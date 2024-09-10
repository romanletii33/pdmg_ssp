const catchAsync = require('../libs/catchAsync')
const moment = require("moment")
const httpStatus = require("http-status")
const config = require("../config/config")
const logger = require("../config/logger.config")
const BidRequest = require('../openrtb/bid_request')
const axios = require('axios')
const fetch = require('node-fetch')
const { performance } = require('perf_hooks');
const { authenticate } = require('../middlewares/auth.middleware')
const { generateGUID, getGeoInfoWithIP, replaceMacros } = require("../libs/methods")
const {
  publisherService,
  deviceService,
  endpointService,
  dealService,
  winService,
} = require('../services')

const startAuction = catchAsync(async (req, res) => {
  const { headers, query } = req
  const { publisher_id, device_id, ad_unit_id } = query

  const response = await authenticate(req, admin = false, auction = true)
  if (response.code !== httpStatus.OK) {
    return res.send(response)
  }

  let publisher = await publisherService.getPublisherById(publisher_id)
  let device = await deviceService.getDeviceById(device_id)
  let dsps = await endpointService.getAvailableEndpointsByPublisherId(publisher_id)
  let deals = await dealService.getDealsByPublisherId(publisher_id)

  if (!publisher.length || !device.length || !dsps.length) {
    logger.warn("No necessary data to initiate the auction")
    return res.send({ code: httpStatus.NOT_FOUND, message: "No necessary data to initiate the auction" })
  }

  publisher = publisher[0]
  device = device[0]

  // GET IP address from the request
  let ipAddress = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : req.connection.remoteAddress
  let splittedAdd = ipAddress.split(':')
  if (splittedAdd.length) {
    ipAddress = splittedAdd[splittedAdd.length - 1]
  }

  let isIpAddress = false
  if (ipAddress === device.ip_address) {
    isIpAddress = true
  }

  let geoInfo
  if (!isIpAddress) {
    // GET geo information from maxmind database with ip address
    geoInfo = await getGeoInfoWithIP(ipAddress)
    if (!geoInfo || !geoInfo.country || !geoInfo.country.isoCode) {
      logger.warn(`No geo country for this ip address ${ipAddress}`)
      return res.send({ code: httpStatus.NOT_FOUND, message: "No geo country for this ip address" })
    }
  }

  let country = isIpAddress ? device.country_iso_code : geoInfo.country.isoCode
  let filteredDsps = await filterDspsByPrefilterGeoCountry(dsps, country)
  if (!filteredDsps || !filteredDsps.length) {
    logger.warn("No valid endpoints to initiate the auction")
    return res.send({ code: httpStatus.NOT_FOUND, message: "No valid endpoints to initiate the auction" })
  }

  let id = generateGUID()
  let at = parseInt(publisher.auction_type)

  // impression section
  let banner = {}, video = {}
  let imp = []

  if (device.is_image == 'Y') {
    banner = {
      w: 300,
      h: 250,
      mimes: [
        "images",
        "image/jpeg",
        "image/png",
      ],
      ext: {
        dooh: {
          impsPerSpot: device.imps_per_spot,
        }
      }
    }

    imp = [
      {
        id: generateGUID(),
        banner,
        bidfloor: publisher.publisher_min_floor_price
      }
    ]

  } else if (device.is_video == 'Y') {
    video = {
      mimes: [
        "video/mp4",
        "video/mpeg"
      ],
      w: 1600,
      h: 900,
      ext: {
        dooh: {
          impsPerSpot: device.imps_per_spot
        }
      }
    }
    imp = [
      {
        id: generateGUID(),
        video,
        bidfloor: publisher.publisher_min_floor_price
      }
    ]
  }

  if (deals && deals.length) {
    imp[0].pmp = {
      private_auction: parseInt(publisher.private_auction),
      deals: deals.map(deal => ({
        id: deal.deal_id,
        bidfloor: deal.bidfloor,
        at: parseInt(deal.auction_type),
        ext: {
          publisher_id: deal.publisher_id
        }
      }))
    }
  } // direct PMP (private market place)

  // site section
  let site = {
    domain: device.domain,
    publisher: {
      id: publisher.publisher_id,
      name: publisher.company
    }
  }

  const lat = query.lat ? query.lat : isIpAddress ? device.geo_latitude : geoInfo.location && geoInfo.location.latitude || null
  const lon = query.lon ? query.lon : isIpAddress ? device.geo_longitude : geoInfo.location && geoInfo.location.longitude || null

  if (!isIpAddress || (lat !== device.geo_latitude) || (lon !== device.geo_longitude)) {
    const updateFields = [
      `ip_address = '${ipAddress}'`,
      `geo_latitude = ${lat}`,
      `geo_longitude = ${lon}`,
      `country_iso_code = '${country}'`,
      `updated_at = ${moment().unix()}`
    ]

    await deviceService.updateDevice(updateFields, publisher_id, device_id)
  }

  // device section
  let deviceInfo = {
    ua: headers['user-agent'],
    ip: ipAddress,
    geo: {
      lat,
      lon,
      country,
      zip: isIpAddress ? device.postal_code : geoInfo.postal?.code,
      type: 1,
    },
    ext: {
      dooh: {
        industryid: config.openrtb.industryid,
        venuetypeids: JSON.parse(device.venuetype_ids),
        publicid: device.device_id
      }
    }
  }

  let wlang = config.openrtb.wlang.split(',')
  let cur = config.openrtb.cur.split(',')
  let tmax = config.openrtb.tmax

  // Generate bid request
  let bidRequest = new BidRequest({ id, at, imp, device: deviceInfo, site, tmax, wlang, cur })
  bidRequest = bidRequest.body()
  if (!bidRequest.device.ext) {
    bidRequest.device.ext = deviceInfo.ext
  }

  let totalRequests = 0
  let bidResponses = []
  let lastRequestTime = performance.now()

  // Send bid request and receive bid responses
  try {
    await Promise.all(filteredDsps.map(async (dsp) => {
      const rateLimit = dsp.queries_per_second;
      const interval = 1000 / rateLimit;
      const currentTime = performance.now();
      const elapsedTime = currentTime - lastRequestTime;

      // Wait for rate limit
      if (elapsedTime < interval) {
        await new Promise(resolve => setTimeout(resolve, interval - elapsedTime));
      }

      totalRequests += 1
      const response = await sendBidRequest(dsp, bidRequest, ad_unit_id);

      if (response && response.code === httpStatus.OK) {
        bidResponses.push(response.response)
      }

      lastRequestTime = performance.now(); // Update last request time
    }));

    if (!bidResponses.length) {
      return res.send({ code: httpStatus.NOT_FOUND, message: "No bid responses for the auction" })
    }

  } catch (err) {
    logger.error(`in processing the auction ${err.stack}`)
    throw err
  }

  const result = await handleBidResponse({ bidRequest, bidResponses, publisher, deals })
  let respond
  let reportInfo = {
    publisherId: publisher.publisher_id,
    publisherName: publisher.contact_name,
    totalBids: 0,
    totalRequests,
    totalWins: 0,
    winPrice: 0,
    endpointId: ""
  }
  if (!result) {
    respond = {
      code: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Failed the auction"
    }

    return res.send(respond)
  }

  const bidsByEndpoint = result.allBids.reduce((acc, bid) => {
    if (!acc[bid.endpointId]) acc[bid.endpointId] = [];
    acc[bid.endpointId].push(bid);
    return acc;
  }, {});

  if (result.code !== httpStatus.OK) {
    const reportInfos = filteredDsps.map((dsp) => {
      const info = { ...reportInfo, endpointId: dsp.publisher_endpoint_id, totalRequests: 1 };

      info.allBids = bidsByEndpoint[dsp.publisher_endpoint_id] || [];
      if (info.allBids.length > 0) {
        info.totalBids = info.allBids.length;
      }

      return info;
    });

    await Promise.all(reportInfos.map((info) => winService.saveReportInfo(info)));

    respond = {
      code: result.code,
      message: result.message,
    }
    return res.send(respond)
  }
  if (result.code === httpStatus.OK) {
    const winInfo = {
      publisherId: publisher.publisher_id,
      impId: bidRequest.imp[0].id,
      deviceId: device.device_id,
      ipAddress,
      ua: bidRequest.device.ua,
      winnerBid: result.winnerBid
    }
    await winService.saveWinInfo(winInfo) // save winner info to the table

    const reportInfos = filteredDsps.map((dsp) => {
      const info = { ...reportInfo, endpointId: dsp.publisher_endpoint_id, totalRequests: 1 };

      if (dsp.publisher_endpoint_id === result.winnerBid.endpointId) {
        info.winPrice = result.winnerBid.winPrice;
        info.totalWins = 1;
        info.totalBids = 1;
      } else {
        info.allBids = bidsByEndpoint[dsp.publisher_endpoint_id] || [];
        if (info.allBids.length > 0) {
          info.totalBids = info.allBids.length;
        }
      }

      return info;
    });

    await Promise.all(reportInfos.map((info) => winService.saveReportInfo(info)));

    respond = {
      code: result.code,
      message: 'The auction succeeded',
      publisherId: publisher.publisher_id,
      winPrice: result.winnerBid.winPrice,
      creativeInfo: result.creative,
    }
    return res.send(respond)
  }
})

/**
 * Function to process bid responses
 * @param {array} bidResponses
 * @param {object} publisher
 * @returns processed result | new array
 */
const handleBidResponse = async ({ bidRequest, bidResponses, publisher, deals }) => {
  const handleResponse = async () => {
    try {
      let allBids = []
      bidResponses.forEach(response => {
        if (response.seatbid && response.seatbid.length && response.seatbid[0].bid && response.seatbid[0].bid.length) {
          response.seatbid[0].bid.forEach(bid => {
            bid.maxBidPrice = response.maxBidPrice
            bid.bidid = response.seatbid[0].bid[0].id ? response.seatbid[0].bid[0].id : ''
            bid.endpointId = response.endpointId
            bid.cur = response.cur ? response.cur : ''
            bid.seat = response.seatbid[0].seat ? response.seatbid[0].seat : ''
            allBids.push(bid)
          })
        }
      })

      if (!allBids.length || !allBids[0]) {
        return {
          code: httpStatus.NO_CONTENT,
          message: `No bids in bid responses`
        }
      }

      let validBids = sortedBids = []
      let winnerBid
      validBids = await validateBids(allBids, deals, publisher)

      if (!validBids || !validBids.length) {
        return {
          code: httpStatus.NOT_FOUND,
          message: `No valid bids in all bid responses`,
          allBids
        }

      } else if (validBids.length === 1) {
        winnerBid = validBids[0]
        winnerBid.winPrice = publisher.auction_type === '2' ? winnerBid.price + 0.01 : winnerBid.price

      } else if (validBids.length > 1) {
        sortedBids = validBids.sort((a, b) => b.price - a.price)

        if (publisher.auction_type === '2') {
          winnerBid = sortedBids[1]
          winnerBid.winPrice = winnerBid.price + 0.01

        } else {
          winnerBid = sortedBids[0]
          winnerBid.winPrice = winnerBid.price
        }
      }

      let nurl, burl, iurl, adm

      const macros = {
        AUCTION_ID: bidRequest.id,
        AUCTION_BID_ID: winnerBid.bidid,
        AUCTION_IMP_ID: winnerBid.impid ? winnerBid.impid : '',
        AUCTION_SEAT_ID: winnerBid.seat,
        AUCTION_AD_ID: winnerBid.addid ? winnerBid.addid : '',
        AUCTION_PRICE: winnerBid.price,
        AUCTION_CURRENCY: winnerBid.cur,
      };

      burl = winnerBid.burl ? await replaceMacros(winnerBid.burl, macros) : "";
      nurl = winnerBid.nurl ? await replaceMacros(winnerBid.nurl, macros) : "";
      iurl = winnerBid.iurl ? await replaceMacros(winnerBid.iurl, macros) : "";
      winnerBid.adm = winnerBid.adm ? await replaceMacros(winnerBid.adm, macros) : "";

      if (burl) fetch(burl)
      if (nurl) fetch(nurl)
      if (iurl) fetch(iurl)

      let creative = {
        billingUrl: burl, noticeUrl: nurl, creativeId: winnerBid.crid ? winnerBid.crid : '', adMarkUp: adm
      }

      return {
        code: httpStatus.OK,
        creative,
        winnerBid,
        allBids,
      }

    } catch (err) {
      logger.error(`in processing bid response: ${err.stack}`);
      return {
        code: httpStatus.INTERNAL_SERVER_ERROR,
        message: `in processing bid response: ${err.stack}`
      };
    }
  }

  const timeoutPromise = new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: httpStatus.REQUEST_TIMEOUT,
        message: `timeout while processing bid response`
      })
    }, config.auction.duration)
  })

  /* INITIATE two promise function simultaneously
  ** Once a function is completed, stop this process and return relevant value
  */
  return await Promise.race([handleResponse(), timeoutPromise])
}

/**
 * Function to validate all bids
 * @param {array} allBids 
 * @param {array} deals 
 * @param {object} publisher 
 * @returns valid bids | new array
 */
const validateBids = async (allBids, deals, publisher) => {
  let validBids = []

  const isBidValid = (bid, minPrice, maxPrice) => bid.price >= minPrice && bid.price <= maxPrice

  try {
    if (deals && deals.length) {
      const privateAuction = publisher.private_auction === '1'
      allBids.forEach(bid => {
        if (bid && bid.dealid) {
          for (const deal of deals) {
            if (deal.deal_id === bid.dealid && isBidValid(bid, deal.bidfloor, bid.maxBidPrice)) {
              validBids.push(bid)
              break
            }
          }

        } else if (!privateAuction && isBidValid(bid, publisher.publisher_min_floor_price, bid.maxBidPrice)) {
          validBids.push(bid)
        }
      })

    } else {
      allBids.forEach(bid => {
        if (isBidValid(bid, publisher.publisher_min_floor_price, bid.maxBidPrice)) {
          validBids.push(bid)
        }
      });
    }

  } catch (err) {
    logger.error(`in validating bids ${err.stack}`)
  }

  return validBids
}

/**
 * Function to filter valid dsps among retrieved dsps with geo country code
 * @param {array} dsps endpoints which will be received bid request
 * @param {string} country country code from maxmind database
 * @returns filtered dsps | new array
 */
const filterDspsByPrefilterGeoCountry = async (dsps, country) => {
  let filteredDsps = []

  dsps.forEach(dsp => {
    let prefilter_geo_countries = JSON.parse(dsp.prefilter_geo_country)
    if (!prefilter_geo_countries || !prefilter_geo_countries.length) filteredDsps.push(dsp)
    else {
      prefilter_geo_countries.forEach(geo_country => {
        if (geo_country.toLowerCase() === country.toLowerCase()) {
          filteredDsps.push(dsp)
        }
      })
    }
  })

  return filteredDsps
}

/**
 * Function to send bid request to dsps and retrieve bid response
 * @param {object} dsp publisher endpoint which will be received bid request
 * @param {object} bidRequest
 * @returns bid response object
 */
const sendBidRequest = async (dsp, bidRequest, ad_unit_id) => {
  const controller = new AbortController();
  const { signal } = controller;

  const sendRequest = async () => {
    try {
      let response = await axios.post(dsp.dsp_endpoint_url, {
        bidRequest: JSON.stringify(bidRequest),
        auctionDuration: config.auction.duration,
        adUnitId: ad_unit_id
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        signal
      });

      if (response && response.data) {
        response = response.data;
        response.maxBidPrice = dsp.prefilter_max_bid_price;
        response.endpointId = dsp.publisher_endpoint_id;
        controller.abort(); // Abort the timeoutPromise
        return { code: httpStatus.OK, response };

      } else {
        controller.abort(); // Abort the timeoutPromise
        return { code: httpStatus.NOT_FOUND, message: `No bid response from ${dsp.dsp_endpoint_url}` };
      }

    } catch (err) {
      logger.error(`Error sending bid request to ${dsp.dsp_endpoint_url}: ${err.stack}`);
      controller.abort(); // Abort the timeoutPromise

      return {
        code: httpStatus.INTERNAL_SERVER_ERROR,
        message: `Error sending bid request to ${dsp.dsp_endpoint_url}: ${err.stack}`
      };
    }
  };

  const timeoutPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      logger.warn(`Timeout while waiting for bid response from ${dsp.dsp_endpoint_url}`);

      controller.abort(); // Abort the axios request

      resolve({ code: httpStatus.REQUEST_TIMEOUT, message: `Timeout while waiting for bid response from ${dsp.dsp_endpoint_url}` });

    }, bidRequest.tmax);

    signal.addEventListener('abort', () => clearTimeout(timer));
  });

  /* INITIATE two promise function simultaneously
  ** Once a function is completed, stop this process and return relevant value
  */
  return await Promise.race([sendRequest(), timeoutPromise]);
};

module.exports = {
  startAuction,
  handleBidResponse,
  validateBids,
  filterDspsByPrefilterGeoCountry
}


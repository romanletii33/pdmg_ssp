let bidResponse = {
  id: "92d6421sd44dff9f05b29sdfasbe0ca5bef",
  seatbid: [
    {
      seat: 'test seat',
      bid: [
        {
          id: "9cafcb32sdf39f5dfhccghj974f5c",
          impid: "e60f4faf-9eab-4fcf-bb07-4619197a38ff",
          price: parseFloat((1 + Math.random() * 0.5).toFixed(2)),
          adid: "test_campaign",
          burl: "http://localhost:8002/win/bill?auction_id=${AUCTION_ID}&bid_id=${AUCTION_BID_ID}&imp_id=${AUCTION_IMP_ID}&seat_id=${AUCTION_SEAT_ID}&ad_id=${AUCTION_AD_ID}&price=${AUCTION_PRICE}&currency=${AUCTION_CURRENCY}",
          nurl: "http://localhost:8002/win/notice?ap=${AUCTION_PRICE}&t=8m0OJBZ7871n3RGbrC6jz8mmgocK3okt1DBd_36kZURw8Vf56tf2wDF-Nd7e4i1XnxggaauMDjNEst1xmIrGW-JitQ",
          adm: "<a href=\"http://ads.com/click/112770_1386565997\"><img src=\"https://cdn.pubnative.net/widget/v3/assets/300x250.jpg\" width=\"300\" height=\"250\" border=\"0\" alt=\"Advertisement\" /></a><img src=\"http://mock-dsp.pubnative.net/tracker/nurl?app_id=1008118&p=${AUCTION_PRICE}\" style=\"display:none\"/><img src=\"https://got.pubnative.net/impression?aid=1008118&t=QduxwF1RKZT6blfGfU2pjf5vOxe3GWrj9k9Fy8xHWoclDkRFCCqNXV-HcDU74JlYzXikknQ5ndfxRfkLTXrlUIpNLZTtR5sJW_ynhlClj9yVphyIxT-E21TVNjyEYPdjDfpx-ruNp7_xkN8zkGCfq6eqOoZmASdD7ZxUNeL52IsWEhrkRxOIGpwuiXSxI-M7taWBMF3eEB6ZMvW7Sh2rawLmjL1i8tCd-62MVdY4Z2wIQr7CkD6Nm7UDnUs4bKGNrVn1Y7wwnpl9iEo5UGuqCstkuMugwxwxT__qtdrnIO13GkzAR4qpKVfaaK15xJjJn9CRAbx88jsWAYLwpcAXOcFztVOLFbEc-9nJryuMz32DlHd_ghHCHTRikA_olUFoC9gpnlkEp16a4X5OgbOuGtg5ZOEOjJ22BHDKw9jbdjy_eQY-ClBwFUFSolO6hl8F-AHkw3S3mnM-RC1E89KdX9I19Esdme7QIJmhcnQS5qZYJWiLTiwc-rzpb-QXxlG0SK0WT1iqQBO8JYjD8CYgzlvsIsDCa5_BuUXtV8__8_zpveVt0jgYQhwDrl4vWI4aTmMGi8PyDemEBhPufmsra6jrKwZ9ZOSmxsBppJk3YJgJE4uSwWiBw91GSxgHj8kUGaOREqsC9KGLm9ABcqtm-ImoCYas1ZeiyilfInrxUTqBStqIDbgqbROoTW8GhdySNX2OE7nTEDQ1hqkSVqLuJVM0i4-Iu7BEzOBa8pIaHSPKrhHlzVkdbWQdcDqI7O1Y16aK6rrenRsC5-eWmCPAsCuTQ7-_PGUMrFYqZFKHowPzd-Mwnil_Ne16&ap=${AUCTION_PRICE}&px=1\" style=\"display:none\"/>",
          adomain: [
            "pubnative.net"
          ],
          iurl: "http://localhost:8002/win/inform?auction_price=${AUCTION_PRICE}",
          cid: "test_campaign",
          crid: "test_creative",
          attr: [
            4
          ]
        },
      ]
    }
  ]
}

const handleBidRequest = (req, res, next) => {
  if (req.body) {
    let bidRequest = JSON.parse(req.body.bidRequest)
    let impid = bidRequest.imp[0].id
    bidResponse.seatbid[0].bid[0].price = parseFloat((1 + Math.random() * 0.5).toFixed(2))
    bidResponse.seatbid[0].bid[0].impid = impid
    res.send(bidResponse)
  }
}

const handleWinningBill = (req, res, next) => {
  console.log(req.query)
  res.send({
    code: 200
  })
}

const handleWinningNotice = (req, res, next) => {
  console.log(req.query)
  res.send({
    code: 200
  })
}

const handleWinningInform = (req, res, next) => {
  console.log(req.query)
  res.send({
    code: 200
  })
}

const restify = require('restify')

let server = restify.createServer()
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())

server.post('/dsp', handleBidRequest)
server.get('/win/bill', handleWinningBill)
server.get('/win/notice', handleWinningNotice)
server.get('/win/inform', handleWinningInform)

server.listen(8002, () => {
  console.log("Server 3 listening at %s", server.name, server.url)
})

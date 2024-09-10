const { expect } = require('chai');
const sinon = require('sinon');
const { handleBidResponse } = require('../../controllers/auction.controller'); // Adjust the path as necessary
const fetch = require('node-fetch');
const httpStatus = require('http-status');

describe('handleBidResponse', () => {
  let fetchStub;
  let validateBidsStub;
  let replaceMacrosStub;

  beforeEach(() => {
    fetchStub = sinon.stub(fetch, 'default');
    validateBidsStub = sinon.stub().resolves([]);
    replaceMacrosStub = sinon.stub().resolves('');
  });

  afterEach(() => {
    fetchStub.restore();
  });

  it('should handle no bids in bid responses', async () => {
    const bidResponses = [];
    const result = await handleBidResponse({ bidRequest: {}, bidResponses, publisher: {}, deals: [] });
    expect(result.code).to.equal(httpStatus.NO_CONTENT);
    expect(result.message).to.equal('No bids in bid responses');
  });

  it('should handle no valid bids in bid responses', async () => {
    validateBidsStub.resolves([]);
    const bidResponses = [
      {
        id: '92d6421e44a44dff9f05b29be0ca5bef',
        seatbid: [
          {
            seat: 'test seat',
            bid: [
              {
                id: '9cafcb3224fb45839f509abcca974f5c',
                impid: 'e60f4faf-9eab-4fcf-bb07-4619197a38ff',
                price: 1.39
              }
            ]
          }
        ]
      }
    ];
    const result = await handleBidResponse({ bidRequest: {}, bidResponses, publisher: {}, deals: [] });
    console.log(result)
    expect(result.code).to.equal(httpStatus.NOT_FOUND);
    expect(result.message).to.equal('No valid bids in all bid responses');
  });

  it('should return the winner bid with winPrice = second price (auction_type == 2)', async () => {
    const bidResponses = [
      {
        id: "92d6421e44a44dff9f05b29be0ca5bef",
        seatbid: [
          {
            seat: 'test seat',
            bid: [
              {
                id: "9cafcb3224fb45839f509abcca974f5c",
                impid: "e60f4faf-9eab-4fcf-bb07-4619197a38ff",
                price: 1.39,
                dealid: "aaabbb",
                adid: "test_campaign",
                burl: "http://notification-url.fraudfree.net:8998/rtb/openrtbnotify?auction_id=${AUCTION_ID}&bid_id=${AUCTION_BID_ID}&imp_id=${AUCTION_IMP_ID}&seat_id=${AUCTION_SEAT_ID}&ad_id=${AUCTION_AD_ID}&price=${AUCTION_PRICE}&currency=${AUCTION_CURRENCY}",
                nurl: "https://got.pubnative.net/dspv1/winnotice?ap=${AUCTION_PRICE}&t=8m0OJBZ7871n3RGbrC6jz8mmgocK3okt1DBd_36kZURw8Vf56tf2wDF-Nd7e4i1XnxggaauMDjNEst1xmIrGW-JitQ",
                adm: "<a href=\"http://ads.com/click/112770_1386565997\"><img src=\"https://cdn.pubnative.net/widget/v3/assets/300x250.jpg\" width=\"300\" height=\"250\" border=\"0\" alt=\"Advertisement\" /></a><img src=\"http://mock-dsp.pubnative.net/tracker/nurl?app_id=1008118&p=${AUCTION_PRICE}\" style=\"display:none\"/><img src=\"https://got.pubnative.net/impression?aid=1008118&t=QduxwF1RKZT6blfGfU2pjf5vOxe3GWrj9k9Fy8xHWoclDkRFCCqNXV-HcDU74JlYzXikknQ5ndfxRfkLTXrlUIpNLZTtR5sJW_ynhlClj9yVphyIxT-E21TVNjyEYPdjDfpx-ruNp7_xkN8zkGCfq6eqOoZmASdD7ZxUNeL52IsWEhrkRxOIGpwuiXSxI-M7taWBMF3eEB6ZMvW7Sh2rawLmjL1i8tCd-62MVdY4Z2wIQr7CkD6Nm7UDnUs4bKGNrVn1Y7wwnpl9iEo5UGuqCstkuMugwxwxT__qtdrnIO13GkzAR4qpKVfaaK15xJjJn9CRAbx88jsWAYLwpcAXOcFztVOLFbEc-9nJryuMz32DlHd_ghHCHTRikA_olUFoC9gpnlkEp16a4X5OgbOuGtg5ZOEOjJ22BHDKw9jbdjy_eQY-ClBwFUFSolO6hl8F-AHkw3S3mnM-RC1E89KdX9I19Esdme7QIJmhcnQS5qZYJWiLTiwc-rzpb-QXxlG0SK0WT1iqQBO8JYjD8CYgzlvsIsDCa5_BuUXtV8__8_zpveVt0jgYQhwDrl4vWI4aTmMGi8PyDemEBhPufmsra6jrKwZ9ZOSmxsBppJk3YJgJE4uSwWiBw91GSxgHj8kUGaOREqsC9KGLm9ABcqtm-ImoCYas1ZeiyilfInrxUTqBStqIDbgqbROoTW8GhdySNX2OE7nTEDQ1hqkSVqLuJVM0i4-Iu7BEzOBa8pIaHSPKrhHlzVkdbWQdcDqI7O1Y16aK6rrenRsC5-eWmCPAsCuTQ7-_PGUMrFYqZFKHowPzd-Mwnil_Ne16&ap=${AUCTION_PRICE}&px=1\" style=\"display:none\"/>",
                adomain: [
                  "pubnative.net"
                ],
                iurl: "https://got.pubnative.net/rtb/beacon?t=q8JQ4OLM0au1mRj81xoNIg6cYepOvPKYSoF1PBC1Xhlxfdb7UqNeHKEqdz54MIM4-NJC6KbcbcQXYILR1H9mTAu07JwrdH7v0RFoxv9XKXpdwDAaRVaMFvQV5n_5uLmFR-6_-THn-ZOU&p=${AUCTION_PRICE}",
                cid: "test_campaign",
                crid: "test_creative",
                attr: [
                  4
                ]
              },
              {
                id: "9cafcb3224fb45839f509abcca974f5c",
                impid: "e60f4faf-9eab-4fcf-bb07-4619197a38ff",
                price: 1.29,
                dealid: "bbbccc",
                adid: "test_campaign",
                burl: "http://notification-url.fraudfree.net:8998/rtb/openrtbnotify?auction_id=${AUCTION_ID}&bid_id=${AUCTION_BID_ID}&imp_id=${AUCTION_IMP_ID}&seat_id=${AUCTION_SEAT_ID}&ad_id=${AUCTION_AD_ID}&price=${AUCTION_PRICE}&currency=${AUCTION_CURRENCY}",
                nurl: "https://got.pubnative.net/dspv1/winnotice?ap=${AUCTION_PRICE}&t=8m0OJBZ7871n3RGbrC6jz8mmgocK3okt1DBd_36kZURw8Vf56tf2wDF-Nd7e4i1XnxggaauMDjNEst1xmIrGW-JitQ",
                adm: "<a href=\"http://ads.com/click/112770_1386565997\"><img src=\"https://cdn.pubnative.net/widget/v3/assets/300x250.jpg\" width=\"300\" height=\"250\" border=\"0\" alt=\"Advertisement\" /></a><img src=\"http://mock-dsp.pubnative.net/tracker/nurl?app_id=1008118&p=${AUCTION_PRICE}\" style=\"display:none\"/><img src=\"https://got.pubnative.net/impression?aid=1008118&t=QduxwF1RKZT6blfGfU2pjf5vOxe3GWrj9k9Fy8xHWoclDkRFCCqNXV-HcDU74JlYzXikknQ5ndfxRfkLTXrlUIpNLZTtR5sJW_ynhlClj9yVphyIxT-E21TVNjyEYPdjDfpx-ruNp7_xkN8zkGCfq6eqOoZmASdD7ZxUNeL52IsWEhrkRxOIGpwuiXSxI-M7taWBMF3eEB6ZMvW7Sh2rawLmjL1i8tCd-62MVdY4Z2wIQr7CkD6Nm7UDnUs4bKGNrVn1Y7wwnpl9iEo5UGuqCstkuMugwxwxT__qtdrnIO13GkzAR4qpKVfaaK15xJjJn9CRAbx88jsWAYLwpcAXOcFztVOLFbEc-9nJryuMz32DlHd_ghHCHTRikA_olUFoC9gpnlkEp16a4X5OgbOuGtg5ZOEOjJ22BHDKw9jbdjy_eQY-ClBwFUFSolO6hl8F-AHkw3S3mnM-RC1E89KdX9I19Esdme7QIJmhcnQS5qZYJWiLTiwc-rzpb-QXxlG0SK0WT1iqQBO8JYjD8CYgzlvsIsDCa5_BuUXtV8__8_zpveVt0jgYQhwDrl4vWI4aTmMGi8PyDemEBhPufmsra6jrKwZ9ZOSmxsBppJk3YJgJE4uSwWiBw91GSxgHj8kUGaOREqsC9KGLm9ABcqtm-ImoCYas1ZeiyilfInrxUTqBStqIDbgqbROoTW8GhdySNX2OE7nTEDQ1hqkSVqLuJVM0i4-Iu7BEzOBa8pIaHSPKrhHlzVkdbWQdcDqI7O1Y16aK6rrenRsC5-eWmCPAsCuTQ7-_PGUMrFYqZFKHowPzd-Mwnil_Ne16&ap=${AUCTION_PRICE}&px=1\" style=\"display:none\"/>",
                adomain: [
                  "pubnative.net"
                ],
                iurl: "https://got.pubnative.net/rtb/beacon?t=q8JQ4OLM0au1mRj81xoNIg6cYepOvPKYSoF1PBC1Xhlxfdb7UqNeHKEqdz54MIM4-NJC6KbcbcQXYILR1H9mTAu07JwrdH7v0RFoxv9XKXpdwDAaRVaMFvQV5n_5uLmFR-6_-THn-ZOU&p=${AUCTION_PRICE}",
                cid: "test_campaign",
                crid: "test_creative",
                attr: [
                  4
                ]
              }
            ]
          }
        ],
        cur: "USD",
        maxBidPrice: 1.5,
        endpointId: 2
      },
    ]
    const bidRequest = {
      timestamp: "2024-06-17T21:55:09Z",
      id: "b74bd614-5a3c-42a3-8a81-776681d8e7d5",
    };
    let publisher = {
      publisher_min_floor_price: 0.8,
      auction_type: '2',
      publisher_id: 'c6868d4f-7938-44e4-a2a8-471a4ed83dd4',
      private_auction: '0'
    }
    const result = await handleBidResponse({ bidRequest, bidResponses, publisher, deals: [] });
    console.log({
      code: result.code,
      winPrice: result.winnerBid.winPrice,
      creative: result.creative,
    })
    expect(result.code).to.equal(httpStatus.OK);
    expect(result.winnerBid.winPrice).to.equal(1.3);
  });

  it('should return the winner bid with winPrice = first price (auction_type == 1)', async () => {
    const bidResponses = [
      {
        id: "92d6421e44a44dff9f05b29be0ca5bef",
        seatbid: [
          {
            seat: 'test seat',
            bid: [
              {
                id: "9cafcb3224fb45839f509abcca974f5c",
                impid: "e60f4faf-9eab-4fcf-bb07-4619197a38ff",
                price: 1.39,
                dealid: "aaabbb",
                adid: "test_campaign",
                burl: "http://notification-url.fraudfree.net:8998/rtb/openrtbnotify?auction_id=${AUCTION_ID}&bid_id=${AUCTION_BID_ID}&imp_id=${AUCTION_IMP_ID}&seat_id=${AUCTION_SEAT_ID}&ad_id=${AUCTION_AD_ID}&price=${AUCTION_PRICE}&currency=${AUCTION_CURRENCY}",
                nurl: "https://got.pubnative.net/dspv1/winnotice?ap=${AUCTION_PRICE}&t=8m0OJBZ7871n3RGbrC6jz8mmgocK3okt1DBd_36kZURw8Vf56tf2wDF-Nd7e4i1XnxggaauMDjNEst1xmIrGW-JitQ",
                adm: "<a href=\"http://ads.com/click/112770_1386565997\"><img src=\"https://cdn.pubnative.net/widget/v3/assets/300x250.jpg\" width=\"300\" height=\"250\" border=\"0\" alt=\"Advertisement\" /></a><img src=\"http://mock-dsp.pubnative.net/tracker/nurl?app_id=1008118&p=${AUCTION_PRICE}\" style=\"display:none\"/><img src=\"https://got.pubnative.net/impression?aid=1008118&t=QduxwF1RKZT6blfGfU2pjf5vOxe3GWrj9k9Fy8xHWoclDkRFCCqNXV-HcDU74JlYzXikknQ5ndfxRfkLTXrlUIpNLZTtR5sJW_ynhlClj9yVphyIxT-E21TVNjyEYPdjDfpx-ruNp7_xkN8zkGCfq6eqOoZmASdD7ZxUNeL52IsWEhrkRxOIGpwuiXSxI-M7taWBMF3eEB6ZMvW7Sh2rawLmjL1i8tCd-62MVdY4Z2wIQr7CkD6Nm7UDnUs4bKGNrVn1Y7wwnpl9iEo5UGuqCstkuMugwxwxT__qtdrnIO13GkzAR4qpKVfaaK15xJjJn9CRAbx88jsWAYLwpcAXOcFztVOLFbEc-9nJryuMz32DlHd_ghHCHTRikA_olUFoC9gpnlkEp16a4X5OgbOuGtg5ZOEOjJ22BHDKw9jbdjy_eQY-ClBwFUFSolO6hl8F-AHkw3S3mnM-RC1E89KdX9I19Esdme7QIJmhcnQS5qZYJWiLTiwc-rzpb-QXxlG0SK0WT1iqQBO8JYjD8CYgzlvsIsDCa5_BuUXtV8__8_zpveVt0jgYQhwDrl4vWI4aTmMGi8PyDemEBhPufmsra6jrKwZ9ZOSmxsBppJk3YJgJE4uSwWiBw91GSxgHj8kUGaOREqsC9KGLm9ABcqtm-ImoCYas1ZeiyilfInrxUTqBStqIDbgqbROoTW8GhdySNX2OE7nTEDQ1hqkSVqLuJVM0i4-Iu7BEzOBa8pIaHSPKrhHlzVkdbWQdcDqI7O1Y16aK6rrenRsC5-eWmCPAsCuTQ7-_PGUMrFYqZFKHowPzd-Mwnil_Ne16&ap=${AUCTION_PRICE}&px=1\" style=\"display:none\"/>",
                adomain: [
                  "pubnative.net"
                ],
                iurl: "https://got.pubnative.net/rtb/beacon?t=q8JQ4OLM0au1mRj81xoNIg6cYepOvPKYSoF1PBC1Xhlxfdb7UqNeHKEqdz54MIM4-NJC6KbcbcQXYILR1H9mTAu07JwrdH7v0RFoxv9XKXpdwDAaRVaMFvQV5n_5uLmFR-6_-THn-ZOU&p=${AUCTION_PRICE}",
                cid: "test_campaign",
                crid: "test_creative",
                attr: [
                  4
                ]
              },
              {
                id: "9cafcb3224fb45839f509abcca974f5c",
                impid: "e60f4faf-9eab-4fcf-bb07-4619197a38ff",
                price: 1.29,
                dealid: "bbbccc",
                adid: "test_campaign",
                burl: "http://notification-url.fraudfree.net:8998/rtb/openrtbnotify?auction_id=${AUCTION_ID}&bid_id=${AUCTION_BID_ID}&imp_id=${AUCTION_IMP_ID}&seat_id=${AUCTION_SEAT_ID}&ad_id=${AUCTION_AD_ID}&price=${AUCTION_PRICE}&currency=${AUCTION_CURRENCY}",
                nurl: "https://got.pubnative.net/dspv1/winnotice?ap=${AUCTION_PRICE}&t=8m0OJBZ7871n3RGbrC6jz8mmgocK3okt1DBd_36kZURw8Vf56tf2wDF-Nd7e4i1XnxggaauMDjNEst1xmIrGW-JitQ",
                adm: "<a href=\"http://ads.com/click/112770_1386565997\"><img src=\"https://cdn.pubnative.net/widget/v3/assets/300x250.jpg\" width=\"300\" height=\"250\" border=\"0\" alt=\"Advertisement\" /></a><img src=\"http://mock-dsp.pubnative.net/tracker/nurl?app_id=1008118&p=${AUCTION_PRICE}\" style=\"display:none\"/><img src=\"https://got.pubnative.net/impression?aid=1008118&t=QduxwF1RKZT6blfGfU2pjf5vOxe3GWrj9k9Fy8xHWoclDkRFCCqNXV-HcDU74JlYzXikknQ5ndfxRfkLTXrlUIpNLZTtR5sJW_ynhlClj9yVphyIxT-E21TVNjyEYPdjDfpx-ruNp7_xkN8zkGCfq6eqOoZmASdD7ZxUNeL52IsWEhrkRxOIGpwuiXSxI-M7taWBMF3eEB6ZMvW7Sh2rawLmjL1i8tCd-62MVdY4Z2wIQr7CkD6Nm7UDnUs4bKGNrVn1Y7wwnpl9iEo5UGuqCstkuMugwxwxT__qtdrnIO13GkzAR4qpKVfaaK15xJjJn9CRAbx88jsWAYLwpcAXOcFztVOLFbEc-9nJryuMz32DlHd_ghHCHTRikA_olUFoC9gpnlkEp16a4X5OgbOuGtg5ZOEOjJ22BHDKw9jbdjy_eQY-ClBwFUFSolO6hl8F-AHkw3S3mnM-RC1E89KdX9I19Esdme7QIJmhcnQS5qZYJWiLTiwc-rzpb-QXxlG0SK0WT1iqQBO8JYjD8CYgzlvsIsDCa5_BuUXtV8__8_zpveVt0jgYQhwDrl4vWI4aTmMGi8PyDemEBhPufmsra6jrKwZ9ZOSmxsBppJk3YJgJE4uSwWiBw91GSxgHj8kUGaOREqsC9KGLm9ABcqtm-ImoCYas1ZeiyilfInrxUTqBStqIDbgqbROoTW8GhdySNX2OE7nTEDQ1hqkSVqLuJVM0i4-Iu7BEzOBa8pIaHSPKrhHlzVkdbWQdcDqI7O1Y16aK6rrenRsC5-eWmCPAsCuTQ7-_PGUMrFYqZFKHowPzd-Mwnil_Ne16&ap=${AUCTION_PRICE}&px=1\" style=\"display:none\"/>",
                adomain: [
                  "pubnative.net"
                ],
                iurl: "https://got.pubnative.net/rtb/beacon?t=q8JQ4OLM0au1mRj81xoNIg6cYepOvPKYSoF1PBC1Xhlxfdb7UqNeHKEqdz54MIM4-NJC6KbcbcQXYILR1H9mTAu07JwrdH7v0RFoxv9XKXpdwDAaRVaMFvQV5n_5uLmFR-6_-THn-ZOU&p=${AUCTION_PRICE}",
                cid: "test_campaign",
                crid: "test_creative",
                attr: [
                  4
                ]
              }
            ]
          }
        ],
        cur: "USD",
        maxBidPrice: 1.5,
        endpointId: 2
      },
    ]
    const bidRequest = {
      timestamp: "2024-06-17T21:55:09Z",
      id: "b74bd614-5a3c-42a3-8a81-776681d8e7d5",
    };
    let publisher = {
      publisher_min_floor_price: 0.8,
      auction_type: '1',
      publisher_id: 'a71c7646-918e-4578-840d-9c77ee38a8c1',
      private_auction: '0'
    }
    const result = await handleBidResponse({ bidRequest, bidResponses, publisher, deals: [] });
    console.log({
      code: result.code,
      winPrice: result.winnerBid.winPrice,
      creative: result.creative,
    })
    expect(result.code).to.equal(httpStatus.OK);
    expect(result.winnerBid.winPrice).to.equal(1.39);
  });

});

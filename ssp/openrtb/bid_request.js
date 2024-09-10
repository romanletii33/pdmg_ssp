const openrtb = require("openrtb")
const config = require("../config/config")
const RequestBuilder = openrtb.getBuilder({ openRtbVersion: config.openrtb.version, builderType: 'bidRequest' })
const moment = require("moment")

class BidRequest {
  constructor({ id, at, imp, device, site, tmax, wlang, cur }) {
    this.bidRequest = RequestBuilder
      .timestamp(moment.utc().format())
      .id(id)
      .at(at)
      .imp(imp)
      .device(device)
      .tmax(tmax)
      .site(site)
      .ext({
        wlang: wlang,
        cur: cur
      })
      .build()
  }

  body() {
    return this.bidRequest
  }
}

module.exports = BidRequest

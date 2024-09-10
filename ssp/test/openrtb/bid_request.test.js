const chai = require('chai');
const BidRequest = require('../../openrtb/bid_request');
const { generateGUID } = require("../../libs/methods")

// Configure Chai
const expect = chai.expect;

describe('BidRequest', () => {
  describe('constructor', () => {
    it('should create a valid BidRequest object based on OpenRTB protocol', () => {
      // Sample data for constructor
      const id = generateGUID();
      const at = 2;
      const imp = [{ id: generateGUID(), bidfloor: 1.5 }];
      const device = { ua: 'Mozilla', ip: '192.168.0.1', geo: { lat: 37.7749, lon: -122.4194 } };
      const tmax = 1000;
      const site = {
        domain: "test domain",
        publisher: {
          id: "test publisher id",
          name: "test publisher company"
        }
      }
      const wlang = ['en'];
      const cur = ['USD'];

      // Create BidRequest object
      const bidRequest = new BidRequest({ id, at, imp, device, site, tmax, wlang, cur });

      // Assert properties
      expect(bidRequest).to.have.property('bidRequest');
      expect(bidRequest.bidRequest).to.be.an('object');
    });
  });

  describe('body', () => {
    it('should return the body of the bid request', () => {
      // Sample data for constructor
      const id = generateGUID();
      const at = 2;
      const imp = [{ id: generateGUID(), bidfloor: 1.5 }];
      const device = { ua: 'Mozilla', ip: '192.168.0.1', geo: { lat: 37.7749, lon: -122.4194 } };
      const tmax = 1000;
      const site = {
        domain: "test domain",
        publisher: {
          id: "test publisher id",
          name: "test publisher company"
        }
      }
      const wlang = ['en'];
      const cur = ['USD'];

      // Create BidRequest object
      const bidRequest = new BidRequest({ id, at, imp, device, site, tmax, wlang, cur });

      // Call body method
      const body = bidRequest.body();

      // Assert body
      expect(body).to.be.an('object');
      expect(body).to.have.property('id', id);
      expect(body).to.have.property('at', at);
    });
  });
});

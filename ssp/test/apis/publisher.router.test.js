const request = require("supertest")
const SSPEngine = require("../../engine/server")
const { expect } = require("chai")
const httpStatus = require("http-status")
const config = require('../../config/config')
const { generateGUID } = require("../../libs/methods")

describe("Publisher router", () => {
  let engine
  const GUID = generateGUID()

  beforeEach(() => {
    engine = new SSPEngine()
  })

  describe("Add publisher router", () => {
    it("should add publisher successfully", async () => {
      const body = {
        publisherId: GUID,
        isActive: "Y",
        domain: "test.com",
        company: "test",
        contactName: "test",
        contactEmail: "passionatedev34@outlook.com",
        contactPhone: "3802565753576",
        taxId: "672_xqewr",
        address: "Lviv, in Ukraine",
        city: "Lviv",
        state: "Lviv",
        postalCode: "3455768",
        publisherMinFloorPrice: "0.8",
        auctionType: "1",
        privateAuction: 1
      }

      const res = await request(engine.server)
        .post("/api/v1/publisher")
        .set('x-api-key', config.apiKey)
        .send(body)

      expect(res.status).to.equal(httpStatus.OK)
      expect(res.body.message).to.equal("Publisher added successfully")
    })
  })

  describe("Update publisher router", () => {
    it("should update publisher successfully", async () => {
      const body = {
        isActive: "Y",
        domain: "softserve.com",
        company: "softserver",
        contactName: "softserver",
        contactEmail: "softserver@gmail.com",
        contactPhone: "3802565753576",
        taxId: "672_xqewr",
        address: "Lviv, in Ukraine",
        city: "Lviv",
        state: "Lviv",
        postalCode: "3455768",
        publisherMinFloorPrice: "0.8",
        auctionType: "2"
      }

      const res = await request(engine.server)
        .patch(`/api/v1/publisher/${GUID}`)
        .set('x-api-key', config.apiKey)
        .send(body)

      expect(res.status).to.equal(httpStatus.OK)
      expect(res.body.message).to.equal("Publisher updated successfully")
    })
  })

  describe("Get publisher router", () => {
    it("should get publisher list successfully", async () => {
      const res = await request(engine.server)
        .get(`/api/v1/publisher/${GUID}`)
        .set('x-api-key', config.apiKey)

      expect(res.status).to.equal(httpStatus.OK)
      expect(res.body.message).to.equal('Publisher gotten successfully')
    })
  })
  
  describe("Delete publisher router", () => {
    it("should delete publisher successfully", async () => {
      const res = await request(engine.server)
        .delete(`/api/v1/publisher/${GUID}`)
        .set('x-api-key', config.apiKey)

      expect(res.status).to.equal(httpStatus.OK)
      expect(res.body.message).to.equal("Publisher deleted successfully")
    })
  })
})
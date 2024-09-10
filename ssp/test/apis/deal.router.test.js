const request = require("supertest")
const SSPEngine = require("../../engine/server")
const { expect } = require("chai")
const httpStatus = require("http-status")
const config = require('../../config/config')
const { generateGUID } = require("../../libs/methods")

describe("Deal router", () => {
  let engine

  beforeEach(() => {
    engine = new SSPEngine()
  })

  describe("Add deal router", () => {
    it("should add deal successfully", async () => {
      const body = {
        isActive: "Y",
        bidfloor: 1.23,
        auctionType: "2"
      }

      const res = await request(engine.server)
        .post("/api/v1/publisher/a03bdbdc-2e3a-4cad-801f-018a9e2abc2b/deal")
        .set('x-api-key', config.apiKey)
        .send(body)

      expect(res.status).to.equal(httpStatus.OK)
      expect(res.body.message).to.equal("Publisher deal added successfully")
    })
  })

  describe("Update deal router", () => {
    it("should update deal successfully", async () => {
      const body = {
        isActive: "Y",
        bidfloor: 0.98,
        auctionType: "1"
      }

      const res = await request(engine.server)
        .patch("/api/v1/publisher/a03bdbdc-2e3a-4cad-801f-018a9e2abc2b/deal/87931cec-bdb2-4123-8428-246dfbf19881")
        .set('x-api-key', config.apiKey)
        .send(body)

      expect(res.status).to.equal(httpStatus.OK)
      expect(res.body.message).to.equal("Publisher deal updated successfully")
    })
  })

  describe("Get deal router", () => {
    it("should get deal list by publisher id successfully", async () => {
      const res = await request(engine.server)
        .get("/api/v1/publisher/a03bdbdc-2e3a-4cad-801f-018a9e2abc2b/deal/list/1/3")
        .set('x-api-key', config.apiKey)

      expect(res.status).to.equal(httpStatus.OK)
      expect(res.body.message).to.equal('Publisher deals gotten successfully')
    })

    it("should get a publisher deal by deal id successfully", async () => {
      const res = await request(engine.server)
        .get("/api/v1/publisher/a03bdbdc-2e3a-4cad-801f-018a9e2abc2b/deal/87931cec-bdb2-4123-8428-246dfbf19881")
        .set('x-api-key', config.apiKey)

      expect(res.status).to.equal(httpStatus.OK)
      expect(res.body.message).to.equal('Publisher deal gotten successfully')
    })
  })

  describe("Delete deal router", () => {
    it("should delete Deal successfully", async () => {
      const res = await request(engine.server)
        .del("/api/v1/publisher/a03bdbdc-2e3a-4cad-801f-018a9e2abc2b/deal/87931cec-bdb2-4123-8428-246dfbf19881")
        .set('x-api-key', config.apiKey)

      expect(res.status).to.equal(httpStatus.OK)
      expect(res.body.message).to.equal("Publisher deal deleted successfully")
    })
  })
})

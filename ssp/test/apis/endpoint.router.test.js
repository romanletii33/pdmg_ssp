const request = require("supertest")
const SSPEngine = require("../../engine/server")
const { expect } = require("chai")
const httpStatus = require("http-status")
const config = require('../../config/config')

describe("Endpoint router", () => {
  let engine

  beforeEach(() => {
    engine = new SSPEngine()
  })

  describe("Add Endpoint router", () => {
    it("should add Endpoint successfully", async () => {
      const body = {
        dspEndpointUrl: "https://localhost:8000/dsp",
        queriesPerSecond: 90,
        prefilterGeoCountry: ["en", "ua", "us"],
        prefilterMaxBidPrice: 1.42,
        isActive: "Y"
      }

      const res = await request(engine.server)
        .post("/api/v1/publisher/a03bdbdc-2e3a-4cad-801f-018a9e2abc2b/endpoint")
        .set('x-api-key', config.apiKey)
        .send(body)

      expect(res.status).to.equal(httpStatus.OK)
      expect(res.body.message).to.equal("Publisher endpoint added successfully")
    })
  })

  describe("Update Endpoint router", () => {
    it("should update Endpoint successfully", async () => {
      const body = {
        dspEndpointUrl: "https://localhost:1223/dsp",
        queriesPerSecond: 90,
        prefilterGeoCountry: ["en", "ua", "us"],
        prefilterMaxBidPrice: 1.42,
        isActive: "Y"
      }

      const res = await request(engine.server)
        .patch("/api/v1/publisher/a03bdbdc-2e3a-4cad-801f-018a9e2abc2b/endpoint/4c271315-fa62-4884-914a-fb3087e44564")
        .set('x-api-key', config.apiKey)
        .send(body)

      expect(res.status).to.equal(httpStatus.OK)
      expect(res.body.message).to.equal("Endpoint updated successfully")
    })
  })

  describe("Get Endpoint router", () => {
    it("should get Endpoint list by publisher id successfully", async () => {
      const res = await request(engine.server)
        .get("/api/v1/publisher/a03bdbdc-2e3a-4cad-801f-018a9e2abc2b/endpoint/list/1/3")
        .set('x-api-key', config.apiKey)

      expect(res.status).to.equal(httpStatus.OK)
      expect(res.body.message).to.equal('Endpoints gotten successfully')
    })

    it("should get a single Endpoint by endpoint id successfully", async () => {
      const res = await request(engine.server)
        .get("/api/v1/publisher/a03bdbdc-2e3a-4cad-801f-018a9e2abc2b/endpoint/4c271315-fa62-4884-914a-fb3087e44564")
        .set('x-api-key', config.apiKey)

      expect(res.status).to.equal(httpStatus.OK)
      expect(res.body.message).to.equal('Endpoint gotten successfully')
    })
  })

  describe("Delete Endpoint router", () => {
    it("should delete Endpoint successfully", async () => {
      const res = await request(engine.server)
        .delete("/api/v1/publisher/a03bdbdc-2e3a-4cad-801f-018a9e2abc2b/endpoint/4c271315-fa62-4884-914a-fb3087e44564")
        .set('x-api-key', config.apiKey)

      expect(res.status).to.equal(httpStatus.OK)
      expect(res.body.message).to.equal("Endpoint deleted successfully")
    })
  })
})
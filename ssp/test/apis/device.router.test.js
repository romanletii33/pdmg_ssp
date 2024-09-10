const request = require("supertest")
const SSPEngine = require("../../engine/server")
const { expect } = require("chai")
const httpStatus = require("http-status")
const config = require('../../config/config')

describe("Device router", () => {
  let engine

  beforeEach(() => {
    engine = new SSPEngine()
  })

  describe("Add Device router", () => {
    it("should add Device successfully", async () => {
      const body = {
        isVideo: "N",
        isImage: "Y",
        isActive: "Y",
        taxonomy: "abc_0224",
        venuetypeIds: ["1", "301"],
        impsPerSpot: 0.95
      }

      const res = await request(engine.server)
        .post("/api/v1/publisher/a03bdbdc-2e3a-4cad-801f-018a9e2abc2b/device")
        .set('x-api-key', config.apiKey)
        .send(body)

      expect(res.status).to.equal(httpStatus.OK)
      expect(res.body.message).to.equal("Device added successfully")
    })
  })

  describe("Update Device router", () => {
    it("should update device successfully", async () => {
      const body = {
        isVideo: "N",
        isImage: "Y",
        isActive: "Y",
        taxonomy: "abc_0224",
        venuetypeIds: ["1", "301"],
        impsPerSpot: 0.95
      }

      const res = await request(engine.server)
        .patch("/api/v1/publisher/a03bdbdc-2e3a-4cad-801f-018a9e2abc2b/device/b0d05150-1e5c-4b46-9dc0-415820fcfd9b")
        .set('x-api-key', config.apiKey)
        .send(body)

      expect(res.status).to.equal(httpStatus.OK)
      expect(res.body.message).to.equal("Device updated successfully")
    })
  })

  describe("Get device router", () => {
    it("should get device list by publisher id successfully", async () => {
      const res = await request(engine.server)
        .get("/api/v1/publisher/a03bdbdc-2e3a-4cad-801f-018a9e2abc2b/device/list/1/3")
        .set('x-api-key', config.apiKey)

      expect(res.status).to.equal(httpStatus.OK)
      expect(res.body.message).to.equal('Devices gotten successfully')
    })

    it("should get a single device by device id successfully", async () => {
      const res = await request(engine.server)
        .get("/api/v1/publisher/a03bdbdc-2e3a-4cad-801f-018a9e2abc2b/device/b0d05150-1e5c-4b46-9dc0-415820fcfd9b")
        .set('x-api-key', config.apiKey)

      expect(res.status).to.equal(httpStatus.OK)
      expect(res.body.message).to.equal('Device gotten successfully')
    })
  })

  describe("Delete Device router", () => {
    it("should delete Device successfully", async () => {
      const res = await request(engine.server)
        .del("/api/v1/publisher/a03bdbdc-2e3a-4cad-801f-018a9e2abc2b/device/b0d05150-1e5c-4b46-9dc0-415820fcfd9b")
        .set('x-api-key', config.apiKey)

      expect(res.status).to.equal(httpStatus.OK)
      expect(res.body.message).to.equal("Device deleted successfully")
    })
  })
})
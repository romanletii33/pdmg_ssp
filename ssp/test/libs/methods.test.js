const { expect } = require("chai")
const { getGeoInfoWithIP, generateGUID } = require('../../libs/methods');

describe("getGeoInfoWithIP", async () => {
  it("should get geo location info with ip address from maxmind db", async () => {
    const ipAddress = "34.226.216.114"
    const geoInfo = await getGeoInfoWithIP(ipAddress)
    expect(geoInfo).to.be.an("object")
    expect(geoInfo).to.have.property("country")
    expect(geoInfo).to.have.property("city")
    expect(geoInfo).to.have.property("location")
    expect(geoInfo).to.have.property("postal")
  })

  it("should handle any error in getting geo info from maxmind db", async () => {
    const ipAddress = "127.0.0.1";
    try {
      await getGeoInfoWithIP(ipAddress);
    } catch (err) {
      expect(err).to.be.an("error");
    }
  })
})

describe('generateGUID', () => {
  it('should return a string with the correct format', () => {
    const guid = generateGUID();
    expect(typeof guid).to.be.an('string');
    expect(guid).match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('should generate unique GUIDs', () => {
    const numGUIDs = 100;
    const guids = new Set();
    for (let i = 0; i < numGUIDs; i++) {
      const guid = generateGUID()
      expect(typeof guid).to.be.an("string")
      expect(guids.has(guid)).to.be.false;
      guids.add(guid);
    }
  });
});

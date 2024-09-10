const Joi = require("joi")

const addPublisher = {
  body: Joi.object().keys({
    publisherId: Joi.string().guid({ version: ["uuidv4"] }),
    isActive: Joi.string(),
    domain: Joi.string(),
    company: Joi.string(),
    contactName: Joi.string(),
    contactEmail: Joi.string().email(),
    contactPhone: Joi.string(),
    taxId: Joi.string(),
    address: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    postalCode: Joi.string(),
    publisherMinFloorPrice: Joi.number(),
    auctionType: Joi.number().valid(1, 2),
    privateAuction: Joi.number().valid(0, 1)
  })
}

const updatePublisher = {
  params: Joi.object().keys({
    publisherId: Joi.string().guid({ version: ["uuidv4"] }).required()
  }),
  body: Joi.object().keys({
    isActive: Joi.string(),
    domain: Joi.string(),
    company: Joi.string(),
    contactName: Joi.string(),
    contactEmail: Joi.string().email(),
    contactPhone: Joi.string(),
    taxId: Joi.string(),
    address: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    postalCode: Joi.string(),
    publisherMinFloorPrice: Joi.number(),
    auctionType: Joi.number().valid(1, 2),
    privateAuction: Joi.number().valid(0, 1)
  })
}

const deletePublisher = {
  params: Joi.object().keys({
    publisherId: Joi.string().guid({ version: ["uuidv4"] }).required()
  })
}

const getPublisher = {
  params: Joi.object().keys({
    publisherId: Joi.string().guid({ version: ["uuidv4"] }).required()
  })
}

const getPublishers = {
  params: Joi.object().keys({
    start: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1)
  })
}

const auction = {
  query: Joi.object().keys({
    publisher_id: Joi.string().guid({ version: ["uuidv4"] }).required(),
    device_id: Joi.string().guid({ version: ["uuidv4"] }).required(),
    ad_unit_id: Joi.number().integer().required(),
    lat: Joi.string(),
    lon: Joi.string(),
  })
}

module.exports = {
  addPublisher,
  updatePublisher,
  deletePublisher,
  getPublisher,
  getPublishers,
  auction,
}
const Joi = require("joi")

const addEndpoint = {
  params: Joi.object().keys({
    publisherId: Joi.string().guid({ version: ['uuidv4'] }).required()
  }),
  body: Joi.object().keys({
    dspEndpointUrl: Joi.string(),
    queriesPerSecond: Joi.number(),
    prefilterGeoCountry: Joi.array(),
    prefilterMaxBidPrice: Joi.number(),
    endpointId: Joi.string().guid({ version: ["uuidv4"] }),
    isActive: Joi.string().valid("Y", "N"),
  })
}

const updateEndpoint = {
  params: Joi.object().keys({
    publisherId: Joi.string().guid({ version: ['uuidv4'] }).required(),
    endpointId: Joi.string().guid({ version: ['uuidv4'] }).required()
  }),
  body: Joi.object().keys({
    dspEndpointUrl: Joi.string(),
    queriesPerSecond: Joi.number(),
    prefilterGeoCountry: Joi.array(),
    prefilterMaxBidPrice: Joi.number(),
    isActive: Joi.string().valid("Y", "N"),
  })
}

const deleteEndpoint = {
  params: Joi.object().keys({
    publisherId: Joi.string().guid({ version: ['uuidv4'] }).required(),
    endpointId: Joi.string().guid({ version: ['uuidv4'] }).required()
  }),
}

const getEndpoint = {
  params: Joi.object().keys({
    publisherId: Joi.string().guid({ version: ['uuidv4'] }).required(),
    endpointId: Joi.string().guid({ version: ['uuidv4'] }).required()
  }),
}

const getEndpoints = {
  params: Joi.object().keys({
    publisherId: Joi.string().guid({ version: ['uuidv4'] }).required(),
    start: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1)
  }),
}

const getAvailableEndpointsByPublisherId = {
  query: Joi.object().keys({
    publisher_id: Joi.string().required()
  })
}

module.exports = {
  addEndpoint,
  updateEndpoint,
  deleteEndpoint,
  getEndpoints,
  getEndpoint,
  getAvailableEndpointsByPublisherId,
}
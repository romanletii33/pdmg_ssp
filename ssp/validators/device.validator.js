const Joi = require("joi")

const addDevice = {
  params: Joi.object().keys({
    publisherId: Joi.string().guid({ version: ['uuidv4'] }).required()
  }),
  body: Joi.object().keys({
    isVideo: Joi.string().valid("Y", "N"),
    isImage: Joi.string().valid("Y", "N"),
    isActive: Joi.string().valid("Y", "N"),
    ipAddress: Joi.string(),
    geoLatitude: Joi.number(),
    geoLongitude: Joi.number(),
    taxonomy: Joi.string(),
    deviceId: Joi.string().guid({ version: ["uuidv4"] }),
    impsPerSpot: Joi.number(),
    venuetypeIds: Joi.array()
  })
}

const updateDevice = {
  params: Joi.object().keys({
    publisherId: Joi.string().guid({ version: ['uuidv4'] }).required(),
    deviceId: Joi.string().guid({ version: ['uuidv4'] }).required()
  }),
  body: Joi.object().keys({
    isVideo: Joi.string().valid("Y", "N"),
    isImage: Joi.string().valid("Y", "N"),
    isActive: Joi.string().valid("Y", "N"),
    ipAddress: Joi.string(),
    geoLatitude: Joi.number(),
    geoLongitude: Joi.number(),
    taxonomy: Joi.string(),
    impsPerSpot: Joi.number(),
    venuetypeIds: Joi.array()
  })
}

const deleteDevice = {
  params: Joi.object().keys({
    publisherId: Joi.string().guid({ version: ['uuidv4'] }).required(),
    deviceId: Joi.string().guid({ version: ['uuidv4'] }).required()
  }),
}

const getDevice = {
  params: Joi.object().keys({
    publisherId: Joi.string().guid({ version: ['uuidv4'] }).required(),
    deviceId: Joi.string().guid({ version: ['uuidv4'] }).required()
  }),
}

const getDevices = {
  params: Joi.object().keys({
    publisherId: Joi.string().guid({ version: ['uuidv4'] }).required(),
    start: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1)
  }),
}

module.exports = {
  addDevice,
  updateDevice,
  deleteDevice,
  getDevice,
  getDevices,
}
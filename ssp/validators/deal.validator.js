const Joi = require("joi")

const addDeal = {
  params: Joi.object().keys({
    publisherId: Joi.string().guid({ version: ['uuidv4'] }).required()
  }),
  body: Joi.object().keys({
    dealId: Joi.string().guid({ version: ["uuidv4"] }),
    auctionType: Joi.number().valid(1, 2),
    bidfloor: Joi.number(),
    isActive: Joi.string().valid("Y", "N")
  })
}

const updateDeal = {
  params: Joi.object().keys({
    publisherId: Joi.string().guid({ version: ['uuidv4'] }).required(),
    dealId: Joi.string().guid({ version: ['uuidv4'] }).required()
  }),
  body: Joi.object().keys({
    auctionType: Joi.number().valid(1, 2),
    bidfloor: Joi.number(),
    isActive: Joi.string().valid("Y", "N")
  })
}

const deleteDeal = {
  params: Joi.object().keys({
    publisherId: Joi.string().guid({ version: ['uuidv4'] }).required(),
    dealId: Joi.string().guid({ version: ['uuidv4'] }).required()
  }),
}

const getDeal = {
  params: Joi.object().keys({
    publisherId: Joi.string().guid({ version: ['uuidv4'] }).required(),
    dealId: Joi.string().guid({ version: ['uuidv4'] }).required()
  }),
}

const getDeals = {
  params: Joi.object().keys({
    publisherId: Joi.string().guid({ version: ["uuidv4"] }).required(),
    start: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1)
  })
}

module.exports = {
  addDeal,
  updateDeal,
  deleteDeal,
  getDeal,
  getDeals,
}
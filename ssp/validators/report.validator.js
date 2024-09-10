const Joi = require("joi")

const report = {
  params: Joi.object().keys({
    publisherId: Joi.string().guid({ version: ['uuidv4'] }).required(),
    endpointId: Joi.string().guid({ version: ['uuidv4'] })
  }),
}

module.exports = {
  report
}
const Joi = require('joi')
const pick = require('../libs/pick')
const errs = require("restify-errors")

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ["params", "query", "body"])
  const obj = pick(req, Object.keys(validSchema))
  
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' } })
    .validate(obj)
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(", ")
      return next(new errs.BadRequestError(errorMessage))
    }
    Object.assign(req, value)
    return next()
}

module.exports = validate
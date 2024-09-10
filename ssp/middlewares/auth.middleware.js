const httpStatus = require("http-status");
const config = require("../config/config")
const logger = require("../config/logger.config")
const { publisherService } = require('../services')

/**
 * Function to authenticate api key of the request
 * @param {object} req 
 * @param {boolean} admin | optional | default: false
 * @returns true | false
 */
const authenticate = async (req, admin = false, auction = false) => {
  try {
    // CHECK api key in the header in of the request
    const apiKey = req.headers && req.headers['x-api-key'] ? req.headers['x-api-key'] : ""
    if (!apiKey) {
      return {
        code: httpStatus.BAD_REQUEST,
        message: "No api key in the request"
      }
    }

    if (config.apiKey !== apiKey) {
      if (admin) {
        return {
          code: httpStatus.UNAUTHORIZED,
          message: "Unauthorized api key"
        }
      }

      const publisherId = auction ? req.query.publisher_id : req.params.publisherId
      let key = await publisherService.getSecurityKey(publisherId)

      if (!key || !key.length || !key[0].security_key) {
        return {
          code: httpStatus.NOT_FOUND,
          message: "No security key in database"
        }
      }

      key = key[0].security_key

      if (key !== apiKey) {
        return {
          code: httpStatus.UNAUTHORIZED,
          message: "Unauthorized api key"
        }
      }
    }

    return {
      code: httpStatus.OK
    }

  } catch (err) {
    logger.error(`in authenticating ${err.stack}`)
    return {
      code: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Server error'
    }
  }
}

module.exports = {
  authenticate
}
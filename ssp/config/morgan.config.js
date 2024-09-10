/**
 * Library for logging HTTP request and response
 */

const morgan = require('morgan')
const config = require('./config')
const logger = require('./logger.config')

// Define a custom token
morgan.token('message', (req, res) => res && res._data && JSON.parse(res._data).message || ""
)

// Define a function to determine IP format based on environment
const getIpFormat = () =>
  config.env === 'production' ? ':remote-addr - ' : ''

// Define format for logging successful responses and error response  
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`

// For logging successful response
const successHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400, // Skip logging if status code is 400 or above
  stream: { write: (msg) => logger.info(msg.trim()) }
})

// For logging error response
const errorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400, // Skip logging if status code is less than 400
  stream: { write: (msg) => logger.error(msg.trim()) }
})

module.exports = { successHandler, errorHandler }

/**
 * Library to config all variables used in the server
 */

const dotenv = require('dotenv')
const Joi = require('joi')
const path = require('path')

dotenv.config()

const envVariableSchema = Joi.object() // Define a schema for validating objects
  // Specifies the keys(properties) that are allowed in the object being validated - optional .keys()
  .keys({
    SERVER_PORT: Joi.number().default(1223),
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    MYSQL_HOST: Joi.string().default('localhost').required(),
    MYSQL_USER: Joi.string().default('root').required(),
    MYSQL_PASSWORD: '',
    // MYSQL_PASSWORD: Joi.string().required(),
    MYSQL_DATABASE: Joi.string().required(),
    MYSQL_PORT: Joi.number().default(3306).required(),
    OPENRTB_VERSION: Joi.number().default(2.6).required(),
    INDUSTRYID: Joi.string().required(),
    MAXMIND_DB_PATH: Joi.string().required(),
    TIME_MAX_FOR_BIDS: Joi.number().default(1000).required(),
    AWS_ACCESS_KEY_ID: Joi.string(),
    API_KEY: Joi.string().required(),
    AWS_SECRET_ACCESS_KEY: Joi.string(),
    AWS_REGION: Joi.string(),
    ALLOW_LANGS: Joi.string().required(),
    ALLOW_CUR: Joi.string().required(),
    LOG_LEVEL: Joi.string(),
    LOG_FILE_PATH: Joi.string(),
    SSL_KEY_PATH: Joi.string(),
    SSL_CERT_PATH: Joi.string(),
    SSL_DOMAIN: Joi.string(),
    SMTP_HOST: Joi.string().description("server that will send the emails"),
    SMTP_PORT: Joi.number().description("port to connect to the email server"),
    SMTP_USERNAME: Joi.string().description("username for email server"),
    SMTP_PASSWORD: Joi.string().description("password for email server"),
    SMTP_SECURE: Joi.string(),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    AUCTION_DURATION_MS: Joi.number(),
  })
  .unknown() // Method allows additional keys in the object that are not explicity defined in the schems

  const { value: envVars, error } = envVariableSchema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env)

  if (error) throw new Error(`Config Validation Error: ${error.message}`)

  module.exports = {
    env: envVars.NODE_ENV,
    port: envVars.SERVER_PORT,
    apiKey: envVars.API_KEY,
    openrtb: {
      version: envVars.OPENRTB_VERSION,
      industryid: envVars.INDUSTRYID,
      tmax: envVars.TIME_MAX_FOR_BIDS,
      wlang: envVars.ALLOW_LANGS,
      cur: envVars.ALLOW_CUR,
      maxmind: {
        db_city: envVars.MAXMIND_DB_PATH
      }
    },
    aws: {
      accessKeyId: envVars.AWS_ACCESS_KEY_ID,
      secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
      region: envVars.AWS_REGION
    },
    mysql: {
        host: envVars.MYSQL_HOST,
        user: envVars.MYSQL_USER,
        password: envVars.MYSQL_PASSWORD,
        port: envVars.MYSQL_PORT,
        database: envVars.MYSQL_DATABASE,
    },
    email: {
      smtp: {
        host: envVars.SMTP_HOST,
        port: envVars.SMTP_PORT,
        auth: {
          user: envVars.SMTP_USERNAME,
          pass: envVars.SMTP_PASSWORD,
        }
      },
      from: envVars.EMAIL_FROM
    },
    log: {
        level: envVars.LOG_LEVEL,
        path: path.join(__dirname, envVars.LOG_FILE_PATH),
    },
    ssl: {
        key_path: envVars.SSL_KEY_PATH,
        crt_path: envVars.SSL_CERT_PATH,
        ssl_domain: envVars.SSL_DOMAIN,
    },
    auction: {
        duration: envVars.AUCTION_DURATION_MS,
    }
  }
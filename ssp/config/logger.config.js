/**
 * Library to config all logging info
 */

const winston = require('winston');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// Ensure the log directory exists
const logDirectory = path.dirname(config.log.path);
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

// Define a custom log format
const enumeratedErrorFormat = winston.format((info) => {
    if (info instanceof Error) Object.assign(info, { message: info.stack })

    return info
})

// Create logger
const logger = winston.createLogger({
    // Define the log message format
    format: winston.format.combine(
        enumeratedErrorFormat(), // Ensure if the log message is an error
        winston.format.timestamp(), // Add a timestamp to each log message
        winston.format.splat(), // Interpolate variables into log messages
        winston.format.printf(({ level, message }) => `${level} : ${message}`) // Specify the final format of the log message
    ),
    transports: [],
})

// Only add file transport for test environment
if (config.env === 'production') {
    logger.add(new winston.transports.File({
        filename: config.log.path,
        format: winston.format.printf(({ level, message, timestamp }) => `${timestamp} ${level} : ${message}`)
    }));
}

// Add console transport for all environments
logger.add(new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp }) => `${timestamp} ${level} : ${message}`)
    ),
    stderrLevels: ['error'],
}));

module.exports = logger;

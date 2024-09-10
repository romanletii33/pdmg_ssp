const config = require('../config/config')
const logger = require('../config/logger.config')
const mysql = require('mysql')

const DB_HANDLE = mysql.createConnection(config.mysql) // Handler interacting with database

const runDB_query = (query) => new Promise((res, rej) => {
    if (!query || !DB_HANDLE) rej('Not connected to DB yet.')

    DB_HANDLE.query(query, (err, result) => {
        if (err) {
            rej(err)
            return
        }
        logger.info(`${query} implemented on DB`)
        res(result)
    })
})

/**
 * Function to run query
 * @param {string} query 
 * @returns result
 */
const DB_query = async (query) => {
    let result
    try {
        result = await runDB_query(query)
        
    } catch (err) {
        logger.error(`in running query ${err.stack}`)
        throw err
    }
    return result
}

module.exports = {
    DB_HANDLE,
    DB_query
}
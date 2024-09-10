const { DB_query } = require("../model")
const logger = require('../config/logger.config')

const addPublisher = async (fields) => {
    try {
        const query = `INSERT INTO publisher SET ${fields.join(', ')}`
        const result = await DB_query(query)

        return result

    } catch (err) {
        logger.error(`in adding publisher ${err.stack}`)
        throw new Error('Adding publisher failed')
    }
}

const updatePublisher = async (fields, publisherId) => {
    if (!fields || !fields.length || !publisherId) throw new Error('bad request')

    try {
        const query = `UPDATE publisher SET ${fields.join(', ')} WHERE publisher_id = '${publisherId}'`;

        return await DB_query(query)

    } catch (err) {
        logger.error(`in updating publisher ${err.stack}`)
        throw new Error('Updating publisher failed')
    }
}

const getPublisherById = async (id) => {
    try {
        const query = `SELECT * FROM publisher where publisher_id = '${id}' and is_active = 'Y' and ISNULL(deleted_at)
        `
        return await DB_query(query)

    } catch (err) {
        logger.error(`in getting publisher with publisher id ${err.stack}`)
        throw new Error('Error in getting publisher with publisher id')
    }
}

const getPublisher = async (publisherId) => {
    try {
        const query = `SELECT * FROM publisher where publisher_id = '${publisherId}' and ISNULL(deleted_at)`

        return await DB_query(query)

    } catch (err) {
        logger.error(`in getting publisher by publisher id ${err.stack}`)
        throw new Error('Getting publisher by publisher id failed')
    }
}

const countTotalPublishers = async () => {
    try {
        const query = `SELECT COUNT(id) as total_count from publisher where ISNULL(deleted_at)`

        return await DB_query(query)

    } catch (err) {
        logger.error(`in counting total publishers ${err.stack}`)
        throw err
    }
}

const getPublisherList = async (start, limit) => {
    try {
        const query = `SELECT * FROM publisher where ISNULL(deleted_at) LIMIT ${limit} OFFSET ${start}`

        return await DB_query(query)

    } catch (err) {
        logger.error(`in getting publishers ${err.stack}`)
        throw new Error('Getting publishers failed')
    }
}

const getAvailablePublishers = async () => {
    try {
        const query = `SELECT publisher_id, contact_email FROM publisher WHERE is_active = "Y" and ISNULL(deleted_at)`

        return await DB_query(query)

    } catch (err) {
        logger.error(`in getting available publishers ${err.stack}`)
        throw err
    }
}

const getSecurityKey = async (publisherId) => {
    try {
        const query = `SELECT security_key from publisher WHERE publisher_id = '${publisherId}'`

        return await DB_query(query)

    } catch (err) {
        logger.error(`in validating security key ${err.stack}`)
        throw err
    }
}

module.exports = {
    addPublisher,
    getPublisherById,
    updatePublisher,
    getPublisher,
    countTotalPublishers,
    getPublisherList,
    getAvailablePublishers,
    getSecurityKey
}
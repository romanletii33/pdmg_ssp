const { DB_query } = require("../model")
const logger = require('../config/logger.config')

const addEndpoint = async (fields) => {
    try {
        const query = `INSERT INTO publisher_endpoints SET ${fields.join(', ')}`
        const result = await DB_query(query)

        return result

    } catch (err) {
        logger.error(`in adding publisher endpoints ${err.stack}`)
        throw new Error(`Adding publisher endpoints failed`)
    }
}

const updateEndpoint = async (fields, publisherId, endpointId) => {
    try {
        let query
        if (!endpointId) {
            query = `UPDATE publisher_endpoints SET ${fields.join(', ')} WHERE publisher_id = '${publisherId}'`;

        } else {
            query = `UPDATE publisher_endpoints SET ${fields.join(', ')} WHERE publisher_id = '${publisherId}' and publisher_endpoint_id = '${endpointId}'`;
        }

        return await DB_query(query)

    } catch (err) {
        logger.error(`in updating endpoints ${err.stack}`)
        throw new Error('Updating endpoints failed')
    }
}

const deleteEndpoint = async (id) => {
    if (!id) throw new Error('Bad request')

    try {
        const query = `DELETE from publisher_endpoints WHERE id = '${id}'`

        return await DB_query(query)

    } catch (err) {
        logger.error(`in deleting an endpoint ${err. stack}`)
        throw new Error('Deleting endpoint failed')
    }
}

const getAvailableEndpointsByPublisherId = async (publisherId) => {
    try {
        const query = `SELECT * FROM publisher_endpoints where publisher_id = '${publisherId}' and is_active = 'Y' and ISNULL(deleted_at)`

        return await DB_query(query)

    } catch (err) {
        logger.error(`in getting available publisher endpoints by publisher id ${err.stack}`)
        throw new Error("Error in getting available publisher endpoints")
    }
}

const getEndpoint = async (publisherId, endpointId) => {
    try {
        const query = `SELECT * FROM publisher_endpoints where publisher_id = '${publisherId}' and publisher_endpoint_id = '${endpointId}' and ISNULL(deleted_at)`

        return await DB_query(query)

    } catch (err) {
        logger.error(`in getting endpoint with publisher and endpoint id ${err.stack}`)
        throw new Error("Error in getting endpoint with publisher and endpoint id")
    }
}

const countTotalEndpoints = async (publisherId) => {
    try {
        const query = `SELECT COUNT(id) as total_count from publisher_endpoints where publisher_id = '${publisherId}' and ISNULL(deleted_at)`

        return await DB_query(query)

    } catch (err) {
        logger.error(`in counting total endpoints ${err.stack}`)
        throw err
    }
}

const getEndpointList = async (publisherId, start, limit) => {
    try {
        const query = `SELECT * FROM publisher_endpoints where publisher_id = '${publisherId}' and ISNULL(deleted_at) LIMIT ${limit} OFFSET ${start}`

        return await DB_query(query)

    } catch (err) {
        logger.error(`in getting endpoints ${err.stack}`)
        throw new Error('Getting endpoints failed')
    }
}

module.exports = {
    addEndpoint,
    updateEndpoint,
    deleteEndpoint,
    getAvailableEndpointsByPublisherId,
    getEndpoint,
    countTotalEndpoints,
    getEndpointList
}
const { DB_query } = require("../model")
const logger = require('../config/logger.config')

const addDevice = async (fields) => {
    try {
        const query = `INSERT INTO device SET ${fields.join(', ')}`
        const result = await DB_query(query)

        return result

    } catch (err) {
        logger.error(`in adding device ${err.stack}`)
        throw new Error("Adding device failed")
    }
}

const updateDevice = async (fields, publisherId, deviceId) => {
    try {
        let query
        if (!deviceId) {
            query = `UPDATE device SET ${fields.join(', ')} WHERE publisher_id = '${publisherId}'`;

        } else {
            query = `UPDATE device SET ${fields.join(', ')} WHERE publisher_id = '${publisherId}' and device_id = '${deviceId}'`;
        }

        return await DB_query(query)

    } catch (err) {
        logger.error(`in updating device ${err.stack}`)
        throw new Error('Updating device failed')
    }
}

const deleteDevice = async (id) => {
    if (!id) throw new Error('Bad request')

    try {
        const query = `DELETE from device WHERE id = '${id}'`

        return await DB_query(query)

    } catch (err) {
        throw new Error('Deleting device failed')
    }
}

const getDeviceById = async (id) => {
    try {
        const query = `SELECT * FROM device where device_id = '${id}' and is_active = 'Y' and ISNULL(deleted_at)`

        return await DB_query(query)

    } catch (err) {
        logger.error(`in getting device with device id ${err.stack}`)
        throw new Error("Error in getting device with device id")
    }
}

const getDevice = async (publisherId, deviceId) => {
    try {
        const query = `SELECT * FROM device where publisher_id = '${publisherId}' and device_id = '${deviceId}' and ISNULL(deleted_at)`

        return await DB_query(query)

    } catch (err) {
        logger.error(`in getting device with publisher and device id ${err.stack}`)
        throw new Error("Error in getting device with publisher and device id")
    }
}

const countTotalDevices = async (publisherId) => {
    try {
        const query = `SELECT COUNT(id) as total_count from device where publisher_id = '${publisherId}' and ISNULL(deleted_at)`

        return await DB_query(query)

    } catch (err) {
        logger.error(`in counting total devices ${err.stack}`)
        throw err
    }
}

const getDeviceList = async (publisherId, start, limit) => {
    try {
        query = `SELECT * FROM device where publisher_id = '${publisherId}' and ISNULL(deleted_at) LIMIT ${limit} OFFSET ${start}`

        return await DB_query(query)

    } catch (err) {
        logger.error(`in getting devices ${err.stack}`)
        throw new Error('Getting devices failed')
    }
}

module.exports = {
    addDevice,
    updateDevice,
    deleteDevice,
    getDeviceById,
    countTotalDevices,
    getDeviceList,
    getDevice
}
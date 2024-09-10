const catchAsync = require('../libs/catchAsync')
const httpStatus = require("http-status")
const moment = require("moment")
const { authenticate } = require('../middlewares/auth.middleware')
const { deviceService, publisherService } = require("../services")
const { generateGUID } = require('../libs/methods')

const addDevice = catchAsync(async (req, res) => {
    const response = await authenticate(req)
    if (response.code !== httpStatus.OK) {
        return res.send(response)
    }

    let addFields = [];

    const publisherId = req.params.publisherId
    const publisher = await publisherService.getPublisher(publisherId)
    if (!publisher || !publisher.length) {
        return res.send({ code: httpStatus.NOT_FOUND, message: "The publisher is not existed" })
    }

    const deviceId = generateGUID()
    addFields.push(`publisher_id = '${publisherId}'`);
    if (req.body.deviceId) addFields.push(`device_id = '${req.body.deviceId}'`);
    else addFields.push(`device_id = '${deviceId}'`)
    if (req.body.isVideo) addFields.push(`is_video = '${req.body.isVideo}'`);
    if (req.body.isImage) addFields.push(`is_image = '${req.body.isImage}'`);
    if (req.body.isActive) addFields.push(`is_active = '${req.body.isActive}'`);
    if (req.body.ipAddress) addFields.push(`ip_address = '${req.body.ipAddress}'`);
    if (req.body.taxonomy) addFields.push(`taxonomy = '${req.body.taxonomy}'`);
    if (req.body.venuetypeIds) addFields.push(`venuetype_ids = '${JSON.stringify(req.body.venuetypeIds)}'`);
    if (req.body.geoLatitude !== undefined) addFields.push(`geo_latitude = ${req.body.geoLatitude}`);
    if (req.body.geoLongitude !== undefined) addFields.push(`geo_longitude = '${req.body.geoLongitude}'`);
    if (req.body.impsPerSpot !== undefined) addFields.push(`imps_per_spot = '${req.body.impsPerSpot}'`);

    const currentDate = moment().unix()

    addFields.push(`created_at = ${currentDate}`);
    addFields.push(`updated_at = ${currentDate}`);

    const result = await deviceService.addDevice(addFields)

    if (result && result.affectedRows && result.affectedRows > 0)
        return res.send({ code: httpStatus.OK, message: 'Device added successfully', deviceId })
    else
        return res.send({ code: httpStatus.NOT_IMPLEMENTED, message: 'Not added' })
})

const updateDevice = catchAsync(async (req, res) => {
    const response = await authenticate(req)
    if (response.code !== httpStatus.OK) {
        return res.send(response)
    }

    const publisherId = req.params.publisherId
    const deviceId = req.params.deviceId
    
    const device = await deviceService.getDevice(publisherId, deviceId)
    if (!device || !device.length) {
        return res.send({ code: httpStatus.NOT_FOUND, message: "The device is not existed" })
    }

    let updateFields = [];

    if (req.body.isVideo) updateFields.push(`is_video = '${req.body.isVideo}'`);
    if (req.body.isImage) updateFields.push(`is_image = '${req.body.isImage}'`);
    if (req.body.isActive) updateFields.push(`is_active = '${req.body.isActive}'`);
    if (req.body.ipAddress) updateFields.push(`ip_address = '${req.body.ipAddress}'`);
    if (req.body.taxonomy) updateFields.push(`taxonomy = '${req.body.taxonomy}'`);
    if (req.body.venuetypeIds) updateFields.push(`venuetype_ids = '${JSON.stringify(req.body.venuetypeIds)}'`);
    if (req.body.geoLatitude !== undefined) updateFields.push(`geo_latitude = ${req.body.geoLatitude}`);
    if (req.body.geoLongitude !== undefined) updateFields.push(`geo_longitude = '${req.body.geoLongitude}'`);
    if (req.body.impsPerSpot !== undefined) updateFields.push(`imps_per_spot = '${req.body.impsPerSpot}'`);

    if (!updateFields || !updateFields.length) {
        return res.send({ code: httpStatus.BAD_REQUEST, message: 'No fields to update' });
    }

    const currentDate = moment().unix()
    updateFields.push(`updated_at = ${currentDate}`);

    const result = await deviceService.updateDevice(updateFields, publisherId, deviceId);

    if (result && result.affectedRows && result.affectedRows > 0) {
        return res.send({ code: httpStatus.OK, message: 'Device updated successfully' })

    } else {
        return res.send({ code: httpStatus.NOT_FOUND, message: 'Not updated' })
    }
})

const deleteDevice = catchAsync(async (req, res) => {
    const response = await authenticate(req)
    if (response.code !== httpStatus.OK) {
        return res.send(response)
    }

    const publisherId = req.params.publisherId
    const deviceId = req.params.deviceId

    const device = await deviceService.getDevice(publisherId, deviceId)
    if (!device || !device.length) {
        return res.send({ code: httpStatus.NOT_FOUND, message: "The device is not existed" })
    }

    let updateFields = [];

    updateFields.push(`deleted_at = '${moment().unix()}'`);

    const result = await deviceService.updateDevice(updateFields, publisherId, deviceId);

    if (result && result.affectedRows && result.affectedRows > 0) {
        return res.send({ code: httpStatus.OK, message: 'Device deleted successfully' })

    } else {
        return res.send({ code: httpStatus.NOT_FOUND, message: 'Not deleted' })
    }
})

const getDevice = catchAsync(async (req, res) => {
    const response = await authenticate(req)
    if (response.code !== httpStatus.OK) {
        return res.send(response)
    }

    const publisherId = req.params.publisherId
    const deviceId = req.params.deviceId

    const device = await deviceService.getDevice(publisherId, deviceId)
    if (!device || !device.length) {
        return res.send({ code: httpStatus.NOT_FOUND, message: "The device is not existed" })
    }

    return res.send({ code: httpStatus.OK, message: "Device gotten successfully", device: device[0] })
})

const getDeviceList = catchAsync(async (req, res) => {
    const response = await authenticate(req)
    if (response.code !== httpStatus.OK) {
        return res.send(response)
    }

    const publisherId = req.params.publisherId
    const publisher = await publisherService.getPublisher(publisherId)

    if (!publisher || !publisher.length) {
        return res.send({ code: httpStatus.NOT_FOUND, message: "The publisher is not existed" })
    }

    const start = req.params.start
    const limit = req.params.limit

    let totalDevices = await deviceService.countTotalDevices(publisherId)
    totalDevices = totalDevices[0].total_count
    if (totalDevices === 0) {
        return res.send({ code: httpStatus.OK, message: "No devices", totalDevices })
    }

    const devices = await deviceService.getDeviceList(publisherId, parseInt(start) - 1, parseInt(limit))
    let count = devices && devices.length ? devices.length : 0
    return res.send({ code: httpStatus.OK, message: "Devices gotten successfully", totalDevices, from: start, count, devices })
})

module.exports = {
    addDevice,
    updateDevice,
    deleteDevice,
    getDevice,
    getDeviceList
}

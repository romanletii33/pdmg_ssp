const catchAsync = require('../libs/catchAsync')
const httpStatus = require("http-status")
const moment = require("moment")
const { authenticate } = require('../middlewares/auth.middleware')
const { publisherService, endpointService } = require("../services")
const { generateGUID } = require('../libs/methods')

const addEndpoint = catchAsync(async (req, res) => {
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

    const endpointId = generateGUID()
    addFields.push(`publisher_id = '${publisherId}'`);
    if (req.body.endpointId) addFields.push(`publisher_endpoint_id = '${req.body.endpointId}'`);
    else addFields.push(`publisher_endpoint_id = '${endpointId}'`)
    if (req.body.isActive) addFields.push(`is_active = '${req.body.isActive}'`);
    if (req.body.dspEndpointUrl) addFields.push(`dsp_endpoint_url = '${req.body.dspEndpointUrl}'`);
    if (req.body.prefilterGeoCountry) addFields.push(`prefilter_geo_country = '${JSON.stringify(req.body.prefilterGeoCountry)}'`);
    if (req.body.queriesPerSecond !== undefined) addFields.push(`queries_per_second = ${req.body.queriesPerSecond}`);
    if (req.body.prefilterMaxBidPrice !== undefined) addFields.push(`prefilter_max_bid_price = '${req.body.prefilterMaxBidPrice}'`);

    const currentDate = moment().unix()

    addFields.push(`created_at = ${currentDate}`);
    addFields.push(`updated_at = ${currentDate}`);

    const result = await endpointService.addEndpoint(addFields)

    if (result && result.affectedRows && result.affectedRows > 0)
        return res.send({ code: httpStatus.OK, message: 'Publisher endpoint added successfully', endpointId })
    else
        return res.send({ code: httpStatus.NOT_IMPLEMENTED, message: 'Not added' })
})

const updateEndpoint = catchAsync(async (req, res) => {
    const response = await authenticate(req)
    if (response.code !== httpStatus.OK) {
        return res.send(response)
    }

    const publisherId = req.params.publisherId
    const endpointId = req.params.endpointId

    const endpoint = await endpointService.getEndpoint(publisherId, endpointId)
    if (!endpoint || !endpoint.length) {
        return res.send({ code: httpStatus.NOT_FOUND, message: "The endpoint is not existed" })
    }

    let updateFields = [];

    if (req.body.isActive) updateFields.push(`is_active = '${req.body.isActive}'`);
    if (req.body.dspEndpointUrl) updateFields.push(`dsp_endpoint_url = '${req.body.dspEndpointUrl}'`);
    if (req.body.prefilterGeoCountry) updateFields.push(`prefilter_geo_country = '${JSON.stringify(req.body.prefilterGeoCountry)}'`);
    if (req.body.queries_per_second !== undefined) updateFields.push(`queries_per_second = ${req.body.queries_per_second}`);
    if (req.body.prefilterMaxBidPrice !== undefined) updateFields.push(`prefilter_max_bid_price = '${req.body.prefilterMaxBidPrice}'`);

    if (!updateFields || !updateFields.length) {
        return res.send({ code: httpStatus.BAD_REQUEST, message: 'No fields to update' });
    }

    const currentDate = moment().unix()
    updateFields.push(`updated_at = ${currentDate}`);

    const result = await endpointService.updateEndpoint(updateFields, publisherId, endpointId);

    if (result && result.affectedRows && result.affectedRows > 0) {
        return res.send({ code: httpStatus.OK, message: 'Endpoint updated successfully' })

    } else {
        return res.send({ code: httpStatus.NOT_FOUND, message: 'Not updated' })
    }
})

const deleteEndpoint = catchAsync(async (req, res) => {
    const response = await authenticate(req)
    if (response.code !== httpStatus.OK) {
        return res.send(response)
    }

    const publisherId = req.params.publisherId
    const endpointId = req.params.endpointId

    const endpoint = await endpointService.getEndpoint(publisherId, endpointId)
    if (!endpoint || !endpoint.length) {
        return res.send({ code: httpStatus.NOT_FOUND, message: "The endpoint is not existed" })
    }

    let updateFields = [];

    updateFields.push(`deleted_at = '${moment().unix()}'`);

    const result = await endpointService.updateEndpoint(updateFields, publisherId, endpointId);

    if (result && result.affectedRows && result.affectedRows > 0) {
        return res.send({ code: httpStatus.OK, message: 'Endpoint deleted successfully' })

    } else {
        return res.send({ code: httpStatus.NOT_FOUND, message: 'Not deleted' })
    }
})

const getEndpoint = catchAsync(async (req, res) => {
    const response = await authenticate(req)
    if (response.code !== httpStatus.OK) {
        return res.send(response)
    }

    const publisherId = req.params.publisherId
    const endpointId = req.params.endpointId

    const endpoint = await endpointService.getEndpoint(publisherId, endpointId)
    if (!endpoint || !endpoint.length) {
        return res.send({ code: httpStatus.NOT_FOUND, message: "The endpoint is not existed" })
    }

    return res.send({ code: httpStatus.OK, message: "Endpoint gotten successfully", endpoint: endpoint[0] })
})

const getEndpointList = catchAsync(async (req, res) => {
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

    let totalEndpoints = await endpointService.countTotalEndpoints(publisherId)
    totalEndpoints = totalEndpoints[0].total_count
    if (totalEndpoints === 0) {
        return res.send({ code: httpStatus.OK, message: "No endpoints", totalEndpoints })
    }

    const endpoints = await endpointService.getEndpointList(publisherId, parseInt(start) - 1, parseInt(limit))
    let count = endpoints && endpoints.length ? endpoints.length : 0
    return res.send({ code: httpStatus.OK, message: "Endpoints gotten successfully", totalEndpoints, from: start, count, endpoints })
})

module.exports = {
    addEndpoint,
    updateEndpoint,
    deleteEndpoint,
    getEndpoint,
    getEndpointList
}

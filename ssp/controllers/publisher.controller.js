const catchAsync = require('../libs/catchAsync')
const httpStatus = require("http-status")
const moment = require('moment')
const { authenticate } = require('../middlewares/auth.middleware')
const { generateGUID, generateSecurityKey } = require("../libs/methods")
const {
    publisherService,
    endpointService,
    deviceService,
    dealService,
    winService,
    reportService
} = require("../services")

const addPublisher = catchAsync(async (req, res) => {
    const response = await authenticate(req, admin = true)
    if (response.code !== httpStatus.OK) {
        return res.send(response)
    }

    let addFields = [];
    const publisherId = generateGUID()

    if (req.body.publisherId) addFields.push(`publisher_id = '${req.body.publisherId}'`);
    else addFields.push(`publisher_id = '${publisherId}'`)
    if (req.body.isActive) addFields.push(`is_active = '${req.body.isActive}'`);
    if (req.body.domain) addFields.push(`domain = '${req.body.domain}'`);
    if (req.body.company) addFields.push(`company = '${req.body.company}'`);
    if (req.body.contactName) addFields.push(`contact_name = '${req.body.contactName}'`);
    if (req.body.contactEmail) addFields.push(`contact_email = '${req.body.contactEmail}'`);
    if (req.body.contactPhone) addFields.push(`contact_phone = '${req.body.contactPhone}'`);
    if (req.body.taxId) addFields.push(`tax_id = '${req.body.taxId}'`);
    if (req.body.address) addFields.push(`address = '${req.body.address}'`);
    if (req.body.city) addFields.push(`city = '${req.body.city}'`);
    if (req.body.state) addFields.push(`state = '${req.body.state}'`);
    if (req.body.postalCode) addFields.push(`postal_code = '${req.body.postalCode}'`);
    if (req.body.publisherMinFloorPrice !== undefined) addFields.push(`publisher_min_floor_price = ${req.body.publisherMinFloorPrice}`);
    if (req.body.auctionType !== undefined) addFields.push(`auction_type = '${req.body.auctionType}'`);
    if (req.body.privateAuction !== undefined) addFields.push(`private_auction = '${req.body.privateAuction}'`);

    const currentDate = moment().unix()

    let securityKey = await generateSecurityKey()
    addFields.push(`security_key = '${securityKey}'`)
    addFields.push(`created_at = ${currentDate}`);
    addFields.push(`updated_at = ${currentDate}`);

    const result = await publisherService.addPublisher(addFields)
    if (result && result.affectedRows && result.affectedRows > 0) {
        return res.send({
            code: httpStatus.OK,
            message: 'Publisher added successfully',
            publisherId,
            securityKey
        })

    } else {
        return res.send({ code: httpStatus.NOT_IMPLEMENTED, message: 'Not added' })
    }
})

const updatePublisher = catchAsync(async (req, res) => {
    const publisherId = req.params.publisherId
    const response = await authenticate(req)
    if (response.code !== httpStatus.OK) {
        return res.send(response)
    }

    const publisher = await publisherService.getPublisher(publisherId)
    if (!publisher || !publisher.length) {
        return res.send({ code: httpStatus.NOT_FOUND, message: "The publisher is not existed" })
    }

    let updateFields = [];

    if (req.body.isActive) updateFields.push(`is_active = '${req.body.isActive}'`);
    if (req.body.domain) updateFields.push(`domain = '${req.body.domain}'`);
    if (req.body.company) updateFields.push(`company = '${req.body.company}'`);
    if (req.body.contactName) updateFields.push(`contact_name = '${req.body.contactName}'`);
    if (req.body.contactEmail) updateFields.push(`contact_email = '${req.body.contactEmail}'`);
    if (req.body.contactPhone) updateFields.push(`contact_phone = '${req.body.contactPhone}'`);
    if (req.body.taxId) updateFields.push(`tax_id = '${req.body.taxId}'`);
    if (req.body.address) updateFields.push(`address = '${req.body.address}'`);
    if (req.body.city) updateFields.push(`city = '${req.body.city}'`);
    if (req.body.state) updateFields.push(`state = '${req.body.state}'`);
    if (req.body.postalCode) updateFields.push(`postal_code = '${req.body.postalCode}'`);
    if (req.body.publisherMinFloorPrice !== undefined) updateFields.push(`publisher_min_floor_price = ${req.body.publisherMinFloorPrice}`);
    if (req.body.auctionType !== undefined) updateFields.push(`auction_type = '${req.body.auctionType}'`);
    if (req.body.privateAuction !== undefined) updateFields.push(`private_auction = '${req.body.privateAuction}'`);

    if (!updateFields || !updateFields.length) {
        return res.send({ code: httpStatus.BAD_REQUEST, message: 'No fields to update' });
    }

    const currentDate = moment().unix()
    updateFields.push(`updated_at = ${currentDate}`);

    const result = await publisherService.updatePublisher(updateFields, publisherId);

    if (result && result.affectedRows && result.affectedRows > 0) {
        return res.send({ code: httpStatus.OK, message: 'Publisher updated successfully' })

    } else {
        return res.send({ code: httpStatus.NOT_FOUND, message: 'Not updated' })
    }
});

const getPublisher = catchAsync(async (req, res) => {
    const publisherId = req.params.publisherId
    const response = await authenticate(req)
    if (response.code !== httpStatus.OK) {
        return res.send(response)
    }

    const publisher = await publisherService.getPublisher(publisherId)
    if (!publisher || !publisher.length) {
        return res.send({ code: httpStatus.NOT_FOUND, message: "The publisher is not existed" })
    }

    return res.send({ code: httpStatus.OK, message: "Publisher gotten successfully", publisher: publisher[0] })
})

const getPublisherList = catchAsync(async (req, res) => {
    const response = await authenticate(req, admin = true)
    if (response.code !== httpStatus.OK) {
        return res.send(response)
    }

    const start = req.params.start
    const limit = req.params.limit

    let totalPublishers = await publisherService.countTotalPublishers()
    totalPublishers = totalPublishers[0].total_count
    if (totalPublishers === 0) {
        return res.send({ code: httpStatus.OK, message: "No publishers", totalPublishers })
    }

    const publishers = await publisherService.getPublisherList(parseInt(start) - 1, parseInt(limit))
    let count = publishers && publishers.length ? publishers.length : 0

    return res.send({ code: httpStatus.OK, message: "Publishers gotten successfully", totalPublishers, from: start, count, publishers })
})

const deletePublisher = catchAsync(async (req, res) => {
    const publisherId = req.params.publisherId
    const response = await authenticate(req)
    if (response.code !== httpStatus.OK) {
        return res.send(response)
    }

    const publisher = await publisherService.getPublisher(publisherId)
    if (!publisher || !publisher.length) {
        return res.send({ code: httpStatus.NOT_FOUND, message: "The publisher is not existed" })
    }
    let updateFields = [];

    updateFields.push(`deleted_at = '${moment().unix()}'`);
    await publisherService.updatePublisher(updateFields, publisherId);
    await endpointService.updateEndpoint(updateFields, publisherId);
    await deviceService.updateDevice(updateFields, publisherId);
    await dealService.updateDeal(updateFields, publisherId);
    await winService.updateReportingWins(updateFields, publisherId);
    await reportService.updateConsolidatedWins(updateFields, publisherId);

    return res.send({ code: httpStatus.OK, message: 'Publisher deleted successfully' })

})

module.exports = {
    addPublisher,
    updatePublisher,
    deletePublisher,
    getPublisherList,
    getPublisher
}

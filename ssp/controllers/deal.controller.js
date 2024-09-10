const catchAsync = require('../libs/catchAsync')
const httpStatus = require("http-status")
const moment = require('moment')
const { authenticate } = require('../middlewares/auth.middleware')
const { dealService, publisherService } = require("../services")
const { generateGUID } = require("../libs/methods")

const addDeal = catchAsync(async (req, res) => {
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

  const dealId = generateGUID()
  addFields.push(`publisher_id = '${publisherId}'`);
  if (req.body.dealId) addFields.push(`deal_id = '${req.body.dealId}'`);
  else addFields.push(`deal_id = '${dealId}'`)
  if (req.body.isActive) addFields.push(`is_active = '${req.body.isActive}'`);
  if (req.body.bidfloor !== undefined) addFields.push(`bidfloor = ${req.body.bidfloor}`);
  if (req.body.auctionType !== undefined) addFields.push(`auction_type = '${req.body.auctionType}'`);

  const currentDate = moment().unix()

  addFields.push(`created_at = ${currentDate}`);
  addFields.push(`updated_at = ${currentDate}`);

  const result = await dealService.addDeal(addFields)

  if (result && result.affectedRows && result.affectedRows > 0) {
    return res.send({ code: httpStatus.OK, message: 'Publisher deal added successfully', dealId })

  } else {
    return res.send({ code: httpStatus.NOT_IMPLEMENTED, message: 'Not added' })
  }
})

const updateDeal = catchAsync(async (req, res, next) => {
  const response = await authenticate(req)
  if (response.code !== httpStatus.OK) {
    return res.send(response)
  }

  const dealId = req.params.dealId
  const publisherId = req.params.publisherId
  const deal = await dealService.getDeal(publisherId, dealId)
  if (!deal || !deal.length) {
    return res.send({ code: httpStatus.NOT_FOUND, message: "The publisher deal is not existed" })
  }

  let updateFields = [];

  if (req.body.isActive) updateFields.push(`is_active = '${req.body.isActive}'`);
  if (req.body.bidfloor !== undefined) updateFields.push(`bidfloor = ${req.body.bidfloor}`);
  if (req.body.auctionType !== undefined) updateFields.push(`auction_type = '${req.body.auctionType}'`);

  if (!updateFields || !updateFields.length) {
    return res.send({ code: httpStatus.BAD_REQUEST, message: 'No fields to update' });
  }

  const currentDate = moment().unix()
  updateFields.push(`updated_at = ${currentDate}`)

  const result = await dealService.updateDeal(updateFields, publisherId, dealId);

  if (result && result.affectedRows && result.affectedRows > 0) {
    return res.send({ code: httpStatus.OK, message: 'Publisher deal updated successfully' })

  } else {
    return res.send({ code: httpStatus.NOT_FOUND, message: 'Not updated' })
  }
});

const deleteDeal = catchAsync(async (req, res) => {
  const response = await authenticate(req)
  if (response.code !== httpStatus.OK) {
    return res.send(response)
  }

  const dealId = req.params.dealId
  const publisherId = req.params.publisherId
  const deal = await dealService.getDeal(publisherId, dealId)
  if (!deal || !deal.length) {
    return res.send({ code: httpStatus.NOT_FOUND, message: "The publisher deal is not existed" })
  }

  let updateFields = [];

  updateFields.push(`deleted_at = '${moment().unix()}'`);

  const result = await dealService.updateDeal(updateFields, publisherId, dealId);

  if (result && result.affectedRows && result.affectedRows > 0) {
    return res.send({ code: httpStatus.OK, message: 'Publisher deal deleted successfully' })

  } else {
    return res.send({ code: httpStatus.NOT_FOUND, message: 'Not deleted' })
  }
})

const getDeal = catchAsync(async (req, res) => {
  const response = await authenticate(req)
  if (response.code !== httpStatus.OK) {
    return res.send(response)
  }

  const dealId = req.params.dealId
  const publisherId = req.params.publisherId
  const deal = await dealService.getDeal(publisherId, dealId)
  if (!deal || !deal.length) {
    return res.send({ code: httpStatus.NOT_FOUND, message: "The publisher deal is not existed" })
  }

  return res.send({ code: httpStatus.OK, message: "Publisher deal gotten successfully", deal: deal[0] })
})

const getDealList = catchAsync(async (req, res) => {
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

  let totalDeals = await dealService.countTotalDeals(publisherId)
  totalDeals = totalDeals[0].total_count
  if (totalDeals === 0) {
    return res.send({ code: httpStatus.OK, message: "No publisher deals", totalDeals })
  }

  const deals = await dealService.getDealList(publisherId, parseInt(start) - 1, parseInt(limit))
  let count = deals && deals.length ? deals.length : 0
  return res.send({ code: httpStatus.OK, message: "Publisher deals gotten successfully", totalDeals, from: start, count, deals })
})

module.exports = {
  addDeal,
  updateDeal,
  deleteDeal,
  getDeal,
  getDealList
}
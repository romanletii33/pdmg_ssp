const { publisherService, reportService, endpointService } = require("../services")
const catchAsync = require('../libs/catchAsync')
const httpStatus = require("http-status")
const { authenticate } = require('../middlewares/auth.middleware')

const sendReportToPublisher = catchAsync(async (req, res) => {
  const respond = await authenticate(req)
  if (respond.code !== httpStatus.OK) {
    return res.send(respond)
  }

  const publisherId = req.params.publisherId
  let publisher = await publisherService.getPublisher(publisherId)

  if (!publisher || !publisher.length) {
    return res.send({
      code: httpStatus.NOT_FOUND,
      message: 'Not existed publisher'
    })
  }
  const endpointId = req.params.endpointId || ''
  if (endpointId) {
    let endpoint = await endpointService.getEndpoint(publisherId, endpointId)
    if (!endpoint || !endpoint.length) {
      return res.send({
        code: httpStatus.NOT_FOUND,
        message: "Not existed endpoint"
      })
    }
  }

  const response = await reportService.sendReportToPublisher(publisherId, endpointId)
  res.send(response)
})

module.exports = {
  sendReportToPublisher
}

const restify = require('restify')
const httpStatus = require("http-status")
const morgan = require("../config/morgan.config")
const logger = require("../config/logger.config")
const restifyCors = require('restify-cors-middleware')
const validate = require("../middlewares/validate.middleware")
const {
    publisherValidator,
    endpointValidator,
    deviceValidator,
    dealValidator,
    reportValidator
} = require("../validators"),
    {
        auctionController,
        publisherController,
        endpointController,
        deviceController,
        dealController,
        reportController
    } = require("../controllers")

const cors = restifyCors({
    origins: ['*']
})

class SSPEngine {
    constructor(options) {
        this.server = restify.createServer()
        this.server.pre(cors.preflight)
        this.server.use(cors.actual)
        this.server.use(restify.plugins.queryParser())
        this.server.use(restify.plugins.bodyParser())

        this.server.use((req, res, next) => {
            morgan.successHandler(req, res, (err) => {
                if (err) return next(err)
                morgan.errorHandler(req, res, next)
            })
        })

        // handle auction request 
        this.server.get(
            "/api/v1/auction",
            validate(publisherValidator.auction),
            auctionController.startAuction.bind(this)
        )

        // reporting api
        this.server.get(
            "/api/v1/report/:publisherId",
            validate(reportValidator.report),
            reportController.sendReportToPublisher
        )
        this.server.get(
            "/api/v1/report/:publisherId/:endpointId",
            validate(reportValidator.report),
            reportController.sendReportToPublisher
        )

        // publisher api
        this.server.post(
            '/api/v1/publisher',
            validate(publisherValidator.addPublisher),
            publisherController.addPublisher.bind(this)
        )
        this.server.patch(
            `/api/v1/publisher/:publisherId`,
            validate(publisherValidator.updatePublisher),
            publisherController.updatePublisher.bind(this)
        )
        this.server.del(
            `/api/v1/publisher/:publisherId`,
            validate(publisherValidator.deletePublisher),
            publisherController.deletePublisher.bind(this)
        )
        this.server.get(
            `/api/v1/publisher/:publisherId`,
            validate(publisherValidator.getPublisher),
            publisherController.getPublisher.bind(this)
        )
        this.server.get(
            `/api/v1/publisher/list/:start/:limit`,
            validate(publisherValidator.getPublishers),
            publisherController.getPublisherList.bind(this)
        )

        // publisher endpoints api
        this.server.post(
            '/api/v1/publisher/:publisherId/endpoint',
            validate(endpointValidator.addEndpoint),
            endpointController.addEndpoint.bind(this)
        )
        this.server.patch(
            `/api/v1/publisher/:publisherId/endpoint/:endpointId`,
            validate(endpointValidator.updateEndpoint),
            endpointController.updateEndpoint.bind(this)
        )
        this.server.del(
            `/api/v1/publisher/:publisherId/endpoint/:endpointId`,
            validate(endpointValidator.deleteEndpoint),
            endpointController.deleteEndpoint.bind(this)
        )
        this.server.get(
            `/api/v1/publisher/:publisherId/endpoint/list/:start/:limit`,
            validate(endpointValidator.getEndpoints),
            endpointController.getEndpointList.bind(this)
        )
        this.server.get(
            `/api/v1/publisher/:publisherId/endpoint/:endpointId`,
            validate(endpointValidator.getEndpoint),
            endpointController.getEndpoint.bind(this)
        )

        // device api
        this.server.post(
            '/api/v1/publisher/:publisherId/device',
            validate(deviceValidator.addDevice),
            deviceController.addDevice.bind(this)
        )
        this.server.patch(
            `/api/v1/publisher/:publisherId/device/:deviceId`,
            validate(deviceValidator.updateDevice),
            deviceController.updateDevice.bind(this)
        )
        this.server.del(
            `/api/v1/publisher/:publisherId/device/:deviceId`,
            validate(deviceValidator.deleteDevice),
            deviceController.deleteDevice.bind(this)
        )
        this.server.get(
            `/api/v1/publisher/:publisherId/device/list/:start/:limit`,
            validate(deviceValidator.getDevices),
            deviceController.getDeviceList.bind(this)
        )
        this.server.get(
            `/api/v1/publisher/:publisherId/device/:deviceId`,
            validate(deviceValidator.getDevice),
            deviceController.getDevice.bind(this)
        )

        // publisher deal api
        this.server.post(
            '/api/v1/publisher/:publisherId/deal',
            validate(dealValidator.addDeal),
            dealController.addDeal.bind(this)
        )
        this.server.patch(
            `/api/v1/publisher/:publisherId/deal/:dealId`,
            validate(dealValidator.updateDeal),
            dealController.updateDeal.bind(this)
        )
        this.server.del(
            `/api/v1/publisher/:publisherId/deal/:dealId`,
            validate(dealValidator.deleteDeal),
            dealController.deleteDeal.bind(this)
        )
        this.server.get(
            `/api/v1/publisher/:publisherId/deal/:dealId`,
            validate(dealValidator.getDeal),
            dealController.getDeal.bind(this)
        )
        this.server.get(
            `/api/v1/publisher/:publisherId/deal/list/:start/:limit`,
            validate(dealValidator.getDeals),
            dealController.getDealList.bind(this)
        )

        let hcendpoint = '/'
        if (options && options.healthCheck) {
            hcendpoint = options.healthCheck
        }

        this.server.get(hcendpoint, this._handleHealthCheck.bind(this))

        process.on('SIGTERM', () => {
            this.server.close(() => {
                logger.info('Server closed gracefully');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            this.server.close(() => {
                logger.info('Server closed gracefully');
                process.exit(0);
            });
        });
    }

    listen(port) {
        this.server.listen(port, () => {
            logger.info(`System listening at ${this.server.url}`)
        })
    }

    _handleHealthCheck(req, res, next) {
        res.send({ code: httpStatus.OK, message: `System is running at ${this.server.url}` })
        next()
    }

}

module.exports = SSPEngine
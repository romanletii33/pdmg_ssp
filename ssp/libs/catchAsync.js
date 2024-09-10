const errs = require('restify-errors')

const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(new errs.InternalServerError(err.message)))
}

module.exports = catchAsync
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const Joi = require('joi');
const validate = require('../../middlewares/validate.middleware');
const errs = require('restify-errors');

chai.use(require('sinon-chai'));

describe('Validate Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {}
    };
    res = {};
    next = sinon.spy();
  });

  it('should call next with no error if validation passes', () => {
    const schema = {
      body: Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required()
      })
    };

    req.body = { name: 'John', age: 30 };

    const middleware = validate(schema);
    middleware(req, res, next);

    expect(next).to.have.been.calledOnce;
    expect(next).to.have.been.calledWith();
  });

  it('should call next with BadRequestError if validation fails', () => {
    const schema = {
      body: Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required()
      })
    };

    req.body = { name: 'John' }; // Missing 'age'

    const middleware = validate(schema);
    middleware(req, res, next);

    expect(next).to.have.been.calledOnce;
    expect(next.args[0][0]).to.be.an.instanceof(errs.BadRequestError);
    expect(next.args[0][0].message).to.contain('"age" is required');
  });

  it('should validate params, query, and body if schema contains them', () => {
    const schema = {
      params: Joi.object({
        id: Joi.string().required()
      }),
      query: Joi.object({
        search: Joi.string().required()
      }),
      body: Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required()
      })
    };

    req.params = { id: '123' };
    req.query = { search: 'test' };
    req.body = { name: 'John', age: 30 };

    const middleware = validate(schema);
    middleware(req, res, next);

    expect(next).to.have.been.calledOnce;
    expect(next).to.have.been.calledWith();
  });

  it('should merge validated values into req object', () => {
    const schema = {
      body: Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required()
      })
    };

    req.body = { name: 'John', age: '30' }; // Note: 'age' as a string

    const middleware = validate(schema);
    middleware(req, res, next)

    expect(req.body.age).to.be.an('number');
  });
});

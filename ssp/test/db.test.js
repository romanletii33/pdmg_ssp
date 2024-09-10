const sinon = require('sinon');
const { DB_HANDLE } = require('../model');
const assert = require("assert")

describe('Server Initialization', () => {
  let originalExit;
  let connectStub

  before(() => {
    originalExit = process.exit;
    process.exit = sinon.stub();
  });

  after(() => {
    process.exit = originalExit;
  });

  beforeEach(() => {
    connectStub = sinon.stub(DB_HANDLE, 'connect');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should start the server when DB connection is successful', (done) => {
    connectStub.callsFake((callback) => callback(null));

    DB_HANDLE.connect(err => {
      assert.strictEqual(err, null)
      done()
    })
  });

  it('should exit the process when DB connection fails', (done) => {
    const error = new Error('DB connection failed');
    connectStub.callsFake((callback) => callback(error));

    DB_HANDLE.connect(err => {
      assert.strictEqual(err, error)
      done()
    })
  });
});

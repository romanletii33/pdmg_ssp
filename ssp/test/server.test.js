const assert = require('assert')
const sinon = require('sinon')
const config = require('../config/config')
const httpStatus = require("http-status")
const SSPEngine = require('../engine/server')

// Test the status of server running
describe('SSPEngine Server', () => {
  let engine
  beforeEach(() => {
    engine = new SSPEngine({ healthCheck: '/healthCheck' })
  })

  it('should start the server', () => {
    const listenSpy = sinon.spy(engine.server, 'listen')
    engine.listen(config.port)
    assert(listenSpy.calledOnce)
  })

  it('should handle health check requests', async () => {
    const req = {}
    const res = { send: sinon.stub(), next: sinon.stub() }
    await engine._handleHealthCheck(req, res, res.next)
    sinon.assert.calledWith(res.send, { code: httpStatus.OK, message: `System is running at ${engine.server.url}` })
  })
})

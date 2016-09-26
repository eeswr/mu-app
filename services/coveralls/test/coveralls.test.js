'use strict'

const Mu = require('mu')

const test = require('tape')
const _ = require('lodash')

const Proxyquire = require('proxyquire')
const NpmSenecaFakeData = require('./npm-data')
const CoverallsSenecaFakeData = require('./coveralls-data')

const NpmRegistry = 'http://registry.npmjs.org/'
const CoverallsUrl = 'https://coveralls.io/'
const invalidPluginName = 'qwerty_qwerty'

var RequestMap = []
const RequestProxy = {
  request: {
    get: (opts, done) => {
      const request = _.find(RequestMap, (o) => { return opts.url.includes(o.urlMatch) })
      if (request) {
        done(request.err, request.response, request.body)
      }
      else {
        done(new Error('invalid request error'), null, null)
      }
    }
  }
}

const Coveralls = Proxyquire('..', RequestProxy)

function createInstance (options) {
  const opts = _.assign({log: 'silent'}, options)
  return Seneca(opts)
  .use('seneca-entity')
  .use(Coveralls, {
    registry: NpmRegistry,
    url: CoverallsUrl
  })
}

process.setMaxListeners(12)

const DefaultRequestMap = [
{
  urlMatch: NpmRegistry + 'seneca',
  err: null,
  response: {},
  body: JSON.stringify(NpmSenecaFakeData)
},
{
  urlMatch: 'coveralls.io',
  err: null,
  response: {},
  body: JSON.stringify(CoverallsSenecaFakeData)
}
]

test('"role:store, cmd:get, type:coveralls" non cached valid response', (t) => {
  RequestMap = DefaultRequestMap.slice(0)
  t.plan(6)

  const mu = Mu()
  const payload = { 'name': 'seneca' }

  Coveralls(mu, {registry: NpmRegistry, url: CoverallsUrl}, () => {
    mu.dispatch({role: 'store', cmd: 'get', type:'coveralls', name: payload.name}, (err, reply) => {
      t.error(err)
      t.equal(reply.name, payload.name)
      t.ok(_.isNumber(reply.coveredPercent))
      t.ok(_.isNumber(reply.coverageChange))
      t.ok(reply.badgeUrl)
      t.ok(reply.cached)
    })
  })
})

test('"role:store, cmd:get, type:coveralls" cached valid response', (t) => {
  RequestMap = DefaultRequestMap.slice(0)
  t.plan(5)

  const mu = Mu()
  const payload = { 'name': 'seneca' }

  Coveralls(mu, {registry: NpmRegistry, url: CoverallsUrl}, () => {
    mu.dispatch({role: 'store', cmd: 'get', type:'coveralls', name: payload.name}, (err, reply) => {
        t.error(err)

        const cachedOne = reply.cached
        t.ok(cachedOne)

        mu.dispatch({role: 'store', cmd: 'get', type:'coveralls', name: payload.name}, (err, reply) => {
          t.error(err)

          const cachedTwo = reply.cached
          t.ok(cachedTwo)

          t.equal(cachedOne, cachedTwo)
        })
    })
  })
})

  //   it('test cached valid response', (done) => {
  //     const payload = { 'name': 'seneca' }

  //     si.act('role:coveralls,cmd:get', payload, function (err, reply) {
  //     })
  //   })

  // describe('Valid "role:coveralls,cmd:get" calls', () => {

  //   it('test non-cached valid reponse - update flag', (done) => {
  //     const payload = {name: 'seneca'}

  //     si.act('role:coveralls,cmd:get', payload, (err, reply) => {
  //       expect(err).to.not.exist()

  //       const cachedOne = reply.data.cached
  //       expect(cachedOne).to.exist()
  //       payload.update = true

  //       si.act('role:coveralls,cmd:get', payload, (err, reply) => {
  //         expect(err).to.not.exist()

  //         const cachedTwo = reply.data.cached
  //         expect(cachedTwo).to.exist()

  //         expect(cachedOne).to.be.below(cachedTwo)

  //         done()
  //       })
  //     })
  //   })
  // })

  // describe('Invalid "role:coveralls,cmd:get" calls', () => {
  //   it('has no error and no data', (done) => {
  //     const seneca = createInstance()
  //     const payload = {name: invalidPluginName}
  //     const invalidPluginMap = {
  //       urlMatch: invalidPluginName,
  //       err: null,
  //       response: {},
  //       body: '{}'
  //     }

  //     seneca.ready(function () {
  //       RequestMap = _.concat(DefaultRequestMap, invalidPluginMap)

  //       seneca.act('role:coveralls,cmd:get', payload, (err, reply) => {
  //         expect(err).to.not.exist()
  //         expect(reply.ok).to.be.false()
  //         expect(reply.err).to.exist()

  //         done()
  //       })
  //     })
  //   })

  //   it('npm request returns error', (done) => {
  //     const seneca = createInstance()
  //     const payload = {name: 'seneca'}
  //     const errMsg = 'Request failed'
  //     const failedRequestMap = {
  //       urlMatch: 'npm',
  //       err: errMsg,
  //       response: null,
  //       body: null
  //     }

  //     seneca.ready(function () {
  //       RequestMap = _.concat([], failedRequestMap)

  //       seneca.act('role:coveralls,cmd:get', payload, (err, reply) => {
  //         expect(err).to.not.exist()
  //         expect(reply.ok).to.be.false()
  //         expect(reply.err).to.equal(errMsg)

  //         done()
  //       })
  //     })
  //   })

  //   it('npm request invalid body', (done) => {
  //     const seneca = createInstance()
  //     const payload = {name: 'seneca'}
  //     const failedRequestMap = {
  //       urlMatch: 'npm',
  //       err: null,
  //       response: null,
  //       body: {}
  //     }

  //     seneca.ready(function () {
  //       RequestMap = _.concat([], failedRequestMap)

  //       seneca.act('role:coveralls,cmd:get', payload, (err, reply) => {
  //         expect(err).to.not.exist()
  //         expect(reply.ok).to.be.false()
  //         expect(reply.err).to.exist()

  //         done()
  //       })
  //     })
  //   })

  //   it('coveralls request returns error', (done) => {
  //     const seneca = createInstance()
  //     const payload = {name: 'seneca'}
  //     const errMsg = 'Request failed'
  //     const failedRequestMap = {
  //       urlMatch: 'coveralls',
  //       err: errMsg,
  //       response: null,
  //       body: null
  //     }

  //     seneca.ready(function () {
  //       RequestMap = _.concat([], failedRequestMap, DefaultRequestMap[0])

  //       seneca.act('role:coveralls,cmd:get', payload, (err, reply) => {
  //         expect(err).to.not.exist()
  //         expect(reply.ok).to.be.false()
  //         expect(reply.err).to.equal(errMsg)

  //         done()
  //       })
  //     })
  //   })

  //   it('coveralls request invalid body', (done) => {
  //     const seneca = createInstance()
  //     const payload = {name: 'seneca'}
  //     const failedRequestMap = {
  //       urlMatch: 'coveralls',
  //       err: null,
  //       response: null,
  //       body: {}
  //     }

  //     seneca.ready(function () {
  //       RequestMap = _.concat([], failedRequestMap, DefaultRequestMap[0])

  //       seneca.act('role:coveralls,cmd:get', payload, (err, reply) => {
  //         expect(err).to.not.exist()
  //         expect(reply.ok).to.be.false()
  //         expect(reply.err).to.exist()

  //         done()
  //       })
  //     })
  //   })

  //   it('coveralls request invalid body', (done) => {
  //     const seneca = createInstance()
  //     const payload = {name: 'seneca'}
  //     const failedRequestMap = {
  //       urlMatch: 'coveralls',
  //       err: null,
  //       response: { statusCode: 404 },
  //       body: '<html lang=\'en\'></html>'
  //     }

  //     seneca.ready(function () {
  //       RequestMap = _.concat([], failedRequestMap, DefaultRequestMap[0])

  //       seneca.act('role:coveralls,cmd:get', payload, (err, reply) => {
  //         expect(err).to.not.exist()
  //         expect(reply.ok).to.be.false()
  //         expect(reply.err).to.exist()

  //         done()
  //       })
  //     })
  //   })
  // })

  // describe('Valid "role:info,req:part" calls', () => {
  //   it('has no error and has data', (done) => {
  //     const seneca = createInstance()
  //     const payload = {name: 'seneca'}

  //     seneca.ready(function () {
  //       seneca.act('role:info,req:part', payload, (err, reply) => {
  //         expect(err).to.not.exist()
  //         expect(reply.ok).to.be.true()

  //         done()
  //       })
  //     })
  //   })

  //   it('responds via "role:info,res:part"', (done) => {
  //     const seneca = createInstance()
  //     const payload = {name: 'seneca'}

  //     seneca.ready(function () {
  //       seneca.add('role:info,res:part', (msg, cb) => {
  //         expect(msg).to.exist()

  //         cb()
  //         done()
  //       })

  //       seneca.act('role:info,req:part', payload, (err, reply) => {
  //         expect(err).to.not.exist()
  //         expect(reply).to.exist()
  //         expect(reply.ok).to.be.true()
  //       })
  //     })
  //   })
  // })

  // describe('Invalid "role:info,req:part" calls', () => {
  //   it('calls role:coveralls,cmd:get and receives an error', (done) => {
  //     const seneca = createInstance()
  //     const payload = {name: 'seneca'}
  //     const errMsg = 'error'

  //     seneca.ready(function () {
  //       seneca.add('role:coveralls,cmd:get', (msg, cb) => {
  //         expect(msg).to.exist()

  //         cb(errMsg, null)
  //         done()
  //       })

  //       seneca.act('role:info,req:part', payload, (err, reply) => {
  //         expect(err).to.not.exist()
  //         expect(reply).to.exist()
  //         expect(reply.ok).to.be.false()
  //         expect(reply.err).to.equal(errMsg)
  //       })
  //     })
  //   })

  //   it('calls role:coveralls,cmd:get and the npm request fails', (done) => {
  //     const seneca = createInstance()
  //     const payload = {name: 'seneca'}
  //     const errMsg = 'Request failed'
  //     const failedRequestMap = {
  //       urlMatch: 'npm',
  //       err: errMsg,
  //       response: null,
  //       body: null
  //     }

  //     seneca.ready(function () {
  //       RequestMap = _.concat([], failedRequestMap)

  //       seneca.act('role:info,req:part', payload, (err, reply) => {
  //         expect(err).to.not.exist()
  //         expect(reply.ok).to.be.false()
  //         expect(reply.err).to.equal(errMsg)

  //         done()
  //       })
  //     })
  //   })
  // })

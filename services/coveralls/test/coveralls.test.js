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

test('"role:store, cmd:get, type:coveralls" non cached valid response - update flag', (t) => {
  RequestMap = DefaultRequestMap.slice(0)
  t.plan(5)

  const mu = Mu()
  const payload = { 'name': 'seneca' }

  Coveralls(mu, {registry: NpmRegistry, url: CoverallsUrl}, () => {
    mu.dispatch({role: 'store', cmd: 'get', type:'coveralls', name: payload.name}, (err, reply) => {
      t.error(err)

      const cachedOne = reply.cached
      t.ok(cachedOne)

      payload.update = true

      mu.dispatch({role: 'store', cmd: 'get', type:'coveralls', name: payload.name, update: payload.update}, (err, reply) => {
        t.error(err)

        const cachedTwo = reply.cached
        t.ok(cachedTwo)

        t.equal(cachedOne, cachedTwo)
      })
    })
  })
})

test('invalid "role:store, cmd:get, type:coveralls" no error and no data', (t) => {
  t.plan(1)

  const mu = Mu()

  const payload = {name: invalidPluginName}
  const invalidPluginMap = {
    urlMatch: invalidPluginName,
    err: null,
    response: {},
    body: '{}'
  }

  RequestMap = _.concat(DefaultRequestMap, invalidPluginMap)

  Coveralls(mu, {registry: NpmRegistry, url: CoverallsUrl}, () => {
    mu.dispatch({role: 'store', cmd: 'get', type:'coveralls', name: payload.name}, (err, reply) => {
      t.ok(err)
    })
  })
})


test('invalid "role:store, cmd:get, type:coveralls" npm request returns error', (t) => {
  t.plan(1)

  const mu = Mu()

  const payload = {name: 'seneca'}
  const errMsg = 'Request failed'
  const failedRequestMap = {
    urlMatch: 'npm',
    err: errMsg,
    response: null,
    body: null
  }

  RequestMap = _.concat([], failedRequestMap)

  Coveralls(mu, {registry: NpmRegistry, url: CoverallsUrl}, () => {
    mu.dispatch({role: 'store', cmd: 'get', type:'coveralls', name: payload.name}, (err, reply) => {
      t.equal(err, errMsg)
    })
  })
})

test('invalid "role:store, cmd:get, type:coveralls" invalid body', (t) => {
  t.plan(1)

  const mu = Mu()

  const payload = {name: 'seneca'}
  const errMsg = 'Request failed'
  const failedRequestMap = {
    urlMatch: 'npm',
    err: null,
    response: null,
    body: {}
  }

  RequestMap = _.concat([], failedRequestMap)

  Coveralls(mu, {registry: NpmRegistry, url: CoverallsUrl}, () => {
    mu.dispatch({role: 'store', cmd: 'get', type:'coveralls', name: payload.name}, (err, reply) => {
      t.ok(err)
    })
  })
})

test('invalid "role:store, cmd:get, type:coveralls" coveralls request return error', (t) => {
  t.plan(1)

  const mu = Mu()

  const payload = {name: 'seneca'}
  const errMsg = 'Request failed'
  const failedRequestMap = {
    urlMatch: 'coveralls',
    err: errMsg,
    response: null,
    body: null
  }

  RequestMap = _.concat([], failedRequestMap, DefaultRequestMap[0])

  Coveralls(mu, {registry: NpmRegistry, url: CoverallsUrl}, () => {
    mu.dispatch({role: 'store', cmd: 'get', type:'coveralls', name: payload.name}, (err, reply) => {
      t.equal(err, errMsg)
    })
  })
})

test('invalid "role:store, cmd:get, type:coveralls" coveralls request invalid body', (t) => {
  t.plan(1)

  const mu = Mu()

  const payload = {name: 'seneca'}
  const failedRequestMap = {
    urlMatch: 'coveralls',
    err: null,
    response: null,
    body: {}
  }


  RequestMap = _.concat([], failedRequestMap, DefaultRequestMap[0])

  Coveralls(mu, {registry: NpmRegistry, url: CoverallsUrl}, () => {
    mu.dispatch({role: 'store', cmd: 'get', type:'coveralls', name: payload.name}, (err, reply) => {
      t.ok(err)
    })
  })
})

test('invalid "role:store, cmd:get, type:coveralls" coveralls request invalid body', (t) => {
  t.plan(1)

  const mu = Mu()

  const payload = {name: 'seneca'}
  const failedRequestMap = {
    urlMatch: 'coveralls',
    err: null,
    response: { statusCode: 404 },
    body: '<html lang=\'en\'></html>'
  }

  RequestMap = _.concat([], failedRequestMap, DefaultRequestMap[0])

  Coveralls(mu, {registry: NpmRegistry, url: CoverallsUrl}, () => {
    mu.dispatch({role: 'store', cmd: 'get', type:'coveralls', name: payload.name}, (err, reply) => {
      t.ok(err)
    })
  })
})

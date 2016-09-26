'use strict'

var Tape = require('tape')
var Proxyquire = require('proxyquire')
var NpmProxy = require('./stubs/npm.proxy.js')
var Mu = require('mu')
var Tcp = require('mu/drivers/tcp')

var Npm = Proxyquire('..', NpmProxy)

Tape('Works over the network', (test) => {
  test.plan(5)

  var client = Mu()
  var server = Mu()

  server.inbound({role: 'store', type: 'npm'}, Tcp.server({port: 4000, host: 'localhost'}))
  client.outbound({role: 'store', type: 'npm'}, Tcp.client({port: 4000, host: 'localhost'}))

  Npm(server, {}, () => {
    client.dispatch({role: 'store', cmd: 'get', type: 'npm', name: 'example-module'}, (err, reply) => {
      test.error(err)
      test.ok(reply)

      test.same(reply.id, 'example-module')
      test.same(reply.name, 'example-module')
      test.ok(reply.cached)

      client.tearDown()
      server.tearDown()
    })
  })
})

Tape('A valid "role:store,type:npm,cmd:get" call - Has no error and valid data', (test) => {
  test.plan(2)

  var mu = Mu()

  Npm(mu, {}, () => {
    mu.dispatch({role: 'store', cmd: 'get', type: 'npm', name: 'example-module'}, (err, reply) => {
      test.error(err)
      test.ok(reply)
    })
  })
})

Tape('It returns cached data by default', (test) => {
  test.plan(1)

  var mu = Mu()

  Npm(mu, {}, () => {
    mu.dispatch({role: 'store', cmd: 'get', type: 'npm', name: 'example-module'}, (err, reply) => {
      var cachedOne = reply.cached

      mu.dispatch({role: 'store', cmd: 'get', type: 'npm', name: 'example-module'}, (err, reply) => {
        var cachedTwo = reply.cached

        test.same(cachedOne, cachedTwo)
      })
    })
  })
})

Tape('It can return non-cached data', (test) => {
  test.plan(1)

  var mu = Mu()

  Npm(mu, {}, () => {
    mu.dispatch({role: 'store', cmd: 'get', type: 'npm', name: 'example-module'}, (err, reply) => {
      var cachedOne = reply.cached

      mu.dispatch({role: 'store', cmd: 'get', type: 'npm', name: 'example-module', update: true}, (err, reply) => {
        var cachedTwo = reply.cached

        console.log(cachedOne, cachedTwo)

        test.ok((cachedOne < cachedTwo))
      })
    })
  })
})

Tape('Has an error and no data', (test) => {
  test.plan(2)

  var mu = Mu()

  Npm(mu, {}, () => {
    mu.dispatch({role: 'store', cmd: 'get', type: 'npm', name: 'randomName0927e3'}, (err, reply) => {
      test.ok(err)
      test.same(reply, {})
    })
  })
})

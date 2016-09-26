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
    client.dispatch({role: 'store', cmd: 'get', type: 'npm', name: 'example-plugin'}, (err, reply) => {
      test.error(err)
      test.ok(reply)

      test.same(reply.id, 'example-plugin')
      test.same(reply.name, 'example-plugin')
      test.ok(reply.cached)

      client.tearDown()
      server.tearDown()
    })
  })
})

Tape('A valid role:npm,cmd:get call - Has no error and data', (test) => {
  test.plan(2)

  var mu = Mu()

  Npm(mu, {}, () => {
    mu.dispatch({role: 'store', cmd: 'get', type: 'npm', name: 'example-plugin'}, (err, reply) => {
      test.error(err)
      test.ok(reply)
    })
  })
})

Tape('Returns cached data by default', (test) => {
  test.plan(1)

  var mu = Mu()

  Npm(mu, {}, () => {
    mu.dispatch({role: 'store', cmd: 'get', type: 'npm', name: 'mu'}, (err, reply) => {
      var cachedOne = reply.cached

      mu.dispatch({role: 'store', cmd: 'get', type: 'npm', name: 'mu'}, (err, reply) => {
        var cachedTwo = reply.cached

        test.same(cachedOne, cachedTwo)
      })
    })
  })
})

Tape('Returns cached data by default', (test) => {
  test.plan(1)

  var mu = Mu()

  Npm(mu, {}, () => {
    mu.dispatch({role: 'store', cmd: 'get', type: 'npm', name: 'mu'}, (err, reply) => {
      var cachedOne = reply.cached

      mu.dispatch({role: 'store', cmd: 'get', type: 'npm', name: 'mu'}, (err, reply) => {
        var cachedTwo = reply.cached

        test.same(cachedOne, cachedTwo)
      })
    })
  })
})

Tape.skip('Can return non-cached data', (test) => {
  var mu = Mu()
  var payload = {name: 'mu'}

  mu.dispatch('role:npm,cmd:get', payload, (err, reply) => {
    var cachedOne = reply.data.cached
    payload.update = true

    mu.dispatch('role:npm,cmd:get', payload, (err, reply) => {

    })
  })
})

Tape.skip('An invalid role:npm,cmd:get call', (test) => {
  Tape('Has an error and no data', (test) => {
    var mu = Mu()
    var payload = {name: 'randomName0927e3'}

    mu.dispatch('role:npm,cmd:get', payload, (err, reply) => {

    })
  })
})

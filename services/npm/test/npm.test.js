'use strict'

var Tape = require('tape')
var Proxyquire = require('proxyquire')
var NpmProxy = require('./stubs/npm.proxy.js')
var Mu = require('mu/core/core')

var Npm = Proxyquire('..', NpmProxy)

Tape('A valid role:npm,cmd:get call - Has no error and data', (test) => {
  test.plan(2)

  var mu = Mu()

  Npm(mu, {}, () => {
    mu.dispatch({role: 'store', cmd: 'get', type: 'npm', name: 'mu'}, (err, reply) => {
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

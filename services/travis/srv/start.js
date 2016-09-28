'use strict'

var Mu = require('mu')
var Tcp = require('mu/drivers/tcp')
var Travis = require('../lib/travis')

var envs = process.env
var opts = {
  mu: {
    tag: envs.TRAVIS_TAG || 'muzoo-travis'
   },
  travis: {
    registry: envs.TRAVIS_REGISTRY || null
  }
}

var mu = Mu(opts.mu)
Travis(mu, opts.npm, () => {
  mu.inbound({role: 'store', type: 'travis'}, Tcp.server({port: '6052'}))
})

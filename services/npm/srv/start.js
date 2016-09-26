'use strict'

var Mu = require('mu')
var Tcp = require('mu/drivers/tcp')
var Npm = require('../lib/npm')

var envs = process.env
var opts = {
  mu: {
    tag: envs.NPM_TAG || 'muzoo-npm'
  },
  npm: {
    registry: envs.NPM_REGISTRY || null
  }
}

var mu = Mu(opts.mu)
Npm(mu, opts.npm, () => {
  mu.inbound({role: 'store', type: 'npm'}, Tcp.server({port: '6050'}))
})

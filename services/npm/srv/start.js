'use strict'

var Mu = require('mu')
var Tcp = require('mu/drivers/tcp')
var Npm = require('../lib/npm')
var Boot = require('boot-in-the-arse')

var envs = process.env
var opts = {
  mu: {
    tag: envs.NPM_TAG || 'muzoo-npm'
  },
  npm: {
    registry: envs.NPM_REGISTRY || null
  }
}

var service = Mu(opts.mu)
Boot(service)

service
  .use(Npm, opts.npm)
  .after((done) => {
    service.inbound({role: 'store', cmd: 'get', type: 'npm'}, Tcp.server({port: '6050'}))
    service.inbound({role: 'store', cmd: 'validate'}, Tcp.server({port: '6050'}))
  })

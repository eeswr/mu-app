'use strict'


var Mu = require('mu')
var Tcp = require('mu/drivers/tcp')
var Info = require('../lib/info')

var envs = process.env
var opts = {
  mu: {
    tag: envs.NPM_TAG || 'muzoo-info'
  },
  info: {
    port: envs.INFO_PORT || '6000'
    host: envs.NPM_HOST || 'localhost'
  },
  search: {
    port: envs.SEARCH_PORT || '6040'
  },
  npm: {
    port: envs.NPM_PORT || '6050',
    host: envs.NPM_HOST || 'localhost'
  },
  github: {
    port: envs.GITHUB_PORT || '6051',
    host: envs.NPM_HOST || 'localhost'
  },
  travis: {
    port: envs.TRAVIS_PORT || '6052',
    host: envs.NPM_HOST || 'localhost'
  },
  coveralls: {
    port: envs.COVERALLS_PORT || '6053',
    host: envs.NPM_HOST || 'localhost'
  }
}

var mu = Mu(opts.mu)
Info(mu, opts.info, () => {
  mu.inbound({role: 'info', type: 'get'}, Tcp.server(opts.info))

  mu.outbound({role: 'store', type: 'npm'}, Tcp.server(opts.npm))
  mu.outbound({role: 'store', type: 'github'}, Tcp.server(opts.github))
  mu.outbound({role: 'store', type: 'travis'}, Tcp.server(opts.travis.port))
  mu.outbound({role: 'store', type: 'coveralls'}, Tcp.server(opts.coveralls))

  mu.outbound({role: 'search', cmd: 'upsert'}, Tcp.server(opts.search))
})

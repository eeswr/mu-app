'use strict'

const Mu = require('mu')
const Tcp = require('mu/drivers/tcp')
const Coveralls = require('../lib/coveralls')

const envs = process.env
const opts = {
  mu: {
    tag: envs.COVERALLS_TAG || 'muzoo-coveralls'
  },
  cacheSize: 99999,
  coveralls: {
    registry: envs.NPM_REGISTRY || 'http://registry.npmjs.org/',
    url: envs.COVERALLS_REGISTRY || 'https://coveralls.io/',
  },
  network: {
    host: envs.COVERALLS_HOST || 'localhost',
    port: envs.COVERALLS_PORT || '8054'
  }
}

const mu = Mu(opts.mu)

Coveralls(mu, opts.coveralls, () => {
  mu.inbound({role: 'store', type:'coveralls'}, Tcp.server({host: opts.network.host, port: opts.network.port}))
})

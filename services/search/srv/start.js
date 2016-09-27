'use strict'

const Mu = require('mu')
const Tcp = require('mu/drivers/tcp')
var Search = require('../lib/search')

var envs = process.env
var opts = {
  mu: {
    tag: envs.SEARCH_TAG || 'muzoo-search'
  },
  search: {
    host: envs.SEARCH_HOST || 'localhost',
    port: envs.SEARCH_PORT || '6040',
    elastic: {
      host: envs.SEARCH_ELASTIC_HOST || 'localhost',
      port: envs.SEARCH_ELASTIC_PORT || '9200'
    },
  }
}

const mu = Mu(opts.mu)

Search(mu, opts.search, () => {
  mu.inbound({role: 'store', type:'search'}, Tcp.server({host: opts.network.host, port: opts.network.port}))
})

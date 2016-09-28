'use strict'

var Travis = require('travis-ci')
var Request = require('request')
var Cache = require('lru-cache')

var opts = {
  cacheSize: 99999,
  registry: 'http://registry.npmjs.org/'
}

module.exports = function (mu, options, done) {
  opts = Object.assign({}, opts, options)
  opts.client = new Travis({version: '2.0.0'})
  opts.mu = mu
  opts.cache = Cache(opts.cacheSize)

  mu.define({role: 'store', cmd: 'get', type: 'travis'}, cmdGet)

  done()
}

function cmdGet (msg, done) {
  msg = msg.pattern

  var npm = opts.cache.get(msg.name) || null
  if (npm && !msg.update) {
    return done(null, npm)
  }

  var registry = '' + opts.registry + msg.name
  Request.get({url: registry, gzip: true}, (err, res, body) => {
    if (err) {
      return done(err)
    }

    var data = null
    try {
      data = JSON.parse(body)
    }
    catch (e) {
      return done(e)
    }

    var distTags = data['dist-tags'] || {}
    var latest = ((data.versions || {})[distTags.latest]) || {}
    var repository = latest.repository || {}
    var url = repository.url || ''

    var matches = /[\/:]([^\/:]+?)[\/:]([^\/]+?)(\.git)*$/.exec(url) || []
    if (matches && matches.length >= 2) {
      var params = {
        name: msg.name,
        user: matches[1] || '',
        repo: matches[2] || '',
        cached: npm
      }

      queryTravis(params, done)
    }
    else {
      return done(null, {ok: false, err: 'Cannot parse url'})
    }

  })
}

function queryTravis (msg, done) {
  var cache = opts.cache
  var client = opts.client

  var user = msg.user
  var repo = msg.repo

  client.repos(user, repo).get((err, res) => {
    if (err) {
      return done(null, {ok: false, err: err})
    }

    var build = res && res.repo || {}
    var data = {
      name: msg.name || '',
      url: 'https://travis-ci.org/' + user + '/' + repo,
      buildId: build.id || '',
      active: build.active || '',
      buildState: build.last_build_state || '',
      lastBuilt: build.last_build_started_at || '',
      cached: Date.now()
    }

    function complete (err, entity) {
      if (err) {
        return done(null, {ok: false, err: err})
      }
      else {
        return done(null, {ok: true, data: entity && entity.data$(entity)})
      }
    }

    if (msg.cached) {
      msg.cached.data$(data).save$(complete)
    }
    else {
      data.id$ = msg.name
      cache.make$(data).save$(complete)
    }
  })
}

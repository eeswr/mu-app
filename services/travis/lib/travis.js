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
    opts.mu = mu
    opts.cache = Cache(opts.cacheSize)

    mu.define({role: 'store', cmd: 'get', type: 'npm'}, cmdGet)

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
      var urlRepo = repository.url || ''
      var author = latest.author || {}
      var maintainers = data.maintainers || []

      var matches = /[\/:]([^\/:]+?)[\/:]([^\/]+?)(\.git)*$/.exec(url) || []
      if (Object.keys(data).length > 0) {
       var out = {
         id: data.name || '',
         name: data.name || '',
         urlRepo: urlRepo || '',
         urlPkg: 'https://www.npmjs.com/package/' + data.name || '',
         description: data.description || '',
         latestVersion: distTags.latest || '',
         releaseCount: Object.keys(data.versions || {}).length || 0,
         dependencies: latest.dependencies || {},
         author: {name: author.name || '', email: author.email || ''},
         licence: latest.license || '',
         maintainers: maintainers || [],
         readme: data.readme || '',
         homepage: data.homepage || '',
         cached: Date.now()
      }

        queryTravis(params, done)
      }
      else {
        return done(null, {ok: false, err: 'Cannot parse url'})
      }
    })
  })

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

    opts.cache.set(msg.name, out)
        return done(null, out)
    }
    return done({err: new Error('not found on npm')})
  })
}

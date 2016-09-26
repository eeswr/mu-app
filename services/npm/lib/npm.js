'use strict'

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

  var searchOpts = {
    url: opts.registry + msg.name,
    gzip: true
  }

  Request.get(searchOpts, (err, res, body) => {
    if (err) {
      return done(err)
    }

    var data = null
    try {
      data = JSON.parse(body)
    }
    catch (e) {
      return done(err)
    }

    var distTags = data['dist-tags'] || {}
    var latest = ((data.versions || {})[distTags.latest]) || {}
    var repository = latest.repository || {}
    var urlRepo = repository.url || ''
    var author = latest.author || {}
    var maintainers = data.maintainers || []

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

      opts.cache.set(msg.name, out)
      return done(null, out)
    }

    return done({err: new Error('not found on npm')})
  })
}

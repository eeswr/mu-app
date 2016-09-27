'use strict'

const Request = require('request')
const GitUrlParse = require('parse-github-url')
const Cache = require('lru-cache')

let opts = {}

module.exports = function (mu, options, done) {
  opts = Object.assign({}, options)
  opts.cache = Cache(opts.cacheSize || 99999)
  opts.mu = mu

  mu.define({role:'store', cmd:'get', type:'coveralls'}, cmdGet)

  done()
}

function cmdGet (msg, done) {
  let cache = opts.cache
  let registry = opts.registry + msg.pattern.name
  let context = this

  const cachedData = cache.get(msg.pattern.name) || null
  if (cachedData && !msg.update) {
    return done(null, cachedData)
  }

  Request.get({url: registry, gzip: true}, (err, res, body) => {
    if (err) {
      return done(err)
    }

    let data = null

    try {
      data = JSON.parse(body)
    }
    catch (e) {
      return done(e)
    }

    const distTags = data['dist-tags'] || {}
    const latest = ((data.versions || {})[distTags.latest]) || {}
    const repository = latest.repository || {}
    const url = repository.url || ''

    const gitInfo = GitUrlParse(url)
    if (!gitInfo) {
      return done({err: new Error('Cannot parse url')})
    }

    queryCoveralls(gitInfo, msg, done)
  })
}

function queryCoveralls (gitInfo, msg, done) {
  const cache = opts.cache
  const gitUrl = gitInfo.host.slice(0, gitInfo.host.indexOf('.'))
  const registry = opts.url + gitUrl + '/' + gitInfo.repo

  Request.get({url: registry + '.json', gzip: true}, (err, res, body) => {
    if (err) {
      return done(err)
    }
    if (res && res.statusCode && res.statusCode !== 200) {
      return done({err: new Error('Coveralls request not sucessfull')})
    }

    let coverallsData = null

    try {
      coverallsData = JSON.parse(body)
    }
    catch (e) {
      return done(e)
    }
    const data = {
      name: gitInfo.name,
      url: registry,
      coverageChange: coverallsData.coverage_change,
      coveredPercent: coverallsData.covered_percent,
      badgeUrl: coverallsData.badge_url,
      cached: Date.now()
    }

    opts.cache.set(msg.pattern.name, data)
    return done(null, data)
  })
}

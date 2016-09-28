'use strict'

var TravisFakeData = require('./travis.data.js')

module.exports = {
  request: {
    get: (opts, done) => {
      if (opts.url.includes('mu')) {
        return done(null, {}, JSON.stringify(TravisFakeData))
      }

      return done(new Error('npm error'), null, null)
    }
  }
}

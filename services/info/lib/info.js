'use strict'

var Parallel = require('fastparallel')()

var opts = {
  storeTypes: [
   'npm',
   'github',
   'travis',
   'coveralls'
 ]
}

module.exports = function (mu, options, done) {
  opts = Object.assign({}, opts, options)

  opts.mu = mu
  opts.mu.define({role: 'info', cmd: 'get'}, getInfo)

  return done()
}

function getInfo (msg, done) {
  var result = {}

  function next (type, done) {
    var cmd = {
      role: 'store',
      cmd: 'get',
      type: type,
      name: msg.name,
      update: msg.update
    }

    this.dispatch(cmd, (err, reply) => {
      if (err) console.log(err)

      result[type] = reply || {}
      done()
    })
  }

  function complete (err) {
    if (err) console.log(err)

    this.dispatch({role:'search', cmd: 'upsert', module: result})
    done(null, result)
  }

  Parallel(opts.mu, next, opts.storeTypes, complete)
}

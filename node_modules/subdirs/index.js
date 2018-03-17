var path = require('path')
var fs = require('fs')

var Promise = require('es6-promise').Promise

module.exports = subdirs

function subdirs (root, maxDepth, cb) {
  if (typeof maxDepth === 'function') {
    cb = maxDepth
    maxDepth = Infinity
  }

  var failed = false
  var pending = 0
  var subs = []

  if (!cb) {
    return new Promise(begin)
  }

  begin(cb.bind(this, null), cb)

  function begin (resolve, reject) {
    enqueue(path.normalize(root), -1)

    function fail (err) {
      if (!failed) {
        failed = true
        reject(err)
      }
    }

    function complete () {
      if (--pending === 0) {
        resolve(subs)
      }
    }

    function enqueue (file, depth) {
      if (depth > maxDepth) {
        return
      }

      pending++

      fs.lstat(file, processFile)

      function processFile (err, stat) {
        if (err) {
          return fail(err)
        }

        if (!stat.isDirectory() || stat.isSymbolicLink()) {
          return complete()
        }

        if (depth >= 0) {
          subs.push(file)
        }

        fs.readdir(file, processDirectoryListing)

        function processDirectoryListing (err, files) {
          if (err) {
            return fail(err)
          }

          for (var i = 0, len = files.length; i < len; ++i) {
            enqueue(path.join(file, files[i]), depth + 1)
          }

          complete()
        }
      }
    }
  }
}

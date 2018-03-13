/* jshint node: true */
'use strict';

var exec = require('child_process').exec;
var read = require('read');
var _ = require('underscore');
var reCannotFind = /^cannot\sfind/i;
var reRelative = /^\./;

/**
  ## Squirrel Installer Reference

  This module constains the installer helper functions used within squirrel.
  Each of the functions outlined below is designed to be called initially
  with an options object, which then provides you the function signature
  outlined in the docs.

  ```js
  var installer = require('squirrel/installer');
  ```
**/

/**
  ### install(target, callback)

  Use npm to install the required target.
**/
exports.install = function(opts) {
  return function(target, callback) {
    var commandTemplate = _.template(opts.installCommand);
    var cmdline;

    // if we have a module, then fly right by
    if (target.module) {
      return callback(null, target.module);
    }

    cmdline = commandTemplate({
      opts: opts,
      target: target.name,
      version: opts.versions[target.name] || 'latest'
    });

    // create the npm process
    exec(cmdline, { cwd: opts.cwd }, function(err) {
      if (err) {
        return callback(err);
      }

      try {
        callback(null, require(target.name));
      }
      catch (e) {
        callback(e);
      }
    });
  };
};

/**
  ### prepare(target, callback)

  This is the first step called in the pull-stream when squirrel is asked
  for particular modules.  It will determine what action is required based
  on what has been asked for, depending on a number of factors:

  - whether the module requested is relative (i.e. starts with a dot)
  - what our allowed install options (prompt, always, never, etc)
  - whether the module is already available or not

**/
exports.prepare = function(opts) {
  var template = _.template(opts.promptMessage);

  return function(name, callback) {
    var result = {
      name: name,
      module: null,
      install: false
    };

    // attempt to require the module
    try {
      result.module = require(name);
    }
    catch (e) {
      result.install = reCannotFind.test(e.message) &&
        (! reRelative.test(name));
    }

    // if installation is not required, then short circuit other tests
    if (! result.install) {
      return callback(null, result);
    }

    // if we are not permitted to install, then throw a wobbly
    if (! opts.allowInstall) {
      return callback(new Error('Not permitted to install any modules'));
    }

    // if we are allowed to install, then go ahead
    if (opts.allowInstall) {
      return callback(null, result);
    }

    read({
      prompt: template({ target: name, opts: opts }),
      'default': 'Y'
    }, function(err, result) {
      // update the result
      result.install = (! err) &&
        (result || '').toLowerCase().slice(0, 1) === 'y';

      // trigger the callback
      callback(
        result.install ? null : new Error(name + ' install not permitted'),
        result
      );
    });
  };
};

/**
  ### remove(target, callback)

  Execute the required installer operation
**/
exports.remove = function(opts) {
  return function(target, callback) {
    var cmdline = _.template(opts.uninstallCommand, {
      opts: opts,
      target: target,
      version: opts.versions[target] || 'latest'
    });

    // create the npm process
    exec(cmdline, { cwd: opts.cwd }, callback);
  };
};
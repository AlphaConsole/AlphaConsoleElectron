/* jshint node: true */
'use strict';

var pull = require('pull-stream');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var basePath;
var _existsSync = fs.existsSync || path.existsSync;
var installer = require('./installer');
var versions = {};

/**
  # squirrel

  Squirrel is a helpful node module that assists you requiring your
  dependencies for plugins of your application (version controlled via a
  custom `pluginDependencies` in your `package.json` file).

  ## Why Squirrel?

  Because personally, I really don't like the sitting waiting for a node
  package to install a whole swag of dependencies because it requires them
  for some functionality that I don't intend to use.  I believe using
  squirrel will enable certain types of packages to have a leaner core
  with properly managed and installable optional dependencies.

  ## Example Usage

  If you are using `optionalDependencies` in your application, you might
  consider using `pluginDependencies` instead and then "squirreling"
  them rather than requiring them.

  __NOTE:__ Squirreling is an asynchronous operation:

  ```js
  var squirrel = require('squirrel');

  squirrel('coffee-script', function(err, coffee) {
    // do something magical with coffeescript...
  });
  ```

  If you need multiple modules, then squirrel is happy to play in a 
  way similar to the way AMD module loaders do:

  ```js
  squirrel(['coffee-script', 'jade'], function(err, coffee, jade) {
    // do something with both coffeescript and jade...
  });
  ```

  ## Different "Allow Install" Modes

  Squirrel has been built to support a number of "Allow Install" modes, which 
  is controlled in an `allowInstall` option that the squirrel function accepts
  in the 2nd argument, e.g.:

  ```js
  // install jade, and don't trigger a prompt if not already available
  squirrel('jade', { allowInstall: true }, function(err, jade) {
  });
  ```
  The default setting for the `allowInstall` option is set to `prompt` which
  means that when a module using `squirrel` attempts to squirrel one or more
  modules, the user will be prompted if they want to allow those modules to
  install.  If they don't permit installation then the squirrel operation
  will fail and an error will be returned in the callback.

  Other valid settings for the `allowInstall` option are `true` (install
  dependencies without prompting) or `false` (always reject module requests).

  ## Other Squirrel Options

  A squirrel's got to have options.  The demands on the modern squirrel
  mean that having options is important, and this squirrel is not different.
  Here are the options that squirrel supports in a 2nd (optional) argument.

  - `allowInstall` - as outlined above.
  - `promptMessage` - 'Package "<%= target %>" is required. Permit install? '
  - `cwd` - the path to squirrel in
  - `installer` - 'npm'
  - `installCommand` - '<%= opts.installer %> install <%= target %>@<%= version %>'
  - `uninstallCommand` - '<%= opts.installer %> rm <%= target %>'

  The default options can be modified through modifying them in
  the `squirrel.defaults` object.

  ## Shouldn't Squirrel be dependency free?

  You could argue that given squirrel's mission is to reduce the overall
  number of package dependencies, it should be ultralight in it's own
  packaging.  While that's a valid point, I think a balance is required and
  using existing well-tested libraries is important.

  ## Reference

**/

/**
  ### squirrel(targets, opts?, callback)

  Request the installation of the modules specified in the `targets` array
  argument.

**/
function squirrel(targets, opts, callback) {
  // ensure the targets is an array
  targets = [].concat(targets || []);
  
  // handle the no options specified case
  if (typeof opts == 'function') {
    callback = opts;
    opts = {};
  }
  
  // initialise the opts
  opts = _.extend({ versions: versions }, squirrel.defaults, opts);

  // initialise allowInstall
  if (typeof opts.allowInstall == 'undefined') {
    opts.allowInstall = squirrel.defaults.allowInstall;
  }

  pull(
    pull.values(targets),
    pull.asyncMap(installer.prepare(opts)),
    pull.paraMap(installer.install(opts)),
    pull.collect(function(err, modules) {
      callback.apply(this, [err].concat(modules));
    })
  );
}

/**
  ### squirrel.rm(targets, opts, callback)

  Remove the specified targets.  Used in squirrel tests and I guess in some
  cases might be useful in production code also.

**/
squirrel.rm = function(targets, opts, callback) {
  // ensure the targets is an array
  targets = [].concat(targets || []);
  
  // handle the no options specified case
  if (typeof opts == 'function') {
    callback = opts;
    opts = {};
  }
  
  // initialise the opts
  opts = _.extend({ versions: versions }, squirrel.defaults, opts);
  
  // uninstall each of the specified targets
  pull(
    pull.values(targets),
    pull.paraMap(installer.remove(opts)),
    pull.collect(callback)
  );
};

// find the basepath
basePath = path.dirname(path.dirname(module.filename));

(function() {
  var lastPath = '', packageData = {};

  while (basePath !== lastPath &&
    (! _existsSync(path.join(basePath, 'package.json')))) {
    lastPath = basePath;
    basePath = path.dirname(basePath);
  }
  
  try {
    // read the package 
    packageData = require(path.join(basePath, 'package.json'));
  }
  catch (e) {
    // could not find package.json in the expected spot, so
    // default the basepath to the cwd
    basePath = process.cwd();
  }
  
  versions = packageData.pluginDependencies || {};
}());

// initialise the squirrel defaults
squirrel.defaults = {
  // default allowInstall flag to prompt
  allowInstall: 'prompt',
  
  // initialise the prompt message
  promptMessage: 'Package "<%= target %>" is required. Permit installation? ',
  
  // the current working directory in which npm will be
  // run to install the package
  cwd: basePath,
  
  // the path to the installer, by default we are hoping `npm`
  // will exist in the PATH
  installer: 'npm',
  
  // install command
  installCommand: '<%= opts.installer %> install <%= target %>@<%= version %>',
  
  // uninstall command
  uninstallCommand: '<%= opts.installer %> rm <%= target %>'
};

// export squirrel
module.exports = squirrel;
# squirrel

Squirrel is a helpful node module that assists you requiring your
dependencies for plugins of your application (version controlled via a
custom `pluginDependencies` in your `package.json` file).


[![NPM](https://nodei.co/npm/squirrel.png)](https://nodei.co/npm/squirrel/)

[![Build Status](https://img.shields.io/travis/DamonOehlman/squirrel.svg?branch=master)](https://travis-ci.org/DamonOehlman/squirrel) [![unstable](https://img.shields.io/badge/stability-unstable-yellowgreen.svg)](https://github.com/dominictarr/stability#unstable) 

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

### squirrel(targets, opts?, callback)

Request the installation of the modules specified in the `targets` array
argument.

### squirrel.rm(targets, opts, callback)

Remove the specified targets.  Used in squirrel tests and I guess in some
cases might be useful in production code also.

## Squirrel Installer Reference

This module constains the installer helper functions used within squirrel.
Each of the functions outlined below is designed to be called initially
with an options object, which then provides you the function signature
outlined in the docs.

```js
var installer = require('squirrel/installer');
```

### install(target, callback)

Use npm to install the required target.

### prepare(target, callback)

This is the first step called in the pull-stream when squirrel is asked
for particular modules.  It will determine what action is required based
on what has been asked for, depending on a number of factors:

- whether the module requested is relative (i.e. starts with a dot)
- what our allowed install options (prompt, always, never, etc)
- whether the module is already available or not

### remove(target, callback)

Execute the required installer operation

## License(s)

### MIT

Copyright (c) 2014 Damon Oehlman <damon.oehlman@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

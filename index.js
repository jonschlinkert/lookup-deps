/*!
 * lookup-deps <https://github.com/jonschlinkert/lookup-deps>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

/**
 * Module dependencies
 */

var fs = require('fs');
var path = require('path');
var multimatch = require('multimatch');
var get = require('get-value');
var _ = require('lodash');
var utils = require('./lib');


/**
 * Create a new instance of `Deps`.
 *
 * ```js
 * var Deps = require('lookup-deps');
 * var deps = new Deps();
 * ```
 *
 * @param {Object} `config` Optionally pass a default config object instead of `package.json`
 *                          For now there is no reason to do this.
 * @param {Object} `options`
 * @api public
 */

function Deps(options) {
  this.options = options || {};
  this.cwd = this.options.cwd || process.cwd();
  this.cache = {};
  this._paths = [];
  this.init(options);
}

/**
 * Initialize Deps. Unless another config path is specified,
 * the package.json in the cwd of a project is loaded.
 *
 * @param  {String} `filepath`
 * @return {Object}
 * @api private
 */

Deps.prototype.init = function(options) {
  this.config = this.options.config || this.readPkg(this.cwd);
  this.config.path = this._cwd();
  this.tree(this.cwd);
};

/**
 * Set a value on the cache.
 *
 * @param {String} `key`
 * @param {*} `value`
 * @api private
 */

Deps.prototype.set = function(key, value) {
  this.cache[key] = value;
  return this;
};

/**
 * Set a package.json object on the cache.
 *
 * @param {String} `key`
 * @param {Object} `value`
 * @api private
 */

Deps.prototype.setPkg = function(key, value) {
  if (!utils.hasOwn(key)) {
    return this.set(key, value);
  }
  return this;
};

/**
 * Get a value from the cache.
 *
 * ```js
 * // get an entire package.json
 * deps.get('fs-utils');
 * //=> { pkg: { name: 'fs-utils', version: '0.5.0', ... }
 *
 * // or, get a specific value
 * deps.get('fs-utils', 'version');
 * //=> '0.5.0'
 * ```
 *
 * @param  {Object} `name` The module to get.
 * @param  {String} `props` Property paths.
 * @return {Object}
 * @api public
 */

Deps.prototype.get = function(name, props) {
  var config = this.cache[name];

  if (arguments.length === 1) {
    return config;
  }

  return get(config.pkg, props);
};

/**
 * Check to see if a module exists (or at least is on
 * the cache).
 *
 * ```js
 * deps.exists('fs-utils');
 * //=> true
 * ```
 *
 * @param  {String} `name` The name to check.
 * @return {String}
 * @api public
 */

Deps.prototype.exists = function(name) {
  return !!this.get(name);
};

/**
 * Resolve the path to `node_modules` for a named package.
 *
 * @param  {String} `name`
 * @return {String}
 * @api private
 */

Deps.prototype._toPkg = function(cwd) {
  return path.resolve(cwd || process.cwd(), 'package.json');
};

/**
 * Resolve the dirname for a module.
 *
 * @param  {String} `name`
 * @return {String}
 * @api private
 */

Deps.prototype.dirname = function(filepath) {
  return utils.dirname(filepath);
};

/**
 * Resolve the path to current working directory for a module.
 *
 * @param  {String} `filepath`
 * @return {String}
 * @api private
 */

Deps.prototype._cwd = function(filepath) {
  return this.dirname(this._toPkg(filepath));
};

/**
 * List the dependencies in a package.json.
 *
 * @param  {Object} `pkg`
 * @return {Object}
 * @api private
 */

Deps.prototype._deps = function(pkg) {
  if (utils.hasOwn(pkg, 'dependencies')) {
    return pkg.dependencies;
  }
  return {};
};

/**
 * Get the keys for `dependencies` for the specified package.
 *
 * ```js
 * deps.depsKeys('fs-utils');
 * //=> [ 'is-absolute', 'kind-of', 'relative', ... ]
 * ```
 *
 * @param  {Object|String} `config` The name of the module, or package.json config object.
 * @return {Object}
 * @api public
 */

Deps.prototype.depsKeys = function(config) {
  if (typeof config === 'string') {
    config = this.cache[config].pkg;
  }
  var deps = this._deps(config || this.config);
  return Object.keys(deps);
};

/**
 * Require a package.json, silently fail.
 *
 * @param  {Object} `filepath`
 * @return {Object}
 * @api private
 */

Deps.prototype.readPkg = function(filepath) {
  try {
    var fp = path.resolve(filepath, 'package.json');
    return require(fp);
  } catch(err) {
    return {};
  }
};

/**
 * Attempt to require a file, silently fail.
 *
 * @param  {Object} `pkg`
 * @return {Object}
 * @api private
 */

Deps.prototype.tryRequire = function(filepath) {
  try {
    return require(filepath);
  } catch (err) {
    return {};
  }
};

/**
 * Resolve a path to a missing dependency. This is extremely
 * inadequate for anything more than basics.
 *
 * For now, all we're doing is keeping an array of resolved
 * filepaths for modules, then, when a module is missing in
 * the tree, we search the array of existing paths to see if
 * the module is there. It's hit and miss, since we don't wait
 * for the entire tree to be searched. We'll need to revisit.
 *
 * @param  {String} `filepath`
 * @return {String}
 * @api private
 */

Deps.prototype.findPath = function(filepath) {
  var name = path.basename(filepath);
  return utils.first(this._paths, function(fp) {
    return name === path.basename(fp);
  });
};

/**
 * Get the resolved path to the root of a module.
 *
 * @param  {String} `cwd`
 * @param  {String} `filepath`
 * @return {String}
 * @api private
 */

Deps.prototype.moduleRoot = function(cwd, filepath) {
  var res = path.join(cwd, 'node_modules', filepath);
  if (fs.existsSync(res)) {
    this._paths.push(res);
    return utils.slashify(res);
  }
  return this.findPath(res) || null;
};

/**
 * Build a dependency tree by recursively reading in
 * package.json files for projects in node_modules.
 *
 * ```js
 * deps.tree('./');
 * ```
 *
 * @param  {String} `cwd` The root directory to search from.
 * @return {Object}
 * @api public
 */

Deps.prototype.tree = function(cwd) {
  var pkg = this.readPkg(cwd);
  var deps = this.depsKeys(pkg);
  var tree = {};

  if (deps.length) {
    var len = deps.length;
    for (var i = 0; i < len; i++) {
      var name = deps[i];
      var key = utils.escapeDot(name);

      var o = {pkg: null, deps: null, pkgpath: null};
      o.path = this.moduleRoot(cwd, name);
      if (o.path != null) {
        o.pkgpath = path.resolve(o.path, 'package.json');
        o.pkg = this.tryRequire(o.pkgpath);
        o.deps = this.tree(o.path);
      }

      this.setPkg(key, o);
      tree[key] = o;
    }
  }
  return tree;
};

/**
 * Return a list of names of all resolved packages from node_modules
 * that match the given glob patterns. If no pattern is provided the
 * entire list is returned.
 *
 * ```js
 * deps.names('fs-*');
 * //=> ['fs-utils']
 * ```
 *
 * @param {Object} `obj` Optionally pass an object.
 * @return {Array} Array of keys.
 * @api public
 */

Deps.prototype.names = function(patterns) {
  var keys = Object.keys(this.cache);
  if (arguments.length === 0) {
    return keys;
  }
  return multimatch(keys, patterns);
};

/**
 * Lookup a module or modules using glob patterns, and return
 * an object filtered to have only the specified `props`. Note
 * that `package.json` objects are stored on the `pkg` property
 * for each module.
 *
 * Properties are specified using object paths:
 *
 * ```js
 * deps.find('for-*', 'pkg.repository.url');
 *
 * // results in:
 * // { 'for-own': 'git://github.com/jonschlinkert/for-own.git',
 * //   'for-in': 'git://github.com/jonschlinkert/for-in.git' }
 * ```
 *
 * @param  {String} `patterns`
 * @param  {String} `props`
 * @return {Object}
 * @api public
 */

Deps.prototype.find = function(patterns, props) {
  return _.reduce(this.names(patterns), function (acc, name) {
    acc[name] = get(this.cache[name], props) || null;
    return acc;
  }.bind(this), {});
};

/**
 * A convenience proxy for the `.find()` method to specifically search
 * the `pkg` object.
 *
 * ```js
 * deps.lookup('for-*', 'repository.url');
 *
 * // results in:
 * // { 'for-own': 'git://github.com/jonschlinkert/for-own.git',
 * //   'for-in': 'git://github.com/jonschlinkert/for-in.git' }
 * ```
 *
 * @param  {String} `patterns`
 * @param  {String} `props`
 * @return {Object}
 * @api public
 */

Deps.prototype.lookup = function(patterns, props) {
  return this.find(patterns, 'pkg.' + props);
};

/**
 * Get the path to a module or modules, relative to the
 * current working directory. Glob patterns may be used.
 *
 * ```js
 * deps.paths('*');
 * ```
 *
 * @param  {String} `patterns`
 * @return {String}
 * @api public
 */

Deps.prototype.paths = function(patterns) {
  return this.find(patterns, 'path');
};

/**
 * Get the package.json objects for the given module or modules.
 * Glob patterns may be used.
 *
 * ```js
 * deps.pkg('fs-utils');
 * ```
 *
 * @param  {String} `patterns`
 * @return {String}
 * @api public
 */

Deps.prototype.pkg = function(patterns) {
  return this.find(patterns, 'pkg');
};

/**
 * Get the `dependencies` for the given modules. Glob patterns
 * may be used.
 *
 * ```js
 * deps.dependencies('multi*');
 * //=> { multimatch: { 'array-differ': '^1.0.0', ... } }
 * ```
 *
 * @param  {String} `patterns`
 * @return {Object}
 * @api public
 */

Deps.prototype.dependencies = function(patterns) {
  return this.lookup(patterns, 'dependencies');
};

/**
 * Get the `keywords` for the given modules.
 *
 * ```js
 * deps.keywords('multi*');
 * //=> { multimatch: [ 'minimatch', 'match', ... ] }
 * ```
 *
 * @param  {String} `patterns`
 * @return {String}
 * @api public
 */

Deps.prototype.keywords = function(patterns) {
  return this.lookup(patterns, 'keywords');
};

/**
 * Get the `homepage` for the specified modules.
 *
 * ```js
 * deps.homepage('fs-*');
 * //=> { 'fs-utils': 'https://github.com/assemble/fs-utils' }
 * ```
 *
 * @param  {String} `patterns`
 * @return {String}
 * @api public
 */

Deps.prototype.homepage = function(patterns) {
  return this.lookup(patterns, 'homepage');
};

/**
 * Get a list of markdown-formatted links, from the
 * `homepage` properties of the specified modules.
 *
 * ```js
 * deps.links('fs-*');
 * //=> [fs-utils](https://github.com/assemble/fs-utils)
 * ```
 *
 * @param  {String} `patterns`
 * @return {String}
 * @api public
 */

Deps.prototype.links = function(pattern) {
  pattern = pattern || this.config.name;
  var obj = this.lookup(pattern, 'homepage');
  var str = '';

  _.forOwn(obj, function (value, key) {
    str += '[' + key + '](' + value + ')\n';
  });
  return str;
};


/**
 * Expose `Deps`
 */

module.exports = Deps;
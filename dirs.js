'use strict';

/**
 * Module dependencies
 */

var path = require('path');
var util = require('util');
var utils = require('./lib');
var file = require('fs-utils');
var multimatch = require('multimatch');
var getobj = require('getobject');
var get = require('get-value');
var makeIterator = require('make-iterator');
var forOwn = require('for-own');
var _ = require('lodash');


/**
 * Create a new instance of `Deps`
 *
 * @param {Object} `config`
 * @param {Object} `options`
 */

function Deps(config, options) {
  this.options = options || {};
  this.root = this.options.root || './';
  this.cache = {};
  this.paths = [];
  this.init(config);
}

/**
 * Initialize Deps. Unless another config path is specified,
 * the package.json in the root of a project is loaded.
 *
 * @param  {String} filepath
 * @return {Object}
 * @api private
 */

Deps.prototype.init = function(config) {
  this.config = config || this.readPkg('./');
  this.config.path = this.cwd();
  this.modules(this.root);
};


/**
 * Set a value on the cache.
 *
 * @param {String} `key`
 * @param {*} `value`
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
 */

Deps.prototype.setPkg = function(key, value) {
  if (!hasOwn(key)) {
    return this.set(key, value);
  }
  return this;
};


/**
 * Get a value from the cache.
 *
 * @param  {Object} key
 * @return {Object}
 */

Deps.prototype.get = function(name, prop) {
  return this.cache[name];
};


/**
 * Resolve the path to `node_modules` for a named package.
 *
 * @param  {String} `name`
 * @return {String}
 */

Deps.prototype._toPkg = function(cwd) {
  return path.resolve(cwd || process.cwd(), 'package.json');
};


/**
 * Resolve the dirname for a module.
 *
 * @param  {String} `name`
 * @return {String}
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

Deps.prototype.cwd = function(filepath) {
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
  if (hasOwn(pkg, 'dependencies')) {
    return pkg.dependencies;
  }
  return {};
};


/**
 * Get a list of keys for dependencies.
 *
 * @param  {Object} `pkg`
 * @return {Object}
 * @api private
 */

Deps.prototype.depsKeys = function(pkg) {
  return Object.keys(this._deps(pkg));
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
 */

Deps.prototype.findPath = function(filepath) {
  var name = path.basename(filepath);
  return utils.first(this.paths, function(fp) {
    return name === path.basename(fp);
  });
};


/**
 * Get the resolved path to the root of a module.
 *
 * @param  {String} `cwd`
 * @param  {String} `filepath`
 * @return {String}
 */

Deps.prototype.moduleRoot = function(cwd, filepath) {
  var res = path.join(cwd, 'node_modules', filepath);
  if (file.exists(res)) {
    this.paths.push(res);
    return utils.slashify(res);
  }
  return this.findPath(res) || null;
};


/**
 * Build the dependency tree.
 *
 * @param  {[type]} filepath
 * @return {[type]}
 */

Deps.prototype.modules = function(filepath) {
  var pkg = this.readPkg(filepath);
  var keys = this.depsKeys(pkg);
  var deps = {};

  if (keys.length) {
    var len = keys.length;
    for (var i = 0; i < len; i++) {
      var name = keys[i];
      var key = utils.escapeDot(name);

      var o = {pkg: null, deps: null, pkgpath: null};
      o.path = this.moduleRoot(filepath, name);
      if (o.path != null) {
        o.pkgpath = path.resolve(o.path, 'package.json');
        o.pkg = this.tryRequire(o.pkgpath);
        o.deps = this.modules(o.path);
      }

      this.setPkg(key, o);
      deps[key] = o;
    }
  }
  return deps;
};


/**
 * Return a list of names of all resolved packages from node_modules
 * that match the given glob patterns. If no pattern is provided the
 * entire list is returned.
 *
 * ```js
 * deps.names('v*');
 * //=> ['for-own', 'for-own-tag-jscomments']
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
 * @return {String}
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
 * @return {String}
 */

Deps.prototype.lookup = function(patterns, props) {
  return this.find(patterns, 'pkg.' + props);
};


/**
 * Get the `dependencies` for the given module. Glob patterns
 * may be used.
 *
 * @param  {String} `patterns`
 * @return {Object}
 */

Deps.prototype.dependencies = function(patterns) {
  return this.lookup(patterns, 'dependencies')
};


/**
 * Get the path to a module or modules, relative to the
 * current working directory. Glob patterns may be used.
 *
 * @param  {String} `patterns`
 * @return {String}
 */

Deps.prototype.path = function(patterns) {
  return this.find(patterns, 'path');
};


/**
 * Return true if `key` is an own, enumerable property
 * of `this.cache` or the given `obj`.
 *
 * ```js
 * hasOwn(obj, key);
 * ```
 *
 * @param  {String} `key`
 * @param  {Object} `obj` Optionally pass an object to check.
 * @return {Boolean}
 * @api private
 */

function hasOwn(o, key) {
  return {}.hasOwnProperty.call(o, key);
}


var deps = new Deps();

// var files = deps.modules('./');
// console.log(util.inspect(deps, null, 10));
// console.log(deps.lookup('ansi-styles', 'dep'))
// console.log(deps.path('ansi-styles'));
// console.log(deps.dependencies('chalk'));
// console.log(deps.find('is*', 'path'));
console.log(deps.find('for-own', 'pkg.repository.url'));
// console.log(deps.lookup('is*', 'repository.url'));
// console.log(deps.lookup(['**', '!is*'], 'pkg.repository.url'));
// console.log(deps.names('is*'));



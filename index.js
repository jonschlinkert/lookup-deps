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
var findup = require('findup-sync');
var filterKeys = require('filter-keys');
var filterObj = require('filter-object');
var deepFilter = require('deep-filter-object');
var sortObj = require('sort-object');
var get = require('get-value');
var _ = require('lodash');
var utils = require('./lib');

/**
 * Create a new instance of `Lookup`.
 *
 * ```js
 * var Lookup = require('lookup-deps');
 * var deps = new Lookup();
 * ```
 *
 * @param {Object} `config` Optionally pass a default config object instead of `package.json`
 *                          For now there is no reason to do this.
 * @param {Object} `options`
 * @api public
 */

function Lookup(options) {
  this.options = options || {};
  this.cwd = this.options.cwd || process.cwd();
  this.parents = {};
  this.cache = {};
  this._paths = [];
  this.init(options);
}

/**
 * Initialize Lookup. Unless another config path is specified,
 * the package.json in the cwd of a project is loaded.
 *
 * @param  {String} `filepath`
 * @return {Object}
 * @api private
 */

Lookup.prototype.init = function() {
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

Lookup.prototype.set = function(key, value) {
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

Lookup.prototype.setPkg = function(key, value) {
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

Lookup.prototype.get = function(name, props) {
  var config = this.cache[name];

  if (arguments.length === 1) {
    return config;
  }

  return this.lookup(name, props);
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

Lookup.prototype.exists = function(name) {
  return !!this.get(name);
};

/**
 * Resolve the path to `node_modules` for a named package.
 *
 * @param  {String} `name`
 * @return {String}
 * @api private
 */

Lookup.prototype._toPkg = function(cwd) {
  return path.resolve(cwd || process.cwd(), 'package.json');
};

/**
 * Resolve the dirname for a module.
 *
 * @param  {String} `name`
 * @return {String}
 * @api private
 */

Lookup.prototype.dirname = function(filepath) {
  return utils.dirname(filepath);
};

/**
 * Resolve the path to current working directory for a module.
 *
 * @param  {String} `filepath`
 * @return {String}
 * @api private
 */

Lookup.prototype._cwd = function(filepath) {
  return this.dirname(this._toPkg(filepath));
};

/**
 * List the dependencies in a package.json.
 *
 * @param  {Object} `pkg`
 * @return {Object}
 * @api private
 */

Lookup.prototype._deps = function(pkg) {
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

Lookup.prototype.depsKeys = function(config) {
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

Lookup.prototype.readPkg = function(filepath) {
  return this.tryRequire(filepath, 'package.json');
};

/**
 * Attempt to require a file, silently fail.
 *
 * @param  {String} `filepath(s)`
 * @return {Object}
 * @api private
 */

Lookup.prototype.tryRequire = function() {
  try {
    var fp = path.resolve.apply(path, arguments);
    return require(fp);
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

Lookup.prototype.findPath = function(filepath) {
  return utils.first(this._paths, function(fp) {
    return path.basename(filepath) === path.basename(fp);
  });
};

/**
 * Find a package.json for the given module by `name`, starting
 * the search at the given `cwd`.
 *
 * @param  {String} `filepath`
 * @return {String}
 * @api public
 */

Lookup.prototype.findPkg = function(name, cwd) {
  return findup('**/' + name + '/package.json', {
    cwd: cwd
  });
};

/**
 * Get the parent of a module from the given absolute `filepath`.
 *
 * @param  {String} `filepath`
 * @return {String}
 * @api private
 */

Lookup.prototype.parent = function(filepath) {
  try {
    return utils.last(filepath, 3)[0];
  } catch(err) {
    return null;
  }
};

/**
 * Get the resolved path to the root of a module.
 *
 * @param  {String} `cwd`
 * @param  {String} `filepath`
 * @return {String}
 * @api private
 */

Lookup.prototype.moduleRoot = function(cwd, fp) {
  var res = path.join(cwd, 'node_modules', fp);

  if (fs.existsSync(res)) {
    this._paths.push(res);
    return utils.slashify(res);
  }

  res = this.findPath(res);
  if (res) {
    return res;
  }

  if (this.options.findup) {
    return path.dirname(this.findPkg(fp, cwd));
  }
  return null;
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

Lookup.prototype.tree = function(cwd) {
  var pkg = this.readPkg(cwd);
  var deps = this.depsKeys(pkg);
  var tree = {};

  if (deps.length) {
    var len = deps.length;
    var i = 0;

    while (i < len) {
      var name = deps[i++];
      var key = utils.escapeDot(name);

      var o = {pkg: null, deps: null, pkgpath: null};
      o.path = this.moduleRoot(cwd, name);

      this.parents[key] = this.parents[key] || {};

      if (o.path != null) {
        o.pkgpath = path.resolve(o.path, 'package.json');
        o.pkg = this.tryRequire(o.pkgpath);
        o.deps = this.tree(o.path);
      }

      var parent = this.parent(o.path);
      this.parents[key][parent] = sortObj(o, ['path', 'pkgpath', 'deps', 'pkg']);

      this.setPkg(key, o);
      tree[key] = o;
    }
  }
  return tree;
};

/**
 * Returns an object of all modules that have the given
 * module as a dependency. Glob patterns may be used
 * for filtering.
 *
 * ```js
 * deps.getParents('*');
 * ```
 *
 * @param  {String|Array} `patterns` Glob patterns to use for filtering.
 * @return {Object} Object of parent modules.
 * @api public
 */

Lookup.prototype.getParents = function(patterns) {
  return filterObj(this.parents, patterns);
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
 * @param {String|Array} `patterns` Glob patterns to use for filtering.
 * @return {Array} Array of keys.
 * @api public
 */

Lookup.prototype.names = function(patterns) {
  return filterKeys(this.cache, patterns);
};

/**
 * Filter the entire `cache` object to have only packages
 * with names that match the given glob patterns.
 *
 * You may also filter the keys on each object by passing
 * additional glob patterns as a second argument.
 *
 * ```js
 * deps.filter('fs-*');
 * //=> {'fs-utils': {...}}
 *
 * // exclude the `readme` key from package.json objects
 * deps.filter('fs-*', ['*', '!readme']);
 * //=> {'fs-utils': {...}}
 * ```
 *
 * @param {String|Array} `patterns` Glob patterns to use for filtering modules.
 * @param {String|Array} `keyPatterns` Glob patterns to use for filtering the keys on each object.
 * @return {Object} Filtered object.
 * @api public
 */

Lookup.prototype.filter = function(patterns, keyPatterns) {
  var pkgs = filterObj(this.cache, patterns);
  if (keyPatterns == null) return pkgs;
  var o = {};

  var pat = arrayify(keyPatterns);

  for (var key in pkgs) {
    if (pkgs.hasOwnProperty(key)) {
      o[key] = deepFilter(pkgs[key], _.flatten(pat));
    }
  }
  return o;
};

/**
 * Find a module or modules using glob patterns, and return
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

Lookup.prototype.find = function(patterns, props) {
  return _.reduce(this.names(patterns), function (acc, name) {
    acc[name] = get(this.cache[name], props) || null;
    return acc;
  }.bind(this), {});
};

/**
 * A convenience proxy for the `.find()` method to specifically search
 * the `pkg` object of each module on the cache.
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

Lookup.prototype.lookup = function(patterns, props) {
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

Lookup.prototype.paths = function(patterns) {
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

Lookup.prototype.pkg = function(patterns) {
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

Lookup.prototype.dependencies = function(patterns) {
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

Lookup.prototype.keywords = function(patterns) {
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

Lookup.prototype.homepage = function(patterns) {
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

Lookup.prototype.links = function(pattern) {
  pattern = pattern || this.config.name;
  var obj = this.lookup(pattern, 'homepage');
  var str = '';

  _.forOwn(obj, function (value, key) {
    str += '[' + key + '](' + value + ')\n';
  });
  return str;
};

/**
 * Ensure that `val` is an array.
 *
 * @param  {*} `val`
 * @return {Array}
 * @api private
 */

function arrayify(val) {
  return Array.isArray(val) ? [val] : val;
}


/**
 * Expose `Lookup`
 */

module.exports = Lookup;
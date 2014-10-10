'use strict';


/**
 * Module dependencies
 */

// process.env.DEBUG = 'deps';
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var debug = require('debug')('deps');
var getobject = require('getobject');
var lookup = require('lookup-path');
var findup = require('findup-sync');
var typeOf = require('kind-of');
var utils = require('./lib');
var file = require('fs-utils');
var _ = require('lodash');

var types = ['dependencies', 'devDependencies', 'peerDependencies'];

/**
 * Create a new instance of `Deps`
 *
 * @param {Object} `config`
 * @param {Object} `options`
 */

function Deps(config, options) {
  this.options = options || {};
  this.cache = {};

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
  this.config = config || this.tryRequire('./');
  this.config.path = this.cwd();
  this.setPkg(this.config.name, this.config);
};

/**
 * Resolve the path to `node_modules` for a named package.
 *
 * @param  {String} `name`
 * @return {String}
 */

Deps.prototype.pkg = function(cwd) {
  return path.resolve(cwd || process.cwd(), 'package.json');
};

/**
 * Resolve the path to current working directory for package.
 *
 * @param  {String} `name`
 * @return {String}
 */

Deps.prototype.dirname = function(filepath) {
  return utils.dirname(filepath);
};

/**
 * Resolve the path to current working directory for package.
 *
 * @param  {String} `name`
 * @return {String}
 */

Deps.prototype.cwd = function(cwd) {
  return this.dirname(this.pkg(cwd));
};

/**
 * Resolve the path to `node_modules` for a named package.
 *
 * @param  {String} `name`
 * @return {String}
 */

Deps.prototype.nodeModules = function(cwd) {
  return path.join(this.cwd(cwd), 'node_modules');
};

/**
 * Attempt to require a package.json for a resolved
 * module.
 *
 * @param  {String} `filepath`
 * @return {Object}
 */

Deps.prototype.tryRequire = function(cwd) {
  try {
    return require(this.pkg(cwd));
  } catch(err) {}
  return null;
};

/**
 * Set a value on the cache.
 *
 * @param {String} `key`
 * @param {*} `value`
 */

Deps.prototype.set = function(key, value) {
  getobject.set(this.cache, key, value);
  return this;
};

/**
 * Set a package.json object on the cache.
 *
 * @param {String} `key`
 * @param {Object} `value`
 */

Deps.prototype.setPkg = function(key, value) {
  if (!this.hasOwn(key)) {
    return this.set(key, this.escape(value));
  }
  return this;
};

/**
 * Get a value from the cache.
 *
 * @param  {Object} key
 * @return {Object}
 */

Deps.prototype.get = function(key) {
  var args = _.flatten([].slice.call(arguments));
  return getobject.get(this.cache, args.join('.'));
};

/**
 * Resolve the path to `node_modules` for a named package.
 *
 * @param  {String} `name`
 * @return {String}
 */

Deps.prototype.tree = function(cwd, type) {
  var o = {};
  var pkg = this.tryRequire(cwd);
  this.setPkg(pkg.name, pkg);

  if (!this.hasOwn(pkg, 'dependencies')) {
    return this.cache;
  }

  var keys = this.allDeps(pkg, type);
  console.log(keys)

  return this.cache;
};

/**
 * Get the dependency tree for a project.
 *
 * @param  {String} cwd
 * @param  {String} type
 * @return {String}
 */

Deps.prototype._tree = function(cwd, type) {
  // Determine the correct path for a package.json.
  var obj = this.pkgFile(cwd);
  if (obj == null) {
    return {};
  }
  var keys = _.keys(obj[type || this.type]);

  return _.reduce(keys, function (acc, name) {
    acc = acc || {};

    var fp = this.moduleRoot(cwd, name);
    this._push(fp, 'paths');

    var pkg = this.tryRequire(fp);
    var o = {path: fp};

    if (pkg == null) {
      acc[name] = o;
    } else {
      this.setPkg(name, o);
      var child = {};

      child.package = o;
      child.path = relative(fp);
      child.deps = this._tree(fp);
      acc[name] = child;
    }

    return acc;
  }.bind(this), {});
};

/**
 * Determine the correct path for a package.json.
 *
 * @param  {String} cwd
 * @return {Object}
 */

Deps.prototype.pkgFile = function(cwd) {
  var current = this.findPkg(cwd);

  if (!file.exists(current)) {
    current = this.findDependency(cwd);
  }

  if (current && file.exists(current)) {
    current = require(current);
    this.setPkg(current.name, current);
    return current;
  }
  return null;
};

/**
 * Resolve the path to the root of a module from the
 * given `cwd`
 *
 * ```js
 * deps.moduleRoot('dep-tree', 'chalk');
 * ```
 *
 * @param  {String} `cwd`
 * @param  {String} `name`
 * @return {String}
 */

Deps.prototype.moduleRoot = function(cwd, name) {
  return path.resolve(this.nodeModules(cwd), name);
};

Deps.prototype.findPkg = function (cwd) {
  return path.resolve(cwd, 'package.json');
};

/**
 * Push a filepath on `name` on the cache.
 *
 * @param  {[type]} url
 * @param  {[type]} name
 * @return {[type]}
 */

Deps.prototype._push = function(url, name) {
  this.cache[name] = this.cache[name] || [];
  return this.cache[name].push(url);
};

/**
 * Set a value on the cache.
 *
 * @param {String} `key`
 * @param {*} `value`
 */

Deps.prototype.deps = function(name, type) {
  var pkg = this.cache[name];
  if (this.hasOwn(pkg, type)) {
    return pkg[type];
  }
  return {};
};

Deps.prototype._deps = function(pkg, type) {
  if (pkg && this.hasOwn(pkg, type)) {
    return this.keys(pkg[type]);
  }
  return [];
};

Deps.prototype.allDeps = function(pkg) {
  return types.reduce(function (acc, type) {
    return acc.concat(this._deps(pkg, type));
  }.bind(this), []);
};

Deps.prototype.dependencies = function(pkg) {
  return this._deps(pkg, 'dependencies');
};

Deps.prototype.devDependencies = function(pkg) {
  return this._deps(pkg, 'devDependencies');
};

Deps.prototype.peerDependencies = function(pkg) {
  return this._deps(pkg, 'peerDependencies');
};

Deps.prototype.exists = function(cwd) {
  var dir = this.cwd(cwd);
  console.log(dir)
  return file.exists(dir);
};


Deps.prototype.lookup = function(name, key, prop) {
  if (key == null) {
    return this.get(name, 'dependencies');
  }
  var dep = this.get(name, key);
  if (prop == null) {
    return dep;
  }
  return _.reduce(dep, function (acc, value, key) {
    acc[key] = prop ? this.get(key, prop) : dep;
    return acc;
  }.bind(this), {});
};

Deps.prototype.filter = function(list, omit) {
  return _.filter(this.cache, function (pkg) {
    return list.indexOf(pkg.name) !== -1;
  }).map(function (pkg) {
    return _.omit(pkg, omit);
  });
};

Deps.prototype.list = function(name, method) {
  return this.cache[name].map(function (fp) {
    var fn = method === 'relative'
      ? relative
      : path[method];

    return file.forwardSlash(fn ? fn(fp) : fp);
  }.bind(this)).sort();
};

Deps.prototype.paths = function(method) {
  return this.list('paths', method);
};

Deps.prototype.homepage = function(method) {
  return this.list('homepage', method);
};

Deps.prototype.findDependency = function(filepath) {
  var name = path.basename(filepath);

  // console.log(this.lookup(name, 'path'))
  // console.log(chalk.bold('%s'), name)
  // console.log(chalk.cyan('%s'), filepath)
  // console.log(chalk.yellow('%s'), this.isCurrentPath(filepath))

  var res = this.lookup(name, 'path') + '/package.json';
  if (file.exists(res)) {
    return res;
  }
  // return null;

  var pkgs = this.list('paths');
  var len = pkgs.length;

  for (var i = 0; i < len; i++) {
    var fp = pkgs[i];
    if (fp.indexOf(name) !== -1) {
      return path.resolve(fp, 'package.json');
    }
  }
  return null;
};



Deps.prototype.escape = function(pkg) {
  return _.transform(pkg, function (acc, value, key) {
    if (key === 'name' && /\./.test(value)) {
      value = value.replace(/\./g, '\\.');
    }
    acc[key] = value;
  }, {});
};


Deps.prototype.isCurrentPath = function(fp) {
  var current = normalize(process.cwd());
  var compare = normalize(fp);

  if (compare === current) {
    return true;
  }
  return false;
};


/**
 * Utils
 */


function relative(filepath) {
  var rel = path.relative(process.cwd(), filepath);
  return file.forwardSlash(rel);
}

function normalize(fp) {
  return file.forwardSlash(fp);
}




/**
 * Set or get an option.
 *
 * ```js
 * deps.option('a', true)
 * deps.option('a')
 * // => true
 * ```
 *
 * @param {String} `key` The option name.
 * @param {*} `value` The value to set.
 * @return {*|Object} Returns `value` if `key` is supplied, or `Deps` for chaining when an option is set.
 * @api public
 */

Deps.prototype.option = function(key, value) {
  var args = [].slice.call(arguments);

  if (args.length === 1 && typeof key === 'string') {
    return this.options[key];
  }

  if (typeOf(key) === 'object') {
    _.extend.apply(_, [this.options].concat(args));
    return this;
  }

  this.options[key] = value;
  return this;
};

/**
 * Return the keys on `obj` or `this.cache`.
 *
 * ```js
 * deps.keys();
 * ```
 *
 * @param {Object} `obj` Optionally pass an object.
 * @return {Array} Array of keys.
 * @api public
 */

Deps.prototype.keys = function(o) {
  return Object.keys(o || this.cache);
};


/**
 * Return true if `key` is an own, enumerable property
 * of `this.cache` or the given `obj`.
 *
 * ```js
 * app.hasOwn([key]);
 * ```
 *
 * @param  {String} `key`
 * @param  {Object} `obj` Optionally pass an object to check.
 * @return {Boolean}
 * @api public
 */

Deps.prototype.hasOwn = function(o, key) {
  if (typeof o === 'string') {
    key = o;
    o = this.cache;
  }
  return {}.hasOwnProperty.call(o, key);
};


module.exports = Deps;
'use strict';

process.env.DEBUG = 'deps';

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var debug = require('debug')('deps');
var file = require('fs-utils');
var get = require('get-value');
var _ = require('lodash');

var userPkg = require(path.resolve(process.cwd(), 'package'));

function Deps(type) {
  this.type = type || 'dependencies';
  this.cache = {};
}

Deps.prototype.resolve = function(cwd, type) {
  var current = this.findPkg(cwd);
  var tree = {};
  var pkg = {};

  this.setPkg(userPkg.name, pkg);

  if (!fs.existsSync(current)) {
    current = this.resolvePath(cwd);
  }

  if (current && file.exists(current)) {
    pkg = require(current);
    pkg.path = process.cwd();
    this.setPkg(pkg.name, pkg);
  } else {
    return current;
  }

  var arr = _.keys(pkg[type || this.type]);

  return _.reduce(arr, function (acc, name) {
    acc = acc || {};

    var fp = this.resolvePkg(cwd, name);
    this._push(fp, 'paths');
    var child = {};

    var obj = this.tryRequire(fp, pkg);
    obj.path = fp;

    this.setPkg(name, obj);

    child.package = obj;
    child.path = relative(fp);
    child.deps = this.resolve(fp);
    acc[name] = child;
    return acc;
  }.bind(this), {});
};


Deps.prototype.set = function(key, value) {
  this.cache[key] = value;
  return this;
};

Deps.prototype.setPkg = function(key, value) {
  if (!this.cache.hasOwnProperty(key)) {
    return this.set(key, this.escape(value));
  }
  return this;
};

Deps.prototype.get = function(key) {
  var args = _.flatten([].slice.call(arguments));
  return get(this.cache, args.join('.'));
};

Deps.prototype._push = function(url, name) {
  this.cache[name] = this.cache[name] || [];
  return this.cache[name].push(url);
};

Deps.prototype.escape = function(pkg) {
  return _.transform(pkg, function (acc, value, key) {
    if (key === 'name' && /\./.test(value)) {
      value = value.replace(/\./g, '\\.');
    }
    acc[key] = value;
  }, {});
};

Deps.prototype.deps = function(name, type) {
  type = type || 'dependencies';
  var pkg = this.cache[name];
  if (pkg.hasOwnProperty(type)) {
    return pkg[type];
  }
  return {};
};

Deps.prototype.lookup = function(name, key, prop) {
  if (key == null) {
    return this.deps(name);
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

Deps.prototype.isCurrentPath = function(fp) {
  var current = normalize(process.cwd());
  var compare = normalize(fp)

  if (compare === current) {
    return true;
  }
  return false;
};

Deps.prototype.resolveRoot = function(cwd) {
  return path.join(cwd, 'node_modules');
};

Deps.prototype.resolvePkg = function(cwd, name) {
  return path.resolve(this.resolveRoot(cwd), name);
};

Deps.prototype.findPkg = function (cwd) {
  return path.resolve(cwd, 'package.json');
};

Deps.prototype.resolvePath = function(filepath) {
  var name = path.basename(filepath);

  // console.log(this.lookup(name, 'path'))

  // console.log(chalk.bold('%s'), name)
  // console.log(chalk.cyan('%s'), filepath)
  // console.log(chalk.yellow('%s'), this.isCurrentPath(filepath))


  // var res = this.lookup(name, 'path') + '/package.json';
  // if (file.exists(res)) {
  //   return res;
  // }
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

Deps.prototype.tryRequire = function(filepath, pkg) {
  var fp = path.join(filepath, 'package.json');
  if (file.exists(fp)) {
    return require(fp);
  }
  return pkg;
};


function relative(filepath) {
  var rel = path.relative(process.cwd(), filepath);
  return file.forwardSlash(rel);
}

function normalize(fp) {
  return file.forwardSlash(fp);
}


module.exports = Deps;
'use strict';

/**
 * Module dependencies
 */

var fs = require('fs');
var path = require('path');
var util = require('util');
var utils = require('./lib');
var file = require('fs-utils');

var paths = [];

function deps(pkg) {
  if (pkg.hasOwnProperty('dependencies')) {
    return pkg.dependencies;
  }
  return {};
}

function depsKeys(pkg) {
  return Object.keys(deps(pkg, 'dependencies'));
}

function readPkg(filepath) {
  try {
    var fp = path.resolve(filepath, 'package.json');
    return require(fp);
  } catch(err) {
    return {};
  }
}
function tryRequire(filepath) {
  try {
    return require(filepath);
  } catch(err) {
    return {};
  }
}

function first(arr, fn) {
  return arr.filter(fn)[0] || null;
}

function findPath(filepath) {
  var name = path.basename(filepath);

  return first(paths, function(fp) {
    return name === path.basename(fp);
  });
}

function moduleRoot(cwd, fp) {
  var res = path.join(cwd, 'node_modules', fp);
  if (file.exists(res)) {
    paths.push(res);
    return res;
  }
  return findPath(res) || null;
}

function modules(filepath) {
  var pkg = readPkg(filepath);
  var keys = depsKeys(pkg);
  var deps = {};

  if (keys.length) {
    var len = keys.length;
    for (var i = 0; i < len; i++) {
      var name = keys[i];
      var o = {};
      o.path = moduleRoot(filepath, name);
      if (o.path != null) {
        o.pkgpath = path.resolve(o.path, 'package.json');
        o.pkg = tryRequire(o.pkgpath);
        o.deps = modules(o.path);
      } else {
        o.pkg = null;
        o.deps = null;
        o.pkgpath = null;
      }
      deps[escapeDot(name)] = o;
    }
  }
  return deps;
}

// function modules(filepath) {
//   var pkg = readPkg(filepath);
//   var keys = depsKeys(pkg);
//   var deps = {};

//   if (keys.length) {
//     var len = keys.length;
//     for (var i = 0; i < len; i++) {
//       var name = keys[i];
//       var o = {};
//       o.deps = {};
//       o.path = moduleRoot(filepath, name);
//       if (o.path != null) {
//         o.pkgpath = path.resolve(o.path, 'package.json');
//         o.pkg = tryRequire(o.pkgpath);
//         o.deps = modules(o.path);
//       }
//       deps[escapeDot(name)] = o;
//     }
//   }
//   return deps;
// }


var files = modules('./', 'devDependencies');
console.log(util.inspect(files, null, 10));

function escapeDot(str) {
  return str.replace(/\./g, '\\.');
}
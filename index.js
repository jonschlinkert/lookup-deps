'use strict';

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var reduce = require('object.reduce');
var file = require('fs-utils');
var _ = require('lodash');
var utils = require('./lib');

/**
 * Cache any package.json file paths that
 * actually exist on the file system.
 *
 * @type {Array}
 */

var cache = [];
var url = [];


function deps(pkg, type) {
  type = type || 'dependencies';
  return _.keys(pkg[type]);
}

function base(cwd) {
  return path.join(cwd, 'node_modules');
}

function addUrl(pkg) {
  if (pkg.homepage != null) {
    url.push(pkg.homepage);
  } else if (pkg.repository.url != null) {
    url.push(pkg.repository.url);
  }
}

function findPkg(cwd) {
  return path.resolve(cwd, 'package.json');
}


function relative(filepath) {
  var rel = path.relative(process.cwd(), filepath);
  return file.forwardSlash(rel);
}


function filter(files, name) {
  var len = files.length;

  for (var i = 0; i < len; i++) {
    var fp = files[i];
    if (fp.indexOf(name) !== -1) {
      return path.resolve(fp, 'package.json');
    }
  }
  return null;
}

function detectPkg(fp, pkg) {
  var check = path.join(fp, 'package.json');
  if (file.exists(check)) {
    pkg = require(check);
    cache.push(fp);
    return pkg;
  }
  return pkg;
}

function resolve(cwd, type) {
  var current = findPkg(cwd);
  var tree = {};
  var pkg = {};

  if (!fs.existsSync(current)) {
    current = filter(cache, path.basename(cwd));
  }

  if (current && file.exists(current)) {
    pkg = require(current);
  } else {
    return current;
  }

  addUrl(pkg);

  var arr = deps(pkg, type);

  return reduce(arr, function (acc, name) {
    acc = acc || {};

    var fp = path.resolve(base(cwd), name);
    var child = {};

    // child.pkg = detectPkg(fp, pkg);
    // child.path = relative(fp);
    child.deps = resolve(fp);
    acc[name] = child;
    return acc;
  }, {});
}

var t = resolve('./');
// console.log(JSON.stringify(t, null, 2));

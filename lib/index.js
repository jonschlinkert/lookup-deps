'use strict';

/**
 * Module dependencies
 */

var fs = require('fs');
var path = require('path');

function isDir(fp) {
  return fs.statSync(fp).isDirectory();
}

function camelize(fp) {
  var str = path.basename(fp, path.extname(fp));
  return str.replace(/-(.)/, function (_, s) {
    return s.toUpperCase();
  });
}

function isFile(fp) {
  return fs.statSync(fp).isFile();
}

function lookup(dir) {
  fs.readdirSync(dir).forEach(function (name) {
    var fp = path.resolve(dir, name);
    if (!/index/.test(fp) && isFile(fp)) {
      exports[camelize(name)] = require(fp);
    }
  });

  return exports;
}

module.exports = lookup(__dirname);
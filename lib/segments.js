'use strict';

/**
 * Module dependencies
 */

var path = require('path');
var lookup = require('./lookup');
var hyphenate = require('./hyphenate');
var basename = require('./basename');
var name = require('./name');
var last = require('./last');

module.exports = function segments(dir, num) {
  return lookup(dir).map(function (filepath) {
    return last(filepath, num) + '/' + name(filepath);
  });
};

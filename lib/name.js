'use strict';

var hyphenate = require('./hyphenate');
var basename = require('./basename');
var re = /[\\\/]/g;

module.exports = function (filepath) {
  return hyphenate(basename(filepath));
};

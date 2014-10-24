'use strict';

var hyphenate = require('./hyphenate');
var basename = require('./basename');

module.exports = function name(filepath) {
  return hyphenate(basename(filepath));
};

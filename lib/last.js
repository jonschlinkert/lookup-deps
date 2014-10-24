'use strict';

var segments = require('./segments');

module.exports = function last(fp, num) {
  return segments(fp).slice(-num);
};

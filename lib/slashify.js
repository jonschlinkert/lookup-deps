'use strict';

module.exports = function slashify(fp) {
  return fp.replace(/[\\\/]/g, '/');
};
'use strict';

module.exports = function segments(fp) {
  return fp.split(/[\\\/]/g);
};

'use strict';

module.exports = function first(arr, fn) {
  if (arr == null) {
    return null;
  }

  var len = arr.length;
  var val;
  var i = -1;

  while (++i < len) {
    val = arr[i];
    if (fn(val, i, arr)) {
      return val;
    }
  }
  return null;
};

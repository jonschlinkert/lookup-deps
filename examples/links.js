'use strict';

var Deps = require('..');
var deps = new Deps();

/**
 * Get a list of markdown formatted links
 */

console.log(deps.links('for-*'));

// results in:
//
// [for-in](https://github.com/jonschlinkert/for-in)
// [for-own](https://github.com/jonschlinkert/for-own)

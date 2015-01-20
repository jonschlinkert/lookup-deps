'use strict';

var Deps = require('..');
var deps = new Deps();

/**
 * Get a list of markdown formatted refernce links
 */

console.log(deps.reflinks('for-*'));

// results in:
//
// [for-in]: https://github.com/jonschlinkert/for-in
// [for-own]: https://github.com/jonschlinkert/for-own



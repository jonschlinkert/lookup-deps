'use strict';

var Deps = require('..');
var deps = new Deps();

/**
 * Get a package.json (or multiple)
 */

console.log(deps.get('for-in'));


/**
 * Get the version
 */

console.log(deps.get('markdown-utils', 'version'));


/**
 * Get a specific property from the specified dependencies
 */

console.log(deps.get('for-*', 'keywords'));


/**
 * Get the homepage value from every dependency
 */

console.log(deps.get('*', 'homepage'));

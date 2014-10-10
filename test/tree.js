/*!
 * lookup-deps <https://github.com/jonschlinkert/lookup-deps>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var path = require('path');
var should = require('should');
var assert = require('assert');
var Deps = require('..');
var deps = new Deps();
var pkg = require(path.resolve(__dirname, '../package'));

describe('deps', function () {
  it('should return a flattened dependency tree', function () {
    deps.tree('lookup-deps').should.be.an.object;
  });
});


var deps = new Deps({root: 'test/fixtures'});
// var deps = new Deps();

// console.log(deps.dependencies('chalk'));
// console.log(deps.find('for-own', 'pkg.repository.url'));
// console.log(deps.find('is*', 'path'));
// console.log(deps.homepage('fs*'));
// console.log(deps.keywords('verb'));
// console.log(deps.lookup('ansi-styles', 'dep'))
// console.log(deps.lookup('is*', 'repository.url'));
// console.log(deps.lookup('multi*', 'dependencies'));
// console.log(deps.lookup('multi*', 'keywords'));
// console.log(deps.lookup(['**', '!is*'], 'pkg.repository.url'));
// console.log(deps.names('is*'));
// console.log(deps.paths('ansi-styles'));
// console.log(deps.pkg('is*'));
// console.log(util.inspect(deps, null, 10));
// var files = deps.tree('./');

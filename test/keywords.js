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
var deps = new Deps({root: 'test/fixtures'});
var pkg = require(path.resolve(__dirname, '../package'));

describe('keywords', function () {
  it('should return the `keywords` property for the given module.', function () {
    deps.keywords('lodash')['lodash'].should.be.an.array;
  });
});

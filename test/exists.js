/*!
 * lookup-deps <https://github.com/jonschlinkert/lookup-deps>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License
 */

'use strict';

var path = require('path');
var should = require('should');
var assert = require('assert');
var Deps = require('..');
var deps = new Deps();
var pkg = require(path.resolve(__dirname, '../package'));

describe('exists', function () {
  it('should return true if the dependency exists.', function () {
    deps.exists('for-own').should.be.true;
    deps.exists('for-own').should.not.be.false;
    deps.exists('foo').should.be.false;
  });
});
/*!
 * dep-tree <https://github.com/jonschlinkert/dep-tree>
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

describe('exists', function () {
  it('should return true if the dependency exists.', function () {
    deps.exists('fs-utils').should.be.true;
    deps.exists('fs-utils').should.not.be.false;
    deps.exists('foo').should.be.false;
  });
});
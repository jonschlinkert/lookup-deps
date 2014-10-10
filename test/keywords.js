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
var deps = new Deps({root: 'test/fixtures'});
var pkg = require(path.resolve(__dirname, '../package'));

describe('keywords', function () {
  it('should return keywords arrays for the given names.', function () {
    deps.keywords('fs-utils')['fs-utils'].should.be.an.array;
    deps.keywords('fs-utils')['fs-utils'].length.should.equal(10);
  });
});

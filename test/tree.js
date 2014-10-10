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

describe('deps', function () {
  it('should return a flattened dependency tree', function () {
    deps.tree('dep-tree').should.equal(path.join(process.cwd(), 'node_modules'));
    deps.tree('chalk', process.cwd() + '/node_modules').should.equal(path.join(process.cwd(), 'node_modules', 'chalk'));
  });
});
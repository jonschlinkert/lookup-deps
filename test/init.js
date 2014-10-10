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

function lower(str) {
  return str.toLowerCase();
}

describe('.init()', function () {
  it('initialize the config using defaults.', function () {
    deps.init()
    deps.config.should.have.property('name', 'dep-tree');
  });

  it('initialize the config with the given object.', function () {
    deps.init({name: 'foo'})
    deps.config.should.have.property('name', 'foo');
  });
});
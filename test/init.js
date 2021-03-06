/*!
 * lookup-deps <https://github.com/jonschlinkert/lookup-deps>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License
 */

'use strict';

var should = require('should');
var assert = require('assert');
var Deps = require('..');
var deps = new Deps();

describe('.init()', function () {
  it('initialize the config using defaults.', function () {
    deps.init()
    deps.config.should.have.property('name', 'lookup-deps');
  });
});
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

describe('paths', function () {
  describe('.pkg()', function () {
    it('should resolve the path to the package.json for the given module.', function () {
      lower(deps.pkg('dep-tree')).should.equal(lower(path.join(process.cwd(), 'package.json')));
    });
  });

  describe('.cwd()', function () {
    it('should resolve the path to the cwd for the given module.', function () {
      lower(deps.cwd('dep-tree')).should.equal(lower(process.cwd()));
    });
  });

  describe('.nodeModules()', function () {
    it('should resolve the path to node_modules from a given cwd.', function () {
      deps.nodeModules('dep-tree').should.equal(path.join(process.cwd(), 'node_modules'));

      var chalk = path.join(process.cwd(), 'node_modules', 'chalk');
      deps.nodeModules(process.cwd() + '/node_modules/chalk').should.equal(path.join(chalk, 'node_modules'));
      deps.nodeModules(process.cwd() + '/node_modules/chalk/node_modules/ansi-styles').should.equal(path.join(chalk, 'node_modules/ansi-styles/node_modules'));
    });
  });
});
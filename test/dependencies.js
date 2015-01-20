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

describe('.dependencies()', function () {
  it('get the dependencies of a project.', function () {
    deps.dependencies().should.be.an.object;
    deps.dependencies('*').should.be.an.object;
    assert.equal(deps.dependencies('mocha'), null);
  });
});

// describe('.devDependencies()', function () {
//   it('get the devDependencies of a project.', function () {
//     assert.equal(!!deps.dependencies('mocha'), false);
//     deps.devDependencies('*').should.be.an.object;
//     console.log(deps.devDependencies())
//     // deps.devDependencies('mocha').should.eql({a: 'b'})
//   });
// });
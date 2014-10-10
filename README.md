# lookup-deps [![NPM version](https://badge.fury.io/js/lookup-deps.svg)](http://badge.fury.io/js/lookup-deps)


> Simple API for getting metadata from locally installed npm packages (in `node_modules`).

In a nutshell, this scans node_modules and builds an object that represents a basic dependency graph of locally installed packages. Rather than walking directories, this builds the tree by directly referencing dependencies listed in `package.json` of each project, which makes it pretty fast.

This only builds a tree of `dependencies`, e.g. not `devDependencies`, since those aren't installed for any modules other than the current project.

## What does it do!?

Allows you to easily get information from the package.json of any locally installed module.

**Example:**

```js
deps.get('fs-utils', 'version');
//=> '0.5.0'
```

Or use glob patterns:

```js
deps.get('*', 'homepage')
// =>
// { globby: 'https://github.com/sindresorhus/globby',
//  'is-relative': 'https://github.com/jonschlinkert/is-relative',
//  'is-absolute': 'https://github.com/jonschlinkert/is-absolute', ...}
```

## Install
#### Install with [npm](npmjs.org):

```bash
npm i lookup-deps --save-dev
```

## Run tests

```bash
npm test
```

## Usage

```js
var Deps = require('lookup-deps');
var deps = new Deps();
```

## API
### [Deps](index.js#L36)

Create a new instance of `Deps`.

* `config` **{Object}**: Optionally pass a default config object instead of `package.json` For now there is no reason to do this.    
* `options` **{Object}**    

```js
var Deps = require('lookup-deps');
var deps = new Deps();
```

### [.get](index.js#L106)

Get a value from the cache.

* `name` **{Object}**: The module to get.    
* `props` **{String}**: Property paths.    
* `returns`: {Object}  

```js
// get an entire package.json
deps.get('fs-utils');
//=> { pkg: { name: 'fs-utils', version: '0.5.0', ... }

// or, get a specific value
deps.get('fs-utils', 'version');
//=> '0.5.0'
```

### [.exists](index.js#L130)

Check to see if a module exists (or at least is on the cache).

* `name` **{String}**: The name to check.    
* `returns`: {String}  

```js
deps.exists('fs-utils');
//=> true
```

### [.depsKeys](index.js#L198)

Get the keys for `dependencies` for the specified package.

* `config` **{Object|String}**: The name of the module, or package.json config object.    
* `returns`: {Object}  

```js
deps.depsKeys('fs-utils');
//=> [ 'is-absolute', 'kind-of', 'relative', ... ]
```

### [.tree](index.js#L292)

Build a dependency tree by recursively reading in package.json files for projects in node_modules.

* `cwd` **{String}**: The root directory to search from.    
* `returns`: {Object}  

```js
deps.tree('./');
```

### [.names](index.js#L333)

Return a list of names of all resolved packages from node_modules that match the given glob patterns. If no pattern is provided the entire list is returned.

* `obj` **{Object}**: Optionally pass an object.    
* `returns` **{Array}**: Array of keys.  

```js
deps.names('fs-*');
//=> ['fs-utils']
```

### [.find](index.js#L363)

Lookup a module or modules using glob patterns, and return an object filtered to have only the specified `props`. Note that `package.json` objects are stored on the `pkg` property for each module.

* `patterns` **{String}**    
* `props` **{String}**    
* `returns`: {Object}  

Properties are specified using object paths:

```js
deps.find('for-*', 'pkg.repository.url');

// results in:
// { 'for-own': 'git://github.com/jonschlinkert/for-own.git',
//   'for-in': 'git://github.com/jonschlinkert/for-in.git' }
```

### [.lookup](index.js#L388)

A convenience proxy for the `.find()` method to specifically search the `pkg` object.

* `patterns` **{String}**    
* `props` **{String}**    
* `returns`: {Object}  

```js
deps.lookup('for-*', 'repository.url');

// results in:
// { 'for-own': 'git://github.com/jonschlinkert/for-own.git',
//   'for-in': 'git://github.com/jonschlinkert/for-in.git' }
```

### [.paths](index.js#L405)

Get the path to a module or modules, relative to the current working directory. Glob patterns may be used.

* `patterns` **{String}**    
* `returns`: {String}  

```js
deps.paths('*');
```

### [.pkg](index.js#L422)

Get the package.json objects for the given module or modules. Glob patterns may be used.

* `patterns` **{String}**    
* `returns`: {String}  

```js
deps.pkg('fs-utils');
```

### [.dependencies](index.js#L440)

Get the `dependencies` for the given modules. Glob patterns may be used.

* `patterns` **{String}**    
* `returns`: {Object}  

```js
deps.dependencies('multi*');
//=> { multimatch: { 'array-differ': '^1.0.0', ... } }
```

### [.keywords](index.js#L457)

Get the `keywords` for the given modules.

* `patterns` **{String}**    
* `returns`: {String}  

```js
deps.keywords('multi*');
//=> { multimatch: [ 'minimatch', 'match', ... ] }
```

### [.homepage](index.js#L474)

Get the `homepage` for the specified modules.

* `patterns` **{String}**    
* `returns`: {String}  

```js
deps.homepage('fs-*');
//=> { 'fs-utils': 'https://github.com/assemble/fs-utils' }
```

### [.links](index.js#L492)

Get a list of markdown-formatted links, from the `homepage` properties of the specified modules.

* `patterns` **{String}**    
* `returns`: {String}  

```js
deps.links('fs-*');
//=> [fs-utils](https://github.com/assemble/fs-utils)
```

## Author

**Jon Schlinkert**
 
+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert) 

## License
Copyright (c) 2014 Jon Schlinkert, contributors.  
Released under the MIT license

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on October 10, 2014._

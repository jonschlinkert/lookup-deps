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

If an object is returned with `null` values, this means that the package wasn't found at the given path. e.g. it was symlinked by npm.

To get around this, you can pass `{findup: true}` to the constructor and [findup-sync] will be used to find the nearest match. This is
disabled by default since this is an exception to the rule and it considerably slows down searches.

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
### [Lookup](index.js#L40)

Create a new instance of `Lookup`.

* `config` **{Object}**: Optionally pass a default config object instead of `package.json` For now there is no reason to do this.    
* `options` **{Object}**    

```js
var Lookup = require('lookup-deps');
var deps = new Lookup();
```

### [.get](index.js#L111)

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

### [.exists](index.js#L135)

Check to see if a module exists (or at least is on the cache).

* `name` **{String}**: The name to check.    
* `returns`: {String}  

```js
deps.exists('fs-utils');
//=> true
```

### [.depsKeys](index.js#L203)

Get the keys for `dependencies` for the specified package.

* `config` **{Object|String}**: The name of the module, or package.json config object.    
* `returns`: {Object}  

```js
deps.depsKeys('fs-utils');
//=> [ 'is-absolute', 'kind-of', 'relative', ... ]
```

### [.findPkg](index.js#L270)

* `filepath` **{String}**    
* `returns`: {String}  

Find a package.json for the given module by `name`, starting
the search at the given `cwd`.

### [.tree](index.js#L332)

Build a dependency tree by recursively reading in package.json files for projects in node_modules.

* `cwd` **{String}**: The root directory to search from.    
* `returns`: {Object}  

```js
deps.tree('./');
```

### [.getParents](index.js#L380)

Returns an object of all modules that have the given module as a dependency. Glob patterns may be used for filtering.

* `patterns` **{String|Array}**: Glob patterns to use for filtering.    
* `returns` **{Object}**: Object of parent modules.  

```js
deps.getParents('*');
```

### [.names](index.js#L399)

Return a list of names of all resolved packages from node_modules that match the given glob patterns. If no pattern is provided the entire list is returned.

* `patterns` **{String|Array}**: Glob patterns to use for filtering.    
* `returns` **{Array}**: Array of keys.  

```js
deps.names('fs-*');
//=> ['fs-utils']
```

### [.filter](index.js#L425)

Filter the entire `cache` object to have only packages with names that match the given glob patterns.

* `patterns` **{String|Array}**: Glob patterns to use for filtering modules.    
* `keyPatterns` **{String|Array}**: Glob patterns to use for filtering the keys on each object.    
* `returns` **{Object}**: Filtered object.  

You may also filter the keys on each object by passing
additional glob patterns as a second argument.

```js
deps.filter('fs-*');
//=> {'fs-utils': {...}}

// exclude the `readme` key from package.json objects
deps.filter('fs-*', ['*', '!readme']);
//=> {'fs-utils': {...}}
```

### [.find](index.js#L462)

Find a module or modules using glob patterns, and return an object filtered to have only the specified `props`. Note that `package.json` objects are stored on the `pkg` property for each module.

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

### [.lookup](index.js#L487)

A convenience proxy for the `.find()` method to specifically search the `pkg` object of each module on the cache.

* `patterns` **{String}**    
* `props` **{String}**    
* `returns`: {Object}  

```js
deps.lookup('for-*', 'repository.url');

// results in:
// { 'for-own': 'git://github.com/jonschlinkert/for-own.git',
//   'for-in': 'git://github.com/jonschlinkert/for-in.git' }
```

### [.paths](index.js#L504)

Get the path to a module or modules, relative to the current working directory. Glob patterns may be used.

* `patterns` **{String}**    
* `returns`: {String}  

```js
deps.paths('*');
```

### [.pkg](index.js#L521)

Get the package.json objects for the given module or modules. Glob patterns may be used.

* `patterns` **{String}**    
* `returns`: {String}  

```js
deps.pkg('fs-utils');
```

### [.dependencies](index.js#L539)

Get the `dependencies` for the given modules. Glob patterns may be used.

* `patterns` **{String}**    
* `returns`: {Object}  

```js
deps.dependencies('multi*');
//=> { multimatch: { 'array-differ': '^1.0.0', ... } }
```

### [.keywords](index.js#L556)

Get the `keywords` for the given modules.

* `patterns` **{String}**    
* `returns`: {String}  

```js
deps.keywords('multi*');
//=> { multimatch: [ 'minimatch', 'match', ... ] }
```

### [.homepage](index.js#L573)

Get the `homepage` for the specified modules.

* `patterns` **{String}**    
* `returns`: {String}  

```js
deps.homepage('fs-*');
//=> { 'fs-utils': 'https://github.com/assemble/fs-utils' }
```

### [.links](index.js#L591)

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

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on October 24, 2014._

[findup-sync]: https://github.com/cowboy/node-findup-sync
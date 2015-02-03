# lookup-deps [![NPM version](https://badge.fury.io/js/lookup-deps.svg)](http://badge.fury.io/js/lookup-deps)

> Simple API for getting metadata from locally installed npm packages (in `node_modules`).

## What does it do!?

Builds a recursive tree of all `dependencies` currently installed in node_modules. Allows you to easily get information from the package.json of any locally installed module.

**Examples:**

Get the version of the specified dependency:

```js
deps.get('markdown-utils', 'version');
//=> '0.1.0'
```

Use glob patterns to get the specified property from every dependency:

```js
deps.get('*', 'homepage')

// returns an object like this:
{ globby: 'https://github.com/sindresorhus/globby',
 'is-relative': 'https://github.com/jonschlinkert/is-relative',
 'is-absolute': 'https://github.com/jonschlinkert/is-absolute', ...}
```

If an object is returned with `null` values, this means that the package wasn't found at the given path. e.g. it was symlinked by npm.

To get around this, you can pass `{findup: true}` to the constructor and [findup-sync] will be used to find the nearest match. This is
disabled by default since this is an exception to the rule and it considerably slows down searches.

## Install
### Install with [npm](npmjs.org):

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
### [Lookup](index.js#L46)

Create a new instance of `Lookup`.

* `config` **{Object}**: Optionally pass a default config object instead of `package.json` For now there is no reason to do this.    
* `options` **{Object}**    

```js
var Lookup = require('lookup-deps');
var deps = new Lookup();
```

### [.get](index.js#L120)

Get a value from the cache.

* `name` **{Object}**: The module to get.    
* `props` **{String}**: Property paths.    
* `returns`: {Object}  

```js
// get an entire package.json
deps.get('markdown-utils');
//=> { pkg: { name: 'markdown-utils', version: '0.3.0', ... }

// or, get a specific value
deps.get('markdown-utils', 'version');
//=> '0.3.0'
```

### [.exists](index.js#L144)

Check to see if a module exists (or at least is on the cache).

* `name` **{String}**: The name to check.    
* `returns`: {String}  

```js
deps.exists('markdown-utils');
//=> true
```

### [.depsKeys](index.js#L215)

Get the keys for `dependencies` for the specified package.

* `config` **{Object|String}**: The name of the module, or package.json config object.    
* `returns`: {Object}  

```js
deps.depsKeys('markdown-utils');
//=> [ 'is-absolute', 'kind-of', 'relative', ... ]
```

### [.findPkg](index.js#L284)

* `filepath` **{String}**    
* `returns`: {String}  

Find a package.json for the given module by `name`, starting
the search at the given `cwd`.

### [.tree](index.js#L350)

Build a dependency tree by recursively reading in package.json files for projects in node_modules.

* `cwd` **{String}**: The root directory to search from.    
* `returns`: {Object}  

```js
deps.tree('./');
```

### [.filter](index.js#L407)

Filter the entire `cache` object to have only packages with names that match the given glob patterns.

* `patterns` **{String|Array}**: Glob patterns to use for filtering modules.    
* `keyPatterns` **{String|Array}**: Glob patterns to use for filtering the keys on each object.    
* `returns` **{Object}**: Filtered object.  

You may also filter the keys on each object by passing
additional glob patterns as a second argument.

```js
deps.filter('markdown-*');
//=> {'markdown-utils': {...}}

// exclude the `readme` key from package.json objects
deps.filter('markdown-*', ['*', '!readme']);
//=> {'markdown-utils': {...}}
```

### [.getParents](index.js#L436)

Returns an object of all modules that have the given module as a dependency. Glob patterns may be used for filtering.

* `patterns` **{String|Array}**: Glob patterns to use for filtering.    
* `returns` **{Object}**: Object of parent modules.  

```js
deps.getParents('*');
```

### [.names](index.js#L455)

Return a list of names of all resolved packages from node_modules that match the given glob patterns. If no pattern is provided the entire list is returned.

* `patterns` **{String|Array}**: Glob patterns to use for filtering.    
* `returns` **{Array}**: Array of keys.  

```js
deps.names('markdown-*');
//=> ['markdown-utils']
```

### [.find](index.js#L481)

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

### [.lookup](index.js#L506)

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

### [.paths](index.js#L524)

Get the path to a module or modules, relative to the current working directory. Glob patterns may be used.

* `patterns` **{String}**    
* `returns`: {String}  

```js
deps.paths('*');
```

### [.pkg](index.js#L541)

Get the package.json objects for the given module or modules. Glob patterns may be used.

* `patterns` **{String}**    
* `returns`: {String}  

```js
deps.pkg('markdown-utils');
```

### [.dependencies](index.js#L559)

Get the `dependencies` for the given modules. Glob patterns may be used.

* `patterns` **{String}**    
* `returns`: {Object}  

```js
deps.dependencies('multi*');
//=> { multimatch: { 'array-differ': '^1.0.0', ... } }
```

### [.devDependencies](index.js#L577)

Get the `devDependencies` for the given modules. Glob patterns may be used.

* `patterns` **{String}**    
* `returns`: {Object}  

```js
deps.devDependencies('multi*');
//=> { multimatch: { 'array-differ': '^1.0.0', ... } }
```

### [.keywords](index.js#L594)

Get the `keywords` for the given modules.

* `patterns` **{String}**    
* `returns`: {String}  

```js
deps.keywords('multi*');
//=> { multimatch: [ 'minimatch', 'match', ... ] }
```

### [.homepage](index.js#L611)

Get the `homepage` for the specified modules.

* `patterns` **{String}**    
* `returns`: {String}  

```js
deps.homepage('markdown-*');
//=> { 'markdown-utils': 'https://github.com/jonschlinkert/markdown-utils' }
```

### [.links](index.js#L629)

Get a list of markdown-formatted links, from the `homepage` properties of the specified modules.

* `patterns` **{String}**    
* `returns`: {String}  

```js
deps.links('markdown-*');
//=> [markdown-utils](https://github.com/jonschlinkert/markdown-utils)
```

### [.reflinks](index.js#L655)

Get a list of markdown-formatted links, from the `homepage` properties of the specified modules.

* `patterns` **{String}**    
* `returns`: {String}  

```js
deps.reflinks('markdown-*');
//=> [markdown-utils]: https://github.com/jonschlinkert/markdown-utils
```


## Author

**Jon Schlinkert**
 
+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert) 

## License
Copyright (c) 2014-2015 Jon Schlinkert  
Released under the MIT license

***

_This file was generated by [verb](https://github.com/assemble/verb) on February 03, 2015._

[arr-flatten]: https://github.com/jonschlinkert/arr-flatten
[filter-object]: https://github.com/jonschlinkert/filter-object
[isobject]: https://github.com/jonschlinkert/isobject
[deep-filter-object]: https://github.com/jonschlinkert/deep-filter-object
[arr-map]: https://github.com/jonschlinkert/arr-map
[array-slice]: https://github.com/jonschlinkert/array-slice
[extend-shallow]: https://github.com/jonschlinkert/extend-shallow
[kind-of]: https://github.com/jonschlinkert/kind-of
[arr-diff]: https://github.com/jonschlinkert/arr-diff
[for-own]: https://github.com/jonschlinkert/for-own
[make-iterator]: https://github.com/jonschlinkert/make-iterator
[arr-filter]: https://github.com/jonschlinkert/arr-filter
[is-number]: https://github.com/jonschlinkert/is-number
[randomatic]: https://github.com/jonschlinkert/randomatic
[repeat-element]: https://github.com/jonschlinkert/repeat-element
[repeat-string]: https://github.com/jonschlinkert/repeat-string
[fill-range]: https://github.com/jonschlinkert/fill-range
[expand-range]: https://github.com/jonschlinkert/expand-range
[preserve]: https://github.com/jonschlinkert/preserve
[braces]: https://github.com/jonschlinkert/braces
[filename-regex]: https://github.com/regexps/filename-regex
[glob-path-regex]: https://github.com/regexps/glob-path-regex
[is-glob]: https://github.com/jonschlinkert/is-glob
[micromatch]: https://github.com/jonschlinkert/micromatch
[export-files]: https://github.com/jonschlinkert/export-files
[filter-keys]: https://github.com/jonschlinkert/filter-keys
[filter-values]: https://github.com/jonschlinkert/filter-values
[sort-asc]: https://github.com/jonschlinkert/sort-asc
[sort-desc]: https://github.com/jonschlinkert/sort-desc
[sort-object]: https://github.com/doowb/sort-object
[for-in]: https://github.com/jonschlinkert/for-in
[get-value]: https://github.com/jonschlinkert/get-value
[look-up]: https://github.com/jonschlinkert/look-up
[markdown-utils]: https://github.com/jonschlinkert/markdown-utils


<!-- deps: helper-reflinks -->
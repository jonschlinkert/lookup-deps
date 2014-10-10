var Deps = require('./');
var deps = new Deps();
var _ = require('lodash');
var pkg = require('./package');

// var list = deps.tree('./');
// console.log(JSON.stringify(list, null, 2));


// function links(name) {
//   name = name || pkg.name;
//   var obj = deps.get(name, 'dependencies', 'homepage');
//   var str = '';

//   _.forOwn(obj, function (value, key) {
//     str += '[' + key + '](' + value + ')\n';
//   });

//   return str;
// }

// console.log(links('ansi-styles'))




var deps = new Deps();

// var files = deps.tree('./');
// console.log(util.inspect(deps, null, 10));
// console.log(deps.lookup('ansi-styles', 'dep'))
// console.log(deps.paths('ansi-styles'));
// console.log(deps.dependencies('chalk'));
// console.log(deps.find('is*', 'path'));
// console.log(deps.find('for-own', 'pkg.repository.url'));
// console.log(deps.lookup('is*', 'repository.url'));
// console.log(deps.lookup('multi*', 'dependencies'));
console.log(deps.keywords('multi*'));
// console.log(deps.lookup('multi*', 'keywords'));
// console.log(deps.lookup(['**', '!is*'], 'pkg.repository.url'));
// console.log(deps.names('is*'));



var Deps = require('./');
var deps = new Deps();
var _ = require('lodash');
var pkg = require('./package');

var list = deps.tree('./');
console.log(JSON.stringify(list, null, 2));

// console.log(deps.list('urls'));
// console.log(deps.paths('dirname'));
// console.log(deps.filter(['debug', 'chalk'], function(value, key) {
//   if (key === 'readme') {
//     return true;
//   }
//   if (/_/.test(key)) {
//     return true;
//   }
// }));

// console.log(deps.get('delete', 'dependencies'));
// console.log(deps.lookup('dep-tree', 'dependencies', 'homepage'));
// console.log(deps.lookup('dep-tree', 'dependencies'));
// console.log(deps.lookup('chalk', 'dependencies', 'homepage'));
// console.log(deps.lookup('lru-cache', 'path'));

// function links(name) {
//   name = name || pkg.name;
//   var obj = deps.lookup(name, 'dependencies', 'homepage');
//   var str = '';

//   _.forOwn(obj, function (value, key) {
//     str += '[' + key + '](' + value + ')\n';
//   });

//   return str;
// }

// console.log(links('ansi-styles'))
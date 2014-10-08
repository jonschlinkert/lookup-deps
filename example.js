var Deps = require('./');

var deps = new Deps();

var list = deps.resolve('./');
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
// console.log(deps.lookup('dep-tree', 'dependencies', 'homepage'));
// console.log(deps.lookup('underscore.string', 'path'));


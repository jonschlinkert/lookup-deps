var Deps = require('./');
var deps = new Deps();
var _ = require('lodash');
var pkg = require('./package');

var list = deps.tree('./');
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

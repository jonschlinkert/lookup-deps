var Deps = require('./');
var deps = new Deps();
var _ = require('lodash');
var pkg = require('./package.json');


console.log(deps.links('fs-utils'));

// [fs-utils](https://github.com/assemble/fs-utils)
// [get-value](https://github.com/jonschlinkert/get-value)
// [lodash](http://lodash.com/)
// [multimatch](https://github.com/sindresorhus/multimatch)
const crypto = require('crypto');
const { pipe, map, merge, reduce } = require('./base');

const md5 = str => crypto.createHash('md5').update(str).digest('hex')

const key = f => article => ({
  [md5(f(article))]: { ...article }
})

const keyify = f => pipe(
  map(key(f)),
  reduce(merge)({})
);

module.exports = {
  keyify
};

const crypto = require('crypto');
const { pipe, map, merge, reduce, k } = require('./base');
const { prop } = require('./base')

const md5 = str => crypto.createHash('md5').update(str).digest('hex')

const hash = f => x => md5(f(x))

const hashwrap = f => x => {
  const id = hash(f)(x)
  return {
    [id]: { id:id, ...x }
  }
}

const keyify = f => pipe(
  map(hashwrap(f)),
  reduce(merge(k))({})
);

const unkey =
  Object.values

const key =
  keyify(prop('id'))

module.exports = {
  hash,
  keyify,
  unkey,
  key,
};

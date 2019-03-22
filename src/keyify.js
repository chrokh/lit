const crypto = require('crypto');
const { pipe, map, merge, reduce, k } = require('./base');
const { prop } = require('./base')

const md5 = str => crypto.createHash('md5').update(str).digest('hex')

const hash = f => x => md5(f(x))

const hashMapToRecord = f => o => {
  const id = hash(f)(o)
  return {
    [id]: { id:id, ...o }
  }
}

const toRecord = o => {
  if (o.id == undefined)
    throw 'Cannot convert object without id to record'
  return { [o.id]: { ...o } }
}

const toRecords = pipe(
  map(toRecord),
  reduce(merge(k))({})
)

const keyify = f => pipe(
  map(hashMapToRecord(f)),
  reduce(merge(k))({})
);

const unkey =
  Object.values

const key =
  keyify(prop('id'))

// TODO: This whole file is a mess
module.exports = {
  hashMapToRecord,
  toRecord,
  toRecords,
  hash,
  keyify,
  unkey,
  key,
  md5,
};

const { mapObj } = require('../base')
const { into } = require('../query')
const { pipe, k, merge, prop, reduce } = require('../base')

const sets = obj => Object.keys(obj).length
const tokens = obj => Object.values(obj).reduce((sum, x) => x.length + sum, 0)
const print = obj => {
  for (key in obj) {
    console.log(`${key}: ${obj[key].join(', ')}`)
  }
}

// TODO: Should not be needed if print operates on the result of into
const tree = (phrases, sets) => {
  return pipe(
    mapObj(x => ({ [x.name]: Object.values(x.phrases).map(prop('string')) })),
    Object.values,
    reduce(merge(k))({}),
  )(into('phrases', sets, 'set', phrases))
}


module.exports = {
  sets,
  tokens,
  print,
  tree,
}

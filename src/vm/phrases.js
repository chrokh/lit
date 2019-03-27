const { pipe, map, prop } = require('../base')
const { into } = require('../query')

// Turn phrases and sets into nested array.
// { Phrase } -> { Set } -> [[String]]
const nest = (phrases, sets) =>
  pipe(
    Object.values,
    map(pipe(
      prop('phrases'),
      Object.values,
      map(prop('string'))
    ))
  )(into('phrases', sets, 'set', phrases))



module.exports = {
  nest,
}

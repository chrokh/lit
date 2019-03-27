const { pipe, map, rpad, max, len, reduce, transpose, join, insert, padArrR } = require('./base')

const longest = pipe(map(len), reduce(max)(0))

const byCol = cols => pipe(
  map(padArrR('')(longest(cols))),
  map(col => col.map(rpad(longest(col)))),
  transpose,
  map(join('  |  ')),
  map(row => `  ${row}  `),
  rows => [...rows, Array(rows[0].length).fill('-').join('')],
  rows => [Array(rows[0].length).fill('-').join(''), ...rows],
  join('\n'),
)(cols)

module.exports = {
  byCol,
}

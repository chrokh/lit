const { pipe, map, prop, uniq, filter, includes } = require('../base')
const { all } = require('../entity')

const completedQueries = () =>
  pipe(
    Object.values,
    map(prop('queryId')),
    uniq,
  )(all('sweep'))

const remainingQueries = () =>
  pipe(
    Object.values,
    filter(x => !includes(x.id)(completedQueries()))
  )(all('query'))

module.exports = {
  completedQueries,
  remainingQueries,
}

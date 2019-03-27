const db = require('../db')
const { pipe, map, rpad, len, reduce, max, transpose, join, prop } = require('../base')
const { all } = require('../entity')
const { into } = require('../query')
const { nest } = require('../vm/phrases')
const { byCol } = require('../table')
const { completedQueries, remainingQueries } = require('../vm/collect')

const ENTITY = process.argv[3]
const PLAIN  = process.argv[4] || '--pretty'
const plain = PLAIN == '--plain'
switch (ENTITY) {
  case 'phrases':
    switch (PLAIN) {
      case '--plain':
        return plainPhrases()
      case '--pretty':
        return prettyPhrases()
      default:
        console.log(`lit: invalid flag '${PLAIN}'`)
        return
    }
  case 'queries':
    switch (PLAIN) {
      case '--plain':
        return plainQueries()
      case '--pretty':
        return prettyQueries()
      default:
        console.log(`lit: invalid flag '${PLAIN}'`)
        return
    }
  case 'docs':
    switch (PLAIN) {
      case '--plain':
        return plainDocs()
      case '--pretty':
        return prettyDocs()
      default:
        console.log(`lit: invalid flag '${PLAIN}'`)
        return
    }
  case undefined:
    console.log(`lit: please specify what entity to list.`)
    return
  default:
    console.log(`lit: unknown list '${ENTITY}'.`)
    return
}

function plainPhrases () {
  const phrases = Object.values(all('phrase')).
    map(p => p.string).
    join('\n')
  console.log(phrases)
}

function prettyPhrases () {
  console.log(byCol(nest(all('phrase'), all('set'))))
}

function prettyQueries () {
  const every = pipe(Object.values, map(prop('query')))(all('query'))
  const dones = pipe(Object.values, map(prop('query')))(completedQueries())
  const queries = every.map(q => ({ qs:q, ok:dones.includes(q) }))
  console.log(
    pipe(
      map((q, i) => `[${q.ok ? 'x' : ' '}] (#${i}) ${q.qs}`),
      join('\n')
    )(queries)
  )
}

function plainQueries () {
  console.log(
    pipe(
      Object.values,
      map(prop('query')),
      join('\n')
    )(all('query'))
  )
}

function prettyDocs () {
  console.log('lit: Not implemented yet')
}

function plainDocs () {
  console.log('lit: Not implemented yet')
}


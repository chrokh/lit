const db = require('../db')
const { pipe, map, rpad, len, reduce, max, transpose, join, prop } = require('../base')
const { all } = require('../entity')
const { into } = require('../query')
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
  case 'sets':
    switch (PLAIN) {
      case '--plain':
        return plainSets()
      case '--pretty':
        return prettySets()
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
    console.log(`lit: unknown command "ls ${ENTITY}".`)
    return
}

function plainPhrases () {
  const phrases = Object.values(all('phrase')).
    map(p => p.string).
    join('\n')
  console.log(phrases)
}

function prettyPhrases () {
  const phrases = all('phrase')
  const sets    = all('set')
  const both    = Object.values(into('phrases', sets, 'set', phrases))
  const longest = pipe(map(len), reduce(max)(0))
  const table = pipe(
    map(set => [`${set.name}`, ...Object.values(set.phrases).map(p => p.string)]),
    map(col => [col[0], '-'.repeat(longest(col)), ...col.slice(1)]),
    map(col => col.map(rpad(longest(col)))),
    transpose,
    map(join(' | ')),
    join('\n')
  )(both)
  console.log(table)
}

function plainSets () {
  console.log(pipe(
    Object.values,
    map(prop('name')),
    join('\n')
  )(all('set')))
}

function prettySets () {
  const phrases = all('phrase')
  const sets    = all('set')
  const both    = Object.values(into('phrases', sets, 'set', phrases))
  console.log(pipe(
    map(set => `The set '${set.name}' contains ${Object.values(set.phrases).length} phrases`),
    join('\n')
  )(both))
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


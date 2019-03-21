const db = require('../db')
const { all } = require('../entity')
const { completedQueries, remainingQueries } = require('../vm/collect')

if (!db.exists()) {
  console.log('No lit review in current directory.')
  return
}

// Helpers
const len = os => Object.keys(os).length

// Collect data
const phrases   = all('phrase')
const sets      = all('set')
const queries   = all('query')
const versions  = all('version')
const documents = all('document')
const comQs = completedQueries()


// Print input info
if (len(phrases) == 0) {
  console.log('No phrases or sets entered.')
  console.log('  (use "lit feed" to feed input data)')
  return
}
console.log(`${len(phrases)} phrases over ${len(sets)} sets,`)
console.log(`  resulting in ${len(queries)} queries`)
// TODO: Queries can become stale if you add more keywords.
// Perhaps queries should always be generated on demand?


// Print output info
console.log()
if (len(documents) == 0) {
  console.log('No documents collected.')
  console.log('  (use "lit collect" to execute queries)')
  return
}
console.log('Collection status:')
console.log(`  ${comQs.length} queries of ${len(queries)} completed (${Math.round(comQs.length / len(queries) * 100)} %)`)
console.log(`  ${len(documents)} unique documents (${len(versions)} hits)`)
console.log()



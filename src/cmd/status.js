const db = require('../db')
const { all } = require('../entity')
const { completedQueries, remainingQueries } = require('../vm/collect')

if (!db.exists()) {
  console.log('No lit review in current directory.')
  console.log('  (use "lit init" to initialize lit review)')
  return
}

// Helpers
const len = os => Object.keys(os).length

// Collect data
const phrases      = all('phrase')
const sets         = all('set')
const queries      = all('query')
const observations = all('observation')
const documents    = all('document')
const comQs        = completedQueries()



// Print input info
if (len(phrases) == 0) {
  console.log('No phrases or sets entered.')
  console.log('  (use "lit feed" to feed input data)')
  return
}
console.log(`${len(phrases)} phrases over ${len(sets)} sets entered.`)
// TODO: Queries can become stale if you add more keywords.
// Perhaps queries should always be generated on demand?



// Print query info
if (len(queries) == 0) {
  console.log('No queries generated.')
  console.log('  (use "lit expand" to expand phrase sets into queries)')
  return
}
console.log(`${len(queries)} queries generated.`)



// Print output info
if (len(documents) == 0) {
  console.log('No documents collected.')
  console.log('  (use "lit collect" to collect documents)')
  return
}
const percentageComplete = Math.round(comQs.length / len(queries) * 100)
const totQs = len(queries)
console.log(`${comQs.length} queries of ${totQs} completed (${percentageComplete} %).`)
console.log(`${len(documents)} unique documents (${len(observations)} hits).`)
if (totQs != comQs) {
  console.log('  (use "lit collect" to resume document collection)')
}



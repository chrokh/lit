const { arrEq, map, pipe, prop, flat, merge, k } = require('../base')
const { permutations, cartesian } = require('../combinatorics')
const { all } = require('../entity')
const { into } = require('../query')
const prompt = require('../prompt')
const { hash } = require('../hash')
const { key, unkey, keyify } = require('../keyify')
const { setAll } = require('../entity')

// Helpers
const printSummary = qs => {
  const qss = qs.map(prop('query'))
  if (qss.length > 10) {
    console.log(qss.slice(0, 3).join('\n'))
    console.log('.....')
    console.log(qss.slice(-3).join('\n'))
  } else if (qss.length > 0) {
    console.log(qss.join('\n'))
  }
}

// Clear screen
prompt.clear()

// Summarize phrases and sets
const phrases = all('phrase')
const sets    = all('set')
const both    = into('phrases', sets, 'set', phrases)
console.log(`==> Your analysis contains:`)
console.log(`Phrases: ${Object.keys(phrases).length}`)
console.log(`Sets:    ${Object.keys(sets).length}`)
console.log()

// Compute combinations
console.log('>>> Computing combinations...')
const bothPerms = permutations(Object.values(both))
const queries = pipe(
  map(map(x => Object.values(x.phrases))),
  map(cartesian),
  flat(1),
  map(phrases => {
    return {
      query:   phrases.map(prop('string')).join(' '),
      phrases: phrases.map(prop('id')),
    }
  })
)(bothPerms)
console.log()

// Combinations
console.log(`==> Phrases and sets combines into ${queries.length} unique queries`)
printSummary(queries)
console.log()

// Escape if no changes
if (Object.keys(queries).length == 0) {
  console.log('Nothing to do.')
  return
}

// Current
const dbQueries = all('query')
console.log(`==> Your analysis contained ${Object.keys(dbQueries).length} unique queries`)
printSummary(unkey(dbQueries))
console.log()

// Hashing
console.log('>>> Hashing queries...')
const keyedQueries = keyify(prop('query'))(queries)
console.log()

// Merged
const mergedQueries = merge(k)(keyedQueries)(dbQueries)
console.log(`==> After merge, analysis contains ${Object.keys(mergedQueries).length} unique queries`)
printSummary(unkey(mergedQueries))
console.log()

// Escape if no changes
if (arrEq(Object.keys(mergedQueries))(Object.keys(dbQueries))) {
  console.log('No new queries. Nothing to do.')
  return
}

// Save changes?
const save = () => {
  setAll('query')(mergedQueries)
  console.log('Changes saved.')
}
const discard = () =>
  console.log('Nothing changed.')
prompt.save(save, discard)

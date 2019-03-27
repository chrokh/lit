const fs = require('fs')
const { merge, uniq, k, reduce, add, pipe, map, join, len, flat, arrEq } = require('../base')
const { all, get, setAll } = require('../entity')
const prompt = require('../prompt')
const { nest } = require('../vm/phrases.js')
const { byCol } = require('../table.js')
const { toRecords, md5 } = require('../keyify')


// Define parse functions
const parseSet = (_, idx) => ({ id: idx })
const parseSets = pipe(map(parseSet), toRecords)
const parsePhrase = idx => phrase => ({
  id: md5(idx+phrase),
  string: phrase,
  set: idx // TODO: Rename to setId
})
const parsePhraseSet = (phrases, idx) => phrases.map(parsePhrase(idx))
const parsePhraseSets = pipe(map(parsePhraseSet), flat(1), toRecords)

// Read input
const FOOD_PATH = process.argv[3]
if (!FOOD_PATH) {
  var stdin = process.openStdin()
  var input = ''
  stdin.on('data', chunk => input += chunk)
  stdin.on('end', () => feed(input))
} else {
  feed(fs.readFileSync(FOOD_PATH, 'UTF-8'))
}

// Main function
function feed (data) {
  const food = JSON.parse(data)

  // Count
  let numSets = food.length
  let numPhrases = pipe(map(len), reduce(add)(0))(food)

  // Empty?
  if (numPhrases == 0) {
    console.log('lit: Food does not contain any phrases.')
    return
  }

  // Print interpretation
  console.log(`Interpreting as ${numPhrases} phrases over ${numSets} sets:`)
  console.log(byCol(food))

  // Stomach
  const dbPhrases = all('phrase')
  const dbSets = all('set')
  const dbNested = nest(dbPhrases, dbSets)

  // Eating
  const newSets = parseSets(food)
  const newPhrases = parsePhraseSets(food)
  const mergedPhrases = merge(k)(dbPhrases)(newPhrases)
  const mergedSets = merge(k)(dbSets)(newSets)

  // Check if we have changes
  if (arrEq(Object.keys(mergedPhrases).sort())(Object.keys(dbPhrases).sort())) {
    console.log('No new phrases. Nothing to do.')
    return
  }

  // Print existing data
  if (Object.keys(dbPhrases).length > 0) {
    console.log(`Your analysis already contains ${Object.keys(dbPhrases).length} phrases over ${Object.keys(dbSets).length} sets:`)
    console.log(byCol(dbNested))
  } else {
    console.log('Your analysis did not already contain any phrases.')
  }

  // Print post-change data
  console.log(`After introducing the new phrases, analysis contains: ${Object.keys(mergedPhrases).length} phrases over ${Object.keys(mergedSets).length} sets:`)
  if (Object.keys(dbPhrases).length > 0) {
    console.log(byCol(nest(mergedPhrases, mergedSets)))
  }


  // Sanity check sweep
  if (
    Object.keys(all('sweep')).length > 0
    && Object.keys(mergedSets).length > Object.keys(dbSets).length
  ) {
    console.log(`ERROR: You're trying to add sets, but you've already started collecting
documents using queries generated from the old sets. This change would
introduce anomalies. To add additional sets, either start a new analysis or
delete all collected documents. Aborting.`)
    return
  }

  // Sanity check queries
  let numQueries = Object.keys(all('query')).length
  if (numQueries > 0) {
    console.log(`WARNING: You have ${numQueries} queries that are generated from your old phrase
sets. If you save your changes I will *permanently delete* all previously
generated queries to avoid anomalies.`)
  }

  // Save changes?
  const save = () => {
    setAll('phrase')(mergedPhrases)
    setAll('set')(mergedSets)
    setAll('query')({})
    console.log('Changes saved')
  }
  const discard = () =>
    console.log('Nothing changed.')
  prompt.save(save, discard)
}


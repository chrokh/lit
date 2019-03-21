const fs = require('fs')
const { merge, uniq, k } = require('../base')
const { len, all, get, setAll } = require('../entity')
const prompt = require('../prompt')
const { parse } = require('../parsers/phrase-sets')
const { sets, tokens, print, tree } = require('../vm/feed.js')

// CLI input
const foodPath = process.argv[3]
if (foodPath == undefined) {
  console.log('No file to feed specified. See \'lit --help\'')
  return
}

// Clear screen
prompt.clear()

// Food
const food = JSON.parse(fs.readFileSync(foodPath, 'UTF-8'))
console.log(`==> ${foodPath} contains ${tokens(food)} tokens over ${sets(food)} sets:`)
if (sets(food) > 0)
  print(food)
console.log()

// Stomach
const dbphrases = all('phrase')
const dbsets    = all('set')
const stomach   = tree(dbphrases, dbsets)
console.log(`==> Your analysis currently contains: ${Object.keys(dbphrases).length} tokens over ${Object.keys(dbsets).length} sets`)
if (sets(stomach) > 0)
  print(stomach)
console.log()

// Eating
const parsed = parse(food)
const mergedPhrases = merge(k)(parsed.phrases)(dbphrases)
const mergedSets    = merge(k)(parsed.sets)(dbsets)
const mergedStomach = tree(mergedPhrases, mergedSets)
console.log(`==> After merge, analysis contains: ${tokens(mergedStomach)} tokens over ${sets(mergedStomach)} sets`)
if (sets(mergedStomach) > 0)
  print(mergedStomach)
console.log()

// Save changes?
const save = () => {
  setAll('phrase')(mergedPhrases)
  setAll('set')(mergedSets)
  console.log('Changes saved')
}
const discard = () =>
  console.log('Nothing changed.')
prompt.save(save, discard)

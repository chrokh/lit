const prompt = require('../prompt')
const { all, setAll } = require('../entity')
const { merge, k, pipe, map, filter } = require('../base')
const { toRecords } = require('../keyify')
const { md5 } = require('../keyify')

// Read supplied tags
const TAGS = [...process.argv.slice(3)].map(x => x.trim())

// Check if tags are supplied
if (TAGS.length == 0) {
  console.log('No tags supplied. Nothing to do.')
  return
}

// Read existing tags
const oldTags = all('tag')

// Function that checks if tag is new
const isNew = neue =>
  Object.values(oldTags).
    map(old => old.name).
    indexOf(neue) == -1

// Make tags from supplied arguments
const newTags = pipe(
  filter(isNew),
  map(tag => ({ id: md5(tag), name: tag })),
  toRecords
)(TAGS)

// Merge the two
const mergedTags = merge(k)(oldTags)(newTags)

// Count
const numNew = Object.keys(newTags).length
const numDuplicates = TAGS.length - numNew

// Check if any tags are new
if (numNew == 0) {
  console.log('No new tags supplied. Nothing to do.')
  return
}

// Print action info
if (numDuplicates > 0)
  console.log(`Adding ${numNew} new tags (skipping ${numDuplicates} duplicates):`)
else
  console.log(`Adding ${numNew} new tags:`)

// Print tags
console.log(Object.values(newTags).map(t => `* ${t.name}`).join('\n'))

// Save changes?
const save = () => {
  setAll('tag')(mergedTags)
  console.log('Changes saved')
}
const discard = () =>
  console.log('Nothing changed.')
prompt.save(save, discard)

const { pipe, map, join, filter, k, not } = require('../base')
const { all } = require('../entity')
const opts = require('../opts')

// Parse options
const ARGS = [...process.argv.slice(3)]
const OPTS = opts.toObj({ format: 'simple' })([...process.argv.slice(3)])

// Read data
const observations = Object.values(all('observation'))
const documents = Object.values(all('document'))
const marks = Object.values(all('mark'))
const tags = Object.values(all('tag'))

// Data transformation functions
const expandDocument = doc => {
  const matchingObservations = observations.
    filter(ob => ob.documentId == doc.id)
  const matchingTags = documentTags(doc.id)
  // TODO: Should consolidate different observations first
  const { excerpt, author } = matchingObservations[0]
  return { ...doc, excerpt, author, tags: matchingTags }
}
const toDocumentString = doc =>
  `* ${doc.id.substring(0, 7)} ${doc.title}`

// Finds all tags of a document
const documentTags = docId => {
  const matchingMarkIds = marks.
    filter(mk => mk.documentId == docId).
    map(mk => mk.tagId)
  const matchingTags = tags.
    filter(tag => matchingMarkIds.indexOf(tag.id) != -1)
  return matchingTags
}

// Filter functions / predicates
const isUntagged = doc => documentTags(doc.id).length == 0
// TODO: Replace hasTag with boolean algebra based match string.
// E.g: relevant|(review&important)
const hasTag = tag => doc =>
  documentTags(doc.id).
    map(t => t.name).
    indexOf(tag) != -1

// Single filter function
const filterer = pipe(
  filter(OPTS.untagged ? isUntagged : k(true)),
  filter(OPTS.only ? hasTag(OPTS.only) : k(true)),
  filter(OPTS.skip ? not(hasTag(OPTS.skip)) : k(true)),
)

// Single formatting function
const formatter = OPTS.format.toLowerCase() == 'json' ?
  JSON.stringify :
  pipe(map(toDocumentString), join('\n'))

// Main
pipe(
  map(expandDocument),
  filterer,
  formatter,
  console.log,
)(documents)

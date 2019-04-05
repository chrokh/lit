const { pipe, map, join, filter, k, not } = require('../base')
const { all } = require('../entity')
const vmDocs = require('../vm/documents')
const opts = require('../opts')

// Parse options
const ARGS = [...process.argv.slice(3)]
const OPTS = opts.toObj({ format: 'simple' })([...process.argv.slice(3)])

// Read data
const observations = Object.values(all('observation'))
const documents = Object.values(all('document'))

// Data transformation functions
const expandDocument = doc => {
  const matches = observations.filter(ob => ob.documentId == doc.id)
  const { excerpt, author } = matches[0] // TODO: consolidate
  return { ...doc, excerpt, author }
}
const toDocumentString = doc =>
  `* ${doc.id.substring(0, 7)} ${doc.title}`

// Single formatting function
const formatter = OPTS.format.toLowerCase() == 'json' ?
  JSON.stringify :
  pipe(map(toDocumentString), join('\n'))

// Main
pipe(
  map(expandDocument),
  vmDocs.filter(OPTS),
  formatter,
  console.log,
)(documents)

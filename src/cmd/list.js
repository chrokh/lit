const chalk = require('chalk')
const { pipe, map, join, filter, k, not } = require('../base')
const { all } = require('../entity')
const vmDocs = require('../vm/documents')
const { expandDocument } = require('../vm/document')
const opts = require('../opts')

// Parse options
const OPTS = opts.toObj({ format: 'simple' })([...process.argv.slice(3)])

// Data transformation functions
const shortId = doc => doc.id.substring(0, 7)
const toDocumentString = doc =>
  `* ${chalk.yellow(shortId(doc))} ${doc.title}`

// Single formatting function
const formatter = OPTS.format.toLowerCase() == 'json' ?
  JSON.stringify :
  pipe(map(toDocumentString), join('\n'))

// Main
pipe(
  all,
  Object.values,
  map(expandDocument),
  vmDocs.filter(OPTS),
  formatter,
  console.log,
)('document')

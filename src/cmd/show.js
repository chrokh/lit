const { all } = require('../entity')
const { print } = require('../vm/document')

showController({ id: process.argv[3] })

function showController (opts) {
  if (!opts.id)
    return console.log('lit: Please specify a document id.')
  const docs = Object.values(all('document'))
  const matches = docs.filter(doc => doc.id.indexOf(opts.id) == 0)
  if (matches.length > 1)
    return console.log(`lit: Multiple documents matched '${opts.id}'.`)
  if (matches.length == 0)
    return console.log(`lit: No documents matched '${opts.id}'.`)
  const doc = matches[0]
  print(doc)
}

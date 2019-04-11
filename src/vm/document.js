const chalk = require('chalk')
const { all } = require('../entity')

function print (doc) {
  const { title, excerpt, author, fullTextLinks } = expandDocument(doc)

  // Make divider lines
  const smDivider = '-'.repeat(60)
  const lgDivider = '='.repeat(60)

  // Print document info
  console.log(chalk.yellow(doc.id))
  console.log()
  console.log(chalk.red.bold(title))
  console.log(chalk.blue(author))
  if (excerpt)
    console.log(excerpt)

  // Extract full text links but filter out google scholar links as they are
  // stateful and will not work outside of their original context.
  if (fullTextLinks.length > 0) {
    const links = fullTextLinks.
      filter(link => link.url.indexOf('scholar?output') == -1)
    for (let link of links)
      console.log(chalk.grey('* %s'), link.url)
  }
}

function expandDocument (doc) {
  const observations = Object.values(all('observation'))
  const matches = observations.filter(ob => ob.documentId == doc.id)
  const { title, excerpt, author, fullTextLinks } = matches[0] // TODO: consolidate
  return { ...doc, title, excerpt, author, fullTextLinks: fullTextLinks || [] }
}

module.exports = {
  print,
  expandDocument,
}

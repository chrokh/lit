const chalk = require('chalk')
const { all } = require('../entity')

function print (doc) {
  // Extract basic info
  const { title, url } = doc

  // Find matching observations and extract complex info
  const observations = Object.values(all('observation'))
  const matchingObservations =
    observations.filter(ob => ob.documentId == doc.id)
  const observation = matchingObservations[0] // TODO: consolidate!
  const { excerpt, author } = observation

  // Extract full text links but filter out google scholar links as they are
  // stateful and will not work outside of their original context.
  const fullTextLinks = observation.fullTextLinks.
    filter(link => link.url.indexOf('scholar?output') == -1)

  // Make divider lines
  const smDivider = '-'.repeat(60)
  const lgDivider = '='.repeat(60)

  // Print document info
  console.log(chalk.yellow(doc.id))
  console.log()
  console.log(chalk.red.bold(title))
  console.log(chalk.blue(author))
  console.log(excerpt)
  if (fullTextLinks) {
    console.log()
    for (let link of fullTextLinks)
      console.log(chalk.grey('* %s'), link.url)
  }
}

module.exports = {
  print,
}

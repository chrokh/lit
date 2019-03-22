const Comb = require('../combinatorics')
const { all, len, setAll } = require('../entity')
const { pipe, map, prop, assoc, dissoc, merge, k } = require('../base')
const { collect } = require('../scholar')
const { open, close, sleep } = require('../robot')
const { keyify, hash } = require('../keyify')
const { completedQueries, remainingQueries } = require('../vm/collect')
const prompt = require('../prompt')

async function main() {

  const completedQs = completedQueries()
  const remainingQs = remainingQueries()
  const allQs = Object.values(all('query'))

  console.log(`Completed queries: ${completedQs.length}`)
  console.log(`Remaining queries: ${remainingQs.length}`)
  console.log(`Total:             ${allQs.length}`)

  // Continue?
  console.log(`
By selecting yes below, the results of running queries will be saved to your
database. It will take a long time to complete all queries. You can cancel at
any time by pressing ctrl-c or killing the process. Only result sets from
completed queries will be saved to your database. Note that you may have to
interact with the robot to deal with CAPTCHAs.
    `)
  const no = () => console.log('Nothing changed.')
  prompt.cont(go, no)

  async function go () {
    const driver = await open()

    for (let query of remainingQs) {

      // Collect articles
      const qs = query.query
      console.log(`Finding documents matching: "${qs}"`)
      let hits = await collect(driver, qs).
        then(pipe(
          map(assoc('query')(query.id)),
        ))
      console.log(`Found ${Object.keys(hits).length} documents.`)

      // For consistency
      const docKeyer = prop('url')
      const verKeyer = x => x.document + query.id

      // Extract documents
      const docs = pipe(
        map(x => ({
          url:      x.url,
          citation: x.citation, // TODO: Assuming that citation is consistent
        })),
        keyify(docKeyer),
      )(hits)

      // Extract versions
      const vers = pipe(
        map(x => ({ ...x, document: hash(docKeyer)(x) })),
        map(dissoc('url')),
        map(dissoc('citation')),
        keyify(verKeyer),
      )(hits)

      // Insert into db
      const oldDocs = all('document')
      const oldVers = all('version')
      const mergedDocs = merge(k)(docs)(oldDocs)
      const mergedVers = merge(k)(vers)(oldVers)
      setAll('document')(mergedDocs)
      setAll('version')(mergedVers)

      // Print info
      const docDiff = Object.keys(mergedDocs).length - Object.keys(oldDocs).length
      const verDiff = Object.keys(mergedVers).length - Object.keys(oldVers).length
      const docDups = Object.keys(docs).length - docDiff
      const verDups = Object.keys(vers).length - verDiff
      console.log(`Added ${docDiff} seemingly new documents (skipped ${docDups} duplicates).`)
      console.log(`Added ${verDiff} possibly new versions (skipped ${verDups} duplicates).`)

      // Sleep before next
      await sleep(10, 20)
    }

    close(driver)
  }
}

main()

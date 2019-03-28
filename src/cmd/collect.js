const Comb = require('../combinatorics')
const { all, len, setAll } = require('../entity')
const { map, merge, k } = require('../base')
const { collect } = require('../scholar')
const { open, close, sleep } = require('../robot')
const { md5, toRecords, toRecord } = require('../keyify')
const { completedQueries, remainingQueries } = require('../vm/collect')
const prompt = require('../prompt')

async function main() {

  const completedQs = completedQueries()
  const remainingQs = remainingQueries()
  const allQs = Object.values(all('query'))

  const LIMIT = process.argv[3]
  const limit = LIMIT ?
    parseInt(LIMIT.match(/--limit=(\d+)/)[1]) :
    Infinity

  console.log(`Completed queries: ${completedQs.length}`)
  console.log(`Remaining queries: ${remainingQs.length}`)
  console.log(`Total:             ${allQs.length}`)

  // Continue?
  console.log(`
By selecting yes below, the results of running queries will be saved to your
database. It may take a long time to complete all queries. You can cancel at
any time by pressing ctrl-c or killing the process. Only result sets from
completed queries will be saved to your database. Note that you may have to
interact with the robot to deal with CAPTCHAs.
    `)

  if (limit != Infinity) {
    console.log(`Limiting collection to ${limit} queries.`)
    console.log()
  }

  const no = () => console.log('Nothing changed.')
  prompt.cont(go, no)

  let count = 0

  async function go () {
    const driver = await open()

    for (let query of remainingQs) {

      // for consistency
      const docId = hit => md5(hit.url + hit.title)

      // Build sweep record
      const sweepId = md5(query.id + new Date().toJSON())
      let sweep = {
        id: sweepId,
        queryId: query.id,
        started: new Date().toJSON(),
      }

      // Collect articles
      const qs = query.query
      console.log(`Finding documents matching: '${qs}'`)
      // TODO: Generalize the number of pages (into doc count)
      // and make it a setting somehow.
      let hits = await collect(driver, qs, 3)
      console.log(`Found ${Object.keys(hits).length} documents.`)

      // Build documents
      const documents = hits.map(hit => ({
        id:  docId(hit),
        url: hit.url,
      }))

      // Build observations
      const observations = hits.map(hit => ({
        id:         md5(hit.url + sweepId + new Date().toJSON()),
        documentId: docId(hit),
        sweepId,
        ...hit,
      }))

      // Update sweep with end-timestamp
      sweep = { ...sweep, ended: (new Date().toJSON()) }

      // Insert into db
      const oldSweeps = all('sweep')
      const oldDocs = all('document')
      const oldObs = all('observation')
      const mergedSweeps = merge(k)(toRecord(sweep))(oldSweeps)
      const mergedDocs = merge(k)(toRecords(documents))(oldDocs)
      const mergedObs = merge(k)(toRecords(observations))(oldObs)
      setAll('sweep')(mergedSweeps)
      setAll('document')(mergedDocs)
      setAll('observation')(mergedObs)

      // Print info
      const docDiff = Object.keys(mergedDocs).length - Object.keys(oldDocs).length
      const docDups = documents.length - docDiff
      console.log('Sweep summary:')
      console.log(`  Added ${docDiff} seemingly new documents (skipped ${docDups} known documents).`)
      console.log(`  Added ${observations.length} observations.`)

      // Increment counter
      count++

      // Exit if limit is reached
      if (count == limit) {
        console.log(`${count} queries executed. Limit reached. Aborting.`)
        break
      } else if(count != Infinity) {
        console.log(`${count} queries executed. Limit is ${limit}. Continuing.`)
      }

      // Sleep before next
      await sleep(10, 20)
    }

    close(driver)
  }
}

main()

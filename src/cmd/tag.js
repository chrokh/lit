const { pipe, filter } = require('../base')
const { toRecords } = require('../keyify')
const { all, setAll } = require('../entity')
const prompt = require('../prompt')

// Read filter
const FILTER = process.argv[3]

// Read tags and marks
const tags = Object.values(all('tag'))

// Quit if there are not tags
if (tags.length == 0) {
  console.log('No tags available.')
  console.log(`  (use 'lit add' to add tags)`)
  return
}

// Filter function
const matchesFilter = doc => true

// Filter out documents to tag
const docs = pipe(
  Object.values,
  filter(matchesFilter)
)(all('document'))

// Pre-fetch observation data
const observations = Object.values(all('observation'))

// Function to check if document is tagged with tag
const isMarked = (doc, tag, marks) => {
  for (let mark of marks) {
    if (mark.documentId == doc.id && mark.tagId == tag.id)
      return true // early return
  }
  return false
}

// Tag printing function
const printTags = (tags, doc, marks) => {
  const docTags = tags.map((tag, i) => ({ ...tag,
    num: i + 1,
    mark: isMarked(doc, tag, marks) ? 'x' : ' '
  }))
  console.log(docTags.map(t => `${t.num}: [${t.mark}] ${t.name}`).join('\n'))
}

// Define tagging function
async function tagNext (docs, idx) {
  if (idx < 0) idx = 0
  if (idx == docs.length) {
    console.log('No more matching documents left to tag.')
    return
  }

  const doc = docs[idx]
  const marks = Object.values(all('mark'))

  // Print doc and tags
  prompt.clear()
  printTimeline(docs, idx)
  printDoc(doc)
  console.log()
  printTags(tags, doc, marks)


  // Print instructions and parse output
  console.log()
  console.log('Pick tags by number. Separate with comma. End with enter.')
  const alts = tags.map((_, i) => i + 1)
  const picks = await prompt.checkbox(alts)
  const indexPicks = picks.map(pick => parseInt(pick - 1))

  // Compute new marks
  const newMarks = indexPicks.map(i => ({
    id: tags[i].id + doc.id,
    tagId: tags[i].id,
    documentId: doc.id
  }))

  // Filter out old marks
  const filteredMarks = marks.filter(m => m.documentId != doc.id)

  // Merge to compute new marks
  const mergedMarksArr = filteredMarks.concat(newMarks)
  const mergedMarksObj = toRecords(mergedMarksArr)

  // Print changes if any
  if (newMarks.length > 0) {
    prompt.clear()
    printTimeline(docs, idx)
    printDoc(doc)
    console.log()
    printTags(tags, doc, mergedMarksArr)

    // Confirm changes and move to next or back to the same
    console.log()
    const doNothing = () => console.log('Nothing changed.')
    const doNext = () => setAll('mark')(mergedMarksObj)
    await prompt.save(doNext, doNothing)
    await navigate(docs, idx)
  } else {
    console.log('Nothing changed.')
    await navigate(docs, idx)
  }
}

function printDoc (doc) {
  // Extract basic info
  const { title, url } = doc

  // Find matching observations and extract complex info
  const obs = observations.filter(ob => ob.documentId == doc.id)
  const { excerpt, author } = obs[0] // TODO: Should consolidate different observations first

  // Make divider lines
  const smDivider = '-'.repeat(60)
  const lgDivider = '='.repeat(60)

  // Print document info
  console.log(title.toUpperCase())
  console.log(lgDivider)
  console.log(author)
  console.log()
  console.log(excerpt)
}

async function navigate (docs, idx) {
  const doNext = () => tagNext(docs, idx+1)
  const doSame = () => tagNext(docs, idx)
  const doPrev = () => tagNext(docs, idx-1)
  const nothing = () => {}
  console.log()
  await prompt.pick(
    `Tag next (n), previous (p), or same (s)?`,
    { n: doNext, s: doSame, p: doPrev })
}

function printTimeline (docs, idx) {
  const width = 60
  const str = "-".repeat(docs.length)
  const xs = str.split('')
  xs[idx] = '*'
  const timeline = xs.join('')
  const num = `${idx+1} / ${docs.length}`
  console.log(num)
  console.log(timeline)
  console.log()
}

// Begin tagging
tagNext(docs, 0)

const { pipe, map, filter, not, k } = require('../base')
const { all } = require('../entity')

// Find tags of document
const documentTags = docId => {
  const tags = Object.values(all('tag'))
  const marks = Object.values(all('mark'))
  const matchingMarkIds = marks.
    filter(mk => mk.documentId == docId).
    map(mk => mk.tagId)
  const matchingTags = tags.
    filter(tag => matchingMarkIds.indexOf(tag.id) != -1)
  return matchingTags
}

// Predicates
const isUntagged = doc => documentTags(doc.id).length == 0
const isTagged = doc => documentTags(doc.id).length > 0
const hasTag = tag => doc => documentTags(doc.id).
    map(t => t.name).
    indexOf(tag) != -1

// Filter docs based on options
// TODO: Compose predicate to increase performance
const _filter = opts => pipe(
  filter(opts.untagged ? isUntagged : k(true)),
  filter(opts.tagged ? isTagged : k(true)),
  filter(opts.only ? hasTag(opts.only) : k(true)),
  filter(opts.skip ? not(hasTag(opts.skip)) : k(true)),
)

module.exports = {
  filter: _filter,
}

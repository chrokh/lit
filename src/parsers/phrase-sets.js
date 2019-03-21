const { uniq } = require('../base')
const { hash } = require('../hash')
// TODO: Should use keyify rather than hash
// which not only isolates the pk-logic,
// but should also simplify this parser.

const parse = obj => {
  let sets = {}
  let phrases = {}
  let phrase_sets = {}

  for (let set in obj) {
    let ps = uniq(obj[set])
    let setHash = hash(set)
    sets[setHash] = { id: setHash, name: set } // add set
    for (let phrase of ps) {
      let phraseHash = hash(phrase)
      phrases[phraseHash] = {
        id: phraseHash,
        string: phrase,
        active: true,
        set: setHash
      }
    }
  }
  return {
    sets,
    phrases,
  }
}

module.exports = {
  parse,
}

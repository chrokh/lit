const db = require('./db')

// TODO: rename to get
const all = entity =>
  db.get(entity)

// TODO: rename to set
const setAll = entity => value =>
  db.set(value)(entity)

// TODO: rename to find
const get = entity => id =>
  db.get(entity)[id]

// TODO: rename to update
const set = entity => id => value => {
  let old = get(entity)
  old[entity] = value
  db.set(value)(entity)
}

const len = entity =>
  Object.keys(db.get(entity)).length

module.exports = {
  all,
  get,
  set,
  len,
  setAll,
}

const db = require('../db')

if (db.exists()) {
  console.log('lit: Not empty, already initialized?')
} else {
  const dir = db.init()
  console.log(`lit: Initialized lit review in ${dir}`)
}

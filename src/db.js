const fs = require('fs');

const BASE = '.lit'

const get = file =>
  JSON.parse(fs.readFileSync(`${BASE}/${file}.json`, 'UTF-8'))

const set = data => file =>
  fs.writeFileSync(`${BASE}/${file}.json`, JSON.stringify(data, null, 2), 'UTF-8')

const exists = () =>
  fs.existsSync(BASE)

const init = () => {
  fs.mkdirSync(BASE)
  fs.writeFileSync(`${BASE}/phrase.json`, '{}', 'UTF-8')
  fs.writeFileSync(`${BASE}/set.json`, '{}', 'UTF-8')
  fs.writeFileSync(`${BASE}/query.json`, '{}', 'UTF-8')
  fs.writeFileSync(`${BASE}/sweep.json`, '{}', 'UTF-8')
  fs.writeFileSync(`${BASE}/document.json`, '{}', 'UTF-8')
  fs.writeFileSync(`${BASE}/observation.json`, '{}', 'UTF-8')
  fs.writeFileSync(`${BASE}/tag.json`, '{}', 'UTF-8')
  fs.writeFileSync(`${BASE}/mark.json`, '{}', 'UTF-8')
  return BASE
}

module.exports = {
  get,
  set,
  exists,
  init,
}

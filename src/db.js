const fs = require('fs');
const { promisify } = require('util');


const close = promisify(fs.close);
const open = promisify(fs.open);
const touch = p => open(p, 'a').then(close);
const read = p => fs.readFileSync(p, 'UTF-8');
const write = d => p => fs.writeFileSync(p, d);


const get = path => k => {
  touch(path);
  const db = JSON.parse(read(path) || '{}');
  return db[k];
};

const set = path => (k, v) => {
  touch(path);
  const db = JSON.parse(read(path) || '{}');
  db[k] = v;
  write(JSON.stringify(db, null, 2))(path);
};

module.exports = function (path) {
  return {
    get: get(path),
    set: set(path),
  }
}


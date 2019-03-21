// TODO: This module should be deprecated in favor of keyify. It is too
// low-level and spreads information about how we deal with PKs too much.

const crypto = require('crypto');

const md5 = str => crypto.createHash('md5').update(str).digest('hex')

module.exports = {
  hash: md5
}

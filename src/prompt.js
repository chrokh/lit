const readline = require('readline')

const rl = () =>
  readline.createInterface({
    input:  process.stdin,
    output: process.stdout,
  })

const ui = f => function() {
  const rl = readline.createInterface({
    input:  process.stdin,
    output: process.stdout,
  })
  f(rl)
}

async function yesno (m, y, n) {
  async function _yesno (_rl) {
    return new Promise((resolve, reject) => {
      _rl.question(m, function(a) {
        switch (a.trim().toUpperCase()) {
          case 'Y':
          case 'YES':
            _rl.close()
            resolve(y())
            break
          case 'N':
          case 'NO':
          case '':
            _rl.close()
            resolve(n())
            break
          default:
            _yesno(_rl).then(resolve)
            break
        }
      })
    })
  }
  return _yesno(rl())
}

async function save (y, n) {
  yesno('Save changes? [y/n] (default: no)\n> ', y, n)
}

async function cont (y, n) {
  yesno('Continue? [y/n] (default: no)\n> ', y, n)
}

function clear () {
  console.log('\033c')
}

module.exports = {
  save,
  clear,
  cont,
}

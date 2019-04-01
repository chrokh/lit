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
  await yesno('Save changes? [y/n] (default: no)\n> ', y, n)
}

async function cont (y, n) {
  await yesno('Continue? [y/n] (default: no)\n> ', y, n)
}

async function checkbox (alts) {
  async function _checkbox (_rl) {
    return new Promise((resolve, reject) => {
      _rl.question('> ', function(a) {
        const picks = a.trim().
          split(',').
          map(s => s.trim()).
          filter(x => x != '')
        const altStrings = alts.map(a => a.toString())
        // Compute errors if given unknown selections
        const errors = picks.
          filter(pick => altStrings.indexOf(pick) == -1).
          map(pick => `unknown selection '${pick}'`)
        // Continue until all picks are valid
        if (errors.length > 0) {
          console.log(errors.join('\n'))
          _checkbox(_rl).then(resolve)
        } else {
          _rl.close()
          resolve(picks)
        }
      })
    })
  }
  return _checkbox(rl())
}

async function pick (msg, cmds) {
  async function _pick (_rl) {
    return new Promise((resolve, reject) => {
      console.log(msg)
      _rl.question('> ', function(a) {
        const pick = a.trim()
        if (cmds[pick] == undefined) {
          _pick(_rl).then(resolve)
        } else {
          _rl.close()
          resolve(cmds[pick]())
        }
      })
    })
  }
  return _pick(rl())
}


function clear () {
  process.stdout.write('\033c')
}

module.exports = {
  save,
  clear,
  cont,
  checkbox,
  pick,
}

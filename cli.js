#!/usr/bin/env node

const cmd = process.argv[2]

async function index () {
  switch (cmd) {

    case 'init':
    case 'i':
      require('./src/cmd/init')
      return

    case 'feed':
    case 'f':
      require('./src/cmd/feed')
      return

    case 'expand':
    case 'e':
      require('./src/cmd/expand')
      return

    case 'collect':
    case 'c':
      require('./src/cmd/collect')
      return

    case '--help':
    case 'help':
      console.log('lit: Documentation coming soon.')
      return

    default:
      console.log(`lit: ${cmd} is not a command. See 'lit --help'`)

  }
}

index()

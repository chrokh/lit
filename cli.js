#!/usr/bin/env node

const cmd = process.argv[2]

async function index () {
  switch (cmd) {

    case 'init':
    case 'i':
      require('./src/cmd/init')
      return

    case 'status':
    case 's':
      require('./src/cmd/status')
      return

    case 'list':
    case 'ls':
      require('./src/cmd/list')
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
    case undefined:
      console.log(`USAGE
  lit <command> [<args>]

COMMANDS
  lit init
    Initialize new review in current dir.

  lit status
    Show information about current lit review.

  lit list <phrases|queries|docs> [--plain]
    Lists inserted phrases, generated queries, or collected documents.
    Use --plain to avoid listing related data.
    Alias: ls

  lit feed [file]
    Feed current review with phrase sets.
    The file is expected to contain a JSON formatted list of lists of strings.

  lit expand
    Expand phrase sets into queries.

  lit collect [--limit=N]
    Execute queries and collect results.
    Use --limit=N to limit the number of queries to N.

  lit help
  This screen.`)
return

default:
console.log(`lit: '${cmd}' is not a command. See 'lit --help'`)

  }
}

index()

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

    case 'add':
    case 'a':
      require('./src/cmd/add')
      return

    case 'browse':
    case 'b':
      require('./src/cmd/browse')
      return

    case 'export':
      require('./src/cmd/export')
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

  lit list <phrases|queries|docs|tags> [--plain]
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

  lit add [<tag>+]
    Add new tag to the list of available tags. Separate with spaces.

  lit browse [--tag] [--save]
    Browse and tag documents.
    Use --tag to enter tag mode and move to the next document automatically.
    Use --save to automatically save changes.

  lit export [--untagged] [--format=json]
    Print list of documents to standard out.
    Use --untagged to only list untagged documents.
    Use --format=json to output in JSON format.

  lit help
  This screen.`)
return

default:
console.log(`lit: '${cmd}' is not a command. See 'lit --help'`)

  }
}

index()

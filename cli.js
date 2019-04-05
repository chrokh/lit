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

    case 'inspect':
      require('./src/cmd/inspect')
      return

    case 'ls':
    case 'list':
      require('./src/cmd/list')
      return

    case 'show':
      require('./src/cmd/show')
      return

    case '--help':
    case 'help':
    case undefined:
      console.log(`Usage: lit <command>

lit init               Initialize new review in current dir.

lit status             Show information about current lit review.

lit feed [file]        Feed current review with phrase sets.
  [file]                 JSON formatted list of list of strings.

lit expand             Expand phrase sets into queries.

lit collect [<flags>]  Execute queries and collect results.
  --limit=N              Number of queries to execute.

lit add <tags>         Add tags to list of available tags.
  <tag>                  Tags to add. Separate with spaces.

lit browse [<flags>]   Browse and tag documents.
  --tag                  Tag mode.
  --save                 Save changes whenever prompted.
  --untagged             Only untagged.
  --tagged               Only tagged.
  --only=<tag>           Matching tag.
  --skip=<tag>           Not matching tag.

lit list [<flags>]     Print list of documents to standard out. Alias: 'ls'.
  --untagged             Only untagged.
  --tagged               Only tagged.
  --only=<tag>           Matching tag.
  --skip=<tag>           Not matching tag.

lit show <id>          Show document with id.`)
      return

default:
console.log(`lit: '${cmd}' is not a command. See 'lit --help'`)

  }
}

index()

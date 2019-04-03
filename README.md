# Lit

Perform systematic literature reviews without loosing your mind and without wasting too much time.

Lit is a simple command line tool written in JavaScript. In the future, Lit will also be available as a GUI application for Linux, Mac OS, and Windows, but for now our focus is on nailing the conceptual data model and workflow.

Lit is under heavy development. Do **not** use Lit for anything mission critical unless you know what you are doing and/or accept the risks. API changes and bugs should be expected.

Lit is not for novice computer users.

## Why?

Lit can help you:
1. Combine sets of phrases (keywords) into search queries.
2. Automatically collect results from Google Scholar.
3. Non-destructively remove duplicate results.
4. Tag articles.

We're working on also being able to:
- Export subsets in BibTeX format.
- Generate statistics (e.g. relevant articles per keyword).


## Dependencies

To avoid issues, I humbly remind you to prefer installing software using your platform's package manager rather than manually (unless of course you know what you're doing). Package managers are a convenient way of installing and uninstalling applications. Kind of like the App Store on a Mac. Except that the correct thing to say would be that the App Store is like package managers since they've been around for eons. For Mac OS there's [Homebrew](https://brew.sh/) and for Windows there's [Chocolatey](https://chocolatey.org/), and if you're on Linux you already know what a package manager is :P

1. Install Node.js and npm (consider a node version manager like e.g. `n`).
2. Install Selenium.
3. Install Google Chrome (or Chromium).
4. Install `chromedriver` (ships with Chromium).
5. Ensure that `chromedriver` is available in your system's PATH. This should not be an issue if you installed the driver via your package manager.


## Installation

Coming soon. Will distributed as `npm` package.


## Usage

```
SYNOPSIS
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

  lit add [<tag>+]
    Add new tag to the list of available tags. Separate with spaces.

  lit browse [--tag] [--save]
    Browse and tag documents.
    Use --tag to enter tag mode and move to the next document automatically.
    Use --save to automatically save changes.

  lit export [--untagged] [--only=<tag>] [--skip=<tag>] [--format=json]
    Print list of documents to standard out.
    Use --untagged to only list untagged documents.
    Use --only=<tag> to only include documents matching the given tag.
    Use --skip=<tag> to ignore documents matching the given tag.
    Use --format=json to output in JSON format.

  lit help
    This screen.
```


## Contributing

Lit is very specialized tool so while issue reports and pull requests are truly very appreciated, not all proposals will be accepted. Our principles are as follows:

- Simplicity: For intermediate users and power users.
- Consistancy: Only allowing safe actions.
- Respectfulness: No aggressive scraping of search results.


## License

This software is released under GNU GPL v3.

Full license text available at: https://www.gnu.org/licenses/gpl-3.0.en.html.

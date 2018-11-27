# `sync-folders`

This module provides both a CLI and API to one-way sync multiple directories to a single destination folder. Folders are copied by the source name (not merged) and must be unique. Files missing in the destination directories (anything within matching source folder names) will be removed on initial sync, so **be careful** where you target the output. By default, this package uses a "hardlink" strategy where directories are replicated and files are directly linked (pointing to the same inodes).

## Basic usage:

```sh
sync-folders ./a/src1 ./b/src2 ./output
```

This will add / replace two directories `output/src1` and `output/src2`, giving us this final file structure:

```
a/
  src1/
    ... src1 contents ...
b/
  src2/
    ... src2 contents ...
output/
  src1/
    ... src1 contents ...
  src2/
    ... src2 contents ...
```

## Watch and ignore example

```sh
sync-folders --watch --ignore "/node_modules/i" ./src1 ./src2 ./some/output
```

Before:

```
src1/
  x.js
  a/
    b/
      c/
        d.js
src2/
  node_modules/
    react/
      ...
  a.js
```

After:

```
src1/
  x.js
  a/
    b/
      c/
        d.js
src2/
  node_modules/
    react/
  a.js

some/
  output/
    src1/
      x.js
      a/
        b/
          c/
            d.js
    src2/
      a.js
```

Any changes (adding, editing, moving, deleting) will be replicated as well.

## Installation


Install in a project with:

```sh
yarn add sync-folders # or npm install --save sync-folders
```

Globally as a shell tool:

```sh
yarn global add sync-folders # or npm install -g sync-folders
sync-folders --help
```

Example:

We want to sync folders `src1` and `src2` to `./some/output` folder, without copying `node_modules`. We use the default strategy where directories are replicated in the target directories and files are hardlinked. We turn on watch mode to continue syncing and ensuring changes trigger other file watching events in the output directory.



## Strategies

It supports the following strategies to sync:

* `hardlink` (default): Folder structures are replicated and synced files are created as hardlinks (where inodes match).
* `copy`: Folder structures and files are both replicated. Slower and uses more disk space from file copy.

## CLI
```
sync-folders

A CLI tool around the sync-folders module for quickly linking or copying
directories into a target directory. This may be useful for local development
workarounds such as copying a source directory into another repo for local
testing.

Supported flags:


--watch,    Watch the source folders for changes to copy to the target.
-w          Default: false.

--ignore,   Anymatch compatible ignore string. CLI only takes string forms and regex forms.
-i          (separated by commas). Regex forms take the shape of JS literals, i.e.
            \`/node_modules/\` and \`/node_modules/i\`. All flags (igumy) are allowed. Invalid
            regex will fall back to being in string form. Note that anymatch globs will not match
            dotfiles, so a regex is likely what you want for ignoring folders.
            Default: none.
            Example (to ignore all node_modules and git):
                --ignore "/node_modules/i,/\.git/i"

--type,     Strategy for syncing the folders. By default, this tool will prefer
-t          using the "hardlink" strategy, where each file is hardlinked
            (referencing the same inode) and folders are mirrored. Use the
            "copy" strategy for a duplicate file. The hardlink strategy is
            preferred for performance and saving disk space.
            Default: "hardlink".

--bail,     Exits process whenever there is an error syncing any files or folders.
-b          If off, errors will be caught and logged unless \`--quiet\`.
            Default: false.

--verbose,  Logs out detailed information on initial sync and any updates in watch mode.
-v          Default: false.

--quiet,    Suppresses all logging, including basic initial copy output.
-q          Default: false.
```

## Module API

Respects the same options as the CLI. With this method you must provide *absolute* paths for the source and target directories. The ignore option can take any shape allowed from [`anymatch`](https://www.npmjs.com/package/anymatch).

```js
const syncFolders = require("sync-folders");

// Single dir sync
syncFolders("/path/to/sourceDir1", "/path/to/target/dir");

// Multiple dir sync
syncFolders(["/path/to/sourceDir1", "/path/to/sourceDir2"], "/path/to/target/dir");

// Watch mode and other options
syncFolders("/path/to/sourceDir1", "/path/to/target/dir", {
  watch: true,
  ignore: [
    "**/foo/**",
    /node_modules/,
    (path) => path.indexOf("bar") === -1,
  ],
  verbose: true,
  quiet: false,
  bail: true, // throws error on any syncing failure.
  onSync: ({ type, sourceDir, targetDir, relativePath }) => {
    console.log(`Synced folder ${sourceDir}`);
  },
  onUpdate: ({ type, sourceDir, targetDir, path }) => {
    console.log(`Synced file ${path} via ${type}`);
  },
});
```

## Inspiration

A lot of this was taken from https://www.npmjs.com/package/sync-directory by [@hoperyy](https://github.com/hoperyy). We added a new version here that can sync multiple sources with just one watcher (and updates the ignore logic to consistently function the same in both sync and watch).

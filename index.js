const path = require("path");

const linkOrCopyFolders = require("./source/linkOrCopyFolders");
const watchFolders = require("./source/watchFolders");
const { isDirectory } = require("./source/helpers")

const defaultOptions = {
  type: "hardlink",
  ignore: undefined,
  watch: false,
  quiet: true, // defaults to false from CLI
  verbose: false,
  onSync: () => {},
  onUpdate: () => {},
};

const wrappedOnSync = (onSync) => (info) => {
  console.log(`Copied ${info.relativePath}`);
  return onSync(info)
}

const wrappedOnUpdate = (onUpdate) => (info) => {
  switch (info.type) {
    case "add":
      console.log(`Added ${info.path}`);
      break;
    case "change":
      console.log(`Updated ${info.path}`);
      break;
    case "unlink":
      console.log(`Removed ${info.path}`);
      break;
    case "unlinkDir":
      console.log(`Removed directory ${info.path}`);
      break;
  }

  return onUpdate(info)
}

function ensureUniqueFolders(sourceDirs) {
  const folderNames = {};

  sourceDirs.forEach((sourceDir) => {
    if (!isDirectory(sourceDir)) {
      throw new Error(
        `${sourceDir} is not a directory.`
      );
    }

    const folderName = path.parse(sourceDir).name;

    if (folderNames[folderName]) {
      throw new Error(
        `All folder names must be unique. Multiple sources share the folder name ${folderName}.`
      );
    }

    folderNames[folderName] = true;
  });
}

function logOutput(sourceDirs, targetDir, watch) {
  const folderNames = sourceDirs.map(dir => path.parse(dir).name);
  console.log(`Synchronized the following folders to ${targetDir}`);
  console.log(folderNames.map(x => `* ${x}`).join("\n"));

  if (watch) {
    console.log("Now watching for any file changes to sync.")
  }
}

module.exports = function syncFolders(sourceDirs, targetDir, options = {}) {
  const {
    type,
    ignore,
    quiet,
    watch,
    verbose,
    onSync,
    onUpdate,
  } = Object.assign({}, defaultOptions, options);

  const arrSourceDirs = Array.isArray(sourceDirs) ? sourceDirs : [sourceDirs];
  ensureUniqueFolders(arrSourceDirs);

  if (!quiet) {
    logOutput(sourceDirs, targetDir, watch);
  }

  linkOrCopyFolders(arrSourceDirs, targetDir, {
    type,
    ignore,
    onSync: verbose && !quiet ? wrappedOnSync(onSync) : onSync,
  });

  if (watch) {
    const watcher = watchFolders(arrSourceDirs, targetDir, {
      type,
      ignore,
      onUpdate: verbose && !quiet ? wrappedOnUpdate(onUpdate) : onUpdate,
    });

    return watcher;
  }
};

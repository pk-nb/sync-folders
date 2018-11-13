const linkOrCopyFolders = require('./source/linkOrCopyFolders');
const watchFolders = require('./source/watchFolders');

const defaultOptions = {
  type: "hardlink",
  ignore: undefined,
  watch: false,
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

module.exports = function syncFolders(sourceDirs, targetDir, options = {}) {
  const {
    type,
    ignore,
    watch,
    verbose,
    onSync,
    onUpdate,
  } = Object.assign({}, defaultOptions, options);

  const arrSourceDirs = Array.isArray(sourceDirs) ? sourceDirs : [sourceDirs];

  linkOrCopyFolders(arrSourceDirs, targetDir, {
    type,
    ignore,
    onSync: verbose ? wrappedOnSync(onSync) : onSync,
  });

  if (watch) {
    const watcher = watchFolders(arrSourceDirs, targetDir, {
      type,
      ignore,
      onUpdate: verbose ? wrappedOnUpdate(onUpdate) : onUpdate,
    });

    return watcher;
  }
};

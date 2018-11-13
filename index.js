const linkOrCopyFolders = require('./source/linkOrCopyFolders');
const watchFolders = require('./source/watchFolders');

const defaultOptions = {
  type: "hardlink",
  ignore: undefined,
  watch: false,
  verbose: false,
  quiet: false,
  onSync: () => {},
  onUpdate: () => {},
};

module.exports = function syncFolders(sourceDirs, targetDir, options = {}) {
  const {
    type,
    ignore,
    watch,
    onSync,
    onUpdate,
  } = Object.assign({}, defaultOptions, options);

  const arrSourceDirs = Array.isArray(sourceDirs) ? sourceDirs : [sourceDirs];

  linkOrCopyFolders(arrSourceDirs, targetDir, { type, ignore, onSync });

  if (watch) {
    const watcher = watchFolders(arrSourceDirs, targetDir, { type, ignore, onSync, onUpdate });
    return watcher;
  }
};

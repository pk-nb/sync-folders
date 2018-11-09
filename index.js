const linkOrCopyFolders = require('./source/linkOrCopyFolders');
const watchFolders = require('./source/watchFolders');

const defaultOptions = {
  type: "hardlink",
  ignored: undefined,
  watch: false,
  onSync: () => {},
  onUpdate: () => {},
};

module.exports = function syncFolders(sourceDirs, targetDir, options = {}) {
  const {
    type,
    ignored,
    watch,
    onSync,
    onUpdate,
  } = Object.assign({}, defaultOptions, options);

  linkOrCopyFolders(sourceDirs, targetDir, { type, ignored, onSync });

  if (watch) {
    const watcher = watchFolders(sourceDirs, targetDir, { type, ignored, onSync, onUpdate });
    return watcher;
  }
};

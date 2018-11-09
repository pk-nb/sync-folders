const sync = require('./source/sync');
const watch = require('./source/watch');

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
    exclude,
    watch,
    onSync,
    onUpdate,
  } = Object.assign({}, defaultOptions, options);

  sync(sourceDirs, targetDir, { type, ignored, onSync });

  if (watch) {
    const watcher = watchLocalFiles(sourceDirs, targetDir, { type, ignored, onSync, onUpdate});
    return watcher;
  }
};

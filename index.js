const sync = require('./source/sync');
const watch = require('./source/watch');


const defaultOptions = {
  type: "hardlink",
  exclude: null,
  watch: false,
  onSync: () => {},
  onChange: () => {},
};

module.exports = function syncFolders(sourceDirs, targetDir, options = {}) {
  const {
    type,
    exclude,
    watch,
    onSync,
    onChange,
  } = Object.assign({}, defaultOptions, options);

  sync(sourceDirs, targetDir, { type, exclude, onSync });

  if (watch) {
    const watcher = watchLocalFiles(sourceDirs, targetDir, { type, exclude, onSync, onChange});
    return watcher;
  }
};

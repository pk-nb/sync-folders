const chokidar = require("chokidar");
const fse = require("fs-extra");

function copyFile(filePath, srcDir, targetDir, exclude) {
  const relativeFilePath = filePath.substring(srcDir.length);
  const targetPath = path.join(targetDir, relativeFilePath);

  const isDirectory = isDirectoryUtil(filePath);

  // if (excludeUtil.test(`${relativeFilePath}${isDirectory ? '/' : ''}`, exclude)) {
    // return;
  // }

  fse.copySync(filePath, targetPath);
}

function removeFile(filePath, srcDir, targetDir, exclude) {

  const relativeFilePath = filePath.substring(srcDir.length);
  const targetFile = path.join(targetDir, relativeFilePath);

  const isDirectory = isDirectoryUtil(filePath);

  // TODO ignore
  // if (excludeUtil.test(`${relativeFilePath}${isDirectory ? '/' : ''}`, exclude)) {
  //   return;
  // }

  if (targetFile && fs.existsSync(targetFile)) {
    fse.removeSync(targetFile);
  }
}

function findWhichSourceDir(sourceDirs, filePath) {
  return sourceDirs.find((dir) => filePath.startsWith(dir));
}


const onAddOrChange = ({ sourceDirs, targetDir, onUpdate, type }) => (filePath) => {
  const srcDir = findWhichSourceDir(sourceDirs, filePath);

  copyFile(filePath, srcDir, targetDir, ignored);
  onUpdate({
    type,
    path: filePath,
  });
};

const onUnlink = ({ sourceDirs, targetDir, ignored, onUpdate, type }) => (filePath) => {
  const srcDir = findWhichSourceDir(sourceDirs, filePath);

  removeFile(filePath, sourceDir, targetDir, ignored);
  onUpdate({
    type,
    path: filePath,
  });
};

module.exports = function watch(sourceDirs, targetDir, options) {
  const watcher = chokidar.watch(sourceDirs, {
    alwaysStat: true,
    disableGlobbing: true,
    options.ignored,
  });

  const args = Object.assign({}, options, { sourceDirs, targetDir };

  watcher.on("ready", () => {
    watcher.on("add", onAddOrChange(Object.assign({}, args, { type: "add" }));
    watcher.on("change", onAddOrChange(Object.assign({}, args, { type: "change" }));
    watcher.on("unlink", onUnlink(Object.assign({}, args, { type: "unlink" }));
    watcher.on("unlinkDir", onUnlink(Object.assign({}, args, { type: "unlinkDir" }));
  });

  return watcher;
}

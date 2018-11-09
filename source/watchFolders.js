const path = require("path");

const fse = require("fs-extra");
const chokidar = require("chokidar");

const { isDirectory, findWhichSourceDir } = require("./helpers");

function linkFile(filePath, sourceDir, targetDir, ignored) {

}

function copyFile(filePath, sourceDir, targetDir, ignored) {
  const relativeFilePath = filePath.substring(sourceDir.length);
  const folderName = path.parse(sourceDir).name;
  const targetPath = path.join(targetDir, folderName, relativeFilePath);

  // if (excludeUtil.test(`${relativeFilePath}${isDirectory ? '/' : ''}`, exclude)) {
    // return;
  // }

  fse.copySync(filePath, targetPath);
}

function removeFile(filePath, sourceDir, targetDir, ignored) {

  const relativeFilePath = filePath.substring(sourceDir.length);
  const folderName = path.parse(sourceDir).name;
  const targetFile = path.join(targetDir, folderName, relativeFilePath);

  // const isDirectory = isDirectoryUtil(filePath);

  // TODO ignore
  // if (excludeUtil.test(`${relativeFilePath}${isDirectory ? '/' : ''}`, exclude)) {
  //   return;
  // }

  if (targetFile && fs.existsSync(targetFile)) {
    fse.removeSync(targetFile);
  }
}

const onAddOrChange = ({ sourceDirs, targetDir, onUpdate, type, ignored }) => (filePath) => {
  const sourceDir = findWhichSourceDir(sourceDirs, filePath);
  console.log(sourceDir);

  copyFile(filePath, sourceDir, targetDir, ignored);
  onUpdate({
    type,
    path: filePath,
  });
};

const onUnlink = ({ sourceDirs, targetDir, ignored, onUpdate, type }) => (filePath) => {
  const sourceDir = findWhichSourceDir(sourceDirs, filePath);
  console.log(sourceDir);

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
    ignored: options.ignored,
  });

  const args = Object.assign({}, options, { sourceDirs, targetDir });

  watcher.on("ready", () => {
    watcher.on("add", onAddOrChange(Object.assign({}, args, { type: "add" })));
    watcher.on("change", onAddOrChange(Object.assign({}, args, { type: "change" })));
    watcher.on("unlink", onUnlink(Object.assign({}, args, { type: "unlink" })));
    watcher.on("unlinkDir", onUnlink(Object.assign({}, args, { type: "unlinkDir" })));
  });

  return watcher;
}

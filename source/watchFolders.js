const path = require("path");

const fse = require("fs-extra");
const chokidar = require("chokidar");

const { linkDirFiles, timeFile, isDirectory, findWhichSourceDir } = require("./helpers");

function linkFile(filePath, sourceDir, targetDir, ignored) {
  const relativeFilePath = filePath.substring(sourceDir.length);
  const folderName = path.parse(sourceDir).name;
  const targetPath = path.join(targetDir, folderName, relativeFilePath);

  linkDirFiles(filePath, targetPath);
}

function copyFile(filePath, sourceDir, targetDir, ignored) {
  const relativeFilePath = filePath.substring(sourceDir.length);
  const folderName = path.parse(sourceDir).name;
  const targetPath = path.join(targetDir, folderName, relativeFilePath);

  fse.copySync(filePath, targetPath);
}

function removeFile(filePath, sourceDir, targetDir, ignored) {
  const relativeFilePath = filePath.substring(sourceDir.length);
  const folderName = path.parse(sourceDir).name;
  const targetFile = path.join(targetDir, folderName, relativeFilePath);

  if (targetFile && fse.existsSync(targetFile)) {
    fse.removeSync(targetFile);
  }
}

const onAddOrChange = ({ sourceDirs, targetDir, onUpdate, type, eventType, ignored }) => (filePath) => {
  const sourceDir = findWhichSourceDir(sourceDirs, filePath);
  type === "hardlink" ?
    linkFile(filePath, sourceDir, targetDir, ignored) :
    copyFile(filePath, sourceDir, targetDir, ignored);

  onUpdate({
    eventType,
    path: filePath,
  });
};

const onUnlink = ({ sourceDirs, targetDir, ignored, onUpdate, eventType }) => (filePath) => {
  const sourceDir = findWhichSourceDir(sourceDirs, filePath);

  removeFile(filePath, sourceDir, targetDir, ignored);
  onUpdate({
    eventType,
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
    watcher.on("add", onAddOrChange(Object.assign({}, args, { eventType: "add" })));
    watcher.on("change", onAddOrChange(Object.assign({}, args, { eventType: "change" })));
    watcher.on("unlink", onUnlink(Object.assign({}, args, { eventType: "unlink" })));
    watcher.on("unlinkDir", onUnlink(Object.assign({}, args, { eventType: "unlinkDir" })));
  });

  return watcher;
}

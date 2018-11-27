const path = require("path");

const fse = require("fs-extra");
const chokidar = require("chokidar");

const { linkDirFiles, timeFile, findWhichSourceDir } = require("./helpers");

function linkFile(filePath, sourceDir, targetDir, ignore) {
  const relativeFilePath = filePath.substring(sourceDir.length);
  const folderName = path.parse(sourceDir).name;
  const targetPath = path.join(targetDir, folderName, relativeFilePath);

  linkDirFiles(filePath, targetPath);
}

function copyFile(filePath, sourceDir, targetDir, ignore) {
  const relativeFilePath = filePath.substring(sourceDir.length);
  const folderName = path.parse(sourceDir).name;
  const targetPath = path.join(targetDir, folderName, relativeFilePath);

  fse.copySync(filePath, targetPath);
}

function removeFile(filePath, sourceDir, targetDir, ignore) {
  const relativeFilePath = filePath.substring(sourceDir.length);
  const folderName = path.parse(sourceDir).name;
  const targetFile = path.join(targetDir, folderName, relativeFilePath);

  if (targetFile && fse.existsSync(targetFile)) {
    fse.removeSync(targetFile);
  }
}

const onAddOrChange = ({
  sourceDirs,
  targetDir,
  onUpdate,
  type,
  eventType,
  ignore,
  quiet,
  bail
}) => (filePath) => {
  const sourceDir = findWhichSourceDir(sourceDirs, filePath);

  try {
    type === "hardlink" ?
      linkFile(filePath, sourceDir, targetDir, ignore) :
      copyFile(filePath, sourceDir, targetDir, ignore);

    onUpdate({
      sourceDir,
      targetDir,
      type: eventType,
      path: filePath,
    });
  } catch (err) {
    if (bail) {
      throw err;
    }

    if (!quiet) {
      console.log(`Failed to ${type} file ${filePath} to ${targetDir}.`);
    }
  }
};

const onUnlink = ({
  sourceDirs,
  targetDir,
  ignore,
  onUpdate,
  eventType,
  quiet,
  bail
}) => (filePath) => {
  const sourceDir = findWhichSourceDir(sourceDirs, filePath);

  try {
    removeFile(filePath, sourceDir, targetDir, ignore);
    onUpdate({
      sourceDir,
      targetDir,
      type: eventType,
      path: filePath,
    });
  } catch (err) {
    if (bail) {
      throw err;
    }

    if (!quiet) {
      console.log(`Failed to remove file ${filePath} in ${targetDir}.`);
    }
  }
};

module.exports = function watch(sourceDirs, targetDir, options) {
  const watcher = chokidar.watch(sourceDirs, {
    alwaysStat: true,
    disableGlobbing: true,
    ignored: options.ignore,
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

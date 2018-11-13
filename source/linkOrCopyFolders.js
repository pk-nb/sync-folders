const path = require("path");
const fse = require("fs-extra");
const anymatch = require("anymatch");
const readdirEnhanced = require("readdir-enhanced");

const { linkDirFiles } = require("./helpers");

const ignored = (ignore) => (path) => {
  return anymatch(ignore, path);
}

function readdirSync(dir, ignore) {
  return readdirEnhanced.sync(dir, {
    deep: ignore ? (stats) => !ignored(ignore)(stats.path) : true,
    basePath: dir
  });
}

function copyDirFiles(srcPath, targetPath) {
  if (fse.existsSync(srcPath) && !fse.existsSync(targetPath)) {
    fse.copySync(srcPath, targetPath);
  }
}

function removeFile(filePath) {
  fse.removeSync(filePath);
}

function syncFiles(srcDir, targetDir, { type, ignore, onSync }) {
  const srcFiles = readdirSync(srcDir, ignore);
  const targetFiles = readdirSync(targetDir);

  // array to json
  const srcJson = {};
  const wsJson = {};
  srcFiles.forEach(function(filePath, index) {
    // Is this check necessary?
    if (!fse.existsSync(filePath)) {
      return;
    }

    if (ignored(ignore)(filePath)) {
      return;
    }

    srcJson[filePath.replace(srcDir, "")] = false;
  });

  targetFiles.forEach(function(filePath, index) {
    wsJson[filePath.replace(targetDir, "")] = false;
  });

  // link or copy files
  for(let relativeFilePath in srcJson) {
    wsJson[relativeFilePath] = true;

    const srcPath = path.join(srcDir, relativeFilePath);
    const targetPath = path.join(targetDir, relativeFilePath);

    if (type === "hardlink") {
      linkDirFiles(srcPath, targetPath);

      onSync({
        type: "init:hardlink",
        relativePath: relativeFilePath,
      });
    } else if (type === "copy") {
      copyDirFiles(srcPath, targetPath);

      onSync({
        type: "init:copy",
        relativePath: relativeFilePath,
      });
    }
  }

  for(let relativeFilePath in wsJson) {
    if (!wsJson[relativeFilePath]) {
      removeFile(path.join(targetDir, relativeFilePath));
    }
  }
}

module.exports = function linkOrCopyFolders(sourceDirs, targetDir, { type, ignore, onSync }) {
  fse.ensureDirSync(targetDir);

  sourceDirs.forEach((sourceDir) => {
    const folderName = path.parse(sourceDir).name;
    const sourceTargetDir = path.join(targetDir, folderName);

    fse.ensureDirSync(sourceTargetDir);
    syncFiles(sourceDir, sourceTargetDir, { type, ignore, onSync });
  })
};

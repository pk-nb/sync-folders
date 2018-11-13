const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const anymatch = require("anymatch");
const readdirEnhanced = require("readdir-enhanced");

const { isDirectory: isDirectoryUtil } = require("./helpers");
const excludeUtil = require("./ignored");

function readdirSync(dir, ignored) {
  const ignoreFunc = (stats) => {
    console.log(stats.path);
    return !anymatch(ignored, stats.path);
  }

  return readdirEnhanced.sync(dir, {
    deep: ignored ? ignoreFunc : true,
    basePath: dir
  });
}

function utimeFile(filePath) {
  const time = ((Date.now() - 10 * 1000)) / 1000;
  fs.utimesSync(filePath, time, time);
}

function linkDirFiles(relativeFilePath, srcPath, targetPath) {
  const stats = fs.statSync(srcPath);
  if (stats.isFile()) {

    if (fs.existsSync(targetPath)) {
      if (stats.ino !== fs.statSync(targetPath).ino) {
        fse.removeSync(targetPath);
        fse.ensureLinkSync(srcPath, targetPath);
        utimeFile(targetPath);
      }
    } else {
      fse.ensureLinkSync(srcPath, targetPath);
      utimeFile(targetPath);
    }

  } else if (stats.isDirectory()) {
    fse.ensureDirSync(targetPath);
  }
}

function copyDirFiles(srcPath, targetPath) {
  if (fs.existsSync(srcPath) && !fs.existsSync(targetPath)) {
    fse.copySync(srcPath, targetPath);
  }
}

function removeFile(filePath) {
  fse.removeSync(filePath);
}

function syncFiles(srcDir, targetDir, { type, ignored, onSync }) {
  const srcFiles = readdirSync(srcDir, ignored);
  const targetFiles = readdirSync(targetDir);

  // array to json
  const srcJson = {};
  const wsJson = {};
  srcFiles.forEach(function(filePath, index) {
    if (!fs.existsSync(filePath)) {
      return;
    }

    const isDirectory = isDirectoryUtil(filePath);

    if (excludeUtil.test(`${filePath.replace(srcDir, "")}${isDirectory ? "/" : ""}`, ignored)) {
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
      linkDirFiles(relativeFilePath, srcPath, targetPath);

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

module.exports = function linkOrCopyFolders(srcDir, targetDir, { type, ignored, onSync }) {
  fse.ensureDirSync(targetDir);
  syncFiles(srcDir, targetDir, { type, ignored, onSync });
};

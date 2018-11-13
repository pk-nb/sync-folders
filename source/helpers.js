const fse = require("fs-extra");

function isDirectory(filePath) {
  let isDirectory = false;
  if (fse.existsSync(filePath)) {
    return fse.statSync(filePath).isDirectory();
  }
};

function findWhichSourceDir(sourceDirs, filePath) {
  return sourceDirs.find((dir) => filePath.startsWith(dir));
}

function utimeFile(filePath) {
  const time = ((Date.now() - 10 * 1000)) / 1000;
  fse.utimesSync(filePath, time, time);
}

// Used to make a hardlink just like a fse.copySync would make a new copy.
function linkDirFiles(srcPath, targetPath) {
  const stats = fse.statSync(srcPath);

  if (stats.isFile()) {
    if (fse.existsSync(targetPath)) {
      if (stats.ino !== fse.statSync(targetPath).ino) {
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


module.exports = {
  findWhichSourceDir,
  utimeFile,
  linkDirFiles,
};

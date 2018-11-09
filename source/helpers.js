const fs = require("fs");

function isDirectory(filePath) {
  let isDirectory = false;
  if (fs.existsSync(filePath)) {
    return fs.statSync(filePath).isDirectory();
  }
};


function findWhichSourceDir(sourceDirs, filePath) {
  return sourceDirs.find((dir) => filePath.startsWith(dir));
}

module.exports = {
  isDirectory,
  findWhichSourceDir,
};

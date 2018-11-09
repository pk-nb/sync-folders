const path = require("path");

const syncFolders = require("../index");

const src1 = path.resolve(__dirname, "..", "test", "src1");
const src2 = path.resolve(__dirname, "..", "test", "src2");

syncFolders()

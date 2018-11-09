#!/usr/bin/env node

const path = require("path");
const syncFolders = require("../index");

const src1 = path.resolve(__dirname, "..", "test", "src1");
const src2 = path.resolve(__dirname, "..", "test", "src2");
const target = path.resolve(__dirname, "..", "test", "output");

// TODO take CLI args in this form.
// const resolvedSourceDirs = sourceDirs.map((dir) => path.resolve(process.cwd(), sourceDirs));

syncFolders([src1, src2], target, { watch: true, ignored: "**/node_modules/**" });

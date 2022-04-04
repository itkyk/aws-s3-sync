#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var commander_1 = require("commander");
var createInitFile_1 = __importDefault(require("./createInitFile"));
var syncS3_1 = __importDefault(require("./syncS3"));
var program = new commander_1.Command();
program
    .option("-i, --init", "create setting file", false)
    .option("-d, --deploy [value]", "sync s3");
program.parse(process.argv);
var option = program.opts();
if (option.init) {
    (0, createInitFile_1["default"])();
}
else if (option.deploy) {
    (0, syncS3_1["default"])(option.deploy);
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var s3_1 = __importDefault(require("s3"));
var glob_1 = require("glob");
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
// import Util from "./Util";
var getGlobFiles = function (dirPath) {
    var files = glob_1.glob.sync("".concat(dirPath, "**/*"));
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var state = fs_extra_1["default"].statSync(path_1["default"].resolve(file));
        console.log(file, state);
    }
};
var getDiff = function (clientParams, params, cb) {
    var fileList = [];
    var client = s3_1["default"].createClient(clientParams);
    var listObject = client.listObjects(params);
    listObject.on("error", function (err) {
        console.error("unable to getting list: ", err.stack);
    });
    listObject.on("data", function (data) {
        for (var _i = 0, _a = data.Contents; _i < _a.length; _i++) {
            var file = _a[_i];
            fileList.push({ key: file.Key, modified: file.LastModified });
        }
    });
    listObject.on("end", function () {
        // Util.logBlue(`get Log end: ${fileList.join("\n")}`)
        console.log(getGlobFiles(params.localDir));
    });
};
exports["default"] = getDiff;

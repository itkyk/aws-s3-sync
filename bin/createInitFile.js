"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var fs_1 = __importDefault(require("fs"));
var createEnv = function () {
    if (!fs_1["default"].existsSync("./s3")) {
        fs_1["default"].mkdirSync("./s3");
    }
};
var templateEnvFile = function () {
    var envFile = [
        "accessKeyId=\"\"",
        "secretAccessKey=\"\"",
        "localRoot=\"\"",
        "deleteRemote=\"true\"",
        "bucket=\"\""
    ];
    fs_1["default"].writeFile("./s3/.env.template", envFile.join("\n"), function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("create template env file");
        }
    });
};
var init = function () {
    createEnv();
    templateEnvFile();
};
exports["default"] = init;

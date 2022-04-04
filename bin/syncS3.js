"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var s3_1 = __importDefault(require("s3"));
var dotenv_1 = __importDefault(require("dotenv"));
var deepmerge_1 = __importDefault(require("deepmerge"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var is_plain_object_1 = require("is-plain-object");
var Util_1 = __importDefault(require("./Util"));
var syncS3 = function (envPath) {
    var env = dotenv_1["default"].config({
        path: "./s3/.env.".concat(envPath)
    }).parsed;
    var createClient = function (clientParams, params) {
        var client = s3_1["default"].createClient(clientParams);
        var uploader = client.uploadDir(params);
        return uploader;
    };
    var uploadLog = function (uploader) {
        var log = [];
        var uploadFilesTotalCount = 0;
        var finishFilesTotalCount = 0;
        uploader.on("fileUploadStart", function (localFilePath, s3Key) {
            uploadFilesTotalCount++;
        });
        uploader.on("fileUploadEnd", function (localFilePath, s3Key) {
            var date = new Date();
            log.push({
                local: localFilePath,
                remote: s3Key,
                date: "".concat(date.getFullYear(), "/").concat(date.getMonth() + 1, "/").concat(date.getDate(), "  ").concat(date.getHours(), ":").concat(date.getMinutes(), ":").concat(date.getSeconds())
            });
            finishFilesTotalCount++;
            if (finishFilesTotalCount === uploadFilesTotalCount) {
                var logData = [];
                for (var _i = 0, log_1 = log; _i < log_1.length; _i++) {
                    var detail = log_1[_i];
                    logData.push("local: ".concat(detail.local, ", remote: ").concat(detail.remote, ", date: ").concat(detail.date));
                }
                fs_extra_1["default"].writeFileSync(path_1["default"].resolve("./s3/upload-".concat(envPath, ".log")), logData.join("\n"));
                console.table(log);
            }
        });
        uploader.on("error", function (err) {
            console.error("unable to sync:", err.stack);
        });
    };
    if (env) {
        // create unique options from .env
        var envOption = __assign(__assign(__assign(__assign(__assign(__assign({}, env.maxAsyncS3 ? { maxAsyncS3: Number(env.maxAsyncS3) } : {}), env.s3RetryCount ? { s3RetryCount: Number(env.s3RetryCount) } : {}), env.s3RetryDelay ? { s3RetryDelay: Number(env.s3RetryDelay) } : {}), env.multipartUploadThreshold ? { multipartUploadThreshold: Number(env.multipartUploadThreshold) } : {}), env.multipartUploadSize ? { multipartUploadSize: Number(env.multipartUploadSize) } : {}), { s3Options: __assign(__assign(__assign(__assign({}, env.region ? { region: env.region } : {}), { accessKeyId: env.accessKeyId, secretAccessKey: env.secretAccessKey }), env.endpoint ? { endpoint: env.endpoint } : {}), env.sslEnabled ? { sslEnabled: env.sslEnabled === "ture" ? true : false } : {}) });
        // default options
        var defaultOptions = {
            maxAsyncS3: 20,
            s3RetryCount: 3,
            s3RetryDelay: 1000,
            multipartUploadThreshold: 20971520,
            multipartUploadSize: 15728640,
            s3Options: {
                region: 'ap-northeast-1'
            }
        };
        // create merged options from default to unique
        var s3Options = (0, deepmerge_1["default"])(defaultOptions, envOption, {
            isMergeableObject: is_plain_object_1.isPlainObject
        });
        // create upload option from env
        var params = {
            localDir: env.localRoot,
            deleteRemoved: env.deleteRemote === "true" ? true : false,
            s3Params: __assign({ Bucket: env.bucket }, env.prefix ? { Prefix: env.prefix } : {})
        };
        // default upload option
        var defaultParams = {
            deleteRemoved: false,
            s3Params: {
                Prefix: ""
            }
        };
        // create upload option from default to unique
        var mergedParams = (0, deepmerge_1["default"])(defaultParams, params, {
            isMergeableObject: is_plain_object_1.isPlainObject
        });
        // create uploader
        var uploader = createClient(s3Options, mergedParams);
        uploadLog(uploader);
    }
    else {
        Util_1["default"].logRed("Cannot found .env file");
    }
};
exports["default"] = syncS3;

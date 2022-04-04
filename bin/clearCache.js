"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var createInvalidation = function (DistributionId, cloudFront, items) {
    var params = {
        DistributionId: DistributionId,
        InvalidationBatch: {
            CallerReference: Date.now().toString(),
            Paths: {
                Quantity: items.length,
                Items: items
            }
        }
    };
    return new Promise(function (resolve, reject) {
        cloudFront.createInvalidation(params, function (err, data) {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
};
var clearCache = function (env) {
    var cloudFront = new aws_sdk_1["default"].CloudFront({
        accessKeyId: env.accessKeyId,
        secretAccessKey: env.secretAccessKey,
        region: env.region
    });
    var items = env.distributionPaths ? env.distributionPaths.split(",") : ["/*"];
    createInvalidation(env.distributionID, cloudFront, items).then()["catch"](function (err) {
        console.log(err);
    });
};
exports["default"] = clearCache;

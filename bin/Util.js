"use strict";
exports.__esModule = true;
var Util = /** @class */ (function () {
    function Util() {
    }
    Util.logGreen = function (log) {
        console.log("\u001B[32m".concat(log, "\u001B[0m"));
    };
    Util.logBlue = function (log) {
        console.log("\u001B[34m".concat(log, "\u001B[0m"));
    };
    Util.logRed = function (log) {
        console.log("\u001B[31m".concat(log, "\u001B[0m"));
    };
    return Util;
}());
exports["default"] = Util;

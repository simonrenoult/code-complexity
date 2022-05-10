#!/usr/bin/env node
"use strict";
exports.__esModule = true;
var io_1 = require("../src/io");
io_1["default"]()["catch"](function (error) {
    console.error(error);
    process.exit(1);
});

"use strict";
exports.__esModule = true;
var Table = require("cli-table3");
var utils_1 = require("../utils");
var internal = { debug: utils_1.buildDebugger("output") };
exports["default"] = {
    render: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return utils_1.withDuration(render, args, internal.debug);
    }
};
function render(statisticsPerPath, options) {
    var values = Array.from(statisticsPerPath.values());
    var stdout;
    switch (options.format) {
        case "table":
            stdout = toTable(values);
            break;
        case "json":
            stdout = toJson(values);
            break;
        case "csv":
            stdout = toCSV(values);
            break;
        default:
            stdout = toTable(values);
    }
    console.log(stdout);
}
function toJson(statistics) {
    return JSON.stringify(statistics);
}
function toTable(statistics) {
    var table = new Table({
        head: ["file", "complexity", "churn", "score"]
    });
    statistics.forEach(function (statistics) {
        table.push([
            statistics.path,
            statistics.complexity,
            statistics.churn,
            statistics.score,
        ]);
    });
    return table.toString();
}
function toCSV(statistics) {
    var csv = "file,complexity,churn,score\n";
    statistics.forEach(function (stat) {
        csv +=
            [stat.path, stat.complexity, stat.churn, stat.score].join(",") + "\n";
    });
    return csv;
}

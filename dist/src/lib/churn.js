"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var fs_1 = require("fs");
var micromatch = require("micromatch");
var path_1 = require("path");
var simple_git_1 = require("simple-git");
var utils_1 = require("../utils");
var internal = { debug: utils_1.buildDebugger("churn") };
var PER_LINE = "\n";
exports["default"] = {
    compute: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return utils_1.withDuration(compute, args, internal.debug);
    }
};
function compute(options) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var isWindows, gitcli, gitLogCommand, log, parsedLines, allChurns, filteredChurns;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    isWindows = process.platform === "win32";
                    return [4 /*yield*/, simple_git_1["default"](options.directory)];
                case 1:
                    gitcli = _b.sent();
                    return [4 /*yield*/, buildGitLogCommand(options, isWindows)];
                case 2:
                    gitLogCommand = _b.sent();
                    console.log(gitLogCommand);
                    return [4 /*yield*/, gitcli.log(gitLogCommand.filter(function (r) { return r !== ''; }))];
                case 3:
                    log = _b.sent();
                    internal.debug("command to measure churns: " + gitLogCommand);
                    parsedLines = computeNumberOfTimesFilesChanged(((_a = log.latest) === null || _a === void 0 ? void 0 : _a.hash) || "").filter(function (parsedLine) {
                        return fs_1.existsSync(path_1.resolve(options.directory, parsedLine.relativePath));
                    });
                    allChurns = parsedLines.reduce(function (map, _a) {
                        var relativePath = _a.relativePath, commitCount = _a.commitCount;
                        var path = relativePath;
                        var churn = parseInt(commitCount, 10);
                        map.set(path, churn);
                        return map;
                    }, new Map());
                    internal.debug(allChurns.size + " files to compute churn on (before filters)");
                    filteredChurns = new Map();
                    allChurns.forEach(function (churn, path) {
                        var patchIsAMatch = options.filter && options.filter.length > 0
                            ? options.filter.every(function (f) { return micromatch.isMatch(path, f); })
                            : true;
                        if (patchIsAMatch)
                            filteredChurns.set(path, churn);
                    });
                    internal.debug(filteredChurns.size + " files to compute churn on (after filters)");
                    return [2 /*return*/, filteredChurns];
            }
        });
    });
}
/*function assertGitIsInstalled(): void {
  try {
    execSync("which git");
  } catch (error) {
    throw new Error("Program 'git' must be installed");
  }
}*/
/*function assertIsGitRootDirectory(directory: string): void {
  if (!existsSync(`${directory}/.git`)) {
    throw new Error(`Argument 'dir' must be the git root directory.`);
  }
}*/
function buildGitLogCommand(options, isWindows) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, [
                    "--follow",
                    // Windows CMD handle quotes differently than linux, this is why we should put empty string as said in:
                    // https://github.com/git-for-windows/git/issues/3131
                    "--pretty=format:" + (isWindows ? "" : "''"),
                    "--name-only",
                    options.since ? "--since=\"" + options.since + "\"" : "",
                    options.until ? "--until=\"" + options.until + "\"" : "",
                    // Windows CMD handle quotes differently
                    isWindows ? "*" : "'*'",
                ]];
        });
    });
}
function computeNumberOfTimesFilesChanged(gitLogOutput) {
    var changedFiles = gitLogOutput
        .split(PER_LINE)
        .filter(function (line) { return line !== ""; })
        .sort();
    var changedFilesCount = changedFiles.reduce(function (fileAndTimeChanged, fileName) {
        fileAndTimeChanged[fileName] = (fileAndTimeChanged[fileName] || 0) + 1;
        return fileAndTimeChanged;
    }, {});
    return Object.keys(changedFilesCount).map(function (changedFileName) {
        return ({
            relativePath: changedFileName,
            commitCount: changedFilesCount[changedFileName].toString()
        });
    });
}

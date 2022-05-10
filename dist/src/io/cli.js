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
var commander = require("commander");
var url_1 = require("url");
var fs_1 = require("fs");
var simple_git_1 = require("simple-git");
var utils_1 = require("../utils");
var del = require("del");
var internal = { debug: utils_1.buildDebugger("cli") };
exports["default"] = { parse: parse, cleanup: cleanup };
function parse(params) {
    return __awaiter(this, void 0, void 0, function () {
        var cli, options, _a, description, version;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!!params) return [3 /*break*/, 3];
                    return [4 /*yield*/, utils_1.getPackageJson()];
                case 1:
                    _a = _b.sent(), description = _a.description, version = _a.version;
                    cli = getRawCli(description, version).parse(process.argv);
                    assertArgsAreProvided(cli);
                    return [4 /*yield*/, buildOptions(cli)];
                case 2:
                    options = _b.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, buildOptions(params)];
                case 4:
                    options = _b.sent();
                    _b.label = 5;
                case 5:
                    ;
                    internal.debug("applying options: " + JSON.stringify(options));
                    return [2 /*return*/, options];
            }
        });
    });
}
function cleanup(options) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(options.target.startsWith("https://") || options.target.startsWith("http://"))) return [3 /*break*/, 2];
                    return [4 /*yield*/, del(options.directory)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
function getRawCli(description, version) {
    return commander
        .usage("<target> [options]")
        .version(version || "")
        .description(description || "")
        .option("--filter <strings>", "list of globs (comma separated) to filter", commaSeparatedList)
        .option("-f, --format [format]", "format results using table or json", /^(table|json|csv)$/i)
        .option("-l, --limit [limit]", "limit the number of files to output", parseInt)
        .option("-i, --since [since]", "limit analysis to commits more recent in age than date")
        .option("-u, --until [until]", "limit analysis to commits older in age than date")
        .option("-s, --sort [sort]", "sort results (allowed valued: score, churn, complexity or file)", /^(score|churn|complexity|file)$/i)
        .on("--help", function () {
        console.log();
        console.log("Examples:");
        console.log();
        [
            "$ code-complexity .",
            "$ code-complexity https://github.com/simonrenoult/code-complexity",
            "$ code-complexity foo --limit 3",
            "$ code-complexity ../foo --sort score",
            "$ code-complexity /foo/bar --filter 'src/**,!src/front/**'",
            "$ code-complexity . --limit 10 --sort score",
        ].forEach(function (example) { return console.log(example.padStart(2)); });
    });
}
function buildOptions(cli) {
    return __awaiter(this, void 0, void 0, function () {
        // FIXME: I'm not a fan of pulling the code here but it's good enough.
        function parseDirectory(target) {
            return __awaiter(this, void 0, void 0, function () {
                var tmp;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(target.startsWith("https://github.com/") || target.startsWith("http://github.com/"))) return [3 /*break*/, 2];
                            tmp = "src/temp/" + (target === null || target === void 0 ? void 0 : target.split("//github.com/")[1].replace(/\//g, "-")) + "-" + new Date().getTime();
                            //old: execSync(`git clone ${target} ${tmp}`, { stdio: "ignore" });
                            return [4 /*yield*/, simple_git_1["default"]().clone(target, tmp)];
                        case 1:
                            //old: execSync(`git clone ${target} ${tmp}`, { stdio: "ignore" });
                            _a.sent();
                            return [2 /*return*/, tmp];
                        case 2: return [2 /*return*/, target];
                    }
                });
            });
        }
        function parseTarget(target) {
            try {
                return new url_1.URL(target); // \o/ typescript momments
            }
            catch (e) {
                try {
                    fs_1.lstatSync(target);
                    return target;
                }
                catch (e) {
                    throw new Error("Argument 'target' is neither a directory nor a valid URL.");
                }
            }
        }
        var target, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (cli.target) {
                        target = String(cli.target);
                    }
                    else if (cli.args[0]) {
                        target = parseTarget(cli.args[0]);
                    }
                    else {
                        throw new Error("Target is not defined.");
                    }
                    ;
                    _a = {
                        target: target
                    };
                    return [4 /*yield*/, parseDirectory(target)];
                case 1: return [2 /*return*/, (_a.directory = _b.sent(),
                        _a.format = cli.format ? String(cli.format) : "table",
                        _a.filter = cli.filter || [],
                        _a.limit = cli.limit ? Number(cli.limit) : undefined,
                        _a.since = cli.since ? String(cli.since) : undefined,
                        _a.until = cli.until ? String(cli.until) : undefined,
                        _a.sort = cli.sort ? String(cli.sort) : undefined,
                        _a)];
            }
        });
    });
}
function commaSeparatedList(value) {
    return value.split(",");
}
function assertArgsAreProvided(internalCli) {
    if (!internalCli.args || !internalCli.args.length) {
        internalCli.help();
        process.exit(1);
    }
}

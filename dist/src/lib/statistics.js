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
var utils_1 = require("../utils");
var churn_1 = require("./churn");
var complexity_1 = require("./complexity");
var DEFAULT_CHURN = 1;
var DEFAULT_COMPLEXITY = 1;
var internal = { debug: utils_1.buildDebugger("statistics") };
var Statistics = /** @class */ (function () {
    function Statistics(path, churn, complexity) {
        this.path = path;
        this.churn = churn;
        this.complexity = complexity;
        this.score = this.churn * this.complexity;
    }
    Statistics.compute = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var churns, paths, complexities, statistics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        internal.debug("invoked with options: " + JSON.stringify(options));
                        internal.debug("using cwd: " + process.cwd());
                        return [4 /*yield*/, churn_1["default"].compute(options)];
                    case 1:
                        churns = _a.sent();
                        paths = Array.from(churns.keys());
                        return [4 /*yield*/, complexity_1["default"].compute(paths, options)];
                    case 2:
                        complexities = _a.sent();
                        statistics = paths
                            .map(toStatistics(churns, complexities))
                            .sort(sort(options.sort))
                            .filter(limit(options.limit));
                        return [2 /*return*/, toMap(statistics)];
                }
            });
        });
    };
    return Statistics;
}());
exports["default"] = Statistics;
function toStatistics(churns, complexities) {
    return function (path) {
        var churn = churns.get(path) || DEFAULT_CHURN;
        var complexity = complexities.get(path) || DEFAULT_COMPLEXITY;
        return new Statistics(path, churn, complexity);
    };
}
function limit(limit) {
    return function (statistics, i) { return !limit || i < limit; };
}
function sort(sort) {
    return function (statisticsA, statisticsB) {
        if (sort === "score" || sort === "ratio") {
            return statisticsB.score - statisticsA.score;
        }
        if (sort === "churn") {
            return statisticsB.churn - statisticsA.churn;
        }
        if (sort === "complexity") {
            return statisticsB.complexity - statisticsA.complexity;
        }
        if (sort === "file") {
            var fileAPath = statisticsA.path;
            var fileBPath = statisticsB.path;
            return fileAPath.localeCompare(fileBPath);
        }
        return 0;
    };
}
function toMap(statistics) {
    return statistics.reduce(function (map, statistics) {
        map.set(statistics.path, statistics);
        return map;
    }, new Map());
}

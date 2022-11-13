import * as Table from "cli-table3";

import { buildDebugger, withDuration } from "../utils";
import { Options } from "../lib/types";
import Statistics from "../lib/statistics";

const internal = { debug: buildDebugger("output") };

export default {
  render: (...args: any[]): void => withDuration(render, args, internal.debug),
};

function render(statistics: Statistics[], options: Options): void {
  let stdout;
  switch (options.format) {
    case "table":
      stdout = toTable(statistics);
      break;
    case "json":
      stdout = toJson(statistics);
      break;
    case "csv":
      stdout = toCSV(statistics);
      break;
    default:
      stdout = toTable(statistics);
  }

  console.log(stdout);
}

function toJson(statistics: Statistics[]): string {
  return JSON.stringify(statistics.map((s) => s.toState()));
}

function toTable(statistics: Statistics[]): string {
  const table = new Table({
    head: ["file", "complexity", "churn", "score"],
  });
  statistics.forEach((statistics) => {
    table.push([
      statistics.path,
      statistics.complexity,
      statistics.churn,
      statistics.score,
    ]);
  });

  return table.toString();
}

function toCSV(statistics: Statistics[]): string {
  let csv = "file,complexity,churn,score\n";
  statistics.forEach((stat) => {
    csv +=
      [stat.path, stat.complexity, stat.churn, stat.score].join(",") + "\n";
  });

  return csv;
}

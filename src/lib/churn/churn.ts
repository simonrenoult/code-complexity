import { execSync } from "child_process";
import * as micromatch from "micromatch";

import { Options, Path } from "../types";
import { buildDebugger, withDuration } from "../../utils";
import { resolve } from "path";
import { existsSync } from "fs";

const internal = { debug: buildDebugger("churn") };
const PER_LINE = "\n";

export default {
  compute: (...args: any[]): Promise<Map<Path, number>> =>
    withDuration(compute, args, internal.debug),
};

async function compute(options: Options): Promise<Map<Path, number>> {
  const gitLogCommand = buildGitLogCommand(options);
  const singleStringWithAllChurns = executeGitLogCommand(gitLogCommand);
  return computeChurnsPerFiles(
    singleStringWithAllChurns,
    options.directory,
    options.filter
  );
}

function executeGitLogCommand(gitLogCommand: string): string {
  return execSync(gitLogCommand, { encoding: "utf8", maxBuffer: 32_000_000 });
}

function buildGitLogCommand(options: Options): string {
  const isWindows = process.platform === "win32";

  return [
    "git",
    `-C ${options.directory}`,
    `log`,
    `--follow`,

    // Windows CMD handle quotes differently than linux, this is why we should put empty string as said in:
    // https://github.com/git-for-windows/git/issues/3131
    `--format=${isWindows ? "" : "''"}`,
    `--name-only`,
    options.since ? `--since="${options.since}"` : "",
    options.until ? `--until="${options.until}"` : "",

    // Windows CMD handle quotes differently
    isWindows ? "*" : "'*'",
  ]
    .filter((s) => s.length > 0)
    .join(" ");
}

function computeChurnsPerFiles(
  gitLogOutput: string,
  directory: string,
  filters: string[] | undefined
): Map<Path, number> {
  const changedFiles = gitLogOutput
    .split(PER_LINE)
    .filter((line) => line !== "")
    .sort();

  return changedFiles.reduce((map: Map<Path, number>, path) => {
    applyFiltersAndExcludeObsoletePath(path, map);
    return map;
  }, new Map());

  function applyFiltersAndExcludeObsoletePath(
    path: string,
    map: Map<Path, number>
  ) {
    if (!filters || !filters.length) {
      if (pathStillExists(path)) {
        addOrIncrement(map, path);
      }
    } else {
      const pathHasAMatch = filters.every((f) => micromatch.isMatch(path, f));
      if (pathHasAMatch) {
        if (pathStillExists(path)) {
          addOrIncrement(map, path);
        }
      }
    }
  }

  function addOrIncrement(map: Map<Path, number>, path: string) {
    map.set(path, (map.get(path) ?? 0) + 1);
  }

  function pathStillExists(fileName: string) {
    return existsSync(resolve(directory, fileName));
  }
}

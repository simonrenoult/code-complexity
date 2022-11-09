import { execSync } from "child_process";
import { existsSync } from "fs";
import * as micromatch from "micromatch";
import { resolve } from "path";

import { Options, Path } from "./types";
import { buildDebugger, withDuration } from "../utils";

type ParsedLine = { relativePath: string; commitCount: string };
const internal = { debug: buildDebugger("churn") };
const PER_LINE = "\n";

export default {
  compute: (...args: any[]): Promise<Map<Path, number>> =>
    withDuration(compute, args, internal.debug),
};

async function compute(options: Options): Promise<Map<Path, number>> {
  assertGitIsInstalled();
  assertIsGitRootDirectory(options.directory);

  const gitLogCommand = buildGitLogCommand(options);
  const rawStringOfAllChurns = executeGitLogCommand(gitLogCommand);
  const arrayOfAllChurns = computeNumberOfTimesFilesChanged(
    rawStringOfAllChurns,
    options.directory
  );
  const mapOfAllChurns = createMapOfChurnsPerFile(arrayOfAllChurns);
  return applyUserFilters(mapOfAllChurns, options.filter);
}

function applyUserFilters(
  allChurns: Map<Path, number>,
  filter: string[] | undefined
): Map<Path, number> {
  const filteredChurns: Map<Path, number> = new Map();
  allChurns.forEach((churn: number, path: Path) => {
    const patchIsAMatch =
      filter && filter.length > 0
        ? filter.every((f) => micromatch.isMatch(path, f))
        : true;

    if (patchIsAMatch) filteredChurns.set(path, churn);
  });
  return filteredChurns;
}

function createMapOfChurnsPerFile(
  numberOfTimesFilesChanged: ParsedLine[]
): Map<Path, number> {
  return numberOfTimesFilesChanged.reduce(
    (map: Map<Path, number>, { relativePath, commitCount }: ParsedLine) => {
      const path: Path = relativePath;
      const churn = parseInt(commitCount, 10);
      map.set(path, churn);
      return map;
    },
    new Map()
  );
}

function executeGitLogCommand(gitLogCommand: string): string {
  return execSync(gitLogCommand, { encoding: "utf8" });
}

function assertGitIsInstalled(): void {
  try {
    execSync("which git");
  } catch (error) {
    throw new Error("Program 'git' must be installed");
  }
}

function assertIsGitRootDirectory(directory: string): void {
  if (!existsSync(`${directory}/.git`)) {
    throw new Error(`Argument 'dir' must be the git root directory.`);
  }
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

function computeNumberOfTimesFilesChanged(
  gitLogOutput: string,
  directory: string
): ParsedLine[] {
  const changedFiles = gitLogOutput
    .split(PER_LINE)
    .filter((line) => line !== "")
    .sort();

  const changedFilesCount = changedFiles.reduce(
    (fileAndTimeChanged: { [fileName: string]: number }, fileName) => {
      fileAndTimeChanged[fileName] = (fileAndTimeChanged[fileName] || 0) + 1;
      return fileAndTimeChanged;
    },
    {}
  );

  return Object.keys(changedFilesCount)
    .map(
      (changedFileName) =>
        ({
          relativePath: changedFileName,
          commitCount: changedFilesCount[changedFileName].toString(),
        } as ParsedLine)
    )
    .filter((parsedLine: ParsedLine) => {
      return existsSync(resolve(directory, parsedLine.relativePath));
    });
}

import { execSync } from "child_process";
import { existsSync } from "fs";
import * as micromatch from "micromatch";
import { resolve } from "path";

import { Options, Path } from "./types";
import { buildDebugger, withDuration } from "../utils";

type ParsedLine = { relativePath: string; commitCount: string };
const internal = { debug: buildDebugger("churn") };

export default {
  compute: (...args: any[]): Promise<Map<Path, number>> =>
    withDuration(compute, args, internal.debug),
};

async function compute(options: Options): Promise<Map<Path, number>> {
  assertGitIsInstalled();
  assertIsGitRootDirectory(options.directory);

  const isWindows = process.platform === "win32";
  const gitLogCommand = buildGitLogCommand(options, isWindows);

  internal.debug(`command to measure churns: ${gitLogCommand}`);

  const gitLogStdout = execSync(gitLogCommand, { encoding: "utf8" });

  const parsedLines: ParsedLine[] = computeNumberOfTimesFilesChanged(
    gitLogStdout,
    isWindows
  ).filter((parsedLine: ParsedLine) => {
    return existsSync(resolve(options.directory, parsedLine.relativePath));
  });

  const allChurns = parsedLines.reduce(
    (map: Map<Path, number>, { relativePath, commitCount }: ParsedLine) => {
      const path: Path = relativePath;
      const churn = parseInt(commitCount, 10);
      map.set(path, churn);
      return map;
    },
    new Map()
  );

  internal.debug(
    `${allChurns.size} files to compute churn on (before filters)`
  );

  const filteredChurns: Map<Path, number> = new Map();
  allChurns.forEach((churn: number, path: Path) => {
    const patchIsAMatch =
      options.filter && options.filter.length > 0
        ? options.filter.every((f) => micromatch.isMatch(path, f))
        : true;

    if (patchIsAMatch) filteredChurns.set(path, churn);
  });

  internal.debug(
    `${filteredChurns.size} files to compute churn on (after filters)`
  );

  return filteredChurns;
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

function buildGitLogCommand(options: Options, isWindows: boolean): string {
  return [
    "git",
    `-C ${options.directory}`,
    `log`,
    `--follow`,

    // https://github.com/git-for-windows/git/issues/3131
    `--format='${isWindows ? "%s" : ""}'`,
    `--name-only`,
    options.since ? `--since="${options.since}"` : "",

    // In windows CMD if you specify '*' it will output an empty line
    isWindows ? "*" : "'*'",
  ]
    .filter((s) => s.length > 0)
    .join(" ");
}

function computeNumberOfTimesFilesChanged(
  gitLogCommand: string,
  isWindows: boolean
): ParsedLine[] {
  if (isWindows) {
    /**
     * This will remove all the commit messages from the git log output
     * Git log output in Windows for example is:
     * ```
     * 'doc: add michael feathers excerpt'
     *
     * README.md
     * 'fix: use valid command for travis'
     *
     * .travis.yml
     * 'doc: update readme description'
     *
     * README.md
     * ```
     */
    gitLogCommand = gitLogCommand.replace(/.*(\r\n|\r|\n){2}/g, "");
  }

  const changedFiles = gitLogCommand
    .split("\n")
    .filter((line) => line !== "")
    .sort();

  const changedFilesCount = changedFiles.reduce(
    (fileAndTimeChanged: { [fileName: string]: number }, fileName) => {
      fileAndTimeChanged[fileName] = (fileAndTimeChanged[fileName] || 0) + 1;
      return fileAndTimeChanged;
    },
    {}
  );

  return Object.keys(changedFilesCount).map(
    (changedFileName) =>
      ({
        relativePath: changedFileName,
        commitCount: changedFilesCount[changedFileName].toString(),
      } as ParsedLine)
  );
}

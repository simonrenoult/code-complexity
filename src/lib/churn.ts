import { existsSync } from "fs";
import * as micromatch from "micromatch";
import { resolve } from "path";

import git from "simple-git";
import { buildDebugger, withDuration } from "../utils";
import { Options, Path } from "./types";

type ParsedLine = { relativePath: string; commitCount: string };
const internal = { debug: buildDebugger("churn") };
const PER_LINE = "\n";

export default {
  compute: (...args: any[]): Promise<Map<Path, number>> =>
    withDuration(compute, args, internal.debug),
};

async function compute(options: Options): Promise<Map<Path, number>> {
  //assertGitIsInstalled();
  //assertIsGitRootDirectory(options.directory);

  const isWindows = process.platform === "win32";

  const gitcli = await git(options.directory);
  const gitLogCommand = await buildGitLogCommand(options, isWindows);
  console.log(gitLogCommand);

  const log = await gitcli.log(gitLogCommand.filter(r => r !== ''));
  

  internal.debug(`command to measure churns: ${gitLogCommand}`);

  //const gitLogStdout = execSync(gitLogCommand, { encoding: "utf8" });

  const parsedLines: ParsedLine[] = computeNumberOfTimesFilesChanged(
    log.latest?.hash || ""
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

async function buildGitLogCommand(options: Options, isWindows: boolean): Promise<string[]> {
  return [
    `--follow`,

    // Windows CMD handle quotes differently than linux, this is why we should put empty string as said in:
    // https://github.com/git-for-windows/git/issues/3131
    `--pretty=format:${isWindows ? "" : "''"}`,
    `--name-only`,
    options.since ? `--since="${options.since}"` : "",
    options.until ? `--until="${options.until}"` : "",

    // Windows CMD handle quotes differently
    isWindows ? "*" : "'*'",
  ];
}

function computeNumberOfTimesFilesChanged(gitLogOutput: string): ParsedLine[] {
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

  return Object.keys(changedFilesCount).map(
    (changedFileName) =>
      ({
        relativePath: changedFileName,
        commitCount: changedFilesCount[changedFileName].toString(),
      } as ParsedLine)
  );
}

import { execSync } from "child_process";
import { existsSync } from "fs";
import * as micromatch from "micromatch";
import { resolve } from "path";

import { Options, Path } from "./types";
import { buildDebugger, withDuration } from "../utils";

type ParsedLine = { relativePath: string; commitCount: string };
const internal = { debug: buildDebugger("churn") };
const PER_LINE = "\n";
const COMMITS_PER_FILE_REGEX = /(?<commitCount>[0-9]+) (?<relativePath>.+)/;

export default {
  compute: (...args: any[]): Promise<Map<Path, number>> =>
    withDuration(compute, args, internal.debug),
};

async function compute(options: Options): Promise<Map<Path, number>> {
  assertGitIsInstalled();
  assertIsGitRootDirectory(options.directory);

  const gitLogCommand = buildGitLogCommand(options);

  internal.debug(`command to measure churns: ${gitLogCommand}`);

  const gitLogStdout = execSync(gitLogCommand, { encoding: "utf8" });
  const gitLogStdoutLines = gitLogStdout.split(PER_LINE);

  const parsedLines: ParsedLine[] = gitLogStdoutLines
    .map((line: string): string => line.trim())
    .filter((line: string): boolean => line.length !== 0)
    .map(
      (line: string): ParsedLine => {
        const matches = line.match(COMMITS_PER_FILE_REGEX);
        if (!matches || !matches.groups) {
          throw new Error("An error occurred while computing churns");
        }

        const { relativePath, commitCount } = matches.groups;
        return { relativePath, commitCount };
      }
    )
    .filter((parsedLine: ParsedLine) => {
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

function buildGitLogCommand(options: Options): string {
  return [
    [
      "git",
      `-C ${options.directory}`,
      `log`,
      `--follow`,
      `--format=''`,
      `--name-only`,
      options.since ? `--since="${options.since}"` : "",
      "'*'",
    ]
      .filter((s) => s.length > 0)
      .join(" "),
    "sort",
    // --count might not be supported by all OS
    "uniq -c",
  ].join(" | ");
}

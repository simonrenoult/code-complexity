import { execSync } from "child_process";
import { existsSync, lstatSync } from "fs";
import { resolve } from "path";

const PER_LINE = "\n";
const COMMITS_PER_FILE = /(?<commitCount>[0-9]+) (?<relativePathToFile>.+)/;

export class CommitCountPerFile {
  constructor(
    public readonly relativePathToFile: string,
    public readonly absolutePathToFile: string,
    public readonly commitCount: number
  ) {}
}

export async function countCommitsPerFile(
  directory,
  options: { firstParent; since }
): Promise<CommitCountPerFile[]> {
  assertGitIsInstalled();
  assertIsDirectory(directory);
  assertIsGitRootDirectory(directory);

  const command = buildCommand(directory, options);
  const stdout = execSync(command, { encoding: "utf8" });

  return stdout
    .split(PER_LINE)
    .map(trim)
    .filter(jsOrTsOnly)
    .map(toCommitCountPerFile(directory))
    .filter(ignoreFilesThatNoLongerExist);
}

function assertGitIsInstalled(): void {
  try {
    execSync("which git");
  } catch (error) {
    throw new Error("Program 'git' must be installed");
  }
}

function assertIsDirectory(directory: string): void {
  if (!lstatSync(directory).isDirectory()) {
    throw new Error(`Argument 'dir' must be a directory.`);
  }
}

function assertIsGitRootDirectory(directory: string): void {
  if (!existsSync(`${directory}/.git`)) {
    throw new Error(`Argument 'dir' must be the git root directory.`);
  }
}

function buildCommand(directory, { firstParent, since }): string {
  const firstParentFlag = firstParent ? "--first-parent" : "";
  const sinceParameter = since ? `--since="${since}"` : "";
  return [
    `git -C ${directory} log ${sinceParameter} ${firstParentFlag} --name-only --format=''`,
    "sort",
    "uniq --count"
  ].join(" | ");
}

function trim(s): string {
  return s.trim();
}

function jsOrTsOnly(s): string {
  return s.endsWith(".js") || s.endsWith(".ts");
}

function toCommitCountPerFile(directory) {
  return (line: string): CommitCountPerFile => {
    const { groups } = line.match(COMMITS_PER_FILE);
    return new CommitCountPerFile(
      groups.relativePathToFile,
      resolve(directory, groups.relativePathToFile),
      parseInt(groups.commitCount, 10)
    );
  };
}

function ignoreFilesThatNoLongerExist(
  commitCountPerFile: CommitCountPerFile
): boolean {
  return existsSync(commitCountPerFile.absolutePathToFile);
}

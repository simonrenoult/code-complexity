import { execSync } from "child_process";
import { existsSync, lstatSync } from "fs";
import { resolve } from "path";

export async function countCommitsPerFile(
  directory,
  options: { firstParent; since }
): Promise<CommitCountPerFile[]> {
  assertGitIsInstalled();
  assertIsDirectory(directory);

  const command = buildCommand(directory, options);
  const stdout = execSync(command, { encoding: "utf8" });

  return stdout
    .split(PER_LINE)
    .map(trim)
    .filter(jsOnly)
    .map(line => {
      const { groups } = line.match(COMMITS_PER_FILE);
      return new CommitCountPerFile(
        groups.relativePathToFile,
        resolve(directory, groups.relativePathToFile),
        parseInt(groups.commitCount, 10)
      );
    })
    .filter(ignoreFilesThatNoLongerExist);
}

const PER_LINE = "\n";
const trim = (s): string => s.trim();
const jsOnly = (s): string => s.endsWith(".js");
const COMMITS_PER_FILE = /(?<commitCount>[0-9]+) (?<relativePathToFile>.+)/;
const ignoreFilesThatNoLongerExist = (
  commitCountPerFile: CommitCountPerFile
): boolean => existsSync(commitCountPerFile.absolutePathToFile);

export class CommitCountPerFile {
  constructor(
    public readonly relativePathToFile: string,
    public readonly absolutePathToFile: string,
    public readonly commitCount: number
  ) {}
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

function buildCommand(directory, { firstParent, since }): string {
  const firstParentFlag = firstParent ? "--first-parent" : "";
  const sinceParameter = since ? `--since="${since}"` : "";
  return [
    `git -C ${directory} log ${sinceParameter} ${firstParentFlag} --name-only --format=''`,
    "sort",
    "uniq -c"
  ].join(" | ");
}

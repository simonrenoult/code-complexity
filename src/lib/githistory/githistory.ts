import * as micromatch from "micromatch";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { Options, Path } from "../types";

export type History = Path[];

export default class GitHistory {
  private options: Options;

  public readonly history: History;
  public readonly files: Path[];

  public static build(options: Options) {
    return new GitHistory(options);
  }

  private constructor(options: Options) {
    this.options = options;

    this.history = this.buildHistory();
    this.files = this.listFiles();
  }

  private buildGitLogCommand(): string {
    const isWindows = process.platform === "win32";

    return [
      "git",
      `-C ${this.options.directory}`,
      `log`,
      `--follow`,

      // Windows CMD handle quotes differently than linux, this is why we should put empty string as said in:
      // https://github.com/git-for-windows/git/issues/3131
      `--format=${isWindows ? "" : "''"}`,
      `--name-only`,
      this.options.since ? `--since="${this.options.since}"` : "",
      this.options.until ? `--until="${this.options.until}"` : "",

      // Windows CMD handle quotes differently
      isWindows ? "*" : "'*'",
    ]
      .filter((s) => s.length > 0)
      .join(" ");
  }

  private buildHistory(): Path[] {
    const gitLogCommand = this.buildGitLogCommand();
    const stdout = this.executeGitLogCommand(gitLogCommand);
    return stdout
      .split("\n")
      .filter((line) => {
        if (line.trim().length === 0) {
          return false;
        }
        if (!this.pathStillExists(line)) {
          return false;
        }
        if (!this.filterMatches(line)) {
          return false;
        }
        return true;
      })
      .sort();
  }

  private executeGitLogCommand(gitLogCommand: string): string {
    return execSync(gitLogCommand, { encoding: "utf8", maxBuffer: 32_000_000 });
  }

  private listFiles(): string[] {
    return [...new Set(this.history)];
  }

  private pathStillExists(fileName: string) {
    return existsSync(resolve(this.options.directory, fileName));
  }

  private filterMatches(file: string) {
    if (this.options.filter && this.options.filter.length) {
      return this.options.filter.every((f) => micromatch.isMatch(file, f));
    }
    return true;
  }
}

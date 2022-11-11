import { execSync } from "child_process";
import { appendFileSync, writeFileSync } from "fs";
import { sep } from "path";

export default class VersionedFileFixture {
  constructor(private readonly repositoryLocation: string) {}

  private name = "example.js";
  private numberOfLinesInFile = 10;
  private numberOfCommitsForFile = 10;
  private content?: string;
  private commitDate?: string;

  withName(name: string): VersionedFileFixture {
    this.name = name;
    return this;
  }

  containing(args: { lines: number } | string): VersionedFileFixture {
    if (typeof args === "string") {
      this.content = args;
    } else {
      this.numberOfLinesInFile = args.lines;
    }
    return this;
  }

  committed(args: { times: number; date?: string }): VersionedFileFixture {
    this.numberOfCommitsForFile = args.times;
    this.commitDate = args.date;
    return this;
  }

  writeOnDisk(): void {
    for (let i = 0; i < this.numberOfCommitsForFile; i++) {
      if (i === 0) {
        this.createFileWithContentInRepository();
        this.addFileToRepository();
      } else {
        this.modifyFileWithoutChangingItsLength(i);
      }
      this.commitFile(i);
    }
  }

  private commitFile(commitNumber: number): void {
    const commitMessage = `"${this.name}: commit #${commitNumber + 1}"`;
    const command = this.commitDate
      ? `GIT_COMMITTER_DATE="${this.commitDate}" git -C ${this.repositoryLocation} commit --all --message=${commitMessage} --date=${this.commitDate}`
      : `git -C ${this.repositoryLocation} commit --all --message=${commitMessage}`;
    try {
      execSync(command);
    } catch (e: any) {
      console.log(e.stdout.toString());
      throw e;
    }
  }

  private modifyFileWithoutChangingItsLength(commitNumber: number): void {
    appendFileSync(
      `${this.repositoryLocation}${sep}${this.name}`,
      `// change for commit #${commitNumber + 1} `
    );
  }

  private createFileWithContentInRepository(): void {
    const fileContent =
      this.content ||
      new Array(this.numberOfLinesInFile)
        .fill(null)
        .map((value, index) => `console.log(${index});`)
        .join("\n");

    writeFileSync(`${this.repositoryLocation}${sep}${this.name}`, fileContent);
  }

  private addFileToRepository(): void {
    execSync(`git -C ${this.repositoryLocation} add --all`);
  }
}

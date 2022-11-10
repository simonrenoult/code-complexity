import { execSync } from "child_process";
import { appendFileSync, writeFileSync } from "fs";
import { sep } from "path";

export default class VersionedFileFixture {
  constructor(private readonly repositoryLocation: string) {}

  private name = "example.js";
  private numberOfLinesInFile = 10;
  private numberOfCommitsForFile = 10;
  private commitDate?: string;

  withName(name: string): VersionedFileFixture {
    this.name = name;
    return this;
  }

  containing(args: { lines: number }): VersionedFileFixture {
    this.numberOfLinesInFile = args.lines;
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
        this.createFileWithContentInRepository(this.name);
        this.addFileToRepository();
      } else {
        this.modifyFileWithoutChangingItsLength(i);
      }
      this.commitFile(i);
    }
  }

  private commitFile(i: number): void {
    const commitMessage = `"${this.name}: commit #${i + 1}"`;
    const command = this.commitDate
      ? `GIT_COMMITTER_DATE="${this.commitDate}" git -C ${this.repositoryLocation} commit --all --message=${commitMessage} --date=${this.commitDate}`
      : `git -C ${this.repositoryLocation} commit --all --message=${commitMessage}`;
    try {
      execSync(command);
    } catch (e) {
      console.log(e.stdout.toString());
      throw e;
    }
  }

  private modifyFileWithoutChangingItsLength(i: number): void {
    appendFileSync(
      `${this.repositoryLocation}${sep}${this.name}`,
      `// change for commit #${i + 1} `
    );
  }

  private createFileWithContentInRepository(fileName: string): void {
    writeFileSync(
      `${this.repositoryLocation}${sep}${fileName}`,
      new Array(this.numberOfLinesInFile)
        .fill(null)
        .map((value, index) => `console.log(${index});`)
        .join("\n")
    );
  }

  private addFileToRepository(): void {
    execSync(`git -C ${this.repositoryLocation} add --all`);
  }
}

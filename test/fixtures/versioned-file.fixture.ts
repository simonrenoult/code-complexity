import { execSync } from "child_process";
import { appendFileSync, mkdirSync, writeFileSync } from "fs";
import * as NodePath from "path";

export default class VersionedFileFixture {
  constructor(private readonly repositoryLocation: string) {}

  private name = "example.js";
  private numberOfLinesInFile = 10;
  private numberOfCommitsForFile = 10;
  private content?: string;
  private commitDate?: string;
  private removed = false;

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

  isRemoved(value: boolean): VersionedFileFixture {
    this.removed = value;
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

    if (this.removed) {
      this.removeAndCommit();
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
      `${this.getFileLocation()}`,
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

    mkdirSync(NodePath.parse(this.getFileLocation()).dir, { recursive: true });
    writeFileSync(this.getFileLocation(), fileContent);
  }

  private addFileToRepository(): void {
    execSync(`git -C ${this.repositoryLocation} add --all`);
  }

  private removeAndCommit() {
    const message = `"${this.name}: removed"`;
    const commands = [
      `git -C ${this.repositoryLocation} rm ${this.getFileLocation()}`,
      `git -C ${this.repositoryLocation} commit --message=${message}`,
    ].join("&&");
    try {
      execSync(commands);
    } catch (e: any) {
      console.log(e.stdout.toString());
      throw e;
    }
  }

  private getFileLocation(): string {
    return `${this.repositoryLocation}${NodePath.sep}${this.name}`;
  }
}

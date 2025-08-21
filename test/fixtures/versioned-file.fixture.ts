import * as NodePath from "node:path";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

export default class VersionedFileFixture {
  #name = "example.js";
  #numberOfLinesInFile = 10;
  #numberOfCommitsForFile = 10;
  #removed = false;
  #repositoryLocation: string;
  #content?: string;
  #commitDate?: string;

  constructor(repositoryLocation: string) {
    this.#repositoryLocation = repositoryLocation;
  }

  withName(name: string): VersionedFileFixture {
    this.#name = name;
    return this;
  }

  containing(args: { lines: number } | string): VersionedFileFixture {
    if (typeof args === "string") {
      this.#content = args;
    } else {
      this.#numberOfLinesInFile = args.lines;
    }
    return this;
  }

  committed(args: { times: number; date?: string }): VersionedFileFixture {
    this.#numberOfCommitsForFile = args.times;
    this.#commitDate = args.date;
    return this;
  }

  isRemoved(value: boolean): VersionedFileFixture {
    this.#removed = value;
    return this;
  }

  writeOnDisk(): void {
    for (let i = 0; i < this.#numberOfCommitsForFile; i++) {
      if (i === 0) {
        this.#createFileWithContentInRepository();
        this.#addFileToRepository();
      } else {
        this.#modifyFileWithoutChangingItsLength(i);
      }
      this.#commitFile(i);
    }

    if (this.#removed) {
      this.#removeAndCommit();
    }
  }

  #commitFile(commitNumber: number): void {
    const commitMessage = `"${this.#name}: commit #${commitNumber + 1}"`;
    const command = this.#commitDate
      ? `GIT_COMMITTER_DATE="${this.#commitDate}" git -C ${
          this.#repositoryLocation
        } commit --all --message=${commitMessage} --date=${this.#commitDate}`
      : `git -C ${
          this.#repositoryLocation
        } commit --all --message=${commitMessage}`;

    execSync(command);
  }

  #modifyFileWithoutChangingItsLength(commitNumber: number): void {
    appendFileSync(
      `${this.#getFileLocation()}`,
      `// change for commit #${commitNumber + 1} `,
    );
  }

  #createFileWithContentInRepository(): void {
    const fileContent =
      this.#content ||
      new Array(this.#numberOfLinesInFile)
        .fill(null)
        .map((value, index) => `console.log(${index});`)
        .join("\n");

    mkdirSync(NodePath.parse(this.#getFileLocation()).dir, { recursive: true });
    writeFileSync(this.#getFileLocation(), fileContent);
  }

  #addFileToRepository(): void {
    execSync(`git -C ${this.#repositoryLocation} add --all`);
  }

  #removeAndCommit() {
    const message = `"${this.#name}: removed"`;
    const commands = [
      `git -C ${this.#repositoryLocation} rm ${this.#getFileLocation()}`,
      `git -C ${this.#repositoryLocation} commit --message=${message}`,
    ].join("&&");

    execSync(commands);
  }

  #getFileLocation(): string {
    return `${this.#repositoryLocation}${NodePath.sep}${this.#name}`;
  }
}

import { tmpdir } from "os";
import { sep } from "path";
import { existsSync, mkdirSync, rmdirSync } from "fs";
import { execSync } from "child_process";
import VersionedFileFixture from "./versioned-file.fixture";

export default class TestRepositoryFixture {
  private readonly systemTemporaryDirectory = tmpdir();
  public static readonly testRepositoryName = "code-complexity-test-directory";

  public readonly location: string;
  private files: {
    name: string;
    content?: string;
    commits?: number;
    lines?: number;
    date?: string;
    removed?: boolean;
  }[] = [];

  constructor() {
    this.location = `${this.systemTemporaryDirectory}${sep}${TestRepositoryFixture.testRepositoryName}`;
  }

  addFile(args: {
    name: string;
    content?: string;
    commits?: number;
    lines?: number;
    date?: string;
    removed?: boolean;
  }): this {
    this.files.push(args);
    return this;
  }

  public writeOnDisk(): this {
    if (existsSync(this.location)) {
      rmdirSync(this.location, { recursive: true });
    }
    mkdirSync(this.location);
    execSync(`git -C ${this.location} init`);

    this.files.forEach((file) => {
      new VersionedFileFixture(this.location)
        .withName(file.name)
        .containing(file.content ?? { lines: file.lines ?? 1 })
        .committed({ times: file.commits ?? 1, date: file.date })
        .isRemoved(file.removed ?? false)
        .writeOnDisk();
    });

    return this;
  }
}

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
    commits?: number;
    lines?: number;
    date?: string;
  }[] = [];

  constructor() {
    this.location = `${this.systemTemporaryDirectory}${sep}${TestRepositoryFixture.testRepositoryName}`;
  }

  addFile(args: {
    name: string;
    commits?: number;
    lines?: number;
    date?: string;
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

    this.files.forEach((f) => {
      new VersionedFileFixture(this.location)
        .withName(f.name)
        .containing({ lines: f.lines || 1 })
        .committed({ times: f.commits || 1, date: f.date })
        .writeOnDisk();
    });

    return this;
  }
}

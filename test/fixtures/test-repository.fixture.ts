import { existsSync, mkdirSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import { sep } from "node:path";
import { tmpdir } from "node:os";

import VersionedFileFixture from "./versioned-file.fixture";

export default class TestRepositoryFixture {
  static testRepositoryName = "code-complexity-test-directory";
  location: string;
  #systemTemporaryDirectory = tmpdir();
  #files: {
    name: string;
    content?: string;
    commits?: number;
    lines?: number;
    date?: string;
    removed?: boolean;
  }[] = [];

  constructor() {
    this.location = `${this.#systemTemporaryDirectory}${sep}${
      TestRepositoryFixture.testRepositoryName
    }`;
  }

  addFile(args: {
    name: string;
    content?: string;
    commits?: number;
    lines?: number;
    date?: string;
    removed?: boolean;
  }): this {
    this.#files.push(args);
    return this;
  }

  writeOnDisk(): this {
    if (existsSync(this.location)) {
      rmSync(this.location, { recursive: true });
    }
    mkdirSync(this.location);
    execSync(`git -C ${this.location} init`);

    this.#files.forEach((file) => {
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

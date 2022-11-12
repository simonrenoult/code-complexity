import { execSync } from "child_process";
import TestRepositoryFixture from "../fixtures/test-repository.fixture";
import { expect } from "chai";

describe("CLI", () => {
  context("when format is json", () => {
    it("generates the appropriate output", () => {
      // Given
      const repo = new TestRepositoryFixture();
      repo
        .addFile({ name: "a.js", lines: 2, commits: 2 })
        .addFile({ name: "b.ts", lines: 1, commits: 1 })
        .writeOnDisk();

      // When
      const result = execSync(
        `npx ts-node bin/code-complexity.ts ${repo.location} --format=json`,
        { encoding: "utf8" }
      ).trim();

      // Then
      expect(result).to.deep.equal(
        JSON.stringify([
          { path: "a.js", churn: 2, complexity: 2, score: 4 },
          { path: "b.ts", churn: 1, complexity: 1, score: 1 },
        ])
      );
    });
  });

  context("when format is csv", () => {
    it("generates the appropriate output", () => {
      // Given
      const repo = new TestRepositoryFixture();
      repo
        .addFile({ name: "a.js", lines: 2, commits: 2 })
        .addFile({ name: "b.ts", lines: 1, commits: 1 })
        .writeOnDisk();

      // When
      const result = execSync(
        `npx ts-node bin/code-complexity.ts ${repo.location} --format=csv`,
        { encoding: "utf8" }
      ).trim();

      // Then
      expect(result).to.deep.equal(
        ["file,complexity,churn,score", "a.js,2,2,4", "b.ts,1,1,1"].join("\n")
      );
    });
  });
});

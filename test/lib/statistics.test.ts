import { expect } from "chai";
import { sep } from "path";

import Statistics from "../../src/lib";
import { Options } from "../../src/lib/types";
import { tmpdir } from "os";
import TestRepositoryFixture from "../fixtures/test-repository.fixture";

describe("Statistics", () => {
  const defaultOptions: Options = {
    directory: tmpdir() + sep + TestRepositoryFixture.testRepositoryName,
    target: tmpdir() + sep + TestRepositoryFixture.testRepositoryName,
    format: "table",
    filter: [],
    limit: 3,
    since: undefined,
    sort: "score",
  };

  context("options.limit", () => {
    it("returns the appropriate number of elements", async () => {
      // Given
      const options: Options = { ...defaultOptions, limit: 3 };
      await new TestRepositoryFixture()
        .addFile({ name: "a.js" })
        .addFile({ name: "b.js" })
        .addFile({ name: "c.js" })
        .addFile({ name: "d.js" })
        .writeOnDisk();

      // When
      const result = await Statistics.compute(options);

      // Then
      const statistics = Array.from(result.values());
      expect(statistics).to.have.length(3);
    });
  });

  context("options.filter", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const options: Options = {
        ...defaultOptions,
        filter: ["*.js"],
      };
      await new TestRepositoryFixture()
        .addFile({ name: "a.js" })
        .addFile({ name: "b.md" })
        .addFile({ name: "c.js" })
        .writeOnDisk();

      // When
      const result = await Statistics.compute(options);
      const statistics = Array.from(result.values());

      // Then
      expect(statistics).to.deep.equal([
        {
          churn: 1,
          complexity: 1,
          path: "a.js",
          score: 1,
        },
        {
          churn: 1,
          complexity: 1,
          path: "c.js",
          score: 1,
        },
      ]);
    });
  });

  context("options.since", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const options: Options = { ...defaultOptions, since: "2010-01-01" };
      await new TestRepositoryFixture()
        .addFile({ name: "a.js", date: "2000-01-01T00:00:00" })
        .addFile({ name: "b.js", date: "2020-01-01T00:00:00" })
        .addFile({ name: "c.js", date: "2020-01-01T00:00:00" })
        .writeOnDisk();

      // When
      const result = await Statistics.compute(options);
      const statistics = Array.from(result.values());

      // Then
      expect(statistics).to.deep.equal([
        {
          churn: 1,
          complexity: 1,
          path: "b.js",
          score: 1,
        },
        {
          churn: 1,
          complexity: 1,
          path: "c.js",
          score: 1,
        },
      ]);
    });
  });

  context("options.sort=score", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const options: Options = { ...defaultOptions, sort: "score" };
      await new TestRepositoryFixture()
        .addFile({ name: "a.js", lines: 1, commits: 4 })
        .addFile({ name: "b.js", lines: 3, commits: 3 })
        .addFile({ name: "c.js", lines: 3, commits: 2 })
        .addFile({ name: "d.js", lines: 4, commits: 2 })
        .writeOnDisk();

      // When
      const result = await Statistics.compute(options);
      const statistics = Array.from(result.values());

      // Then
      expect(statistics).to.deep.equal([
        {
          churn: 3,
          complexity: 3,
          path: "b.js",
          score: 9,
        },
        {
          churn: 2,
          complexity: 4,
          path: "d.js",
          score: 8,
        },
        {
          churn: 2,
          complexity: 3,
          path: "c.js",
          score: 6,
        },
      ]);
    });
  });

  context("options.sort=complexity", () => {
    context("when using cyclomatic strategy", () => {
      it("returns the appropriate elements", async () => {
        // Given
        const options: Options = {
          ...defaultOptions,
          sort: "complexity",
          complexityStrategy: "cyclomatic",
        };
        await new TestRepositoryFixture()
          .addFile({
            name: "a.ts",
            content: "if (true) if (true) console.log();",
          })
          .writeOnDisk();

        // When
        const result = await Statistics.compute(options);
        const statistics = Array.from(result.values());

        // Then
        expect(statistics).to.deep.equal([
          {
            churn: 1,
            complexity: 3,
            path: "a.ts",
            score: 3,
          },
        ]);
      });
    });

    context("when using halstead strategy", () => {
      it("returns the appropriate elements", async () => {
        // Given
        const options: Options = {
          ...defaultOptions,
          sort: "complexity",
          complexityStrategy: "halstead",
        };
        await new TestRepositoryFixture()
          .addFile({
            name: "a.ts",
            content: "if (true) if (true) console.log();",
          })
          .writeOnDisk();

        // When
        const result = await Statistics.compute(options);
        const statistics = Array.from(result.values());

        // Then
        expect(statistics).to.deep.equal([
          {
            churn: 1,
            complexity: 25.26619429851844,
            path: "a.ts",
            score: 25.26619429851844,
          },
        ]);
      });
    });

    context("when using sloc strategy", () => {
      it("returns the appropriate elements", async () => {
        // Given
        const options: Options = { ...defaultOptions, sort: "complexity" };
        await new TestRepositoryFixture()
          .addFile({ name: "a.js", lines: 8 })
          .addFile({ name: "b.js", lines: 6 })
          .addFile({ name: "c.js", lines: 2 })
          .addFile({ name: "d.js", lines: 4 })
          .writeOnDisk();

        // When
        const result = await Statistics.compute(options);
        const statistics = Array.from(result.values());

        // Then
        expect(statistics).to.deep.equal([
          {
            churn: 1,
            complexity: 8,
            path: "a.js",
            score: 8,
          },
          {
            churn: 1,
            complexity: 6,
            path: "b.js",
            score: 6,
          },
          {
            churn: 1,
            complexity: 4,
            path: "d.js",
            score: 4,
          },
        ]);
      });
    });
  });

  context("options.sort=churn", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const options: Options = { ...defaultOptions, sort: "churn" };
      await new TestRepositoryFixture()
        .addFile({ name: "a.js", commits: 7 })
        .addFile({ name: "b.js", commits: 3 })
        .addFile({ name: "c.js", commits: 5 })
        .addFile({ name: "d.js", commits: 2 })
        .writeOnDisk();

      // When
      const result = await Statistics.compute(options);
      const statistics = Array.from(result.values());

      // Then
      expect(statistics).to.deep.equal([
        {
          churn: 7,
          complexity: 1,
          path: "a.js",
          score: 7,
        },
        {
          churn: 5,
          complexity: 1,
          path: "c.js",
          score: 5,
        },
        {
          churn: 3,
          complexity: 1,
          path: "b.js",
          score: 3,
        },
      ]);
    });
  });

  context("options.sort=file", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const options: Options = { ...defaultOptions, sort: "file" };
      await new TestRepositoryFixture()
        .addFile({ name: "d.js", lines: 1, commits: 4 })
        .addFile({ name: "a.js", lines: 2, commits: 3 })
        .addFile({ name: "c.js", lines: 3, commits: 2 })
        .addFile({ name: "b.js", lines: 4, commits: 1 })
        .writeOnDisk();

      // When
      const result = await Statistics.compute(options);
      const statistics = Array.from(result.values());

      // Then
      expect(statistics).to.deep.equal([
        {
          churn: 3,
          complexity: 2,
          path: "a.js",
          score: 6,
        },
        {
          churn: 1,
          complexity: 4,
          path: "b.js",
          score: 4,
        },
        {
          churn: 2,
          complexity: 3,
          path: "c.js",
          score: 6,
        },
      ]);
    });
  });
});

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
    format: "json",
    filter: [],
    limit: 3,
    since: undefined,
    sort: "score",
  };

  context("options.limit", () => {
    it("returns the appropriate number of elements", async () => {
      // Given
      const options: Options = { ...defaultOptions, limit: 3 };
      new TestRepositoryFixture()
        .addFile({ name: "a.js" })
        .addFile({ name: "b.js" })
        .addFile({ name: "c.js" })
        .addFile({ name: "d.js" })
        .writeOnDisk();

      // When
      const result = await Statistics.compute(options);

      // Then
      const statistics = result.map((s) => s.toState());
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
      new TestRepositoryFixture()
        .addFile({ name: "a.js" })
        .addFile({ name: "b.md" })
        .addFile({ name: "c.js" })
        .writeOnDisk();

      // When
      const result = await Statistics.compute(options);
      const statistics = result.map((s) => s.toState());

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
      new TestRepositoryFixture()
        .addFile({ name: "a.js", date: "2000-01-01T00:00:00" })
        .addFile({ name: "b.js", date: "2020-01-01T00:00:00" })
        .addFile({ name: "c.js", date: "2020-01-01T00:00:00" })
        .writeOnDisk();

      // When
      const result = await Statistics.compute(options);
      const statistics = result.map((s) => s.toState());

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

  context("options.until", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const options: Options = { ...defaultOptions, until: "2010-01-01" };
      new TestRepositoryFixture()
        .addFile({ name: "a.js", date: "2000-01-01T00:00:00" })
        .addFile({ name: "b.js", date: "2020-01-01T00:00:00" })
        .addFile({ name: "c.js", date: "2020-01-01T00:00:00" })
        .writeOnDisk();

      // When
      const result = await Statistics.compute(options);
      const statistics = result.map((s) => s.toState());

      // Then
      expect(statistics).to.deep.equal([
        {
          churn: 1,
          complexity: 1,
          path: "a.js",
          score: 1,
        },
      ]);
    });
  });

  context("options.sort=score", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const options: Options = { ...defaultOptions, sort: "score" };
      new TestRepositoryFixture()
        .addFile({ name: "a.js", lines: 1, commits: 4 })
        .addFile({ name: "b.js", lines: 3, commits: 3 })
        .addFile({ name: "c.js", lines: 3, commits: 2 })
        .addFile({ name: "d.js", lines: 4, commits: 2 })
        .writeOnDisk();

      // When
      const result = await Statistics.compute(options);
      const statistics = result.map((s) => s.toState());

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
        new TestRepositoryFixture()
          .addFile({
            name: "a.ts",
            content: "if (true) if (true) console.log();",
          })
          .addFile({
            name: "b.js",
            content: "if (true) if (true) console.log();",
          })
          .writeOnDisk();

        // When
        const result = await Statistics.compute(options);
        const statistics = result.map((s) => s.toState());

        // Then
        expect(statistics).to.deep.equal([
          {
            churn: 1,
            complexity: 3,
            path: "a.ts",
            score: 3,
          },
          {
            churn: 1,
            complexity: 3,
            path: "b.js",
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
        new TestRepositoryFixture()
          .addFile({
            name: "a.ts",
            content: "if (true) if (true) console.log();",
          })
          .addFile({
            name: "b.js",
            content: "if (true) if (true) console.log();",
          })
          .writeOnDisk();

        // When
        const result = await Statistics.compute(options);
        const statistics = result.map((s) => s.toState());

        // Then
        expect(statistics).to.deep.equal([
          {
            churn: 1,
            complexity: 25.26619429851844,
            path: "a.ts",
            score: 25.26619429851844,
          },
          {
            churn: 1,
            complexity: 25.26619429851844,
            path: "b.js",
            score: 25.26619429851844,
          },
        ]);
      });
    });

    context("when using sloc strategy", () => {
      context("when analyzed file is supported by node-sloc", () => {
        it("returns the appropriate elements", async () => {
          // Given
          const options: Options = {
            ...defaultOptions,
            complexityStrategy: "sloc",
            sort: "complexity",
          };
          new TestRepositoryFixture()
            .addFile({ name: "a.js", lines: 8 })
            .addFile({ name: "b.js", lines: 6 })
            .addFile({ name: "c.js", lines: 2 })
            .addFile({ name: "d.js", lines: 4 })
            .writeOnDisk();

          // When
          const result = await Statistics.compute(options);
          const statistics = result.map((s) => s.toState());

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

      context("when analyzed file is not supported by node-sloc", () => {
        it("returns the appropriate elements", async () => {
          // Given
          const options: Options = {
            ...defaultOptions,
            complexityStrategy: "sloc",
            sort: "complexity",
          };
          new TestRepositoryFixture()
            .addFile({ name: "a.txt", lines: 8 })
            .writeOnDisk();

          // When
          const result = await Statistics.compute(options);
          const statistics = result.map((s) => s.toState());

          // Then
          expect(statistics).to.deep.equal([
            {
              churn: 1,
              complexity: 7,
              path: "a.txt",
              score: 7,
            },
          ]);
        });
      });
    });
  });

  context("options.sort=churn", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const options: Options = { ...defaultOptions, sort: "churn" };
      new TestRepositoryFixture()
        .addFile({ name: "a.js", commits: 7 })
        .addFile({ name: "b.js", commits: 3 })
        .addFile({ name: "c.js", commits: 5 })
        .addFile({ name: "d.js", commits: 2 })
        .writeOnDisk();

      // When
      const result = await Statistics.compute(options);
      const statistics = result.map((s) => s.toState());

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
      new TestRepositoryFixture()
        .addFile({ name: "d.js", lines: 1, commits: 4 })
        .addFile({ name: "a.js", lines: 2, commits: 3 })
        .addFile({ name: "c.js", lines: 3, commits: 2 })
        .addFile({ name: "b.js", lines: 4, commits: 1 })
        .writeOnDisk();

      // When
      const result = await Statistics.compute(options);
      const statistics = result.map((s) => s.toState());

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

  context("options.directories=true", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const options: Options = {
        ...defaultOptions,
        limit: 4,
        directories: true,
      };
      new TestRepositoryFixture()
        .addFile({ name: "test/a.js" })
        .addFile({ name: "test/foo/b.js" })
        .addFile({ name: "test/foo/c.js" })
        .addFile({ name: "test/bar/qux/d.js" })
        .writeOnDisk();

      // When
      const result = await Statistics.compute(options);
      const statistics = result.map((s) => s.toState());

      // Then
      expect(statistics).to.deep.equal([
        {
          path: "test",
          churn: 4,
          complexity: 4,
          score: 16,
        },
        {
          path: "test/foo",
          churn: 2,
          complexity: 2,
          score: 4,
        },
        {
          path: "test/bar",
          churn: 1,
          complexity: 1,
          score: 1,
        },
        {
          path: "test/bar/qux",
          churn: 1,
          complexity: 1,
          score: 1,
        },
      ]);
    });
  });

  context("when file no longer exists", () => {
    it("it is ignored", async () => {
      // Given
      const options: Options = { ...defaultOptions, sort: "file" };
      new TestRepositoryFixture()
        .addFile({ name: "a.js", removed: true })
        .addFile({ name: "b.ts" })
        .writeOnDisk();

      // When
      const result = await Statistics.compute(options);
      const statistics = result.map((s) => s.toState());

      // Then
      expect(statistics).to.deep.equal([
        {
          churn: 1,
          complexity: 1,
          path: "b.ts",
          score: 1,
        },
      ]);
    });
  });
});

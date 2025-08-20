import * as assert from "node:assert";
import { describe, it } from "node:test";

import { Options } from "../../src/lib/types";
import Statistics from "../../src/lib";
import TestRepositoryFixture from "../fixtures/test-repository.fixture";

describe("Statistics", () => {
  const defaultOptions: Partial<Options> = {
    format: "json",
    filter: [],
    limit: 3,
    since: undefined,
    sort: "score",
  };

  describe("options.limit", () => {
    it("returns the appropriate number of elements", async () => {
      // Given
      const trf = new TestRepositoryFixture()
        .addFile({ name: "a.js" })
        .addFile({ name: "b.js" })
        .addFile({ name: "c.js" })
        .addFile({ name: "d.js" })
        .writeOnDisk();
      const options: Options = {
        ...defaultOptions,
        target: trf.location,
        directory: trf.location,
        limit: 3,
      };

      // When
      const result = (await Statistics.compute(options)).list();

      // Then
      assert.equal(result.length, 3);
    });
  });

  describe("options.filter", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const trf = new TestRepositoryFixture()
        .addFile({ name: "a.js" })
        .addFile({ name: "b.md" })
        .addFile({ name: "c.js" })
        .writeOnDisk();
      const options: Options = {
        ...defaultOptions,
        target: trf.location,
        directory: trf.location,
        filter: ["*.js"],
      };

      // When
      const result = (await Statistics.compute(options)).list();

      // Then
      assert.deepStrictEqual(result, [
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

  describe("options.since", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const trf = new TestRepositoryFixture()
        .addFile({ name: "a.js", date: "2000-01-01T00:00:00" })
        .addFile({ name: "b.js", date: "2020-01-01T00:00:00" })
        .addFile({ name: "c.js", date: "2020-01-01T00:00:00" })
        .writeOnDisk();
      const options: Options = {
        ...defaultOptions,
        target: trf.location,
        directory: trf.location,
        since: "2010-01-01",
      };

      // When
      const result = (await Statistics.compute(options)).list();

      // Then
      assert.deepStrictEqual(result, [
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

  describe("options.until", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const trf = new TestRepositoryFixture()
        .addFile({ name: "a.js", date: "2000-01-01T00:00:00" })
        .addFile({ name: "b.js", date: "2020-01-01T00:00:00" })
        .addFile({ name: "c.js", date: "2020-01-01T00:00:00" })
        .writeOnDisk();
      const options: Options = {
        ...defaultOptions,
        target: trf.location,
        directory: trf.location,
        until: "2010-01-01",
      };

      // When
      const result = (await Statistics.compute(options)).list();

      // Then
      assert.deepStrictEqual(result, [
        {
          churn: 1,
          complexity: 1,
          path: "a.js",
          score: 1,
        },
      ]);
    });
  });

  describe("options.sort=score", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const trf = new TestRepositoryFixture()
        .addFile({ name: "a.js", lines: 1, commits: 4 })
        .addFile({ name: "b.js", lines: 3, commits: 3 })
        .addFile({ name: "c.js", lines: 3, commits: 2 })
        .addFile({ name: "d.js", lines: 4, commits: 2 })
        .writeOnDisk();
      const options: Options = {
        ...defaultOptions,
        target: trf.location,
        directory: trf.location,
        sort: "score",
      };

      // When
      const result = (await Statistics.compute(options)).list();

      // Then
      assert.deepStrictEqual(result, [
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

  describe("options.sort=complexity", () => {
    describe("when using cyclomatic strategy", () => {
      it("returns the appropriate elements", async () => {
        // Given
        const trf = new TestRepositoryFixture()
          .addFile({
            name: "a.ts",
            content: "if (true) if (true) console.log();",
          })
          .addFile({
            name: "b.js",
            content: "if (true) if (true) console.log();",
          })
          .writeOnDisk();
        const options: Options = {
          ...defaultOptions,
          target: trf.location,
          directory: trf.location,
          sort: "complexity",
          complexityStrategy: "cyclomatic",
        };

        // When
        const result = (await Statistics.compute(options)).list();

        // Then
        assert.deepStrictEqual(result, [
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

    describe("when using halstead strategy", () => {
      it("returns the appropriate elements", async () => {
        // Given
        const trf = new TestRepositoryFixture()
          .addFile({
            name: "a.ts",
            content: "if (true) if (true) console.log();",
          })
          .addFile({
            name: "b.js",
            content: "if (true) if (true) console.log();",
          })
          .writeOnDisk();
        const options: Options = {
          ...defaultOptions,
          target: trf.location,
          directory: trf.location,
          sort: "complexity",
          complexityStrategy: "halstead",
        };

        // When
        const result = (await Statistics.compute(options)).list();

        // Then
        assert.deepStrictEqual(result, [
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

    describe("when using sloc strategy", () => {
      describe("when analyzed file is supported by node-sloc", () => {
        it("returns the appropriate elements", async () => {
          // Given
          const trf = new TestRepositoryFixture()
            .addFile({ name: "a.js", lines: 8 })
            .addFile({ name: "b.js", lines: 6 })
            .addFile({ name: "c.js", lines: 2 })
            .addFile({ name: "d.js", lines: 4 })
            .writeOnDisk();
          const options: Options = {
            ...defaultOptions,
            target: trf.location,
            directory: trf.location,
            complexityStrategy: "sloc",
            sort: "complexity",
          };

          // When
          const result = (await Statistics.compute(options)).list();

          // Then
          assert.deepStrictEqual(result, [
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

      describe("when analyzed file is not supported by node-sloc", () => {
        it("returns the appropriate elements", async () => {
          // Given
          const trf = new TestRepositoryFixture()
            .addFile({ name: "a.txt", lines: 8 })
            .writeOnDisk();
          const options: Options = {
            ...defaultOptions,
            target: trf.location,
            directory: trf.location,
            complexityStrategy: "sloc",
            sort: "complexity",
          };

          // When
          const result = (await Statistics.compute(options)).list();

          // Then
          assert.deepStrictEqual(result, [
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

  describe("options.sort=churn", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const trf = new TestRepositoryFixture()
        .addFile({ name: "a.js", commits: 7 })
        .addFile({ name: "b.js", commits: 3 })
        .addFile({ name: "c.js", commits: 5 })
        .addFile({ name: "d.js", commits: 2 })
        .writeOnDisk();
      const options: Options = {
        ...defaultOptions,
        target: trf.location,
        directory: trf.location,
        sort: "churn",
      };

      // When
      const result = (await Statistics.compute(options)).list();

      // Then
      assert.deepStrictEqual(result, [
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

  describe("options.sort=file", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const trf = new TestRepositoryFixture()
        .addFile({ name: "d.js", lines: 1, commits: 4 })
        .addFile({ name: "a.js", lines: 2, commits: 3 })
        .addFile({ name: "c.js", lines: 3, commits: 2 })
        .addFile({ name: "b.js", lines: 4, commits: 1 })
        .writeOnDisk();
      const options: Options = {
        ...defaultOptions,
        target: trf.location,
        directory: trf.location,
        sort: "file",
      };

      // When
      const result = (await Statistics.compute(options)).list();

      // Then
      assert.deepStrictEqual(result, [
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

  describe("options.directories=true", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const trf = new TestRepositoryFixture()
        .addFile({ name: "test/a.js" })
        .addFile({ name: "test/foo/b.js" })
        .addFile({ name: "test/foo/c.js" })
        .addFile({ name: "test/bar/qux/d.js" })
        .writeOnDisk();
      const options: Options = {
        ...defaultOptions,
        target: trf.location,
        directory: trf.location,
        limit: 4,
        directories: true,
      };

      // When
      const result = (await Statistics.compute(options)).list();

      // Then
      assert.deepStrictEqual(result, [
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

  describe("options.maxBuffer", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const trf = new TestRepositoryFixture()
        .addFile({ name: "a.js" })
        .writeOnDisk();
      const options: Options = {
        ...defaultOptions,
        target: trf.location,
        directory: trf.location,
        maxBuffer: 64_000_000,
      };

      // When
      const result = (await Statistics.compute(options)).list();

      // Then
      assert.deepStrictEqual(result, [
        {
          churn: 1,
          complexity: 1,
          path: "a.js",
          score: 1,
        },
      ]);
    });
  });

  describe("when file no longer exists", () => {
    it("it is ignored", async () => {
      // Given
      const trf = new TestRepositoryFixture()
        .addFile({ name: "a.js", removed: true })
        .addFile({ name: "b.ts" })
        .writeOnDisk();
      const options: Options = {
        ...defaultOptions,
        target: trf.location,
        directory: trf.location,
        sort: "file",
      };

      // When
      const result = (await Statistics.compute(options)).list();

      // Then
      assert.deepStrictEqual(result, [
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

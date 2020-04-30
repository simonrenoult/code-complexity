import { expect } from "chai";
import { join } from "path";

import Statistics = require("../../src/lib");
import { Options } from "../../src/lib/types";

describe("Statistics", () => {
  const defaultOptions: Options = {
    directory: join(__dirname, "..", "code-complexity-fixture"),
    format: "table",
    filter: [],
    limit: 3,
    since: undefined,
    sort: "ratio",
  };

  context("options.limit", () => {
    it("returns the appropriate number of elements", async () => {
      // Given
      const options: Options = { ...defaultOptions, limit: 3 };

      // When
      const result = await Statistics.compute(options);
      const statistics = Array.from(result.values());

      // Then
      expect(statistics).to.have.length(3);
    });
  });

  context("options.filter", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const options: Options = { ...defaultOptions, filter: ["!test/**"] };

      // When
      const result = await Statistics.compute(options);
      const statistics = Array.from(result.values());

      // Then
      expect(statistics).to.deep.equal([
        {
          churn: 340,
          complexity: 516,
          path: "lib/response.js",
          ratio: 175440,
        },
        {
          churn: 140,
          complexity: 381,
          path: "lib/router/index.js",
          ratio: 53340,
        },
        {
          churn: 159,
          complexity: 269,
          path: "lib/application.js",
          ratio: 42771,
        },
      ]);
    });
  });

  context("options.since", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const options: Options = { ...defaultOptions, since: "2019-05-24" };

      // When
      const result = await Statistics.compute(options);
      const statistics = Array.from(result.values());

      // Then
      expect(statistics).to.deep.equal([
        {
          churn: 1,
          complexity: 516,
          path: "lib/response.js",
          ratio: 516,
        },
        {
          churn: 1,
          complexity: 51,
          path: ".travis.yml",
          ratio: 51,
        },
        {
          churn: 1,
          complexity: 48,
          path: "appveyor.yml",
          ratio: 48,
        },
      ]);
    });
  });

  context("options.sort=complexity", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const options: Options = { ...defaultOptions, sort: "ratio" };

      // When
      const result = await Statistics.compute(options);
      const statistics = Array.from(result.values());

      // Then
      expect(statistics).to.deep.equal([
        {
          churn: 340,
          complexity: 516,
          path: "lib/response.js",
          ratio: 175440,
        },
        {
          churn: 71,
          complexity: 829,
          path: "test/app.router.js",
          ratio: 58859,
        },
        {
          churn: 140,
          complexity: 381,
          path: "lib/router/index.js",
          ratio: 53340,
        },
      ]);
    });
  });

  context("options.sort=churn", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const options: Options = { ...defaultOptions, sort: "ratio" };

      // When
      const result = await Statistics.compute(options);
      const statistics = Array.from(result.values());

      // Then
      expect(statistics).to.deep.equal([
        {
          churn: 340,
          complexity: 516,
          path: "lib/response.js",
          ratio: 175440,
        },
        {
          churn: 71,
          complexity: 829,
          path: "test/app.router.js",
          ratio: 58859,
        },
        {
          churn: 140,
          complexity: 381,
          path: "lib/router/index.js",
          ratio: 53340,
        },
      ]);
    });
  });

  context("options.sort=file", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const options: Options = { ...defaultOptions, sort: "ratio" };

      // When
      const result = await Statistics.compute(options);
      const statistics = Array.from(result.values());

      // Then
      expect(statistics).to.deep.equal([
        {
          churn: 340,
          complexity: 516,
          path: "lib/response.js",
          ratio: 175440,
        },
        {
          churn: 71,
          complexity: 829,
          path: "test/app.router.js",
          ratio: 58859,
        },
        {
          churn: 140,
          complexity: 381,
          path: "lib/router/index.js",
          ratio: 53340,
        },
      ]);
    });
  });

  context("options.sort=ratio", () => {
    it("returns the appropriate elements", async () => {
      // Given
      const options: Options = { ...defaultOptions, sort: "ratio" };

      // When
      const result = await Statistics.compute(options);
      const statistics = Array.from(result.values());

      // Then
      expect(statistics).to.deep.equal([
        {
          churn: 340,
          complexity: 516,
          path: "lib/response.js",
          ratio: 175440,
        },
        {
          churn: 71,
          complexity: 829,
          path: "test/app.router.js",
          ratio: 58859,
        },
        {
          churn: 140,
          complexity: 381,
          path: "lib/router/index.js",
          ratio: 53340,
        },
      ]);
    });
  });
});

const { describe, it } = require("mocha");
const { expect } = require("chai");
const proxyquire = require("proxyquire");
const { computeComplexity } = proxyquire("../src/code-complexity", {
  "path-exists": {
    sync() {
      return true;
    }
  },
  "./sloc-interface": {
    getSloc() {
      return { sloc: 2 };
    }
  }
});

describe(".computeComplexity(rawCommitCount, directory)", () => {
  it("returns the appropriate object", async () => {
    // Given
    const directory = "/qux/bar";
    const rawCommitCount = [
      "3 .eslintrc.json",
      "2 .gitignore",
      "1 LICENSE",
      "7 README.md",
      "9 package.json",
      "8 server.js",
      "28 src/foo.js"
    ].join("\n");

    // When
    const result = await computeComplexity(rawCommitCount, directory);

    // Then
    expect(result).to.eql([
      {
        absolutePath: "/qux/bar/server.js",
        commitCount: 8,
        overallComplexity: 16,
        pathToFile: "server.js",
        sloc: {
          sloc: 2
        }
      },
      {
        absolutePath: "/qux/bar/src/foo.js",
        commitCount: 28,
        overallComplexity: 56,
        pathToFile: "src/foo.js",
        sloc: {
          sloc: 2
        }
      }
    ]);
  });
});

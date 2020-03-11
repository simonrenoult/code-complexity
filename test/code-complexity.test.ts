// FIXME: use proxyquire with TypeScript...
// import { describe, it } from 'mocha'
// import { expect } from 'chai'
// import proxyquire from 'proxyquire'
// const { computeComplexityPerFile } = proxyquire("../src/index.ts", {
//   "path-exists": {
//     sync() {
//       return true;
//     }
//   },
//   "./sloc-interface": {
//     getSloc() {
//       return { sloc: 2 };
//     }
//   }
// });
//
// describe(".computeComplexityPerFile(rawCommitCount, directory)", () => {
//   it("returns the appropriate object", async () => {
//     // Given
//     const directory = "/qux/bar";
//     const rawCommitCount = [
//       "3 .eslintrc.js",
//       "2 .gitignore",
//       "1 LICENSE",
//       "7 README.md",
//       "9 package.json",
//       "8 server.js",
//       "28 src/foo.js"
//     ].join("\n");
//
//     // When
//     const result = await computeComplexityPerFile(rawCommitCount, directory);
//
//     // Then
//     expect(result).to.eql([
//       {
//         absolutePathToFile: "/qux/bar/server.js",
//         commitCount: 8,
//         overallComplexity: 16,
//         relativePathToFile: "server.js",
//         sloc: {
//           sloc: 2
//         }
//       },
//       {
//         absolutePathToFile: "/qux/bar/src/foo.js",
//         commitCount: 28,
//         overallComplexity: 56,
//         relativePathToFile: "src/foo.js",
//         sloc: {
//           sloc: 2
//         }
//       }
//     ]);
//   });
// });

import { execSync } from "child_process";
import { describe, before, it } from "mocha";
import { resolve } from "path";
import { expect } from "chai";

const codeComplexity = resolve(__dirname, "../src/index.ts");
const fixture = resolve(__dirname, "code-complexity-fixture");

describe("code-complexity", () => {
  context("With details, limit and sort", () => {
    it("outputs the appropriate values", () => {
      // Given
      const command = [
        `ts-node ${codeComplexity}`,
        fixture,
        `--details`,
        `--limit 10`,
        `--sort complexity`
      ].join(" ");

      // When
      const output = execSync(command, { encoding: "utf8" });

      // Then
      expect(output.trim()).to.deep.equal(
        [
          "lib/response.js 142416 (commits: 276, sloc: 516)",
          "test/app.router.js 54714 (commits: 66, sloc: 829)",
          "lib/router/index.js 40005 (commits: 105, sloc: 381)",
          "lib/application.js 32818 (commits: 122, sloc: 269)",
          "lib/request.js 21746 (commits: 131, sloc: 166)",
          "test/res.send.js 17822 (commits: 38, sloc: 469)",
          "test/res.sendFile.js 14674 (commits: 22, sloc: 667)",
          "test/Router.js 11100 (commits: 25, sloc: 444)",
          "lib/express.js 7875 (commits: 125, sloc: 63)",
          "lib/utils.js 7095 (commits: 55, sloc: 129)"
        ].join("\n")
      );
    });

    context("With exclude", () => {
      it("outputs the appropriate values", () => {
        // Given
        const command = [
          `ts-node ${codeComplexity}`,
          fixture,
          `--details`,
          `--limit 8`,
          `--sort complexity`,
          `--excludes response,request`
        ].join(" ");

        // When
        const output = execSync(command, { encoding: "utf8" });

        // Then
        expect(output.trim()).to.deep.equal(
          [
            "test/app.router.js 54714 (commits: 66, sloc: 829)",
            "lib/router/index.js 40005 (commits: 105, sloc: 381)",
            "lib/application.js 32818 (commits: 122, sloc: 269)",
            "test/res.send.js 17822 (commits: 38, sloc: 469)",
            "test/res.sendFile.js 14674 (commits: 22, sloc: 667)",
            "test/Router.js 11100 (commits: 25, sloc: 444)",
            "lib/express.js 7875 (commits: 125, sloc: 63)",
            "lib/utils.js 7095 (commits: 55, sloc: 129)"
          ].join("\n")
        );
      });
    });
  });
});

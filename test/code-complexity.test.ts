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
          `--limit 10`,
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
            "lib/utils.js 7095 (commits: 55, sloc: 129)",
            "lib/view.js 6384 (commits: 84, sloc: 76)",
            "test/app.use.js 5936 (commits: 14, sloc: 424)"
          ].join("\n")
        );
      });
    });

    context("With includes", () => {
      it("outputs the appropriate values", () => {
        // Given
        const command = [
          `ts-node ${codeComplexity}`,
          fixture,
          `--details`,
          `--limit 10`,
          `--sort complexity`,
          `--includes router`
        ].join(" ");

        // When
        const output = execSync(command, { encoding: "utf8" });

        // Then
        expect(output.trim()).to.deep.equal(
          [
            "test/app.router.js 54714 (commits: 66, sloc: 829)",
            "lib/router/index.js 40005 (commits: 105, sloc: 381)",
            "lib/router/route.js 2856 (commits: 28, sloc: 102)",
            "lib/router/layer.js 1602 (commits: 18, sloc: 89)",
            "test/acceptance/multi-router.js 78 (commits: 2, sloc: 39)",
            "examples/multi-router/index.js 22 (commits: 2, sloc: 11)",
            "examples/multi-router/controllers/api_v1.js 9 (commits: 1, sloc: 9)",
            "examples/multi-router/controllers/api_v2.js 9 (commits: 1, sloc: 9)"
          ].join("\n")
        );
      });
    });
  });
});

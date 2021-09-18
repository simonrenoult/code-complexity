import { expect } from "chai";
import { resolve } from "path";
import { calculate } from "../../../src/lib/complexity/cyclomatic";

describe("Cyclomatic", () => {
  it("returns the appropriate value", () => {
    console.log(__dirname);
    const result = calculate(resolve(__dirname, "../..", "sample.fixture.ts"));
    expect(result).to.equal(7);
  });
});

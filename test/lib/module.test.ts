import { expect } from "chai";

import { execute } from "../../src/lib";
import { Command } from "../../src/lib/types";

describe("Statistics", () => {
  const params: Command = {
    target: "https://github.com/l-marcel/exe-classwork",
    filter: [],
    limit: 3,
    since: undefined,
    sort: "score",
  };

  context("module", () => {
    it("returns the appropriate number of elements", async () => {
      // When
      const result = await execute(params);
      console.log(result);
      // Then
      expect(result.length).equals(3);
    });
  });
});

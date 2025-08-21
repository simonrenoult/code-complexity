import { extname } from "node:path";

import { buildDebugger, UnsupportedExtension } from "../../../../utils";
import { compute as computeFromBabel } from "./cyclomatic.babel";

const internal = { debug: buildDebugger("cyclomatic") };

export function calculate(path: string): number | UnsupportedExtension {
  internal.debug(`Processing ${path}...`);

  switch (extname(path)) {
    case ".ts":
      return computeFromBabel(path, {
        sourceType: "unambiguous",
        plugins: ["typescript"],
      });
    case ".mjs":
    case ".cjs":
    case ".js":
      return computeFromBabel(path, { sourceType: "unambiguous" });
    default:
      internal.debug(
        "Unsupported file extension. Falling back on default complexity (1)"
      );
      return new UnsupportedExtension();
  }
}

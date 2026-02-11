import { extname } from "node:path";
import { buildDebugger, UnsupportedExtension } from "../../../../utils";
import { compute as computeFromBabel } from "./halstead.babel";

const internal = { debug: buildDebugger("halstead") };

export function calculate(path: string): number | UnsupportedExtension {
  internal.debug(`Processing ${path}...`);
  switch (extname(path)) {
    case ".ts":
      return computeFromBabel(path, {
        sourceType: "unambiguous",
        plugins: ["typescript", "decorators"],
      });
    case ".mjs":
    case ".cjs":
    case ".js":
      return computeFromBabel(path, { sourceType: "unambiguous" });
    default:
      internal.debug(
        "Unsupported file extension. Falling back on default complexity (1)",
      );
      return new UnsupportedExtension();
  }
}

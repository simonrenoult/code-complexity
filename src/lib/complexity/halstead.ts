import { readFileSync } from "fs";
import { transformSync } from "@babel/core";
import { extname } from "path";
import { buildDebugger, UnsupportedExtension } from "../../utils";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const escomplex = require("escomplex");

const internal = { debug: buildDebugger("halstead") };

export function calculate(path: string): number | UnsupportedExtension {
  switch (extname(path)) {
    case ".ts":
      return fromTypeScript(path);
    case ".mjs":
    case ".js":
      return fromJavaScript(path);
    default:
      internal.debug(
        "Unsupported file extension. Falling back on default complexity (1)"
      );
      return new UnsupportedExtension();
  }
}

function fromJavaScript(path: string): number {
  const content = readFileSync(path, { encoding: "utf8" });
  const babelResult = transformSync(content, {
    presets: ["@babel/preset-env"],
  });
  if (!babelResult) throw new Error(`Error while parsing file ${path}`);
  const result = escomplex.analyse(babelResult.code, {});
  return result.aggregate.halstead;
}

function fromTypeScript(path: string): number {
  const content = readFileSync(path, { encoding: "utf8" });
  const babelResult = transformSync(content, {
    plugins: ["@babel/plugin-transform-typescript"],
    presets: ["@babel/preset-env"],
  });
  if (!babelResult) throw new Error(`Error while parsing file ${path}`);
  const result = escomplex.analyse(babelResult.code);
  return result.aggregate.halstead.volume;
}

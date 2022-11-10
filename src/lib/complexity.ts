import * as sloc from "node-sloc";
import { resolve } from "path";

import { Options, Path } from "./types";
import { buildDebugger, withDuration } from "../utils";
import { createReadStream } from "fs";

type ComplexityEntry = { path: Path; complexity: number };
const internal = { debug: buildDebugger("complexity") };

export default {
  compute: (...args: any[]): Promise<Map<Path, number>> =>
    withDuration(compute, args, internal.debug),
};

async function compute(
  paths: Path[],
  options: Options
): Promise<Map<Path, number>> {
  internal.debug(`${paths.length} files to compute complexity on`);

  const entries: ComplexityEntry[] = await Promise.all(
    paths.map(async (path) => {
      const complexity = await getComplexity(path, options);
      return { path, complexity };
    })
  );

  return entries.reduce((map: Map<Path, number>, entry: ComplexityEntry) => {
    map.set(entry.path, entry.complexity);
    return map;
  }, new Map());
}

async function getComplexity(path: Path, options: Options): Promise<number> {
  const absolutePath = resolve(options.directory, path);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const result = await sloc({ path: absolutePath });
  if (result?.sloc) {
    return result?.sloc;
  } else {
    return countLineNumber(absolutePath);
  }
}

async function countLineNumber(absolutePath: string): Promise<number> {
  const ASCII_FOR_NEW_LINE = "10";
  const ASCII_FOR_CARRIAGE_RETURN = "13";

  let count = 0;
  return new Promise((resolve) => {
    createReadStream(absolutePath)
      .on("data", function (chunk) {
        for (let i = 0; i < chunk.length; ++i) {
          const char = chunk[i];
          // Use "==" instead of "===" to use type coercion
          if (char == ASCII_FOR_NEW_LINE || char == ASCII_FOR_CARRIAGE_RETURN) {
            count += 1;
          }
        }
      })
      .on("end", function () {
        resolve(count);
      });
  });
}

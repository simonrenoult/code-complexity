// FIXME: use something else than node-sloc, it's not widely used
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as nodeSloc from "node-sloc";
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

  const complexityPerPath: Map<Path, number> = entries.reduce(
    (map: Map<Path, number>, entry: ComplexityEntry) => {
      map.set(entry.path, entry.complexity);
      return map;
    },
    new Map()
  );

  return complexityPerPath;
}

async function getComplexity(path: Path, options: Options): Promise<number> {
  const absolutePath = resolve(options.directory, path);
  const result = await nodeSloc({ path: absolutePath });
  if (result.sloc.sloc) {
    return result.sloc.sloc;
  } else {
    return countLineNumber(absolutePath);
  }
}

async function countLineNumber(absolutePath: string): Promise<number> {
  let count = 0;
  return new Promise((resolve) => {
    createReadStream(absolutePath)
      .on("data", function (chunk) {
        for (let i = 0; i < chunk.length; ++i) if (chunk[i] == 10) count++;
      })
      .on("end", function () {
        resolve(count);
      });
  });
}

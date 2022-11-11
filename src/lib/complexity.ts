import { resolve } from "path";

import { Options, Path } from "./types";
import { buildDebugger, UnsupportedExtension, withDuration } from "../utils";
import computeSloc from "./complexity/sloc";
import { calculate as calculateCyclomatic } from "./complexity/cyclomatic";
import { calculate as calculateHalstead } from "./complexity/halstead";

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
      const complexity = await computeComplexity(path, options);
      return { path, complexity };
    })
  );

  return entries.reduce((map: Map<Path, number>, entry: ComplexityEntry) => {
    map.set(entry.path, entry.complexity);
    return map;
  }, new Map());
}

async function computeComplexity(
  path: Path,
  options: Options
): Promise<number> {
  const absolutePath = resolve(options.directory, path);

  let result: number | UnsupportedExtension;
  switch (options.complexityStrategy) {
    case "sloc":
      result = await computeSloc(absolutePath);
      break;
    case "cyclomatic":
      result = await calculateCyclomatic(absolutePath);
      break;
    case "halstead":
      result = await calculateHalstead(absolutePath);
      break;
    default:
      result = await computeSloc(absolutePath);
  }

  if (result instanceof UnsupportedExtension) {
    result = await computeSloc(absolutePath);
  }

  return result as number;
}

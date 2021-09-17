import { resolve } from "path";
import { Options, Path } from "./types";
import { buildDebugger, withDuration } from "../utils";
import { calculate as calcCyclomaticComplexity } from "./complexity/cyclomatic";
import { calculate as calcHalsteadComplexity } from "./complexity/halstead";
import { calculate as calcSlocComplexity } from "./complexity/sloc";

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

  switch (options.complexityStrategy) {
    case "sloc":
      return calcSlocComplexity(absolutePath);
    case "cyclomatic":
      return calcCyclomaticComplexity(absolutePath);
    case "halstead":
      return calcHalsteadComplexity(absolutePath);
    default:
      return calcSlocComplexity(absolutePath);
  }
}

import { resolve } from "node:path";
import { Options, Path } from "../types";
import computeSloc from "./strategies/sloc";
import { calculate as calculateCyclomatic } from "./strategies/cyclomatic";
import { calculate as calculateHalstead } from "./strategies/halstead";
import { UnsupportedExtension } from "../../utils";

export default class Complexity {
  path: Path;
  complexity: number;

  static async compute(path: Path, options: Options) {
    const complexity = await Complexity.#computeComplexity(path, options);
    return new Complexity(path, complexity);
  }

  constructor(path: Path, complexity: number) {
    this.complexity = complexity;
    this.path = path;
  }

  static async #computeComplexity(
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

  getValue(): number {
    return this.complexity;
  }
}

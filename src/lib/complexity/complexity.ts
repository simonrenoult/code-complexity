import { Options, Path } from "../types";
import computeSloc from "./strategies/sloc";
import { calculate as calculateCyclomatic } from "./strategies/cyclomatic";
import { calculate as calculateHalstead } from "./strategies/halstead";
import { resolve } from "node:path";
import { UnsupportedExtension } from "../../utils";

// FIXME: add modules

export default class Complexity {
  public static async compute(path: Path, options: Options) {
    const complexity = await Complexity.computeComplexity(path, options);
    return new Complexity(path, complexity);
  }

  private constructor(
    public readonly path: Path,
    public readonly complexity: number
  ) {}

  private static async computeComplexity(
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

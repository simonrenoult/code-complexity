import { buildDebugger } from "../../utils";
import { Options, Path } from "../types";
import Complexity from "./complexity";

const internal = { debug: buildDebugger("complexity") };

export default class Complexities {
  #complexityByPath: Map<Path, Complexity>;

  static async computeFor(
    paths: Path[],
    options: Options
  ): Promise<Complexities> {
    internal.debug(`${paths.length} files to compute complexity on`);
    const complexities = await Promise.all(
      paths.map(async (p) => await Complexity.compute(p, options))
    );

    return new Complexities(complexities);
  }

  constructor(complexities: Complexity[]) {
    this.#complexityByPath = this.#computeComplexitiesPerPath(complexities);
  }

  getByPath(path: Path): Complexity {
    const complexity = this.#complexityByPath.get(path);
    if (!complexity) throw new Error("Complexity not found for #path: " + path);
    return complexity;
  }

  #computeComplexitiesPerPath(complexities: Complexity[]) {
    return complexities.reduce((map, complexity) => {
      map.set(complexity.path, complexity);
      return map;
    }, new Map());
  }
}

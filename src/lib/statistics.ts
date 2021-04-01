import Churn from "./churn";
import Complexity from "./complexity";
import { Options, Path, Sort } from "./types";
import { buildDebugger } from "../utils";

const DEFAULT_CHURN = 1;
const DEFAULT_COMPLEXITY = 1;

const internal = { debug: buildDebugger("statistics") };

export default class Statistics {
  public readonly path: Path;
  public readonly churn: number;
  public readonly complexity: number;
  public readonly score: number;

  constructor(path: Path, churn: number, complexity: number) {
    this.path = path;
    this.churn = churn;
    this.complexity = complexity;
    this.score = this.churn * this.complexity;
  }

  public static async compute(
    options: Options
  ): Promise<Map<Path, Statistics>> {
    internal.debug(`invoked with options: ${JSON.stringify(options)}`);
    internal.debug(`using cwd: ${process.cwd()}`);

    const churns = await Churn.compute(options);
    const paths = Array.from(churns.keys());
    const complexities = await Complexity.compute(paths, options);

    const statistics = paths
      .map(toStatistics(churns, complexities))
      .sort(sort(options.sort))
      .filter(limit(options.limit));

    return toMap(statistics);
  }
}

function toStatistics(
  churns: Map<Path, number>,
  complexities: Map<Path, number>
): (path: Path) => Statistics {
  return (path): Statistics => {
    const churn = churns.get(path) || DEFAULT_CHURN;
    const complexity = complexities.get(path) || DEFAULT_COMPLEXITY;
    return new Statistics(path, churn, complexity);
  };
}

function limit(
  limit: number | undefined
): (s: Statistics, n: number) => boolean {
  return (statistics: Statistics, i: number): boolean => !limit || i < limit;
}

function sort(sort: Sort | undefined) {
  return (statisticsA: Statistics, statisticsB: Statistics): number => {
    if (sort === "score" || sort === "ratio") {
      return statisticsB.score - statisticsA.score;
    }

    if (sort === "churn") {
      return statisticsB.churn - statisticsA.churn;
    }

    if (sort === "complexity") {
      return statisticsB.complexity - statisticsA.complexity;
    }

    if (sort === "file") {
      const fileAPath = statisticsA.path;
      const fileBPath = statisticsB.path;
      return fileAPath.localeCompare(fileBPath);
    }

    return 0;
  };
}

function toMap(statistics: Statistics[]): Map<Path, Statistics> {
  return statistics.reduce((map: Map<Path, Statistics>, statistics) => {
    map.set(statistics.path, statistics);
    return map;
  }, new Map());
}

import * as NodePath from "node:path";

import { Options, Path, Sort } from "./types";
import { buildDebugger } from "../utils";
import Churn from "./churn/churn";
import Complexity from "./complexity";

const DEFAULT_CHURN = 1;
const DEFAULT_COMPLEXITY = 1;

const internal = { debug: buildDebugger("statistics") };

export interface IStatistics {
  path: Path;
  churn: number;
  complexity: number;
  score: number;
}

export default class Statistics {
  public readonly path: Path;
  public readonly churn: number;
  public readonly complexity: number;
  public readonly score: number;

  private readonly directories: string[];

  public static async compute(options: Options): Promise<Statistics[]> {
    internal.debug(`invoked with options: ${JSON.stringify(options)}`);
    internal.debug(`using cwd: ${process.cwd()}`);

    const churns = await Churn.compute(options);
    const paths = Array.from(churns.keys());
    const complexities = await Complexity.compute(paths, options);

    const statisticsForFiles: Statistics[] = paths.map(
      Statistics.toStatistics(churns, complexities)
    );

    const result = options.directories
      ? Statistics.buildDirectoriesStatistics(statisticsForFiles)
      : statisticsForFiles;

    return result.sort(sort(options.sort)).filter(limit(options.limit));
  }

  public static toStatistics(
    churns: Map<Path, number>,
    complexities: Map<Path, number>
  ): (path: Path) => Statistics {
    return (path): Statistics => {
      const churn = churns.get(path) || DEFAULT_CHURN;
      const complexity = complexities.get(path) || DEFAULT_COMPLEXITY;
      return new Statistics(path, churn, complexity);
    };
  }

  private static buildDirectoriesStatistics(
    statisticsForFiles: Statistics[]
  ): Statistics[] {
    const map = statisticsForFiles.reduce((map, statisticsForFile) => {
      statisticsForFile.directories.forEach((directoryForFile) => {
        computeStatisticsForDirectory(map, directoryForFile, statisticsForFile);
      });
      return map;
    }, new Map<string, Statistics>());

    return [...map.values()];

    function computeStatisticsForDirectory(
      map: Map<string, Statistics>,
      dir: string,
      statisticsForFile: Statistics
    ) {
      const statisticsForDir = map.get(dir);
      const churn =
        statisticsForFile.churn +
        (statisticsForDir ? statisticsForDir.churn : 0);
      const complexity =
        statisticsForFile.complexity +
        (statisticsForDir ? statisticsForDir.complexity : 0);
      map.set(dir, new Statistics(dir, churn, complexity));
    }
  }

  private constructor(path: Path, churn: number, complexity: number) {
    this.path = path;
    this.churn = churn;
    this.complexity = complexity;
    this.directories = this.findDirectoriesForFile(path);
    this.score = this.churn * this.complexity;
  }

  private findDirectoriesForFile(path: string): string[] {
    const directories: string[] = [];
    const pathChunks = NodePath.parse(path).dir.split(NodePath.sep);
    pathChunks.forEach((chunk) => {
      const parentDir = directories.slice(-1);
      const directory = parentDir.length
        ? parentDir + NodePath.sep + chunk
        : chunk;
      directories.push(directory);
    });
    return directories.filter((d) => d.length > 0);
  }

  public toState(): IStatistics {
    return {
      path: this.path,
      churn: this.churn,
      complexity: this.complexity,
      score: this.score,
    };
  }
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

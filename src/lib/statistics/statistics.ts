import { IStatistic } from "./statistic";
import { buildDebugger } from "../../utils";
import Churns from "../churn/churns";
import Complexities from "../complexity/complexities";
import Complexity from "../complexity/complexities";
import GitHistory from "../githistory/githistory";
import { Options, Path, Sort } from "../types";
import Statistic from "./statistic";

const internal = { debug: buildDebugger("statistics") };

export default class Statistics {
  private statistics: Statistic[] = [];

  public static async compute(options: Options): Promise<Statistics> {
    internal.debug(`invoked with options: ${JSON.stringify(options)}`);
    internal.debug(`using cwd: ${process.cwd()}`);

    const gitHistory = GitHistory.build(options);
    const churns = Churns.from(gitHistory.history, options);
    const complexities = await Complexity.computeFor(gitHistory.files, options);

    return new Statistics(gitHistory.files, churns, complexities, options);
  }

  public list(): IStatistic[] {
    return this.statistics.map((s) => s.toState());
  }

  private constructor(
    files: Path[],
    churns: Churns,
    complexities: Complexities,
    options: Options
  ) {
    const statisticsForFiles: Statistic[] = files.map((path): Statistic => {
      const churn = churns.getByPath(path);
      const complexity = complexities.getByPath(path);
      return Statistic.build(path, churn.getValue(), complexity.getValue());
    });

    const result = options.directories
      ? Statistics.buildDirectoriesStatistics(statisticsForFiles)
      : statisticsForFiles;

    this.statistics = result
      .sort(sort(options.sort))
      .filter(limit(options.limit));
  }

  private static buildDirectoriesStatistics(
    statisticsForFiles: Statistic[]
  ): Statistic[] {
    const map = statisticsForFiles.reduce((map, statisticsForFile) => {
      statisticsForFile.directories.forEach((directoryForFile) => {
        computeStatisticsForDirectory(map, directoryForFile, statisticsForFile);
      });
      return map;
    }, new Map<string, Statistic>());

    return [...map.values()];

    function computeStatisticsForDirectory(
      map: Map<string, Statistic>,
      dir: string,
      statisticsForFile: Statistic
    ) {
      const statisticsForDir = map.get(dir);
      const churn =
        statisticsForFile.churn +
        (statisticsForDir ? statisticsForDir.churn : 0);
      const complexity =
        statisticsForFile.complexity +
        (statisticsForDir ? statisticsForDir.complexity : 0);
      map.set(dir, Statistic.build(dir, churn, complexity));
    }
  }
}

function limit(
  limit: number | undefined
): (s: Statistic, n: number) => boolean {
  return (statistics: Statistic, i: number): boolean => !limit || i < limit;
}

function sort(sort: Sort | undefined) {
  return (statisticsA: Statistic, statisticsB: Statistic): number => {
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

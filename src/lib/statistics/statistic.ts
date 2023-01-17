import * as NodePath from "node:path";

import { Path } from "../types";

export interface IStatistic {
  path: string;
  churn: number;
  complexity: number;
  score: number;
}

export default class Statistic {
  public readonly path: Path;
  public readonly churn: number;
  public readonly complexity: number;
  public readonly score: number;

  readonly directories: string[];

  static build(path: Path, churn: number, complexity: number): Statistic {
    return new Statistic(path, churn, complexity);
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

  public toState(): IStatistic {
    return {
      path: this.path,
      churn: this.churn,
      complexity: this.complexity,
      score: this.score,
    };
  }
}

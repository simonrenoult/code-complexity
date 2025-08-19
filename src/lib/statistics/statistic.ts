import * as NodePath from "node:path";

import { Path } from "../types";

export interface IStatistic {
  path: string;
  churn: number;
  complexity: number;
  score: number;
}

export default class Statistic {
  path: Path;
  churn: number;
  complexity: number;
  score: number;
  directories: string[];

  constructor(path: Path, churn: number, complexity: number) {
    this.path = path;
    this.churn = churn;
    this.complexity = complexity;
    this.directories = this.#findDirectoriesForFile(path);
    this.score = this.churn * this.complexity;
  }

  #findDirectoriesForFile(path: string): string[] {
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

  toState(): IStatistic {
    return {
      path: this.path,
      churn: this.churn,
      complexity: this.complexity,
      score: this.score,
    };
  }
}

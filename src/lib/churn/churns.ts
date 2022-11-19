import { History } from "../githistory/githistory";

import { Options, Path } from "../types";
import Churn from "./churn";

// FIXME: add commits

export default class Churns {
  private readonly churnByPath: Map<Path, Churn>;
  private readonly options: Options;

  public static from(history: History, options: Options) {
    return new Churns(history, options);
  }

  private constructor(history: History, options: Options) {
    this.options = options;
    this.churnByPath = this.computeChurnsPerFiles(history);
  }

  public get files(): Path[] {
    return [...this.churnByPath.keys()];
  }

  public getByPath(path: Path): Churn {
    const churn = this.churnByPath.get(path);
    if (!churn) {
      throw new Error("churn not found for path: " + path);
    }
    return churn;
  }

  private computeChurnsPerFiles(history: History): Map<Path, Churn> {
    return history.reduce((map: Map<Path, Churn>, path) => {
      if (map.has(path)) {
        const actualChurn = map.get(path);
        if (actualChurn) {
          actualChurn.increment();
        } else {
          throw new Error("A churn should have existed for path: " + path);
        }
      } else {
        const churn = new Churn(path).increment();
        map.set(path, churn);
      }
      return map;
    }, new Map());
  }
}

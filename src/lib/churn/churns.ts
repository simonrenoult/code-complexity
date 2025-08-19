import { History } from "../githistory/githistory";

import { Path } from "../types";
import Churn from "./churn";

export default class Churns {
  #churnByPath: Map<Path, Churn>;

  static from(history: History) {
    return new Churns(history);
  }

  constructor(history: History) {
    this.#churnByPath = this.#computeChurnsPerFiles(history);
  }

  getByPath(path: Path): Churn {
    const churn = this.#churnByPath.get(path);
    if (!churn) {
      throw new Error("churn not found for path: " + path);
    }
    return churn;
  }

  #computeChurnsPerFiles(history: History): Map<Path, Churn> {
    return history.reduce((map: Map<Path, Churn>, path) => {
      if (map.has(path)) {
        const actualChurn = map.get(path);
        if (actualChurn) {
          actualChurn.increment();
        } else {
          throw new Error("A churn should have existed for path: " + path);
        }
      } else {
        const churn = new Churn().increment();
        map.set(path, churn);
      }
      return map;
    }, new Map());
  }
}

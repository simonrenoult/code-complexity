import { Path } from "../types";

export default class Churn {
  private path: Path;
  private changes: number;

  constructor(path: Path) {
    this.path = path;
    this.changes = 0;
  }

  public increment(): this {
    this.changes += 1;
    return this;
  }

  public getValue(): number {
    return this.changes;
  }
}

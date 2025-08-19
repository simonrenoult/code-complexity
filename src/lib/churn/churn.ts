export default class Churn {
  #changes: number;

  constructor() {
    this.#changes = 0;
  }

  increment(): this {
    this.#changes += 1;
    return this;
  }

  getValue(): number {
    return this.#changes;
  }
}

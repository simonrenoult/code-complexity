import { Options, Path } from "./types";
export default class Statistics {
    readonly path: Path;
    readonly churn: number;
    readonly complexity: number;
    readonly score: number;
    constructor(path: Path, churn: number, complexity: number);
    static compute(options: Options): Promise<Map<Path, Statistics>>;
}

import { Command, Options } from "../lib/types";
declare const _default: {
    parse: typeof parse;
    cleanup: typeof cleanup;
};
export default _default;
declare function parse(params?: Command): Promise<Options>;
declare function cleanup(options: Options): Promise<void>;

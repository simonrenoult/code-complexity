export declare function withDuration(fn: Function, args: any[], log: Function): any;
export declare function buildDebugger(module: string | undefined): any;
export declare function getPackageJson(): Promise<{
    description: string | undefined;
    name: string;
    version: string;
}>;

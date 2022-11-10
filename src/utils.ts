import debug from "debug";
const pkg = import("../package.json");

// eslint-disable-next-line @typescript-eslint/ban-types
export function withDuration(fn: Function, args: any[], log: Function): any {
  const startedAt = Date.now();
  const result = fn(...args);
  const endedAt = Date.now();

  log(`duration: ${endedAt - startedAt}ms`);

  return result;
}

export function buildDebugger(module: string | undefined): any {
  const name = "code-complexity";
  return name ? debug(`${name}:${module}`) : debug(name);
}

export async function getPackageJson(): Promise<{
  description: string | undefined;
  name: string;
  version: string;
}> {
  const { description, name, version } = pkg as any;
  return { description, name, version };
}

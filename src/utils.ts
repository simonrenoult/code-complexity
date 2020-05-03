import debug from "debug";
import * as readPkgUp from "read-pkg-up";

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
  const result = await readPkgUp();
  if (!result || !result.packageJson) {
    throw new Error("Error: no package.json found, exiting.");
  }

  const { description, name, version } = result.packageJson;
  return { description, name, version };
}

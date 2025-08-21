import debug from "debug";

export function buildDebugger(module: string | undefined): debug.Debugger {
  const name = "code-complexity";
  return name ? debug(`${name}:${module}`) : debug(name);
}

export class UnsupportedExtension {}

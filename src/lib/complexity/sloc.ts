// eslint-disable-next-line @typescript-eslint/no-var-requires
const sloc = require("node-sloc");

export async function calculate(path: string): Promise<number> {
  const result = await sloc({ path });
  return result ? result.sloc : 1;
}

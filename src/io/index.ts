import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

import Cli from "./cli";
import { Options } from "../lib/types";
import Output from "./output";
import Statistics from "../lib";

export default async function main(): Promise<void> {
  const options = await Cli.parse();

  warnIfUsingComplexityWithIncompatibleFileTypes(options);
  assertGitIsInstalled();
  assertIsGitRootDirectory(options.directory);

  const statistics = await Statistics.compute(options);
  Cli.cleanup(options);
  Output.render(statistics.list(), options);
}

function warnIfUsingComplexityWithIncompatibleFileTypes(options: Options) {
  if (options.complexityStrategy !== "sloc") {
    console.warn(
      "Beware, the 'halstead' and 'cyclomatic' strategies are only available for JavaScript/TypeScript."
    );
  }
}

function assertGitIsInstalled(): void {
  try {
    execSync("which git");
  } catch (error) {
    throw new Error("Program 'git' must be installed");
  }
}

function assertIsGitRootDirectory(directory: string): void {
  if (!existsSync(`${directory}/.git`)) {
    throw new Error(`Argument 'dir' must be the git root directory.`);
  }
}

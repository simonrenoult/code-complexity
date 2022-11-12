import Cli from "./cli";
import Output from "./output";
import { Options, Path } from "../lib/types";
import Statistics from "../lib";
import { execSync } from "child_process";
import { existsSync } from "fs";

export default async function main(): Promise<void> {
  const options = await Cli.parse();

  warnIfUsingComplexityWithIncompatibleFileTypes(options);
  assertGitIsInstalled();
  assertIsGitRootDirectory(options.directory);

  const statistics: Map<Path, Statistics> = await Statistics.compute(options);
  Cli.cleanup(options);
  Output.render(statistics, options);
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

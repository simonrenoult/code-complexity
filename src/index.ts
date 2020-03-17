#!/usr/bin/env node

import cli from "./cli";
import { prepareStdout } from "./services/prepare-stdout";
import {
  ComplexityPerFile,
  computeComplexityPerFile
} from "./services/compute-complexity-per-file";
import {
  CommitCountPerFile,
  countCommitsPerFile
} from "./services/count-commits-per-file";

main();

export default async function main(): Promise<void> {
  if (!cli.args || !cli.args.length) {
    cli.help();
    process.exit(0);
  }

  const [directory] = cli.args;
  const options = { firstParent: cli.firstParent, since: cli.since };

  const commitCountPerFiles: CommitCountPerFile[] = await countCommitsPerFile(
    directory,
    options
  );

  const complexityPerFiles: ComplexityPerFile[] = await computeComplexityPerFile(
    commitCountPerFiles
  );

  prepareStdout(complexityPerFiles, cli).forEach(line => console.log(line));
}

#!/usr/bin/env node

import cli from "../cli";
import { prepareStdout } from "./prepare-stdout";
import {
  ComplexityPerFile,
  computeComplexityPerFile
} from "./compute-complexity-per-file";
import {
  CommitCountPerFile,
  countCommitsPerFile
} from "./count-commits-per-file";

export default async function computeComplexity(): Promise<void> {
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

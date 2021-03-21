import * as commander from "commander";
import { CommanderStatic } from "commander";
import { lstatSync } from "fs";

import { buildDebugger, getPackageJson } from "../utils";
import { Format, Options, Sort } from "../lib/types";

const internal = { debug: buildDebugger("cli") };

export default { parse };

async function parse(): Promise<Options> {
  const { description, version } = await getPackageJson();
  const cli = getRawCli(description, version).parse(process.argv);

  assertArgsAreProvided(cli);
  assertIsDirectory(cli.args[0]);

  const options = buildOptions(cli);

  internal.debug(`applying options: ${JSON.stringify(options)}`);

  return options;
}

function getRawCli(
  description: string | undefined,
  version: string | undefined
): CommanderStatic {
  return commander
    .usage("<dir> [options]")
    .version(version || "")
    .description(description || "")
    .option(
      "--filter <strings>",
      "list of globs (comma separated) to filter",
      commaSeparatedList
    )
    .option(
      "-f, --format [format]",
      "format results using table or json",
      /^(table|json)$/i
    )
    .option(
      "-l, --limit [limit]",
      "limit the number of files to output",
      parseInt
    )
    .option("-i, --since [since]", "limit the age of the commit analyzed")
    .option(
      "-s, --sort [sort]",
      "sort results (allowed valued: score, churn, complexity or file)",
      /^(score|churn|complexity|file)$/i
    )
    .on("--help", () => {
      console.log();
      console.log("Examples:");
      console.log();
      [
        "$ code-complexity <dir>",
        "$ code-complexity <dir> --limit 3",
        "$ code-complexity <dir> --sort score",
        "$ code-complexity <dir> --filter 'src/**,!src/front/**'",
        "$ code-complexity <dir> --limit 10 --sort score",
      ].forEach((example) => console.log(example.padStart(2)));
    });
}

function buildOptions(cli: CommanderStatic): Options {
  return {
    directory: cli.args[0],
    format: cli.format ? (String(cli.format) as Format) : "table",
    filter: cli.filter || [],
    limit: cli.limit ? Number(cli.limit) : undefined,
    since: cli.since ? String(cli.since) : undefined,
    sort: cli.sort ? (String(cli.sort) as Sort) : undefined,
  };
}

function commaSeparatedList(value: string): string[] {
  return value.split(",");
}

function assertIsDirectory(directory: string): void {
  if (!lstatSync(directory).isDirectory()) {
    throw new Error(`Argument 'dir' must be a directory.`);
  }
}

function assertArgsAreProvided(internalCli: CommanderStatic): void {
  if (!internalCli.args || !internalCli.args.length) {
    internalCli.help();
    process.exit(1);
  }
}

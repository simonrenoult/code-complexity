import * as commander from "commander";
import { CommanderStatic } from "commander";
import { URL } from "url";

import { buildDebugger, getPackageJson } from "../utils";
import { Format, Options, Sort } from "../lib/types";
import { lstatSync } from "fs";
import { execSync } from "child_process";

const internal = { debug: buildDebugger("cli") };

export default { parse, cleanup };

async function parse(): Promise<Options> {
  const { description, version } = await getPackageJson();
  const cli = getRawCli(description, version).parse(process.argv);

  assertArgsAreProvided(cli);

  const options = buildOptions(cli);

  internal.debug(`applying options: ${JSON.stringify(options)}`);

  return options;
}

function cleanup(options: Options): void {
  if (options.target instanceof URL) {
    execSync(`rm -rf ${options.directory}`, { stdio: "ignore" });
  }
}

function getRawCli(
  description: string | undefined,
  version: string | undefined
): CommanderStatic {
  return commander
    .usage("<target> [options]")
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
        "$ code-complexity .",
        "$ code-complexity https://github.com/simonrenoult/code-complexity",
        "$ code-complexity foo --limit 3",
        "$ code-complexity ../foo --sort score",
        "$ code-complexity /foo/bar --filter 'src/**,!src/front/**'",
        "$ code-complexity . --limit 10 --sort score",
      ].forEach((example) => console.log(example.padStart(2)));
    });
}

function buildOptions(cli: CommanderStatic): Options {
  const target = parseTarget(cli.args[0]);
  return {
    target,
    directory: parseDirectory(target),
    format: cli.format ? (String(cli.format) as Format) : "table",
    filter: cli.filter || [],
    limit: cli.limit ? Number(cli.limit) : undefined,
    since: cli.since ? String(cli.since) : undefined,
    sort: cli.sort ? (String(cli.sort) as Sort) : undefined,
  };

  // FIXME: I'm not a fan of pulling the code here but it's good enough.
  function parseDirectory(target: string | URL): string {
    if (target instanceof URL) {
      const tmp = `code-complexity-${new Date().getTime()}`;
      execSync(`git clone ${target} ${tmp}`, { stdio: "ignore" });
      return tmp;
    } else {
      return target;
    }
  }

  function parseTarget(target: string): string | URL {
    try {
      return new URL(target);
    } catch (e) {
      try {
        lstatSync(target);
        return target;
      } catch (e) {
        throw new Error(
          "Argument 'target' is neither a directory nor a valid URL."
        );
      }
    }
  }
}

function commaSeparatedList(value: string): string[] {
  return value.split(",");
}

function assertArgsAreProvided(internalCli: CommanderStatic): void {
  if (!internalCli.args || !internalCli.args.length) {
    internalCli.help();
    process.exit(1);
  }
}

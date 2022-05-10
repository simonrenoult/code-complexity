import * as commander from "commander";
import { CommanderStatic } from "commander";
import { URL } from "url";

import { lstatSync } from "fs";
import git from "simple-git";
import { Command, Format, Options, Sort } from "../lib/types";
import { buildDebugger, getPackageJson } from "../utils";
import del = require("del");

const internal = { debug: buildDebugger("cli") };

export default { parse, cleanup };

async function parse(params?: Command): Promise<Options> {
  let cli;
  let options;

  if(!params) {
    const { description, version } = await getPackageJson();
    cli = getRawCli(description, version).parse(process.argv);
    assertArgsAreProvided(cli);
    options = await buildOptions(cli as any);
  } else {
    options = await buildOptions(params as any);
  }; 

  internal.debug(`applying options: ${JSON.stringify(options)}`);

  return options;
}

async function cleanup(options: Options) {
  if (options.target.startsWith("https://") || options.target.startsWith("http://")) {
    await del(options.directory);
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
      /^(table|json|csv)$/i
    )
    .option(
      "-l, --limit [limit]",
      "limit the number of files to output",
      parseInt
    )
    .option(
      "-i, --since [since]",
      "limit analysis to commits more recent in age than date"
    )
    .option(
      "-u, --until [until]",
      "limit analysis to commits older in age than date"
    )
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

async function buildOptions(cli: CommanderStatic): Promise<Options> {
  let target;

  if(cli.target) {
    target = String(cli.target);
  } else if(cli.args[0]) {
    target = parseTarget(cli.args[0] as any);
  } else {
    throw new Error("Target is not defined.");
  };

  return {
    target,
    directory: await parseDirectory(target),
    format: cli.format ? (String(cli.format) as Format) : "table",
    filter: cli.filter || [],
    limit: cli.limit ? Number(cli.limit) : undefined,
    since: cli.since ? String(cli.since) : undefined,
    until: cli.until ? String(cli.until) : undefined,
    sort: cli.sort ? (String(cli.sort) as Sort) : undefined,
  };

  // FIXME: I'm not a fan of pulling the code here but it's good enough.
  async function parseDirectory(target: string): Promise<string> {
    if (target.startsWith("https://github.com/") || target.startsWith("http://github.com/")) {
      const tmp = `src/temp/${target?.split("//github.com/")[1].replace(/\//g, "-")}-${new Date().getTime()}`;
      //old: execSync(`git clone ${target} ${tmp}`, { stdio: "ignore" });
      await git().clone(target, tmp);
      return tmp;
    } else {
      return target;
    }
  }

  function parseTarget(target: string): string {
    try {
      return new URL(target) as any; // \o/ typescript momments
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

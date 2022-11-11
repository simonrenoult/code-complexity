import { URL } from "url";

import { buildDebugger, getPackageJson } from "../utils";
import { ComplexityStrategy, Format, Options, Sort } from "../lib/types";
import { lstatSync } from "fs";
import { execSync } from "child_process";
import { Command, program } from "commander";
import { tmpdir } from "os";
import { sep } from "path";

const internal = { debug: buildDebugger("cli") };

export default { parse, cleanup };

async function parse(): Promise<Options> {
  const { description, version } = await getPackageJson();
  const cli = getRawCli(description, version).parse();

  assertArgsAreProvided(cli);

  const options = buildOptions(cli.args, cli.opts());

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
): Command {
  return program
    .name("code-complexity")
    .usage("<target> [options]")
    .argument("<target>")
    .version(version || "")
    .description(description || "")
    .option(
      "--filter <strings>",
      "list of globs (comma separated) to filter",
      commaSeparatedList
    )
    .option(
      "-cs, --complexity-strategy [sloc|cyclomatic|halstead]",
      "choose the complexity strategy to analyze your codebase with",
      /^(sloc|cyclomatic|halstead)$/i
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

function buildOptions(args: string[], options: any): Options {
  const target = parseTarget(args[0]);
  return {
    target,
    directory: parseDirectory(target),
    format: options.format ? (String(options.format) as Format) : "table",
    filter: options.filter || [],
    limit: options.limit ? Number(options.limit) : undefined,
    since: options.since ? String(options.since) : undefined,
    until: options.until ? String(options.until) : undefined,
    sort: options.sort ? (String(options.sort) as Sort) : undefined,
    complexityStrategy: options.complexityStrategy
      ? (String(options.complexityStrategy) as ComplexityStrategy)
      : "sloc",
  };

  // FIXME: I'm not a fan of pulling the code here but it's good enough.
  function parseDirectory(target: string | URL): string {
    if (target instanceof URL) {
      const temporaryDirLocation =
        tmpdir() + sep + `code-complexity-${new Date().getTime()}`;
      execSync(`git clone ${target} ${temporaryDirLocation}`, {
        stdio: "ignore",
      });
      return temporaryDirLocation;
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

function assertArgsAreProvided(internalCli: Command): void {
  if (!internalCli.args || !internalCli.args.length) {
    internalCli.help();
    process.exit(1);
  }
}

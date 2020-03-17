import { readFileSync } from "fs";
import { resolve } from "path";
import * as commander from "commander";

const pkg = getPackageJson();
const examples = [
  "$ code-complexity <dir>",
  "$ code-complexity <dir> --limit 3",
  "$ code-complexity <dir> --details",
  "$ code-complexity <dir> --min 10 --max 50",
  "$ code-complexity <dir> --sort complexity",
  "$ code-complexity <dir> --details --limit 10 --sort complexity"
];

export default commander
  .usage("<dir>")
  .description(pkg.description)
  .option(
    "-l, --limit [limit]",
    "Limit the number of files to output",
    parseInt
  )
  .option("-d, --details", "Show the number of commit and computed sloc")
  .option("-c, --commit", "Show the number of commits")
  .option("-s, --sloc", "Show the computed sloc")
  .option("-i, --since [since]", "Limit the age of the commit analyzed")
  .option(
    "-n, --no-first-parent",
    "Do not use the git-log flag '--first-parent' when counting commits"
  )
  .option(
    "--sort [sort]",
    "Sort results by commit, complexity, file or sloc",
    /^(commit|complexity|file|sloc)$/i
  )
  .option("--min [min]", "Exclude results below <min>", parseInt)
  .option("--max [max]", "Exclude results above <max>", parseInt)
  .on("--help", () => {
    console.log();
    console.log("Examples:");
    console.log();
    examples.forEach(example => console.log(`  ${example}`));
    console.log();
  })
  .parse(process.argv);

function getPackageJson(): { description: string } {
  const path = resolve(__dirname, "../package.json");
  const rawPkg = readFileSync(path, "utf8");
  return JSON.parse(rawPkg);
}

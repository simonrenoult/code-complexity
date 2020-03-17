import { readFileSync } from "fs";
import { resolve } from "path";
import * as commander from "commander";

const pkg = getPackageJson();

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
    console.log(
      "  Examples (using the source code instead of npm published versions):"
    );
    console.log();
    console.log(
      "    $ npm run build && node dist/index.js /path/to/git/directory"
    );
    console.log(
      "    $ npm run build && node dist/index.js /path/to/git/directory --limit 3"
    );
    console.log(
      "    $ npm run build && node dist/index.js /path/to/git/directory --details"
    );
    console.log(
      "    $ npx code-complexity /path/to/git/directory --min 10 --max 50"
    );
    console.log();
  })
  .parse(process.argv);

function getPackageJson(): { description: string } {
  const path = resolve(__dirname, "../package.json");
  const rawPkg = readFileSync(path, "utf8");
  return JSON.parse(rawPkg);
}

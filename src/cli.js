const pkg = require("../package");
const commander = require("commander");

commander
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
    console.log("  Examples:");
    console.log();
    console.log("    $ code-complexity /path/to/git/directory");
    console.log("    $ code-complexity /path/to/git/directory --limit 3");
    console.log("    $ code-complexity /path/to/git/directory --details");
    console.log(
      "    $ code-complexity /path/to/git/directory --min 10 --max 50"
    );
    console.log();
  })
  .parse(process.argv);

module.exports = commander;

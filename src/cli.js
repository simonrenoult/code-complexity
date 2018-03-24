const commander = require("commander");

commander
  .usage("<dir>")
  .option("-l, --limit [limit]", "Limit the number of files to output")
  .option("-d, --details", "Show the number of commit and computed sloc")
  .on("--help", () => {
    console.log();
    console.log("  Examples:");
    console.log();
    console.log("    $ code-complexity /path/to/git/directory");
    console.log("    $ code-complexity /path/to/git/directory --limit 3");
    console.log("    $ code-complexity /path/to/git/directory --details");
    console.log();
  })
  .parse(process.argv);

module.exports = commander;

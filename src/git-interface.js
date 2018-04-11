const { exec } = require("child_process");
const fs = require("fs");
const { promisify } = require("util");
const isDebug = process.env.DEBUG || false;

module.exports = {
  getRawCommitCount
};

async function getRawCommitCount(directory, firstParent, since) {
  if (!directory) {
    throw new Error("Argument 'dir' must be provided.");
  }

  if (!fs.lstatSync(directory).isDirectory()) {
    throw new Error("Argument 'dir' must be a directory.");
  }

  const firstParentFlag = firstParent ? "--first-parent" : "";
  const sinceParameter = since ? `--since="${since}"` : "";
  const command = `git -C ${directory} log ${sinceParameter} ${firstParentFlag} --name-only --format='' | sort | uniq -c`;

  if (isDebug) {
    console.log(command);
  }

  const { stdout, stderr } = await promisify(exec)(command);

  if (stderr) throw stderr;

  return stdout;
}

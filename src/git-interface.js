const { exec } = require("child_process");
const fs = require("fs");
const { promisify } = require("util");

module.exports = {
  getRawCommitCount
};

async function getRawCommitCount(directory) {
  if (!directory) {
    throw new Error("Argument 'dir' must be provided.");
  }

  if (!fs.lstatSync(directory).isDirectory()) {
    throw new Error("Argument 'dir' must be a directory.");
  }

  const { stdout, stderr } = await promisify(exec)(
    `git -C ${directory} log --name-only --format='' | sort | uniq -c`
  );

  if (stderr) throw stderr;

  return stdout;
}

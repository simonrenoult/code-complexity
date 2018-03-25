const { exec } = require("child_process");
const fs = require("fs");
const nodeSloc = require("node-sloc");
const path = require("path");
const pathExists = require("path-exists");
const { promisify } = require("util");

module.exports = {
  computeComplexity
};

async function computeComplexity(directory) {
  if (!directory) {
    throw new Error("Argument 'dir' must be provided.");
  }

  if (!fs.lstatSync(directory).isDirectory()) {
    throw new Error("Argument 'dir' must be a directory.");
  }

  const commitCount = await countCommitsPerFile(directory);

  const filesToAnalyze = commitCount.map(file => file.absolutePath);
  const slocPerFile = await computeSlocPerFile(filesToAnalyze);

  return await computeComplexityPerFile(commitCount, slocPerFile);
}

async function countCommitsPerFile(directory) {
  const { stdout, stderr } = await promisify(exec)(
    `git -C ${directory} log --name-only --format='' | sort | uniq -c`
  );

  if (stderr) throw stderr;

  return stdout
    .split("\n")
    .filter(line => line.endsWith(".js"))
    .map(line => {
      const matches = line.match(/(.+) (.+)/);
      const commitCount = parseInt(matches[1], 10);
      const pathToFile = matches[2];
      const absolutePath = path.resolve(directory, pathToFile);
      return { absolutePath, pathToFile, commitCount };
    })
    .filter(({ absolutePath }) => pathExists.sync(absolutePath));
}

async function computeSlocPerFile(fileList) {
  return await Promise.all(
    fileList.map(async file => {
      const { sloc } = await nodeSloc({ path: file });
      return { absolutePath: file, sloc };
    })
  );
}

function computeComplexityPerFile(commitCountList, slocList) {
  return commitCountList.map(commitCountObject => {
    const { sloc } = slocList.find(
      ({ absolutePath }) => absolutePath === commitCountObject.absolutePath
    );
    const overallComplexity = sloc.sloc * commitCountObject.commitCount;
    return Object.assign({ sloc, overallComplexity }, commitCountObject);
  });
}

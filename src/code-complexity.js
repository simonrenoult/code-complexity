const path = require("path");
const pathExists = require("path-exists");
const { getSloc } = require("./sloc-interface");

module.exports = {
  computeComplexity
};

async function computeComplexity(rawCommitCount, directory) {
  const commitCount = await parseRawCommitCount(rawCommitCount, directory);
  const filesToAnalyze = commitCount.map(file => file.absolutePath);
  const slocPerFile = await computeSlocPerFile(filesToAnalyze);

  return await computeComplexityPerFile(commitCount, slocPerFile);
}

async function parseRawCommitCount(rawCommitCountPerFile, directory) {
  return rawCommitCountPerFile
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.endsWith(".js"))
    .map(line => {
      const { commitCount, pathToFile } = parseRawLine(line);
      const absolutePath = path.resolve(directory, pathToFile);
      return { absolutePath, pathToFile, commitCount };
    })
    .filter(({ absolutePath }) => pathExists.sync(absolutePath));
}

function parseRawLine(line) {
  const COMMIT_COUNT_PER_FILE_REGEX = /(.+) (.+)/;
  const COMMIT_COUNT_INDEX = 1;
  const PATH_INDEX = 2;

  const matches = line.match(COMMIT_COUNT_PER_FILE_REGEX);
  const commitCount = parseInt(matches[COMMIT_COUNT_INDEX], 10);
  const pathToFile = matches[PATH_INDEX];

  return { commitCount, pathToFile };
}

async function computeSlocPerFile(fileList) {
  return await Promise.all(
    fileList.map(async file => {
      const sloc = await getSloc(file);
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

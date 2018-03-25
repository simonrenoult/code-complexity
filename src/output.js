const chalk = require("chalk");

module.exports = {
  displayResult
};

function displayResult(filesComplexity, cli) {
  console.log();

  filesComplexity
    .sort(sortByComplexityDesc)
    .filter(limitResult(cli.limit))
    .map(prepareLine(cli.details))
    .forEach(line => console.log(line));
}

function sortByComplexityDesc(fileA, fileB) {
  return fileB.overallComplexity - fileA.overallComplexity;
}

function limitResult(limit) {
  return (result, i) => (limit ? i < limit : true);
}

function prepareLine(details) {
  return ({ pathToFile, overallComplexity, commitCount, sloc: { sloc } }) => {
    let messageChunks = [
      chalk.yellow(pathToFile),
      chalk.magenta(overallComplexity)
    ];

    if (details) {
      messageChunks.push(
        chalk.blue(`(commits: ${commitCount}, sloc: ${sloc})`)
      );
    }

    return messageChunks.join(" ");
  };
}

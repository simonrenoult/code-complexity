const chalk = require("chalk");

module.exports = {
  displayResult
};

function displayResult(filesComplexity, cli) {
  console.log();

  filesComplexity
    .sort(sortResult(cli))
    .filter(limitResult(cli))
    .map(prepareLine(cli))
    .forEach(line => console.log(line));
}

function sortResult(cli) {
  return (fileA, fileB) => {
    if (cli.sort === "complexity") {
      return fileB.overallComplexity - fileA.overallComplexity;
    }

    if (cli.sort === "commit") {
      return fileB.commitCount - fileA.commitCount;
    }

    if (cli.sort === "sloc") {
      return fileB.sloc.sloc - fileA.sloc.sloc;
    }

    if (cli.sort === "file") {
      const fileAName = fileA.pathToFile;
      const fileBName = fileB.pathToFile;
      return fileAName.localeCompare(fileBName);
    }

    return 0;
  };
}

function limitResult({ limit, min, max }) {
  return ({ overallComplexity }, i) => {
    if (limit && i >= limit) {
      return false;
    }

    if (min && overallComplexity < min) {
      return false;
    }

    if (max && overallComplexity > max) {
      return false;
    }

    return true;
  };
}

function prepareLine(options) {
  return ({ pathToFile, overallComplexity, commitCount, sloc: { sloc } }) => {
    let messageChunks = [
      chalk.yellow(pathToFile),
      chalk.magenta(overallComplexity)
    ];

    if (options.commit) {
      messageChunks.push(chalk.blue(commitCount));
    }

    if (options.sloc) {
      messageChunks.push(chalk.blue(sloc));
    }

    if (options.details) {
      messageChunks.push(
        chalk.blue(`(commits: ${commitCount}, sloc: ${sloc})`)
      );
    }

    return messageChunks.join(" ");
  };
}

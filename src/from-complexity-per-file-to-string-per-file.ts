import { blue, magenta, yellow } from "chalk";
import { ComplexityPerFile } from "./compute-complexity-per-file";

export function fromComplexityPerFileToStringPerFile(
  filesComplexity: ComplexityPerFile[],
  cli
): string[] {
  return filesComplexity
    .sort(sortResult(cli.sort))
    .filter(limitResult(cli.limit, cli.min, cli.max))
    .map(prepareLine(cli));
}

function sortResult(sort) {
  return (fileA: ComplexityPerFile, fileB: ComplexityPerFile): number => {
    if (sort === "complexity") {
      return fileB.complexity - fileA.complexity;
    }

    if (sort === "commit") {
      return fileB.commitCount - fileA.commitCount;
    }

    if (sort === "sloc") {
      return fileB.sloc - fileA.sloc;
    }

    if (sort === "file") {
      const fileAName = fileA.relativePathToFile;
      const fileBName = fileB.relativePathToFile;
      return fileAName.localeCompare(fileBName);
    }

    return 0;
  };
}

function limitResult(limit, min, max) {
  return (complexityPerFile: ComplexityPerFile, i: number): boolean => {
    if (limit && i >= limit) {
      return false;
    }

    if (min && complexityPerFile.complexity < min) {
      return false;
    }

    if (max && complexityPerFile.complexity > max) {
      return false;
    }

    return true;
  };
}

function prepareLine(options) {
  return (complexityPerFile: ComplexityPerFile): string => {
    const messageChunks = [
      yellow(complexityPerFile.relativePathToFile),
      magenta(complexityPerFile.complexity)
    ];

    if (options.commit) {
      messageChunks.push(blue(complexityPerFile.commitCount));
    }

    if (options.sloc) {
      messageChunks.push(blue(complexityPerFile.sloc));
    }

    if (options.details) {
      messageChunks.push(
        blue(
          `(commits: ${complexityPerFile.commitCount}, sloc: ${complexityPerFile.sloc})`
        )
      );
    }

    return messageChunks.join(" ");
  };
}

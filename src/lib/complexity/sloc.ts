import * as fs from "fs";

const getComments = (text: string): Array<string> => {
  // Regex that matches all the strigns starting with //
  const singleLineCommentsRegex = /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm;
  return text ? text.match(singleLineCommentsRegex) || [] : [];
};

const calculateFromSourceCode = (sourceText: string): number => {
  const comments = getComments(sourceText);
  for (let i = 0; i < comments.length; i++) {
    const aMatched = comments[i];
    sourceText = sourceText.replace(aMatched, "").trim();
  }

  return sourceText
    .split("\n")
    .map((aLine) => aLine.trim())
    .filter((aLine) => !!aLine).length;
};

export function calculate(path: string): number {
  const contents = fs.readFileSync(path).toString("utf8");
  const result = calculateFromSourceCode(contents);

  return result;
}

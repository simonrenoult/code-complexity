import * as fs from "fs";
import {
  forEachChild,
  SyntaxKind,
  createSourceFile,
  ScriptTarget,
} from "typescript";
import { isFunctionWithBody } from "tsutils";
import { getNodeName } from "../../utils";
import { HalsteadOutput } from "../types";

const isIdentifier = (kind: SyntaxKind): boolean =>
  kind === SyntaxKind.Identifier;
const isLiteral = (kind: SyntaxKind): boolean =>
  kind >= SyntaxKind.FirstLiteralToken && kind <= SyntaxKind.LastLiteralToken;

const isToken = (kind: SyntaxKind): boolean =>
  kind >= SyntaxKind.FirstPunctuation && kind <= SyntaxKind.LastPunctuation;

const isKeyword = (kind: SyntaxKind): boolean =>
  kind >= SyntaxKind.FirstKeyword && kind <= SyntaxKind.LastKeyword;

const isAnOperator = (node: any): boolean =>
  isToken(node.kind) || isKeyword(node.kind);
const isAnOperand = (node: any): boolean =>
  isIdentifier(node.kind) || isLiteral(node.kind);

const getOperatorsAndOperands = (node: any): any => {
  const output: HalsteadOutput = {
    operators: { total: 0, _unique: new Set([]), unique: 0 },
    operands: { total: 0, _unique: new Set([]), unique: 0 },
  };
  forEachChild(node, function cb(currentNode: any) {
    if (isAnOperand(currentNode)) {
      output.operands.total++;
      output.operands._unique.add(currentNode.text || currentNode.escapedText);
    } else if (isAnOperator(currentNode)) {
      output.operators.total++;
      output.operators._unique.add(currentNode.text || currentNode.kind);
    }
    forEachChild(currentNode, cb);
  });
  output.operands.unique = output.operands._unique.size;
  output.operators.unique = output.operators._unique.size;

  return output;
};

const getHalstead = (node: any): any => {
  if (isFunctionWithBody(node)) {
    const { operands, operators } = getOperatorsAndOperands(node);
    const length = operands.total + operators.total;
    const vocabulary = operands.unique + operators.unique;

    // If legnth is 0, all other values will be NaN
    if (length === 0 || vocabulary === 1) return {};

    const volume = length * Math.log2(vocabulary);
    const difficulty =
      (operators.unique / 2) * (operands.total / operands.unique);
    const effort = volume * difficulty;
    const time = effort / 18;
    const bugsDelivered = effort ** (2 / 3) / 3000;

    return {
      length,
      vocabulary,
      volume,
      difficulty,
      effort,
      time,
      bugsDelivered,
      operands,
      operators,
    };
  }

  return {};
};

// Returns the halstead volume for a function
// If passed node is not a function, returns empty object
const calculateFromSource = (ctx: any): any => {
  const output: any = {};
  forEachChild(ctx, function cb(node) {
    if (isFunctionWithBody(node)) {
      const name = getNodeName(node);
      output[name] = getHalstead(node);
    }
    forEachChild(node, cb);
  });

  return output;
};

export function calculate(path: string): number {
  if (!(path.endsWith("ts") || path.endsWith("js"))) {
    throw new Error(
      "Halstead strategy is only available for JavaScript/TypeScript files."
    );
  }

  const contents = fs.readFileSync(path).toString("utf8");
  const source = createSourceFile(path, contents, ScriptTarget.ES2015);
  const result = calculateFromSource(source);
  const counts: Array<number> = Object.values(result);
  const complexity = counts?.reduce(
    (accum: number, stats: any): number =>
      accum + Math.round(stats.volume ?? 1),
    0
  );

  return complexity ?? 1;
}

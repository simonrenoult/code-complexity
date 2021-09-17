import * as fs from "fs";
import {
  forEachChild,
  SyntaxKind,
  createSourceFile,
  ScriptTarget,
} from "typescript";
import { isFunctionWithBody } from "tsutils";
import { getNodeName } from "../../utils";

const increasesComplexity = (node: any): boolean => {
  switch (node.kind) {
    case SyntaxKind.CaseClause:
      return node.statements.length > 0;
    case SyntaxKind.CatchClause:
    case SyntaxKind.ConditionalExpression:
    case SyntaxKind.DoStatement:
    case SyntaxKind.ForStatement:
    case SyntaxKind.ForInStatement:
    case SyntaxKind.ForOfStatement:
    case SyntaxKind.IfStatement:
    case SyntaxKind.WhileStatement:
      return true;

    case SyntaxKind.BinaryExpression:
      switch (node.operatorToken.kind) {
        case SyntaxKind.BarBarToken:
        case SyntaxKind.AmpersandAmpersandToken:
          return true;
        default:
          return false;
      }

    default:
      return false;
  }
};

export function calculateFromSource(ctx: any): any {
  let complexity = 0;
  const output: any = {};
  forEachChild(ctx, function cb(node) {
    if (isFunctionWithBody(node)) {
      const old = complexity;
      complexity = 1;
      forEachChild(node, cb);
      const name = getNodeName(node);
      output[name] = complexity;
      complexity = old;
    } else {
      if (increasesComplexity(node)) {
        complexity += 1;
      }
      forEachChild(node, cb);
    }
  });

  return output;
}

export function calculate(path: string): any {
  if (!(path.endsWith("ts") || path.endsWith("js"))) {
    throw new Error(
      "Cyclomatic strategy is only available for JavaScript/TypeScript files."
    );
  }

  const contents = fs.readFileSync(path).toString("utf8");
  const source = createSourceFile(path, contents, ScriptTarget.ES2015);
  const result = calculateFromSource(source);
  const counts: Array<number> = Object.values(result);
  const complexity = counts?.reduce(
    (accum: number, complexity: number): number => accum + complexity,
    0
  );

  return complexity ?? 1;
}

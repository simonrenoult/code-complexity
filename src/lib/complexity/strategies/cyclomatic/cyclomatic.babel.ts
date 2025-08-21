import * as assert from "node:assert";
import { readFileSync } from "node:fs";
import { ParseResult, traverse } from "@babel/core";
import { parse, ParserOptions } from "@babel/parser";

type FunctionComplexity = { name: string; complexity: number };

export function compute(path: string, options: ParserOptions) {
  const code = readFileSync(path, { encoding: "utf8" });
  const ast = parse(code, options);
  assert.ok(ast);
  return cyclomaticForAst(ast, code, options);
}

export function cyclomaticForAst(
  ast: ParseResult,
  code: string,
  options: ParserOptions,
): number {
  const results: FunctionComplexity[] = [];
  let hasTopLevelStatements = false;

  traverse(ast, {
    FunctionDeclaration(path) {
      const fnCode = code.slice(
        path.node.start ?? undefined,
        path.node.end ?? undefined,
      );
      results.push({
        name: path.node.id?.name || "<anonymous>",
        complexity: cyclomaticForCode(fnCode, options),
      });
    },
    FunctionExpression(path) {
      const fnCode = code.slice(
        path.node.start ?? undefined,
        path.node.end ?? undefined,
      );
      results.push({
        name: path.node.id?.name || "<anonymous>",
        complexity: cyclomaticForCode(fnCode, options),
      });
    },
    ArrowFunctionExpression(path) {
      const fnCode = code.slice(
        path.node.start ?? undefined,
        path.node.end ?? undefined,
      );
      let name = "<arrow>";
      if (path.parent.type === "VariableDeclarator" && path.parent.id) {
        assert.ok("name" in path.parent.id);
        name = path.parent.id.name;
      }
      results.push({
        name,
        complexity: cyclomaticForCode(fnCode, options),
      });
    },

    enter(path) {
      const topLevelTypes = [
        "ExpressionStatement",
        "IfStatement",
        "ForStatement",
        "ForInStatement",
        "ForOfStatement",
        "WhileStatement",
        "DoWhileStatement",
        "SwitchStatement",
        "TryStatement",
      ];
      if (path.parent.type === "Program" && topLevelTypes.includes(path.type)) {
        hasTopLevelStatements = true;
      }
    },
  });

  return hasTopLevelStatements
    ? cyclomaticForCode(code, options)
    : results.reduce((prev, cur) => prev + cur.complexity, 0);
}

function cyclomaticForCode(code: string, options: ParserOptions) {
  const ast = parse(code, options);
  assert.ok(ast);

  let complexity = 1;

  traverse(ast, {
    IfStatement() {
      complexity++;
    },
    ForStatement() {
      complexity++;
    },
    ForInStatement() {
      complexity++;
    },
    ForOfStatement() {
      complexity++;
    },
    WhileStatement() {
      complexity++;
    },
    DoWhileStatement() {
      complexity++;
    },
    SwitchCase(path) {
      if (path.node.test) complexity++;
    },
    ConditionalExpression() {
      complexity++;
    },
    LogicalExpression(path) {
      if (["&&", "||"].includes(path.node.operator)) complexity++;
    },
    CatchClause() {
      complexity++;
    },
  });

  return complexity;
}

import * as fs from "node:fs";
import { parse, ParserOptions } from "@babel/parser";
import traverse from "@babel/traverse";
import { buildDebugger } from "../../../../utils";
import { Node } from "@babel/core";

export const internal = { debug: buildDebugger("statistics:halstead") };

export function compute(path: string, options: ParserOptions) {
  const code = fs.readFileSync(path, "utf8");
  const ast = parse(code, options);

  const operators = new Set<string>();
  const operands = new Set<string>();
  let rawOperatorCount = 0;
  let rawOperandCount = 0;

  traverse(ast, {
    enter(path) {
      const op = isOperator(path.node);
      if (op) {
        operators.add(op);
        rawOperatorCount++;
      }
      const opd = isOperand(path.node);
      if (opd) {
        operands.add(opd);
        rawOperandCount++;
      }
    },
  });

  const distinctOperatorCount = operators.size;
  const distinctOperandCount = operands.size;
  const programLength = rawOperatorCount + rawOperandCount;
  const vocabularyLength = distinctOperatorCount + distinctOperandCount;

  const volume = programLength * Math.log2(Math.max(vocabularyLength, 1));
  const difficulty =
    distinctOperandCount === 0
      ? 0
      : (distinctOperatorCount / 2) * (rawOperandCount / distinctOperandCount);
  const effort = difficulty * volume;
  const timeToProgram = effort / 18;
  const errorEstimationCount = volume / 3000;

  internal.debug({
    operands,
    operators,
    rawOperandCount,
    rawOperatorCount,
    distinctOperandCount,
    distinctOperatorCount,
    programLength,
    vocabularyLength,
    volume,
    difficulty,
    effort,
    timeToProgram,
    errorEstimationCount,
  });

  return Math.round(volume);
}

function isOperand(node: Node): string | null {
  switch (node.type) {
    case "Identifier":
      return node.name;
    case "StringLiteral":
      return JSON.stringify(node.value);
    case "NumericLiteral":
      return String(node.value);
    case "BooleanLiteral":
      return String(node.value);
    case "NullLiteral":
      return "null";
    case "TemplateElement":
      return "`" + node.value.raw + "`";
    default:
      return null;
  }
}

function isOperator(node: Node): string | null {
  switch (node.type) {
    // Expressions binaires / logiques / assignations
    case "BinaryExpression":
    case "LogicalExpression":
    case "AssignmentExpression":
      return node.operator;

    // Unaires / mises à jour (++/--/!)
    case "UnaryExpression":
    case "UpdateExpression":
      return node.operator;

    // Appel de fonction
    case "CallExpression":
      return "call";

    // Accès membre : obj.prop ou obj["prop"]
    case "MemberExpression":
      return "memberAccess";

    // Opérateurs ternaires
    case "ConditionalExpression":
      return "?:";

    // Déclarations et structures de contrôle
    case "IfStatement":
      return "if";
    case "ForStatement":
      return "for";
    case "ForOfStatement":
      return "forOf";
    case "ForInStatement":
      return "forIn";
    case "WhileStatement":
      return "while";
    case "DoWhileStatement":
      return "doWhile";
    case "SwitchStatement":
      return "switch";
    case "SwitchCase":
      return "case";
    case "BreakStatement":
      return "break";
    case "ContinueStatement":
      return "continue";
    case "ThrowStatement":
      return "throw";
    case "TryStatement":
      return "try";
    case "CatchClause":
      return "catch";
    case "ReturnStatement":
      return "return";

    // Déclarations de fonctions, variables, classes
    case "FunctionDeclaration":
    case "ArrowFunctionExpression":
    case "FunctionExpression":
      return "function";
    case "VariableDeclaration":
      return node.kind; // var | let | const
    case "ClassDeclaration":
      return "class";
    case "NewExpression":
      return "new";

    default:
      return null;
  }
}

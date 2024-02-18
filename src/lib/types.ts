import { URL } from "node:url";

export type Path = string;
export type Sort = "score" | "churn" | "complexity" | "file" | "ratio";
export type Format = "table" | "json" | "csv";
export type ComplexityStrategy = "sloc" | "halstead" | "cyclomatic";
export type Options = {
  target: string | URL;
  directory: string;
  directories?: boolean;
  limit?: number;
  since?: string;
  until?: string;
  sort?: Sort;
  complexityStrategy?: ComplexityStrategy;
  filter?: string[];
  format?: Format;
};

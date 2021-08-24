import { URL } from "url";

export type Path = string;
export type Sort = "score" | "churn" | "complexity" | "file" | "ratio";
export type Format = "table" | "json";
export type Options = {
  target: string | URL;
  directory: string;
  limit?: number;
  complexityStrategy?: string;
  since?: string;
  sort?: Sort;
  filter?: string[];
  format?: Format;
};
export type HalsteadOps = {
  total: number;
  _unique: Set<number>;
  unique: number;
};
export type HalsteadOutput = {
  operators: HalsteadOps;
  operands: HalsteadOps;
};

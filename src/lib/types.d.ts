export type Path = string;
export type Sort = "score" | "churn" | "complexity" | "file";
export type Format = "table" | "json";
export type Options = {
  directory: string;
  limit?: number;
  since?: string;
  sort?: Sort;
  filter?: string[];
  format?: Format;
};

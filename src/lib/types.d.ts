
export type Path = string;
export type Sort = "score" | "churn" | "complexity" | "file" | "ratio";
export type Format = "table" | "json" | "csv";
export type Options = {
  target: string;
  directory: string;
  limit?: number;
  since?: string;
  until?: string;
  sort?: Sort;
  filter?: string[];
  format?: Format;
};
export type Command = {
  target: string;
  limit?: number;
  since?: string;
  until?: string;
  sort?: Sort;
  filter?: string[];
};
import * as nodeSloc from "node-sloc";
import { CommitCountPerFile } from "./count-commits-per-file";

export class ComplexityPerFile {
  public readonly complexity: number;
  public readonly relativePathToFile: string;
  public readonly absolutePathToFile: string;
  public readonly sloc: number;
  public readonly commitCount: number;

  constructor(
    relativePathToFile: string,
    absolutePathToFile: string,
    commitCount: number,
    sloc: { sloc: number }
  ) {
    this.relativePathToFile = relativePathToFile;
    this.absolutePathToFile = absolutePathToFile;
    this.commitCount = commitCount;
    this.sloc = sloc.sloc;
    this.complexity = sloc.sloc * commitCount;
  }

  static async create(
    commitCountPerFile: CommitCountPerFile
  ): Promise<ComplexityPerFile> {
    return new ComplexityPerFile(
      commitCountPerFile.relativePathToFile,
      commitCountPerFile.absolutePathToFile,
      commitCountPerFile.commitCount,
      (await nodeSloc({ path: commitCountPerFile.absolutePathToFile })).sloc
    );
  }
}

export async function computeComplexityPerFile(
  commitCountPerFiles: CommitCountPerFile[]
): Promise<ComplexityPerFile[]> {
  return await Promise.all(commitCountPerFiles.map(ComplexityPerFile.create));
}

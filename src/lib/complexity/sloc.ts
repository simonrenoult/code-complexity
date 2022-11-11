import * as sloc from "node-sloc";
import { createReadStream } from "fs";

export default async function compute(absolutePath: string): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const result = await sloc({ path: absolutePath });
  if (result?.sloc) {
    return result?.sloc;
  } else {
    return countLineNumber(absolutePath);
  }
}

async function countLineNumber(absolutePath: string): Promise<number> {
  const ASCII_FOR_NEW_LINE = "10";
  const ASCII_FOR_CARRIAGE_RETURN = "13";

  let count = 0;
  return new Promise((resolve) => {
    createReadStream(absolutePath)
      .on("data", function (chunk) {
        for (let i = 0; i < chunk.length; ++i) {
          const char = chunk[i];
          // Use "==" instead of "===" to use type coercion
          if (char == ASCII_FOR_NEW_LINE || char == ASCII_FOR_CARRIAGE_RETURN) {
            count += 1;
          }
        }
      })
      .on("end", function () {
        resolve(count);
      });
  });
}

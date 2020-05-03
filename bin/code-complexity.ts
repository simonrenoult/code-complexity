#!/usr/bin/env node

import computeCodeComplexity from "../src/io";

computeCodeComplexity().catch((error) => {
  console.error(error);
  process.exit(1);
});

#!/usr/bin/env bun

import { generateLlmsGuideFile } from "./generate-llms-full-lib";
import { relative } from "path";

const rootDir = process.cwd();

generateLlmsGuideFile(rootDir).then((outputPath) => {
  console.log(`Generated ${relative(rootDir, outputPath)}`);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});

#!/usr/bin/env bun

import { main } from "./generate-docs-diagrams-lib";

const force = process.argv.includes("--force");

main({ force }).catch((error) => {
  console.error(error);
  process.exit(1);
});

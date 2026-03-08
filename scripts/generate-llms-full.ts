#!/usr/bin/env bun

import { main } from "./generate-llms-full-lib";

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

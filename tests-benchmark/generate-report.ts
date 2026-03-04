#!/usr/bin/env bun
import { writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const ROOT_DIR = join(import.meta.dir, "..");

function getFileSize(path: string): number {
  if (existsSync(path)) {
    return readFileSync(path).length;
  }
  return 0;
}

function formatKB(bytes: number): string {
  return (bytes / 1024).toFixed(2) + "KB";
}

function runBenchmarks() {
  console.log("Running benchmarks...\n");
  
  const output = execSync("bun test tests-benchmark/", {
    cwd: ROOT_DIR,
    encoding: "utf-8"
  });
  
  return output;
}

function parseBundleSize(output: string) {
  const results: any = {};
  
  const xrMatch = output.match(/X-Robot minified: ([\d.]+)KB/);
  if (xrMatch) results.xRobot = parseFloat(xrMatch[1]);
  
  const xsFullMatch = output.match(/xstate\.js \(full\): ([\d.]+)KB/);
  if (xsFullMatch) results.xstateFull = parseFloat(xsFullMatch[1]);
  
  const xsWebMatch = output.match(/xstate\.web\.js \(web\): ([\d.]+)KB/);
  if (xsWebMatch) results.xstateWeb = parseFloat(xsWebMatch[1]);
  
  const xsIntMatch = output.match(/xstate\.interpreter\.js: ([\d.]+)KB/);
  if (xsIntMatch) results.xstateInterpreter = parseFloat(xsIntMatch[1]);
  
  return results;
}

function parsePerformance(output: string) {
  const results: any = {};
  
  const match1 = output.match(/=== Performance Comparison[\s\S]*?X-Robot: ([\d.]+)ms[\s\S]*?XState:\s+([\d.]+)ms/);
  if (match1) {
    results.simple5k = { xRobot: parseFloat(match1[1]), xState: parseFloat(match1[2]) };
  }
  
  const match2 = output.match(/=== Performance with Guards[\s\S]*?X-Robot: ([\d.]+)ms[\s\S]*?XState:\s+([\d.]+)ms/);
  if (match2) {
    results.guards3k = { xRobot: parseFloat(match2[1]), xState: parseFloat(match2[2]) };
  }
  
  const match3 = output.match(/=== 10k Transitions Comparison[\s\S]*?X-Robot: ([\d.]+)ms[\s\S]*?XState:\s+([\d.]+)ms/);
  if (match3) {
    results.transitions10k = { xRobot: parseFloat(match3[1]), xState: parseFloat(match3[2]) };
  }
  
  const match4 = output.match(/=== 10k Context Updates Comparison[\s\S]*?X-Robot: ([\d.]+)ms[\s\S]*?XState:\s+([\d.]+)ms/);
  if (match4) {
    results.context10k = { xRobot: parseFloat(match4[1]), xState: parseFloat(match4[2]) };
  }
  
  const match5 = output.match(/=== invokeAfter Scheduling \((\d+) iterations\)[\s\S]*?X-Robot: ([\d.]+)ms[\s\S]*?XState:\s+([\d.]+)ms/);
  if (match5) {
    results.invokeAfter = { xRobot: parseFloat(match5[2]), xState: parseFloat(match5[3]) };
  }
  
  const match6 = output.match(/=== Delayed Transitions Complete[\s\S]*?X-Robot: ([\d.]+)ms[\s\S]*?XState:\s+([\d.]+)ms/);
  if (match6) {
    results.delayedTransitions = { xRobot: parseFloat(match6[1]), xState: parseFloat(match6[2]) };
  }
  
  return results;
}

function parseLOC(output: string) {
  const results: any = {};
  
  const match1 = output.match(/=== Simple Machine[\s\S]*?X-Robot: (\d+) lines/);
  const match1b = output.match(/=== Simple Machine[\s\S]*?XState:\s+(\d+) lines/);
  if (match1 && match1b) {
    results.simple = { xRobot: parseInt(match1[1]), xState: parseInt(match1b[1]) };
  }
  
  const match2 = output.match(/=== Async Machine[\s\S]*?X-Robot: (\d+) lines/);
  const match2b = output.match(/=== Async Machine[\s\S]*?XState:\s+(\d+) lines/);
  if (match2 && match2b) {
    results.async = { xRobot: parseInt(match2[1]), xState: parseInt(match2b[1]) };
  }
  
  const match3 = output.match(/=== Guards Machine[\s\S]*?X-Robot: (\d+) lines/);
  const match3b = output.match(/=== Guards Machine[\s\S]*?XState:\s+(\d+) lines/);
  if (match3 && match3b) {
    results.guards = { xRobot: parseInt(match3[1]), xState: parseInt(match3b[1]) };
  }
  
  const match4 = output.match(/=== Delayed Transitions[\s\S]*?X-Robot: (\d+) lines/);
  const match4b = output.match(/=== Delayed Transitions[\s\S]*?XState:\s+(\d+) lines/);
  if (match4 && match4b) {
    results.delayed = { xRobot: parseInt(match4[1]), xState: parseInt(match4b[1]) };
  }
  
  return results;
}

function generateMarkdown(bundle: any, perf: any, loc: any, distSizes: any) {
  const date = new Date().toISOString().split("T")[0];
  
  const xrKB = distSizes.core;
  const xsIntKB = distSizes.xstateInterpreter;
  const xsWebKB = distSizes.xstateWeb;
  const xsFullKB = distSizes.xstateFull;
  
  const totalSize = distSizes.core + distSizes.documentate + distSizes.validate;
  
  const ratios = [
    xsIntKB / xrKB,
    xsWebKB / xrKB,
    xsFullKB / xrKB
  ];
  const minRatio = Math.min(...ratios);
  const maxRatio = Math.max(...ratios);
  
  const perfSpeeds = [
    perf.simple5k ? perf.simple5k.xState / perf.simple5k.xRobot : 0,
    perf.guards3k ? perf.guards3k.xState / perf.guards3k.xRobot : 0,
    perf.transitions10k ? perf.transitions10k.xState / perf.transitions10k.xRobot : 0,
    perf.context10k ? perf.context10k.xState / perf.context10k.xRobot : 0,
    perf.invokeAfter ? perf.invokeAfter.xState / perf.invokeAfter.xRobot : 0,
    perf.delayedTransitions ? perf.delayedTransitions.xState / perf.delayedTransitions.xRobot : 0
  ].filter(r => r > 0);
  
  const minSpeed = Math.min(...perfSpeeds);
  const maxSpeed = Math.max(...perfSpeeds);
  
  const locRatios = [
    loc.simple ? loc.simple.xState / loc.simple.xRobot : 0,
    loc.async ? loc.async.xState / loc.async.xRobot : 0,
    loc.guards ? loc.guards.xState / loc.guards.xRobot : 0,
    loc.delayed ? loc.delayed.xState / loc.delayed.xRobot : 0
  ].filter(r => r > 0);
  
  const minLOC = Math.min(...locRatios);
  const maxLOC = Math.max(...locRatios);
  
  let md = `# X-Robot Performance Report

Generated: ${date}

---

## Bundle Size

### Core (x-robot only)

| Library                 | Size     | vs X-Robot Core |
| ----------------------- | -------- | --------------- |
| X-Robot Core (minified) | **${formatKB(distSizes.core)}** | 1x              |
| XState interpreter      | ${formatKB(distSizes.xstateInterpreter)}  | ${(distSizes.xstateInterpreter / distSizes.core).toFixed(1)}x            |
| XState web              | ${formatKB(distSizes.xstateWeb)}  | ${(distSizes.xstateWeb / distSizes.core).toFixed(1)}x            |
| XState full             | ${formatKB(distSizes.xstateFull)}   | ${(distSizes.xstateFull / distSizes.core).toFixed(1)}x            |

### With Modules (x-robot + documentate + validate)

| Module                                                   | Size      |
| -------------------------------------------------------- | --------- |
| X-Robot Core                                             | ${formatKB(distSizes.core)}   |
| + documentate (code gen, diagrams, serialization, SCXML) | +${formatKB(distSizes.documentate)}     |
| + validate (machine validation)                          | +${formatKB(distSizes.validate)}     |
| **Total**                                                | **${formatKB(totalSize)}** |

---

## Features Comparison

| Feature             | X-Robot Core (${formatKB(distSizes.core)}) | X-Robot + Modules (${formatKB(totalSize)}) | XState Interpreter (${formatKB(distSizes.xstateInterpreter)}) | XState Web (${formatKB(distSizes.xstateWeb)}) | XState Full (${formatKB(distSizes.xstateFull)}) |
| ------------------- | ------------------- | ------------------------- | ------------------------- | ----------------- | ------------------ |
| Nested states       | ✅                  | ✅                        | ❌                        | ✅                | ✅                 |
| Parallel states     | ✅                  | ✅                        | ❌                        | ✅                | ✅                 |
| Guards              | ✅                  | ✅                        | ✅                        | ✅                | ✅                 |
| Async guards        | ✅                  | ✅                        | ❌                        | ❌                | ❌                 |
| Entry/Exit actions  | ✅                  | ✅                        | ✅                        | ✅                | ✅                 |
| Context             | ✅                  | ✅                        | ✅                        | ✅                | ✅                 |
| Final states        | ✅                  | ✅                        | ✅                        | ✅                | ✅                 |
| invoke()            | ✅                  | ✅                        | ✅                        | ✅                | ✅                 |
| Delayed transitions | ✅                  | ✅                        | ❌                        | ✅                | ✅                 |
| History tracking    | ✅                  | ✅                        | ❌                        | ❌                | ❌                 |
| Machine validation  | ❌                  | ✅ validate()             | ❌                        | ❌                | ❌                 |
| Code generation     | ❌                  | ✅ documentate()          | ❌                        | ❌                | ❌                 |
| Diagram generation  | ❌                  | ✅ documentate()          | ❌                        | ❌                | ❌                 |
| JSON serialization  | ❌                  | ✅ documentate()          | ❌                        | ❌                | ❌                 |
| SCXML import/export | ❌                  | ✅ documentate()          | ❌                        | ❌                | ✅                 |
| Actor model         | ❌                  | ❌                        | ❌                        | ❌                | ✅                 |

---

## Performance

| Test                   | X-Robot | XState   | Advantage        |
| ---------------------- | ------- | -------- | ---------------- |
| 5k transitions         | ${perf.simple5k?.xRobot.toFixed(2) || "N/A"}ms  | ${perf.simple5k?.xState.toFixed(2) || "N/A"}ms | **${perf.simple5k ? (perf.simple5k.xState / perf.simple5k.xRobot).toFixed(1) : "N/A"}x faster** |
| 3k with guards         | ${perf.guards3k?.xRobot.toFixed(2) || "N/A"}ms  | ${perf.guards3k?.xState.toFixed(2) || "N/A"}ms  | **${perf.guards3k ? (perf.guards3k.xState / perf.guards3k.xRobot).toFixed(1) : "N/A"}x faster**  |
| 10k transitions        | ${perf.transitions10k?.xRobot.toFixed(2) || "N/A"}ms  | ${perf.transitions10k?.xState.toFixed(2) || "N/A"}ms | **${perf.transitions10k ? (perf.transitions10k.xState / perf.transitions10k.xRobot).toFixed(1) : "N/A"}x faster** |
| 10k context updates    | ${perf.context10k?.xRobot.toFixed(2) || "N/A"}ms | ${perf.context10k?.xState.toFixed(2) || "N/A"}ms  | **${perf.context10k ? (perf.context10k.xState / perf.context10k.xRobot).toFixed(1) : "N/A"}x faster**  |
| invokeAfter scheduling | ${perf.invokeAfter?.xRobot.toFixed(2) || "N/A"}ms  | ${perf.invokeAfter?.xState.toFixed(2) || "N/A"}ms  | **${perf.invokeAfter ? (perf.invokeAfter.xState / perf.invokeAfter.xRobot).toFixed(1) : "N/A"}x faster**  |
| Delayed transitions    | ${perf.delayedTransitions?.xRobot.toFixed(2) || "N/A"}ms | ${perf.delayedTransitions?.xState.toFixed(2) || "N/A"}ms  | **${perf.delayedTransitions ? (perf.delayedTransitions.xState / perf.delayedTransitions.xRobot).toFixed(1) : "N/A"}x faster**  |

---

## Developer Experience (Lines of Code)

| Example             | X-Robot | XState | Advantage     |
| ------------------- | ------- | ------ | ------------- |
| Simple machine      | ${loc.simple?.xRobot || "N/A"}       | ${loc.simple?.xState || "N/A"}     | **${loc.simple ? (loc.simple.xState / loc.simple.xRobot).toFixed(1) : "N/A"}x less** |
| Async machine       | ${loc.async?.xRobot || "N/A"}      | ${loc.async?.xState || "N/A"}     | **${loc.async ? (loc.async.xState / loc.async.xRobot).toFixed(1) : "N/A"}x less** |
| Guards machine      | ${loc.guards?.xRobot || "N/A"}      | ${loc.guards?.xState || "N/A"}     | **${loc.guards ? (loc.guards.xState / loc.guards.xRobot).toFixed(1) : "N/A"}x less** |
| Delayed transitions | ${loc.delayed?.xRobot || "N/A"} | ${loc.delayed?.xState || "N/A"}     | **${loc.delayed ? (loc.delayed.xState / loc.delayed.xRobot).toFixed(1) : "N/A"}x less** |

---

## Why X-Robot?

1. **${minRatio.toFixed(1)}-${maxRatio.toFixed(1)}x smaller** bundle size (core only)
2. **${minSpeed.toFixed(1)}-${maxSpeed.toFixed(1)}x faster** performance
3. **${minLOC.toFixed(1)}-${maxLOC.toFixed(1)}x less code** to write
4. **More features** - History, validate(), documentate() (code gen, diagrams, serialization, SCXML)
5. **Simpler API** - Declarative, functional approach
6. **Native async guards** - No workarounds needed
7. **invokeAfter()** - Built-in with cancel functionality
8. **Better DX** - documentate() for code & diagram generation, validate() for machine validation
9. **SCXML support** - Import/export machines in standard SCXML format (via documentate())
10. **Machine validation** - Built-in validation to catch errors before runtime (via validate())
`;

  return md;
}

function getDistSizes() {
  const corePath = join(ROOT_DIR, "dist/index.min.js");
  const documentatePath = join(ROOT_DIR, "dist/documentate/index.min.js");
  
  const validateJsPath = join(ROOT_DIR, "dist/validate/index.js");
  const validateMjsPath = join(ROOT_DIR, "dist/validate/index.mjs");
  
  const core = getFileSize(corePath);
  const documentate = getFileSize(documentatePath);
  
  const validate = getFileSize(validateMjsPath) || getFileSize(validateJsPath);
  
  const xstateInterpreterPath = join(ROOT_DIR, "node_modules/xstate/dist/xstate.interpreter.js");
  const xstateWebPath = join(ROOT_DIR, "node_modules/xstate/dist/xstate.web.js");
  const xstateFullPath = join(ROOT_DIR, "node_modules/xstate/dist/xstate.js");
  
  return {
    core,
    documentate,
    validate,
    xstateInterpreter: getFileSize(xstateInterpreterPath),
    xstateWeb: getFileSize(xstateWebPath),
    xstateFull: getFileSize(xstateFullPath)
  };
}

function main() {
  const distSizes = getDistSizes();
  
  console.log("=== File Sizes ===");
  console.log(`Core: ${formatKB(distSizes.core)}`);
  console.log(`Documentate: ${formatKB(distSizes.documentate)}`);
  console.log(`Validate: ${formatKB(distSizes.validate)}`);
  console.log(`Total: ${formatKB(distSizes.core + distSizes.documentate + distSizes.validate)}`);
  console.log(`XState Interpreter: ${formatKB(distSizes.xstateInterpreter)}`);
  console.log(`XState Web: ${formatKB(distSizes.xstateWeb)}`);
  console.log(`XState Full: ${formatKB(distSizes.xstateFull)}`);
  console.log("");
  
  const output = runBenchmarks();
  
  const bundle = parseBundleSize(output);
  const perf = parsePerformance(output);
  const loc = parseLOC(output);
  
  const md = generateMarkdown(bundle, perf, loc, distSizes);
  
  const outputPath = join(ROOT_DIR, "PERFORMANCE.md");
  writeFileSync(outputPath, md);
  
  console.log(`\n✓ Performance report generated: ${outputPath}`);
}

main();

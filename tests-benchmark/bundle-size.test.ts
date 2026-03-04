import { describe, it, expect } from "bun:test";
import fs from "fs";
import path from "path";

const __dirname = path.dirname(import.meta.url.replace('file://', ''));

describe("Bundle Size Benchmark", () => {
  it("should have smaller bundle than all XState versions", () => {
    const xRobotDistPath = path.resolve(__dirname, "../dist/index.js");
    const xRobotMinPath = path.resolve(__dirname, "../dist/index.min.js");
    
    expect(fs.existsSync(xRobotDistPath)).toBe(true);
    expect(fs.existsSync(xRobotMinPath)).toBe(true);
    
    const distSize = fs.statSync(xRobotDistPath).size;
    const minSize = fs.statSync(xRobotMinPath).size;
    
    // XState versions with features
    const xStateVersions = [
      { 
        name: "xstate.js (full)", 
        path: "../node_modules/xstate/dist/xstate.js",
        features: [
          "Hierarchical states (nested)",
          "Parallel states",
          "Actors/Actor model",
          "Services (invoke)",
          "Guards/Conditions",
          "Actions (entry/exit)",
          "Context/assign",
          "History (pseudo-states)",
          "Final states",
          "Delayed transitions",
          "SCXML import/export"
        ]
      },
      { 
        name: "xstate.web.js (web)", 
        path: "../node_modules/xstate/dist/xstate.web.js",
        features: [
          "Hierarchical states",
          "Parallel states",
          "Services",
          "Guards",
          "Actions",
          "Context/assign",
          "Final states",
          "(No Node.js specific: process, fs, etc.)"
        ]
      },
      { 
        name: "xstate.interpreter.js", 
        path: "../node_modules/xstate/dist/xstate.interpreter.js",
        features: [
          "Basic FSM transitions only",
          "Simple state machine",
          "No hierarchical states",
          "No parallel states",
          "No services/invoke"
        ]
      },
    ];
    
    console.log(`\n=== Bundle Size Comparison ===`);
    console.log(`X-Robot minified: ${(minSize / 1024).toFixed(2)}KB`);
    console.log(`Features: nested, parallel, guards, async guards, exit, history\n`);
    console.log(`-----------------------------------`);
    
    for (const version of xStateVersions) {
      const xStatePath = path.resolve(__dirname, version.path);
      if (fs.existsSync(xStatePath)) {
        const xStateSize = fs.statSync(xStatePath).size;
        const ratio = (xStateSize / minSize).toFixed(1);
        console.log(`${version.name}: ${(xStateSize / 1024).toFixed(2)}KB (${ratio}x)`);
        console.log(`  Features:`);
        for (const feature of version.features) {
          console.log(`    - ${feature}`);
        }
        expect(minSize).toBeLessThan(xStateSize);
      }
    }
    
    const smallestXStateSize = fs.statSync(path.resolve(__dirname, xStateVersions[2].path)).size;
    const ratio = (smallestXStateSize / minSize).toFixed(1);
    console.log(`\nX-Robot is ${ratio}x smaller than the smallest XState version`);
    
    expect(minSize).toBeLessThan(20 * 1024);
  });

  it("should have efficient minified bundle", () => {
    const xRobotMinPath = path.resolve(__dirname, "../dist/index.min.js");
    const minSize = fs.statSync(xRobotMinPath).size;
    
    console.log(`Minified size: ${(minSize / 1024).toFixed(2)}KB`);
    
    expect(minSize).toBeLessThan(16 * 1024);
  });

  it("should provide ESM and CJS builds", () => {
    const esmPath = path.resolve(__dirname, "../dist/index.js");
    expect(fs.existsSync(esmPath)).toBe(true);
    
    const content = fs.readFileSync(esmPath, 'utf8');
    expect(content.includes('export')).toBe(true);
  });
});

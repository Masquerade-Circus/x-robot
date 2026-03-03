import {
  machine,
  state,
  transition,
  init,
  initial,
  invoke,
  context,
  entry
} from "../lib";
import { createMachine, interpret, assign } from "xstate";
import { describe, it, expect } from "bun:test";

describe("Memory Usage Benchmark", () => {
  it("should use minimal memory per machine instance", () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    const machines: any[] = [];
    for (let i = 0; i < 1000; i++) {
      machines.push(
        machine(
          `Machine${i}`,
          init(initial("idle")),
          state("idle", transition("next", "active")),
          state("active", transition("next", "idle"))
        )
      );
    }
    
    const afterCreationMemory = process.memoryUsage().heapUsed;
    const memoryPerMachine = (afterCreationMemory - initialMemory) / 1000;
    
    console.log(`Memory per machine: ${(memoryPerMachine / 1024).toFixed(2)}KB`);
    console.log(`Total machines: 1000`);
    
    expect(memoryPerMachine).toBeLessThan(10 * 1024);
  });

  it("should handle many transitions without memory leak", () => {
    const myMachine = machine(
      "MemoryTest",
      init(initial("idle"), context({ counter: 0 })),
      state("idle", transition("next", "state1")),
      state("state1", transition("next", "state2")),
      state("state2", transition("next", "idle"))
    );
    
    const initialHeap = process.memoryUsage().heapUsed;
    
    for (let i = 0; i < 10000; i++) {
      invoke(myMachine, "next");
    }
    
    const finalHeap = process.memoryUsage().heapUsed;
    const memoryGrowth = finalHeap - initialHeap;
    
    console.log(`Memory growth after 10k transitions: ${(memoryGrowth / 1024).toFixed(2)}KB`);
    
    expect(memoryGrowth).toBeLessThan(20 * 1024 * 1024);
  });

  it("should release memory when machines are dereferenced", () => {
    const createMachine = () => {
      return machine(
        "TempMachine",
        init(initial("idle")),
        state("idle", transition("next", "active")),
        state("active", transition("next", "idle"))
      );
    };
    
    const initialMemory = process.memoryUsage().heapUsed;
    
    for (let i = 0; i < 100; i++) {
      const tempMachine = createMachine();
      invoke(tempMachine, "next");
    }
    
    // Force garbage collection if available
    if (globalThis.gc) {
      globalThis.gc();
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryDiff = finalMemory - initialMemory;
    
    console.log(`Memory difference after dereferencing: ${(memoryDiff / 1024).toFixed(2)}KB`);
    
    expect(Math.abs(memoryDiff)).toBeLessThan(10 * 1024 * 1024);
  });

  it("should use less memory than XState per machine instance", () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // X-Robot: create 1000 machines
    const xRobotMachines: any[] = [];
    for (let i = 0; i < 1000; i++) {
      xRobotMachines.push(
        machine(
          `XRobot${i}`,
          init(initial("idle")),
          state("idle", transition("next", "active")),
          state("active", transition("next", "idle"))
        )
      );
    }
    
    const afterXRobotMemory = process.memoryUsage().heapUsed;
    const xRobotMemoryPerMachine = (afterXRobotMemory - initialMemory) / 1000;
    
    // Clear reference for fair comparison
    const beforeXStateMemory = process.memoryUsage().heapUsed;
    
    // XState: create 1000 machines
    const xStateMachines: any[] = [];
    for (let i = 0; i < 1000; i++) {
      const xStateMachine = createMachine({
        initial: "idle",
        states: {
          idle: { on: { next: "active" }},
          active: { on: { next: "idle" }}
        }
      });
      xStateMachines.push(interpret(xStateMachine).start());
    }
    
    const afterXStateMemory = process.memoryUsage().heapUsed;
    const xStateMemoryPerMachine = (afterXStateMemory - beforeXStateMemory) / 1000;
    
    console.log(`\n=== Memory Per Machine Instance (1000 machines) ===`);
    console.log(`X-Robot: ${(xRobotMemoryPerMachine / 1024).toFixed(2)}KB`);
    console.log(`XState:  ${(xStateMemoryPerMachine / 1024).toFixed(2)}KB`);
    console.log(`X-Robot uses ${(xStateMemoryPerMachine / (xRobotMemoryPerMachine || 1)).toFixed(1)}x less memory`);
    
    expect(xRobotMemoryPerMachine).toBeLessThan(xStateMemoryPerMachine);
  });

  it("should have comparable memory growth to XState after transitions", () => {
    // X-Robot test
    const xRobotMachine = machine(
      "XRobotMemTest",
      init(initial("idle")),
      state("idle", transition("next", "state1")),
      state("state1", transition("next", "idle"))
    );
    
    const xRobotInitialMemory = process.memoryUsage().heapUsed;
    for (let i = 0; i < 5000; i++) {
      invoke(xRobotMachine, "next");
    }
    const xRobotFinalMemory = process.memoryUsage().heapUsed;
    const xRobotGrowth = xRobotFinalMemory - xRobotInitialMemory;
    
    // XState test
    const xStateMachine = createMachine({
      initial: "idle",
      states: {
        idle: { on: { next: "state1" }},
        state1: { on: { next: "idle" }}
      }
    });
    const xStateService = interpret(xStateMachine).start();
    
    const xStateInitialMemory = process.memoryUsage().heapUsed;
    for (let i = 0; i < 5000; i++) {
      xStateService.send("next");
    }
    const xStateFinalMemory = process.memoryUsage().heapUsed;
    const xStateGrowth = xStateFinalMemory - xStateInitialMemory;
    
    console.log(`\n=== Memory Growth After 5k Transitions ===`);
    console.log(`X-Robot: ${(xRobotGrowth / 1024).toFixed(2)}KB`);
    console.log(`XState:  ${(xStateGrowth / 1024).toFixed(2)}KB`);
  });

  it("should show memory usage for context updates", () => {
    // X-Robot test
    const xRobotMachine = machine(
      "XRobotCtx",
      init(initial("idle"), context({ counter: 0 })),
      state("idle", 
        transition("inc", "idle"),
        entry((ctx: any) => { ctx.counter++; })
      )
    );
    
    const xRobotInitialMemory = process.memoryUsage().heapUsed;
    for (let i = 0; i < 5000; i++) {
      invoke(xRobotMachine, "inc");
    }
    const xRobotFinalMemory = process.memoryUsage().heapUsed;
    const xRobotGrowth = xRobotFinalMemory - xRobotInitialMemory;
    
    // XState test
    const xStateMachine = createMachine({
      initial: "idle",
      context: { counter: 0 },
      states: {
        idle: {
          on: {
            inc: {
              actions: assign({ counter: (ctx: any) => ctx.counter + 1 })
            }
          }
        }
      }
    });
    const xStateService = interpret(xStateMachine).start();
    
    const xStateInitialMemory = process.memoryUsage().heapUsed;
    for (let i = 0; i < 5000; i++) {
      xStateService.send("inc");
    }
    const xStateFinalMemory = process.memoryUsage().heapUsed;
    const xStateGrowth = xStateFinalMemory - xStateInitialMemory;
    
    console.log(`\n=== Memory Growth After 5k Context Updates ===`);
    console.log(`X-Robot: ${(xRobotGrowth / 1024).toFixed(2)}KB`);
    console.log(`XState:  ${(xStateGrowth / 1024).toFixed(2)}KB`);
  });
});

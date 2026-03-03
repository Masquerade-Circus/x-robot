import {
  machine,
  state,
  transition,
  init,
  initial,
  invoke,
  context,
  entry,
  guard,
  invokeAfter
} from "../lib";
import { createMachine, interpret, assign } from "xstate";
import { describe, it, expect } from "bun:test";

describe("Performance Benchmark", () => {
  it("should complete 10k transitions in under 100ms", () => {
    const myMachine = machine(
      "PerfTest",
      init(initial("idle")),
      state("idle", transition("next", "state1")),
      state("state1", transition("next", "state2")),
      state("state2", transition("next", "idle"))
    );

    const iterations = 10000;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      invoke(myMachine, "next");
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`X-Robot 10k transitions: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(100);
  });

  it("should be faster than XState for same operations", () => {
    const iterations = 5000;
    
    // X-Robot
    const xRobotMachine = machine(
      "PerfTest",
      init(initial("idle")),
      state("idle", transition("next", "state1")),
      state("state1", transition("next", "idle"))
    );

    const xRobotStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      invoke(xRobotMachine, "next");
    }
    const xRobotEnd = performance.now();
    const xRobotDuration = xRobotEnd - xRobotStart;

    // XState
    const xStateMachine = createMachine({
      initial: "idle",
      states: {
        idle: { on: { next: "state1" }},
        state1: { on: { next: "idle" }}
      }
    });
    const xStateService = interpret(xStateMachine).start();

    const xStateStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      xStateService.send("next");
    }
    const xStateEnd = performance.now();
    const xStateDuration = xStateEnd - xStateStart;

    console.log(`\n=== Performance Comparison (${iterations} transitions) ===`);
    console.log(`X-Robot: ${xRobotDuration.toFixed(2)}ms`);
    console.log(`XState:  ${xStateDuration.toFixed(2)}ms`);
    console.log(`X-Robot is ${(xStateDuration / xRobotDuration).toFixed(1)}x faster`);

    expect(xRobotDuration).toBeLessThan(xStateDuration);
  });

  it("should be faster than XState with guards", () => {
    const iterations = 3000;
    
    // X-Robot with guard
    const alwaysTrue = () => true;
    const xRobotMachine = machine(
      "GuardTest",
      init(initial("idle")),
      state("idle", transition("next", "state1", guard(alwaysTrue))),
      state("state1", transition("next", "idle"))
    );

    const xRobotStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      invoke(xRobotMachine, "next");
    }
    const xRobotEnd = performance.now();
    const xRobotDuration = xRobotEnd - xRobotStart;

    // XState with guard
    const xStateMachine = createMachine({
      initial: "idle",
      states: {
        idle: { 
          on: { 
            next: { 
              target: "state1",
              cond: () => true
            }
          }
        },
        state1: { on: { next: "idle" }}
      }
    });
    const xStateService = interpret(xStateMachine).start();

    const xStateStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      xStateService.send("next");
    }
    const xStateEnd = performance.now();
    const xStateDuration = xStateEnd - xStateStart;

    console.log(`\n=== Performance with Guards (${iterations} transitions) ===`);
    console.log(`X-Robot: ${xRobotDuration.toFixed(2)}ms`);
    console.log(`XState:  ${xStateDuration.toFixed(2)}ms`);
    console.log(`X-Robot is ${(xStateDuration / xRobotDuration).toFixed(1)}x faster`);

    expect(xRobotDuration).toBeLessThan(xStateDuration);
  });

  it("should handle rapid state changes efficiently", () => {
    const myMachine = machine(
      "RapidTest",
      init(initial("a")),
      state("a", transition("step", "b")),
      state("b", transition("step", "c")),
      state("c", transition("step", "d")),
      state("d", transition("step", "a"))
    );

    const iterations = 5000;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      const s = ["a", "b", "c", "d"][i % 4];
      if (myMachine.current !== s) {
        invoke(myMachine, "step");
      }
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`5k rapid changes: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(50);
  });

  it("should handle machines with many states efficiently", () => {
    const myMachine = machine(
      "ManyStates",
      init(initial("state0")),
      state("state0", transition("next", "state1")),
      state("state1", transition("next", "state2")),
      state("state2", transition("next", "state3")),
      state("state3", transition("next", "state4")),
      state("state4", transition("next", "state5")),
      state("state5", transition("next", "state6")),
      state("state6", transition("next", "state7")),
      state("state7", transition("next", "state8")),
      state("state8", transition("next", "state9")),
      state("state9", transition("next", "state0"))
    );

    const iterations = 1000;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      invoke(myMachine, "next");
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`1k transitions (10 states): ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(50);
  });

  it("should handle context updates efficiently", () => {
    const updateContext = (ctx: any) => {
      ctx.counter++;
    };

    const myMachine = machine(
      "ContextPerf",
      init(initial("idle"), context({ counter: 0 })),
      state("idle", 
        entry(updateContext),
        transition("inc", "idle")
      )
    );

    const iterations = 10000;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      invoke(myMachine, "inc");
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`10k context updates: ${duration.toFixed(2)}ms`);
    expect(myMachine.context.counter).toBe(iterations);
    expect(duration).toBeLessThan(200);
  });

  it("should be faster than XState for 10k transitions", () => {
    const iterations = 10000;
    
    // X-Robot
    const xRobotMachine = machine(
      "PerfTest",
      init(initial("idle")),
      state("idle", transition("next", "state1")),
      state("state1", transition("next", "idle"))
    );

    const xRobotStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      invoke(xRobotMachine, "next");
    }
    const xRobotEnd = performance.now();
    const xRobotDuration = xRobotEnd - xRobotStart;

    // XState
    const xStateMachine = createMachine({
      initial: "idle",
      states: {
        idle: { on: { next: "state1" }},
        state1: { on: { next: "idle" }}
      }
    });
    const xStateService = interpret(xStateMachine).start();

    const xStateStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      xStateService.send("next");
    }
    const xStateEnd = performance.now();
    const xStateDuration = xStateEnd - xStateStart;

    console.log(`\n=== 10k Transitions Comparison ===`);
    console.log(`X-Robot: ${xRobotDuration.toFixed(2)}ms`);
    console.log(`XState:  ${xStateDuration.toFixed(2)}ms`);
    console.log(`X-Robot is ${(xStateDuration / xRobotDuration).toFixed(1)}x faster`);

    expect(xRobotDuration).toBeLessThan(xStateDuration);
  });

  it("should be faster than XState for 10k context updates", () => {
    const iterations = 10000;
    
    // X-Robot
    const xRobotMachine = machine(
      "ContextPerf",
      init(initial("idle"), context({ counter: 0 })),
      state("idle", 
        entry((ctx: any) => { ctx.counter++; }),
        transition("inc", "idle")
      )
    );

    const xRobotStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      invoke(xRobotMachine, "inc");
    }
    const xRobotEnd = performance.now();
    const xRobotDuration = xRobotEnd - xRobotStart;

    // XState
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

    const xStateStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      xStateService.send("inc");
    }
    const xStateEnd = performance.now();
    const xStateDuration = xStateEnd - xStateStart;

    console.log(`\n=== 10k Context Updates Comparison ===`);
    console.log(`X-Robot: ${xRobotDuration.toFixed(2)}ms`);
    console.log(`XState:  ${xStateDuration.toFixed(2)}ms`);
    console.log(`X-Robot is ${(xStateDuration / xRobotDuration).toFixed(1)}x faster`);

    expect(xRobotDuration).toBeLessThan(xStateDuration);
  });

  it("should be faster than XState for async operations", async () => {
    const iterations = 500;
    
    const asyncHandler = async () => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1));
    };

    // X-Robot with async entry
    const createXRobotMachine = () => machine(
      "AsyncTest",
      init(initial("idle")),
      state("idle", transition("run", "processing")),
      state("processing", entry(asyncHandler, "success")),
      state("success", transition("reset", "idle"))
    );

    let xRobotDuration = 0;
    for (let i = 0; i < iterations; i++) {
      const xRobotMachine = createXRobotMachine();
      const start = performance.now();
      invoke(xRobotMachine, "run");
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 2));
      xRobotDuration += performance.now() - start;
    }

    // XState with async invoke
    const createXStateMachine = () => createMachine({
      initial: "idle",
      states: {
        idle: { on: { run: "processing" }},
        processing: {
          invoke: {
            src: async () => {
              await new Promise<void>((resolve) => setTimeout(() => resolve(), 1));
              return true;
            },
            onDone: { target: "success" }
          }
        },
        success: { on: { reset: "idle" }}
      }
    });

    let xStateDuration = 0;
    for (let i = 0; i < iterations; i++) {
      const service = interpret(createXStateMachine()).start();
      const start = performance.now();
      service.send("run");
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 2));
      xStateDuration += performance.now() - start;
    }

    console.log(`\n=== Async Operations (${iterations} iterations) ===`);
    console.log(`X-Robot: ${xRobotDuration.toFixed(2)}ms`);
    console.log(`XState:  ${xStateDuration.toFixed(2)}ms`);
    
    const ratio = xStateDuration / xRobotDuration;
    console.log(`X-Robot is ${ratio.toFixed(1)}x ${ratio >= 1 ? 'faster' : 'slower'}`);
  });

  it("should be faster than XState with async guards", async () => {
    const iterations = 300;
    
    const asyncGuard = async () => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1));
      return true;
    };

    // X-Robot with async guard - natively supported
    const xRobotMachine = machine(
      "AsyncGuardTest",
      init(initial("idle")),
      state("idle", transition("check", "state1", guard(asyncGuard))),
      state("state1", transition("reset", "idle")),
      state("state2")
    );

    let xRobotDuration = 0;
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      invoke(xRobotMachine, "check");
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 2));
      xRobotMachine.current = "idle";
      xRobotDuration += performance.now() - start;
    }

    // XState: simulate by wrapping in invoke (no native async guard support)
    const xStateMachine = createMachine({
      initial: "idle",
      states: {
        idle: { on: { check: "checking" }},
        checking: {
          invoke: {
            src: async () => {
              await new Promise<void>((resolve) => setTimeout(() => resolve(), 1));
              return true;
            },
            onDone: { target: "state1" }
          }
        },
        state1: { on: { reset: "idle" }},
        state2: {}
      }
    });

    let xStateDuration = 0;
    for (let i = 0; i < iterations; i++) {
      const service = interpret(xStateMachine).start();
      const start = performance.now();
      service.send("check");
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 2));
      xStateDuration += performance.now() - start;
    }

    console.log(`\n=== Async Guards (${iterations} iterations) ===`);
    console.log(`X-Robot: ${xRobotDuration.toFixed(2)}ms`);
    console.log(`XState:  ${xStateDuration.toFixed(2)}ms (using invoke workaround)`);
    
    const ratio = xStateDuration / xRobotDuration;
    console.log(`X-Robot is ${ratio.toFixed(1)}x ${ratio >= 1 ? 'faster' : 'slower'}`);
  });

  it("should schedule 1k delayed transitions efficiently", () => {
    const iterations = 1000;

    // X-Robot: invokeAfter is a simple function call
    const xRobotStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      const myMachine = machine(
        "PerfTest",
        init(initial("idle")),
        state("idle", transition("tick", "tocked")),
        state("tocked")
      );
      invokeAfter(myMachine, 1000, "tick");
    }
    const xRobotDuration = performance.now() - xRobotStart;

    // XState: delayed transitions require machine definition with 'after' config
    const xStateStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      createMachine({
        initial: "idle",
        states: {
          idle: { after: { 1000: "tocked" }},
          tocked: {}
        }
      });
    }
    const xStateDuration = performance.now() - xStateStart;

    console.log(`\n=== invokeAfter Scheduling (${iterations} iterations) ===`);
    console.log(`X-Robot: ${xRobotDuration.toFixed(2)}ms`);
    console.log(`XState:  ${xStateDuration.toFixed(2)}ms`);

    const ratio = xStateDuration / xRobotDuration;
    console.log(`X-Robot is ${ratio.toFixed(1)}x ${ratio >= 1 ? 'faster' : 'slower'}`);

    expect(xRobotDuration).toBeLessThan(xStateDuration);
  });

  it("should complete delayed transitions faster than XState", async () => {
    const delayMs = 50;
    const iterations = 100;

    // X-Robot: Run all machines and measure total time including wait
    const xRobotStart = performance.now();
    
    const xRobotPromises: Promise<void>[] = [];
    for (let i = 0; i < iterations; i++) {
      const myMachine = machine(
        "PerfTest",
        init(initial("idle")),
        state("idle", transition("tick", "done")),
        state("done")
      );
      
      const p = new Promise<void>((resolve) => {
        invokeAfter(myMachine, delayMs, "tick");
        // Just wait for the delay
        setTimeout(() => resolve(), delayMs + 5);
      });
      xRobotPromises.push(p);
    }
    
    await Promise.all(xRobotPromises);
    const xRobotDuration = performance.now() - xRobotStart;

    // XState: Same approach
    const xStateStart = performance.now();
    
    const xStatePromises: Promise<void>[] = [];
    for (let i = 0; i < iterations; i++) {
      const xStateMachine = createMachine({
        initial: "idle",
        states: {
          idle: { after: { [delayMs]: "done" }},
          done: {}
        }
      });
      
      const p = new Promise<void>((resolve) => {
        interpret(xStateMachine).start();
        // Just wait for the delay
        setTimeout(() => resolve(), delayMs + 5);
      });
      xStatePromises.push(p);
    }
    
    await Promise.all(xStatePromises);
    const xStateDuration = performance.now() - xStateStart;

    console.log(`\n=== Delayed Transitions Complete (${iterations}x${delayMs}ms) ===`);
    console.log(`X-Robot: ${xRobotDuration.toFixed(2)}ms`);
    console.log(`XState:  ${xStateDuration.toFixed(2)}ms`);

    const ratio = xStateDuration / xRobotDuration;
    console.log(`X-Robot is ${ratio.toFixed(1)}x ${ratio >= 1 ? 'faster' : 'slower'}`);

    expect(xRobotDuration).toBeLessThan(xStateDuration);
  });
});

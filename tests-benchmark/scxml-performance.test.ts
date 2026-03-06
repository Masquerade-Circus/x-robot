import { machine, state, transition, init, initial, parallel, nested, entry, exit, guard } from "../lib";
import { documentate } from "../lib/documentate";
import { describe, it, expect } from "bun:test";

describe("SCXML Performance Benchmark", () => {
  // Create a moderately complex machine for testing
  function createTestMachine(stateCount: number = 10) {
    const states = [state("idle", transition("start", "active"))];
    
    for (let i = 1; i < stateCount - 1; i++) {
      states.push(state(`state${i}`, transition("next", `state${i + 1}`)));
    }
    
    states.push(state(`state${stateCount - 1}`, transition("reset", "idle")));
    
    return machine(
      "PerfTest",
      init(initial("idle")),
      ...states
    );
  }

  it("should export to SCXML efficiently", async () => {
    const testMachine = createTestMachine(50);
    
    const iterations = 100;
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      await documentate(testMachine, { format: "scxml" });
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    const avgTime = duration / iterations;
    
    console.log(`\n=== SCXML Export Performance ===`);
    console.log(`X-Robot SCXML export (50 states, ${iterations} iterations): ${duration.toFixed(2)}ms total`);
    console.log(`Average per export: ${avgTime.toFixed(2)}ms`);
    
    expect(avgTime).toBeLessThan(50); // Should be under 50ms per export
  });

  it("should import from SCXML efficiently", async () => {
    const scxml = `<?xml version="1.0" encoding="UTF-8"?>
<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0" initial="idle" name="Test">
  <state id="idle">
    <transition event="start" target="active"/>
  </state>
  <state id="active">
    <transition event="next" target="state1"/>
  </state>
  <state id="state1">
    <transition event="next" target="state2"/>
  </state>
  <state id="state2">
    <transition event="next" target="state3"/>
  </state>
  <state id="state3">
    <transition event="next" target="state4"/>
  </state>
  <state id="state4">
    <transition event="reset" target="idle"/>
  </state>
</scxml>`;
    
    const iterations = 100;
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      await documentate(scxml, { format: "serialized" });
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    const avgTime = duration / iterations;
    
    console.log(`\n=== SCXML Import Performance ===`);
    console.log(`X-Robot SCXML import (6 states, ${iterations} iterations): ${duration.toFixed(2)}ms total`);
    console.log(`Average per import: ${avgTime.toFixed(2)}ms`);
    
    expect(avgTime).toBeLessThan(50); // Should be under 50ms per import
  });

  it("should handle complex machines with nested and parallel states", async () => {
    // Create a more complex machine with nested and parallel states
    const counterMachine = machine(
      "Counter",
      init(initial("idle")),
      state("idle", transition("start", "counting")),
      state("counting", 
        transition("increment", "counting"),
        transition("stop", "stopped")
      ),
      state("stopped")
    );

    const timerMachine = machine(
      "Timer",
      init(initial("running")),
      state("running", transition("tick", "running")),
      state("paused")
    );

    const complexMachine = machine(
      "Complex",
      init(initial("idle")),
      state("idle", transition("start", "active")),
      state("active", parallel(counterMachine), transition("pause", "paused")),
      parallel(timerMachine),
      state("paused", transition("resume", "active"))
    );

    const iterations = 50;
    
    // Test export
    const exportStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      await documentate(complexMachine, { format: "scxml" });
    }
    const exportEnd = performance.now();
    const exportTime = (exportEnd - exportStart) / iterations;

    // Test import
    const { scxml } = await documentate(complexMachine, { format: "scxml" });
    const importStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      await documentate(scxml!, { format: "serialized" });
    }
    const importEnd = performance.now();
    const importTime = (importEnd - importStart) / iterations;

    console.log(`\n=== Complex Machine SCXML Performance ===`);
    console.log(`Export (avg): ${exportTime.toFixed(2)}ms`);
    console.log(`Import (avg): ${importTime.toFixed(2)}ms`);
    console.log(`Total roundtrip (avg): ${(exportTime + importTime).toFixed(2)}ms`);

    expect(exportTime).toBeLessThan(100);
    expect(importTime).toBeLessThan(100);
  });

  it("should roundtrip SCXML correctly", async () => {
    const originalMachine = machine(
      "RoundtripTest",
      init(initial("idle")),
      state("idle", 
        transition("start", "running"),
        entry(() => {})
      ),
      state("running", 
        transition("stop", "idle"),
        exit(() => {}),
        transition("fail", "error", guard(() => false))
      ),
      state("error", transition("reset", "idle"))
    );

    // Export to SCXML
    const { scxml } = await documentate(originalMachine, { format: "scxml" });
    
    // Import back
    const { serialized } = await documentate(scxml!, { format: "serialized" });
    
    // Verify structure is preserved
    expect(serialized.initial).toBe("idle");
    expect(serialized.states.idle).toBeDefined();
    expect(serialized.states.running).toBeDefined();
    expect(serialized.states.error).toBeDefined();
    expect(serialized.states.idle.on!.start.target).toBe("running");
    expect(serialized.states.running.on!.stop.target).toBe("idle");
    
    console.log(`\n=== SCXML Roundtrip ===`);
    console.log(`Original: 3 states, 3 transitions`);
    console.log(`Roundtrip: Success!`);
  });
});

import { documentate } from "../lib/documentate";
import { machine, init, initial, state, transition, exit } from "../lib";
import { describe, it } from "mocha";

import bird from "./bird-machine-ts";
import expect from "expect";

describe("TypeScript Generation", () => {
  it("should generate state interface", async () => {
    const myMachine = machine(
      "Test",
      init(initial("idle")),
      state("idle", transition("next", "active")),
      state("active")
    );

    const result = await documentate(myMachine, { format: 'ts' });
    const code = result.ts!;

    expect(code).toContain("export interface");
    expect(code).toContain("States {");
    expect(code).toContain("idle:");
    expect(code).toContain("active:");
  });

  it("should generate context interface", async () => {
    const myMachine = machine(
      "Test",
      init(initial("idle"), { context: { count: 0, name: "" } }),
      state("idle", transition("next", "active")),
      state("active")
    );

    const result = await documentate(myMachine, { format: 'ts' });
    const code = result.ts!;

    expect(code).toContain("export interface");
    expect(code).toContain("Context {");
    expect(code).toContain("count:");
    expect(code).toContain("name:");
  });

  it("should include generics in machine call", async () => {
    const myMachine = machine(
      "MyMachine",
      init(initial("idle")),
      state("idle", transition("next", "active")),
      state("active")
    );

    const result = await documentate(myMachine, { format: 'ts' });
    const code = result.ts!;

    expect(code).toContain("machine<");
    expect(code).toContain("Context>");
  });

  it("should generate code from a complex machine (bird)", async () => {
    const result = await documentate(bird, { format: 'ts' });
    const code = result.ts!;

    expect(code).toContain("export interface");
    expect(code).toContain("birdContext");
    expect(code).toContain("birdStates");
    expect(code).toContain("land:");
    expect(code).toContain("flying:");
  });

  it("should generate code with exit", async () => {
    function cleanup(context: any) {
      context.cleaned = true;
    }

    const myMachine = machine(
      "Test",
      init(initial("idle")),
      state("idle", transition("start", "loading", exit(cleanup))),
      state("loading")
    );

    const result = await documentate(myMachine, { format: 'ts' });
    const code = result.ts!;
    
    expect(code).toContain("exit");
    expect(code).toContain("cleanup");
  });
});

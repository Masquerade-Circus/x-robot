import { generateFromSerializedMachine, Format, serialize, machine, init, initial, state, transition, exit } from "../lib";
import { describe, it } from "mocha";

import bird from "./bird-machine-ts";
import expect from "expect";

describe("TypeScript Generation", () => {
  it("should generate state interface", () => {
    const myMachine = serialize(
      machine(
        "Test",
        init(initial("idle")),
        state("idle", transition("next", "active")),
        state("active")
      )
    );

    const code = generateFromSerializedMachine(myMachine, Format.TS);

    expect(code).toContain("export interface");
    expect(code).toContain("States {");
    expect(code).toContain("idle:");
    expect(code).toContain("active:");
  });

  it("should generate context interface", () => {
    const myMachine = serialize(
      machine(
        "Test",
        init(initial("idle"), { context: { count: 0, name: "" } }),
        state("idle", transition("next", "active")),
        state("active")
      )
    );

    const code = generateFromSerializedMachine(myMachine, Format.TS);

    expect(code).toContain("export interface");
    expect(code).toContain("Context {");
    expect(code).toContain("count:");
    expect(code).toContain("name:");
  });

  it("should include generics in machine call", () => {
    const myMachine = serialize(
      machine(
        "MyMachine",
        init(initial("idle")),
        state("idle", transition("next", "active")),
        state("active")
      )
    );

    const code = generateFromSerializedMachine(myMachine, Format.TS);

    expect(code).toContain("machine<");
    expect(code).toContain("Context>");
  });

  it("should generate code from a complex machine (bird)", () => {
    const getMachine = () => {
      return serialize(bird);
    };

    let myMachine = getMachine();
    let code = generateFromSerializedMachine(myMachine, Format.TS);

    expect(code).toContain("export interface");
    expect(code).toContain("birdContext");
    expect(code).toContain("birdStates");
    expect(code).toContain("land:");
    expect(code).toContain("flying:");
  });

  it("should generate code with exit", () => {
    function cleanup(context: any) {
      context.cleaned = true;
    }

    const myMachine = machine(
      "Test",
      init(initial("idle")),
      state("idle", transition("start", "loading", exit(cleanup))),
      state("loading")
    );

    const serialized = serialize(myMachine);
    const code = generateFromSerializedMachine(serialized, Format.TS);
    
    expect(code).toContain("exit");
    expect(code).toContain("cleanup");
  });
});

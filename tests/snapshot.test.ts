import { getState, init, initial, invoke, machine, nested, parallel, snapshot, start, state, transition, entry } from "../lib";
import { describe, it } from "mocha";

import expect from "expect";

describe("snapshot", () => {
  it("should create a snapshot of the current machine state", () => {
    const myMachine = machine(
      "Test",
      init(initial("idle"), { context: { count: 0 } }),
      state("idle", transition("next", "active")),
      state("active", transition("next", "idle"))
    );

    invoke(myMachine, "next");

    const snap = snapshot(myMachine);

    expect(snap.current).toEqual("active");
    expect(snap.context.count).toEqual(0);
    expect(snap.history).toContain("State: idle");
    expect(snap.history).toContain("Transition: next");
    expect(snap.history).toContain("State: active");
  });

  it("should restore machine from snapshot without executing entry actions", () => {
    let entryExecuted = false;
    const entryAction = () => { entryExecuted = true; };

    const myMachine = machine(
      "Test",
      init(initial("idle")),
      state("idle", transition("next", "active")),
      state("active", entry(entryAction), transition("next", "idle"))
    );

    invoke(myMachine, "next");
    expect(getState(myMachine)).toEqual("active");
    expect(entryExecuted).toBe(true);

    const snap = snapshot(myMachine);

    const newMachine = machine(
      "Test",
      init(initial("idle")),
      state("idle", transition("next", "active")),
      state("active", entry(entryAction), transition("next", "idle"))
    );

    start(newMachine, snap);

    expect(getState(newMachine)).toEqual("active");
    expect(entryExecuted).toBe(true);
  });

  it("should snapshot and restore parallel machines", () => {
    const boldMachineDef = machine(
      "Bold",
      init(initial("off")),
      state("on", transition("toggle", "off")),
      state("off", transition("toggle", "on"))
    );
    const underlineMachineDef = machine(
      "Underline",
      init(initial("off")),
      state("on", transition("toggle", "off")),
      state("off", transition("toggle", "on"))
    );

    const wordMachine = machine(
      "Word",
      parallel(boldMachineDef, underlineMachineDef)
    );

    invoke(boldMachineDef, "toggle");

    const snap = snapshot(wordMachine);

    expect(snap.parallel?.bold.current).toEqual("on");
    expect(snap.parallel?.underline.current).toEqual("off");

    const newWordMachine = machine(
      "Word",
      parallel(
        machine("Bold", init(initial("off")), state("on", transition("toggle", "off")), state("off", transition("toggle", "on"))),
        machine("Underline", init(initial("off")), state("on", transition("toggle", "off")), state("off", transition("toggle", "on")))
      )
    );

    start(newWordMachine, snap);

    const currentState = getState(newWordMachine) as any;
    expect(currentState.bold).toEqual("on");
    expect(currentState.underline).toEqual("off");
  });

  it("should preserve context in snapshot", () => {
    const myMachine = machine(
      "Test",
      init(initial("idle"), { context: { name: "test", value: 42 } }),
      state("idle", transition("update", "idle")),
      state("done")
    );

    myMachine.context = { name: "updated", value: 100 };

    const snap = snapshot(myMachine);

    expect(snap.context.name).toEqual("updated");
    expect(snap.context.value).toEqual(100);

    const newMachine = machine(
      "Test",
      init(initial("idle"), { context: { name: "test", value: 42 } }),
      state("idle", transition("update", "idle")),
      state("done")
    );

    start(newMachine, snap);

    expect(newMachine.context.name).toEqual("updated");
    expect(newMachine.context.value).toEqual(100);
  });

  it("should work without snapshot as before", () => {
    let entryExecuted = false;
    const entryAction = () => { entryExecuted = true; };

    const myMachine = machine(
      "Test",
      init(initial("idle")),
      state("idle", entry(entryAction))
    );

    start(myMachine);

    expect(getState(myMachine)).toEqual("idle");
    expect(entryExecuted).toBe(true);
  });

  it("should snapshot and restore nested machines", () => {
    const fetchMachine = machine(
      "Fetch",
      init(initial("idle")),
      state("idle", transition("start", "loading")),
      state("loading", transition("success", "success")),
      state("success")
    );

    const parentMachine = machine(
      "Parent",
      init(initial("idle")),
      state("idle", transition("fetch", "fetching")),
      state("fetching", nested(fetchMachine, "start"))
    );

    invoke(parentMachine, "fetch");

    expect(getState(parentMachine)).toEqual("fetching");

    const snap = snapshot(parentMachine);

    expect(snap.nested?.fetching).toBeDefined();
    expect(snap.nested?.fetching["fetch"]).toBeDefined();
    expect(snap.nested?.fetching["fetch"].current).toEqual("loading");

    const newParentMachine = machine(
      "Parent",
      init(initial("idle")),
      state("idle", transition("fetch", "fetching")),
      state("fetching", nested(
        machine("Fetch", init(initial("idle")), state("idle", transition("start", "loading")), state("loading", transition("success", "success")), state("success")),
        "start"
      ))
    );

    start(newParentMachine, snap);

    expect(getState(newParentMachine)).toEqual("fetching");
  });
});

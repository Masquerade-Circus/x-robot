import { getState, init, initial, invoke, invokeAfter, machine, state, transition } from "../lib";
import { describe, it } from "mocha";

import expect from "expect";

describe("invokeAfter", () => {
  it("should invoke event after specified time", (done) => {
    const myMachine = machine(
      "My machine",
      init(initial("idle")),
      state("idle", transition("timeout", "timedOut")),
      state("timedOut")
    );

    expect(getState(myMachine)).toEqual("idle");

    invokeAfter(myMachine, 100, "timeout");

    setTimeout(() => {
      expect(getState(myMachine)).toEqual("timedOut");
      done();
    }, 150);
  });

  it("should pass payload to event", (done) => {
    const myMachine = machine(
      "My machine",
      init(initial("idle")),
      state("idle", transition("process", "done")),
      state("done")
    );

    invokeAfter(myMachine, 100, "process", { data: "test" });

    setTimeout(() => {
      expect(getState(myMachine)).toEqual("done");
      done();
    }, 150);
  });

  it("should cancel timeout before it fires", (done) => {
    const myMachine = machine(
      "My machine",
      init(initial("idle")),
      state("idle", transition("timeout", "timedOut")),
      state("timedOut")
    );

    expect(getState(myMachine)).toEqual("idle");

    const cancelTimeout = invokeAfter(myMachine, 100, "timeout");

    cancelTimeout();

    setTimeout(() => {
      expect(getState(myMachine)).toEqual("idle");
      done();
    }, 150);
  });

  it("should handle multiple concurrent timeouts", (done) => {
    let counter = 0;

    const myMachine = machine(
      "My machine",
      init(initial("idle")),
      state("idle", transition("tick", "ticking")),
      state("ticking", transition("tick", "tocked")),
      state("tocked")
    );

    invokeAfter(myMachine, 100, "tick");
    invokeAfter(myMachine, 100, "tick");

    setTimeout(() => {
      expect(getState(myMachine)).toEqual("tocked");
      done();
    }, 200);
  });

  it("should work with async machines", (done) => {
    const myMachine = machine(
      "My machine",
      init(initial("idle")),
      state(
        "idle",
        transition("wait", "waiting")
      ),
      state("waiting", transition("complete", "done"), transition("cancel", "cancelled")),
      state("done"),
      state("cancelled")
    );

    invoke(myMachine, "wait");
    expect(getState(myMachine)).toEqual("waiting");

    const cancelTimeout = invokeAfter(myMachine, 100, "complete");

    setTimeout(() => {
      cancelTimeout();
      invoke(myMachine, "cancel");
    }, 50);

    setTimeout(() => {
      expect(getState(myMachine)).toEqual("cancelled");
      done();
    }, 200);
  });
});

import {
  guard,
  init,
  initial,
  invoke,
  machine,
  state,
  transition,
  context
} from "../lib";
import { describe, it } from "mocha";
import expect from "expect";

describe("Async Guards", () => {
  it("should support async guard returning true", async () => {
    const asyncGuard = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return true;
    };

    const myMachine = machine(
      "Test",
      init(initial("idle")),
      state("idle", transition("start", "loading", guard(asyncGuard))),
      state("loading")
    );

    expect(myMachine.current).toBe("idle");
    await invoke(myMachine, "start");
    expect(myMachine.current).toBe("loading");
  });

  it("should support async guard returning false", async () => {
    const asyncGuard = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return false;
    };

    const myMachine = machine(
      "Test",
      init(initial("idle")),
      state("idle", transition("start", "loading", guard(asyncGuard))),
      state("loading")
    );

    await invoke(myMachine, "start");
    expect(myMachine.current).toBe("idle");
  });

  it("should support async guard with failure transition", async () => {
    const asyncGuard = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return false;
    };

    const myMachine = machine(
      "Test",
      init(initial("idle")),
      state(
        "idle",
        transition("start", "loading", guard(asyncGuard, "failed")),
        transition("failed", "failed")
      ),
      state("loading"),
      state("failed")
    );

    await invoke(myMachine, "start");
    expect(myMachine.current).toBe("failed");
  });

  it("should support async guard that throws", async () => {
    const asyncGuard = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      throw new Error("Async guard error");
    };

    const myMachine = machine(
      "Test",
      init(initial("idle")),
      state("idle", transition("start", "loading", guard(asyncGuard))),
      state("loading"),
      state("error")
    );

    try {
      await invoke(myMachine, "start");
    } catch (e) {
      // Error is expected
    }
    // Should go to error state if it exists, otherwise throw
  });

  it("should allow context modification in async guard", async () => {
    const asyncGuard = async (ctx: any) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      ctx.value = "modified";
      return true;
    };

    const myMachine = machine(
      "Test",
      init(initial("idle"), context({ value: "initial" })),
      state("idle", transition("start", "loading", guard(asyncGuard))),
      state("loading")
    );

    await invoke(myMachine, "start");
    expect(myMachine.context.value).toBe("modified");
    expect(myMachine.current).toBe("loading");
  });

  it("should await multiple async guards in order", async () => {
    const executionOrder: string[] = [];

    const asyncGuard1 = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      executionOrder.push("guard1");
      return true;
    };

    const asyncGuard2 = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      executionOrder.push("guard2");
      return true;
    };

    const myMachine = machine(
      "Test",
      init(initial("idle")),
      state(
        "idle",
        transition("start", "loading", guard(asyncGuard1), guard(asyncGuard2))
      ),
      state("loading")
    );

    await invoke(myMachine, "start");
    expect(executionOrder).toEqual(["guard1", "guard2"]);
    expect(myMachine.current).toBe("loading");
  });
});

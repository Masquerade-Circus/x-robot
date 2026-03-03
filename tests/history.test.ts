import { describe } from "mocha";
import expect from "expect";
import {
  machine,
  state,
  transition,
  init,
  initial,
  invoke,
  history
} from "../lib";

describe("History", () => {
  it("should have default history limit of 10", () => {
    const myMachine = machine(
      "Test",
      init(initial("idle")),
      state("idle", transition("next", "active")),
      state("active", transition("next", "idle"))
    );

    expect(myMachine.historyLimit).toEqual(10);

    for (let i = 0; i < 20; i++) {
      invoke(myMachine, "next");
    }

    expect(myMachine.history.length).toEqual(10);
  });

  it("should respect custom history limit", () => {
    const myMachine = machine(
      "Test",
      init(initial("idle"), history(5)),
      state("idle", transition("next", "active")),
      state("active", transition("next", "idle"))
    );

    expect(myMachine.historyLimit).toEqual(5);

    for (let i = 0; i < 10; i++) {
      invoke(myMachine, "next");
    }

    expect(myMachine.history.length).toEqual(5);
  });

  it("should disable history when limit is 0", () => {
    const myMachine = machine(
      "Test",
      init(initial("idle"), history(0)),
      state("idle", transition("next", "active")),
      state("active", transition("next", "idle"))
    );

    expect(myMachine.historyLimit).toEqual(0);

    invoke(myMachine, "next");
    invoke(myMachine, "next");

    expect(myMachine.history.length).toEqual(0);
  });

  it("should maintain correct history entries", () => {
    const myMachine = machine(
      "Test",
      init(initial("idle"), history(3)),
      state("idle", transition("next", "active")),
      state("active", transition("next", "idle"))
    );

    invoke(myMachine, "next");

    expect(myMachine.history.some(h => h.includes("State: idle"))).toBeTruthy();
    expect(myMachine.history.some(h => h.includes("Transition: next"))).toBeTruthy();
    expect(myMachine.history.some(h => h.includes("State: active"))).toBeTruthy();
  });

  it("should throw error for negative history limit", () => {
    expect(() => {
      history(-1);
    }).toThrow("History limit must be >= 0");
  });

  it("should allow history limit of 0", () => {
    const myMachine = machine(
      "Test",
      init(initial("idle"), history(0)),
      state("idle", transition("next", "active")),
      state("active")
    );

    expect(myMachine.historyLimit).toEqual(0);
  });
});

import {
  exitPulse,
  guard,
  init,
  initial,
  invoke,
  machine,
  pulse,
  state,
  transition,
  context
} from "../lib";
import { describe, it } from "mocha";
import expect from "expect";
import { validate } from "../lib/validate";

describe("Exit Pulse", () => {
  describe("Execution", () => {
    it("should execute exitPulse when guard passes", () => {
      let exitExecuted = false;
      
      const exitFn = () => {
        exitExecuted = true;
      };
      
      const myMachine = machine(
        "Test",
        init(initial("idle")),
        state("idle", transition("start", "loading", exitPulse(exitFn))),
        state("loading")
      );
      
      expect(myMachine.current).toBe("idle");
      invoke(myMachine, "start");
      expect(exitExecuted).toBe(true);
      expect(myMachine.current).toBe("loading");
    });

    it("should NOT execute exitPulse when guard fails", () => {
      let exitExecuted = false;
      
      const exitFn = () => {
        exitExecuted = true;
      };
      
      const alwaysFail = () => false;
      
      const myMachine = machine(
        "Test",
        init(initial("idle")),
        state("idle", transition("start", "loading", guard(alwaysFail), exitPulse(exitFn))),
        state("loading")
      );
      
      expect(myMachine.current).toBe("idle");
      invoke(myMachine, "start");
      expect(exitExecuted).toBe(false);
      expect(myMachine.current).toBe("idle");
    });

    it("should execute exitPulse and allow context modification", () => {
      const myMachine = machine(
        "Test",
        init(initial("idle"), context({ value: "initial" })),
        state("idle", transition("start", "loading", exitPulse((ctx: any) => { ctx.value = "modified"; }))),
        state("loading")
      );
      
      invoke(myMachine, "start");
      expect(myMachine.context.value).toBe("modified");
      expect(myMachine.current).toBe("loading");
    });

    it("should execute exitPulse after guards", () => {
      const executionOrder: string[] = [];
      
      const guardFn = () => {
        executionOrder.push("guard");
        return true;
      };
      
      const exitFn = () => {
        executionOrder.push("exitPulse");
      };
      
      const myMachine = machine(
        "Test",
        init(initial("idle")),
        state("idle", transition("start", "loading", guard(guardFn), exitPulse(exitFn))),
        state("loading")
      );
      
      invoke(myMachine, "start");
      expect(executionOrder).toEqual(["guard", "exitPulse"]);
    });
  });

  describe("Validation", () => {
    it("should validate exitPulse success transition exists", () => {
      expect(() => {
        const myMachine = machine(
          "Test",
          init(initial("idle")),
          state("idle", transition("start", "loading", exitPulse(() => {}, "success"))),
          state("loading")
        );
        validate(myMachine);
      }).toThrow("has a success transition 'success' that does not exists");
    });

    it("should validate exitPulse failure transition exists", () => {
      expect(() => {
        const myMachine = machine(
          "Test",
          init(initial("idle")),
          state("idle", transition("start", "loading", exitPulse(() => {}, undefined, "failure"))),
          state("loading")
        );
        validate(myMachine);
      }).toThrow("has a failure transition 'failure' that does not exists");
    });
  });

  describe("With other features", () => {
    it("should work with pulse in state (entry)", () => {
      let idleEntryExecuted = false;
      let loadingEntryExecuted = false;
      let exitExecuted = false;
      
      const idleEntryFn = () => {
        idleEntryExecuted = true;
      };
      
      const loadingEntryFn = () => {
        loadingEntryExecuted = true;
      };
      
      const exitFn = () => {
        exitExecuted = true;
      };
      
      const myMachine = machine(
        "Test",
        init(initial("idle")),
        state("idle", 
          pulse(idleEntryFn),
          transition("start", "loading", exitPulse(exitFn))
        ),
        state("loading", pulse(loadingEntryFn))
      );
      
      expect(myMachine.current).toBe("idle");
      
      invoke(myMachine, "start");
      
      expect(exitExecuted).toBe(true);
      expect(loadingEntryExecuted).toBe(true);
      expect(myMachine.current).toBe("loading");
    });

    it("should work with failure transition in guard", () => {
      let exitExecuted = false;
      
      const exitFn = () => {
        exitExecuted = true;
      };
      
      const alwaysFail = () => false;
      
      const myMachine = machine(
        "Test",
        init(initial("idle")),
        state("idle", 
          transition("start", "loading", guard(alwaysFail, "failed"), exitPulse(exitFn)),
          transition("failed", "failed")
        ),
        state("loading"),
        state("failed")
      );
      
      invoke(myMachine, "start");
      
      expect(exitExecuted).toBe(false);
      expect(myMachine.current).toBe("failed");
    });
  });

  describe("Initial state", () => {
    it("should NOT execute exitPulse on initial state", () => {
      let exitExecuted = false;
      
      const exitFn = () => {
        exitExecuted = true;
      };
      
      const myMachine = machine(
        "Test",
        init(initial("idle")),
        state("idle", transition("start", "loading"), transition("go", "loading", exitPulse(exitFn))),
        state("loading")
      );
      
      expect(myMachine.current).toBe("idle");
      expect(exitExecuted).toBe(false);
    });
  });

  describe("Context modification", () => {
    it("should allow context modification in exitPulse", () => {
      const myMachine = machine(
        "Test",
        init(initial("idle"), context({ value: "initial" })),
        state("idle", transition("start", "loading", exitPulse((ctx: any) => { ctx.value = "modified"; }))),
        state("loading")
      );
      
      invoke(myMachine, "start");
      expect(myMachine.context.value).toBe("modified");
      expect(myMachine.current).toBe("loading");
    });
  });
});

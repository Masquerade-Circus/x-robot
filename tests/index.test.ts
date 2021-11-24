import {
  action,
  context,
  dangerState,
  description,
  getState,
  guard,
  immediate,
  infoState,
  initial,
  invoke,
  machine,
  primaryState,
  producer,
  start,
  state,
  states,
  successState,
  transition,
  warningState,
} from "../lib";
import { describe, it } from "mocha";

import expect from "expect";
import { shouldFreeze } from "../lib/machine/create";
import { validate } from "../lib/validate";

describe("XRobot", () => {
  // Machine
  describe("Machine", () => {
    it("should create a machine without a title", () => {
      const myMachine = machine(null);
      expect(myMachine.title).toBe(null);
    });

    it("should create a machine with a title", () => {
      const myMachine = machine("myMachine");

      expect(myMachine.title).toEqual("myMachine");
    });

    it("should validate that the machine has a title", () => {
      const myMachine = machine(null);

      expect(() => validate(myMachine)).toThrow("The machine must have a title");
    });
  });

  // State
  describe("State", () => {
    it("should create an empty context if a context is not passed", () => {
      const myMachine = machine("My machine");

      expect(myMachine.context).toEqual({});
    });

    it("should create a context if a context object is passed", () => {
      let myMachineState = {
        title: "Ok",
      };
      const myMachine = machine("My machine", context(myMachineState));

      expect(myMachine.context).toEqual(myMachineState);
    });

    it("should create a context if a function is passed", () => {
      let myMachineState = {
        title: "Ok",
      };

      const myMachine = machine(
        "My machine",
        context(() => myMachineState)
      );

      expect(myMachine.context).toEqual(myMachineState);
    });

    it("should throw an error if a context is passed but is not an object or function", () => {
      expect(() => {
        machine("My machine", context("not an object" as {}));
      }).toThrowError("The context passed to the machine must be an object or a function that returns an object.");
    });

    it("should throw an error if a context function is passed but this does not return an object", () => {
      expect(() => {
        machine(
          "My machine",
          context(() => "not an object" as {})
        );
      }).toThrowError("The context passed to the machine must be an object or a function that returns an object.");
    });
  });

  // Frozen context
  describe("Frozen context", () => {
    it("should create a frozen context if the freeze option is not passed", () => {
      const myMachine = machine("My machine");

      expect(Object.isFrozen(myMachine.context)).toBe(true);
    });

    it("should freeze the context if the freeze option is passed as true", () => {
      const myMachine = machine("My machine", shouldFreeze(true));

      expect(Object.isFrozen(myMachine.context)).toBe(true);
    });

    it("should not freeze the context if the freeze option is passed as false", () => {
      const myMachine = machine("My machine", shouldFreeze(false));

      expect(Object.isFrozen(myMachine.context)).toBe(false);
    });

    it("should create a frozen context if the context is passed as a function", () => {
      const myMachine = machine(
        "My machine",
        context(() => ({}))
      );

      expect(Object.isFrozen(myMachine.context)).toBe(true);
    });

    it("should throw an error if the context is frozen and try to mutate the context directly", () => {
      const myMachine = machine("My machine");

      expect(() => {
        myMachine.context.title = "Ok";
      }).toThrowError("Cannot add property title, object is not extensible");
    });

    it("should throw an error if the context is frozen and try to mutate a deeper property of the context directly", () => {
      const myMachine = machine("My machine", context({ title: { ok: "Ok" } }));

      expect(() => {
        myMachine.context.title.ok = "Not ok";
      }).toThrowError("Cannot assign to read only property 'ok' of object '#<Object>'");
    });

    it("should throw an error if the context is frozen and try to remove a property of the context directly", () => {
      const myMachine = machine("My machine", context({ title: "Ok" }));

      expect(() => {
        delete myMachine.context.title;
      }).toThrowError("Cannot delete property 'title' of #<Object>");
    });

    it("should throw an error if the context is frozen and try to remove a deeper property of the context directly", () => {
      const myMachine = machine("My machine", context({ title: { ok: "Ok" } }));

      expect(() => {
        delete myMachine.context.title.ok;
      }).toThrowError("Cannot delete property 'ok' of #<Object>");
    });
  });

  // States
  describe("States", () => {
    it("should create a machine with states", () => {
      const myMachine = machine("My machine", states(state("idle")));

      expect(Object.keys(myMachine.states)).toEqual(["idle"]);
      expect(myMachine.states.idle).toEqual({
        name: "idle",
        nested: [],
        args: [], // This are the arguments passed to the state when it is invoked,
        immediate: [],
        on: {}, // This object will keep the transitions that are triggered by the state
        run: [], // This is the list of actions/producers that will be executed when the state is entered
        type: "default", // This is the type of the state, it will be used to determine the style of the state in the visualization or to listen to events
        description: undefined, // This is the description of the state, it will be used to show the description in the visualization
      });
    });

    it("should validate that the machine has a initial state", () => {
      expect(() => {
        validate(machine("My machine"));
      }).toThrowError("The initial state passed to the machine must be a string");
    });

    it("should validate that the machine has a state for the initial state", () => {
      expect(() => {
        validate(machine("My machine", initial("idle")));
      }).toThrowError("The initial state 'idle' is not in the machine's states.");
    });

    it("should validate that a state has a previous transition to get there if this state is not the initial state", () => {
      expect(() => {
        validate(machine("My machine", states(state("idle"), state("loading")), initial("idle")));
      }).toThrowError("The state 'loading' does not have a transition to it.");
    });

    it("should allow to create a fatal state without previous transitions to get there if this state is not the initial state", () => {
      const myMachine = machine("My machine", states(state("idle"), state("fatal")));
      expect(() => {
        validate(myMachine);
      }).not.toThrowError("The state 'fatal' does not have a transition to it.");

      expect(myMachine.states.fatal).toBeDefined();
    });

    it("should allow to create an info state", () => {
      const myMachine = machine("My machine", states(infoState("idle")));

      expect(Object.keys(myMachine.states)).toEqual(["idle"]);
      expect(myMachine.states.idle).toBeDefined();
      expect(myMachine.states.idle.type).toEqual("info");
    });

    it("should allow to create a warning state", () => {
      const myMachine = machine("My machine", states(warningState("idle")));

      expect(Object.keys(myMachine.states)).toEqual(["idle"]);
      expect(myMachine.states.idle).toBeDefined();
      expect(myMachine.states.idle.type).toEqual("warning");
    });

    it("should allow to create a success state", () => {
      const myMachine = machine("My machine", states(successState("idle")));

      expect(Object.keys(myMachine.states)).toEqual(["idle"]);
      expect(myMachine.states.idle).toBeDefined();
      expect(myMachine.states.idle.type).toEqual("success");
    });

    it("should allow to create a danger state", () => {
      const myMachine = machine("My machine", states(dangerState("idle")));

      expect(Object.keys(myMachine.states)).toEqual(["idle"]);
      expect(myMachine.states.idle).toBeDefined();
      expect(myMachine.states.idle.type).toEqual("danger");
    });

    it("should allow to create a primary state", () => {
      const myMachine = machine("My machine", states(primaryState("idle")));

      expect(Object.keys(myMachine.states)).toEqual(["idle"]);
      expect(myMachine.states.idle).toBeDefined();
      expect(myMachine.states.idle.type).toEqual("primary");
    });

    it("should allow to add a description to a state", () => {
      const myMachine = machine("My machine", states(state("idle", description("This is the idle state"))));

      expect(myMachine.states.idle.description).toEqual("This is the idle state");
    });
  });

  // Transitions
  describe("Transitions", () => {
    it("should create a machine with a state that has a transition", () => {
      const myMachine = machine("My machine", states(state("idle", transition("load", "loading"))));

      expect(Object.keys(myMachine.states.idle.on)).toEqual(["load"]);
    });

    it("should validate that the transition has an event and a target state", () => {
      expect(() => {
        validate(machine("My machine", states(state("idle", transition("load", null))), initial("idle")));
      }).toThrowError("The transition 'load' of the state 'idle' must have a target state.");
    });

    it("should validate that the target state exists for a transition", () => {
      expect(() => {
        validate(machine("My machine", states(state("idle", transition("load", "loading"))), initial("idle")));
      }).toThrowError("The transition 'load' of the state 'idle' has a target state 'loading' that does not exists.");
    });

    it("should move between states invoking the correct event", () => {
      const myMachine = machine("My machine", states(state("idle", transition("load", "loading")), state("loading")), initial("idle"));

      expect(getState(myMachine)).toEqual("idle");

      invoke(myMachine, "load");

      expect(getState(myMachine)).toEqual("loading");
    });

    it("should validate that the event can be handled from the current state", () => {
      let myMachine = machine("My machine", states(state("idle", transition("load", "loading")), state("loading")), initial("idle"));

      invoke(myMachine, "load");
      expect(getState(myMachine)).toEqual("loading");

      expect(() => {
        invoke(myMachine, "load");
      }).toThrowError("The transition 'load' does not exist in the current state 'loading'");
    });
  });

  // Final states
  describe("Final states", () => {
    it("should mark a state without transitions as a final state");
  });

  // Immediate transitions
  describe("Immediate transitions", () => {
    it("should create a machine with a state that has a immediate transition", () => {
      const myMachine = machine("My machine", states(state("idle", immediate("loading")), state("loading")), initial("idle"));

      expect(myMachine.states.idle.on).toEqual({
        loading: {
          guards: [],
          target: "loading",
          transition: "loading",
        },
      });
      expect(myMachine.states.idle.immediate).toEqual([{ immediate: "loading", guards: [] }]);
    });

    it("should validate that the immediate transition has a target state", () => {
      expect(() => {
        validate(machine("My machine", states(state("idle", immediate(null))), initial("idle")));
      }).toThrowError("The immediate transition of the state 'idle' must have a target state.");
    });

    it("should validate that the target state exists for a immediate transition", () => {
      expect(() => {
        validate(machine("My machine", states(state("idle", immediate("loading"))), initial("idle")));
      }).toThrowError("The immediate transition of the state 'idle' has a target state 'loading' that does not exists.");
    });

    it("should move between transitions with the correct event for immediate transitions", () => {
      const myMachine = machine(
        "My machine",
        states(state("idle", transition("load", "loading")), state("loading", immediate("loaded")), state("loaded")),
        initial("idle")
      );

      invoke(myMachine, "load");

      expect(getState(myMachine)).toEqual("loaded");
    });
  });

  // Producers
  describe("Producers", () => {
    it("should create a machine with a state that has producers", () => {
      let setTitle = (context, title) => {
        return { ...context, title };
      };

      function updateTitle(context, title) {
        return { ...context, title };
      }

      const myMachine = machine(
        "My machine",
        states(
          state(
            "idle",
            producer(setTitle),
            producer(updateTitle),
            producer(() => ({})),
            producer(function () {
              return {};
            })
          )
        )
      );

      expect(myMachine.states.idle.run).toEqual([
        { producer: setTitle },
        { producer: updateTitle },
        { producer: expect.any(Function) },
        { producer: expect.any(Function) },
      ]);
    });

    it("should validate that first level producers does not have a done transition", () => {
      let mut = () => ({});
      expect(() => {
        validate(machine("My machine", states(state("idle", producer(mut, "done"))), initial("idle")));
      }).toThrowError("The producer 'mut' of the state 'idle' cannot have a transition.");
    });

    it("should validate that the producer has a valid function", () => {
      expect(() => {
        validate(machine("My machine", states(state("idle", producer(null))), initial("idle")));
      }).toThrowError("The producer 'null' of the state 'idle' must be a function.");
    });

    it("should use the producer to update the context returning a new context", () => {
      let setTitle = (context, title) => {
        return { ...context, title };
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated")), state("updated", producer(setTitle))),
        initial("idle")
      );

      let originalState = myMachine.context;

      invoke(myMachine, "updateTitle", "Hello");

      expect(myMachine.context).toEqual({ title: "Hello" });
      expect(myMachine.context === originalState).toBeFalsy();
    });

    it("should use the producer to mutate the context without returning a new context", () => {
      let setTitle = (context, title) => {
        context.title = title;
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated")), state("updated", producer(setTitle))),
        initial("idle")
      );

      let originalState = myMachine.context;

      invoke(myMachine, "updateTitle", "Hello");

      expect(myMachine.context).toEqual({ title: "Hello" });
      expect(myMachine.context === originalState).toBeFalsy();
    });

    it("should throw a fatal error if an error ocurred in a producer", () => {
      let setTitle = (context, title) => {
        throw new Error("Error");
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated")), state("updated", producer(setTitle))),
        initial("idle")
      );

      expect(() => {
        invoke(myMachine, "updateTitle", "Hello");
      }).toThrowError("Error");
    });

    it("should go to an error state if a fatal error ocurred in a producer and we have an error transition", () => {
      let setTitle = (context, title) => {
        throw new Error("Error");
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated")), state("updated", producer(setTitle), transition("error", "error")), state("error")),
        initial("idle")
      );

      invoke(myMachine, "updateTitle", "Hello");

      expect(getState(myMachine)).toEqual("error");
    });

    it("should move to a fatal state if a fatal error ocurred in a producer and we have a fatal state", () => {
      let setTitle = (context, title) => {
        throw new Error("Error");
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated")), state("updated", producer(setTitle)), state("fatal")),
        initial("idle")
      );

      invoke(myMachine, "updateTitle", "Hello");

      expect(getState(myMachine)).toEqual("fatal");
    });

    it("should be able to get the catched error if a fatal error ocurred in a producer and we have a fatal state", () => {
      let setTitle = (context, title) => {
        throw new Error("Error");
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated")), state("updated", producer(setTitle)), state("fatal")),
        initial("idle")
      );

      expect(myMachine.fatal).toBeUndefined();

      invoke(myMachine, "updateTitle", "Hello");

      expect(myMachine.fatal).toEqual(new Error("Error"));
    });

    // TODO: Review this, may be we should allow to define the transitions first
    it("should validate that producers are created before any transitions", () => {
      let updateTitle = (context, title) => {
        return { ...context, title };
      };
      expect(() => {
        validate(
          machine(
            "My machine",
            states(state("idle", transition("updateTitle", "updated")), state("updated", transition("idle", "idle"), producer(updateTitle))),
            initial("idle")
          )
        );
      }).toThrowError("The producer 'updateTitle' of the state 'updated' must be created before any transitions.");
    });
  });

  // Actions
  describe("Actions", () => {
    it("should create a machine with a state that has actions", () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      };

      async function updateTitle(context) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const myMachine = machine(
        "My machine",
        states(
          state(
            "idle",
            action(setTitle),
            action(updateTitle),
            action(async () => ({})),
            action(async function () {
              return {};
            })
          )
        ),
        initial("idle")
      );

      expect(myMachine.states.idle.run).toEqual([
        { action: setTitle },
        { action: updateTitle },
        { action: expect.any(Function) },
        { action: expect.any(Function) },
      ]);
    });

    it("should validate that the action has a valid function", () => {
      expect(() => {
        validate(machine("My machine", states(state("idle", action(null))), initial("idle")));
      }).toThrowError("The action 'null' of the state 'idle' must be a function.");
    });

    it("should fire the action when enter to the state", async () => {
      let actionFired = false;

      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        actionFired = true;
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updating")), state("updating", action(setTitle), immediate("idle"))),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      invoke(myMachine, "updateTitle");

      // The machine is in the updating state and the action was fired but not yet resolved
      expect(getState(myMachine)).toEqual("updating");
      expect(actionFired).toBe(false);

      // Wait for the action to be resolved
      await new Promise((resolve) => setTimeout(resolve, 110));

      // The machine is in the idle state and the action was resolved
      expect(getState(myMachine)).toEqual("idle");
      expect(actionFired).toBe(true);
    });

    it("should be able to await when entering a state that has an action", async () => {
      let actionFired = false;

      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        actionFired = true;
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated")), state("updated", action(setTitle), immediate("idle"))),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");
      // Invoke the transition and wait for the action to be resolved
      await invoke(myMachine, "updateTitle");

      // The machine is in the idle state again and the action was resolved
      expect(getState(myMachine)).toEqual("idle");
      expect(actionFired).toBe(true);
    });

    it("should move to the next producer/action if the action is successful", async () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      };

      let nextActionFired = false;

      const myMachine = machine(
        "My machine",
        states(
          state("idle", transition("updateTitle", "updated")),
          state(
            "updated",
            action(setTitle),
            action(async () => (nextActionFired = true)),
            immediate("idle")
          )
        ),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition and wait for the actions to be resolved
      await invoke(myMachine, "updateTitle");

      // The machine is in the idle state again
      expect(getState(myMachine)).toEqual("idle");
      expect(nextActionFired).toBe(true);
    });

    it("should throw a fatal error if an error ocurred in an action", async () => {
      let setTitle = async (context) => {
        throw new Error("Error");
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated")), state("updated", action(setTitle), immediate("idle"))),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition and wait for the actions to be resolved
      await expect(invoke(myMachine, "updateTitle")).rejects.toThrow(new Error("Error"));
    });

    it("should go to an error state if a fatal error ocurred in an action and we have an error transition", async () => {
      let setTitle = async (context) => {
        throw new Error("Error");
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated")), state("updated", action(setTitle), transition("error", "error")), state("error")),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition and wait for the actions to be resolved
      await expect(invoke(myMachine, "updateTitle")).resolves.toBeUndefined();

      // The machine is in the fatal state
      expect(getState(myMachine)).toEqual("error");
    });

    it("should move to a fatal state if a fatal error ocurred in an action and we have a fatal state", async () => {
      let setTitle = async (context) => {
        throw new Error("Error");
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated")), state("updated", action(setTitle)), state("fatal")),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition and wait for the actions to be resolved
      await expect(invoke(myMachine, "updateTitle")).resolves.toBeUndefined();

      // The machine is in the fatal state
      expect(getState(myMachine)).toEqual("fatal");
    });

    it("should be able to get the catched error if a fatal error ocurred in an action and we have a fatal state", async () => {
      let setTitle = async (context) => {
        throw new Error("Error");
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated")), state("updated", action(setTitle)), state("fatal")),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition and wait for the actions to be resolved
      await expect(invoke(myMachine, "updateTitle")).resolves.toBeUndefined();

      // The machine is in the fatal state
      expect(getState(myMachine)).toEqual("fatal");
      expect(myMachine.fatal).toEqual(new Error("Error"));
    });

    it("should allow to pass a done transition", async () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated")), state("updated", action(setTitle, "done")), state("done")),
        initial("idle")
      );

      expect(myMachine.states.updated.run).toHaveLength(1);
      expect(myMachine.states.updated.run[0]).toEqual({
        action: setTitle,
        success: "done",
      });
      // The transition is created if does not exists in the state
      expect(myMachine.states.updated.on).toEqual({
        done: {
          guards: [],
          target: "done",
          transition: "done",
        },
      });
    });

    it("should go to the done state if the action is successfull and have a done transition", async () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated")), state("updated", action(setTitle, "done")), state("done")),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      invoke(myMachine, "updateTitle");

      // The machine is in the updating state and the action was fired but not yet resolved
      expect(getState(myMachine)).toEqual("updated");

      // Wait for the action to be resolved
      await new Promise((resolve) => setTimeout(resolve, 110));

      // The machine is in the done state
      expect(getState(myMachine)).toEqual("done");
    });

    it("should be able to pass a producer as done handler to update the context if the action is successfull", async () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      };

      let updateContext = (context) => {
        return {
          ...context,
          title: "Updated",
        };
      };

      const myMachine = machine(
        "My machine",
        states(
          state("idle", transition("updateTitle", "updated")),
          state("updated", action(setTitle, producer(updateContext)), transition("done", "done")),
          state("done")
        ),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      invoke(myMachine, "updateTitle");

      // The machine is in the updating state and the action was fired but not yet resolved
      expect(getState(myMachine)).toEqual("updated");

      // Wait for the action to be resolved
      await new Promise((resolve) => setTimeout(resolve, 110));

      // We should have updated the context
      expect(myMachine.context.title).toEqual("Updated");

      // The machine is in the updating state
      expect(getState(myMachine)).toEqual("updated");
    });

    it("should be able to pass a transition to the producer done handler", async () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      };

      let updateContext = (context) => {
        return {
          ...context,
          title: "Updated",
        };
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated")), state("updated", action(setTitle, producer(updateContext, "done"))), state("done")),
        initial("idle")
      );

      expect(myMachine.states.updated.run).toHaveLength(1);
      expect(myMachine.states.updated.run[0]).toEqual({
        action: setTitle,
        success: {
          producer: updateContext,
          transition: "done",
        },
      });

      // Should create the transition if it does not exists in the state
      expect(myMachine.states.updated.on).toEqual({
        done: {
          guards: [],
          target: "done",
          transition: "done",
        },
      });
    });

    it("should go to the done state if we passed a producer done handler with a transition", async () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      };

      let updateContext = (context) => {
        return {
          ...context,
          title: "Updated",
        };
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated")), state("updated", action(setTitle, producer(updateContext, "done"))), state("done")),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      invoke(myMachine, "updateTitle");

      // The machine is in the updating state and the action was fired but not yet resolved
      expect(getState(myMachine)).toEqual("updated");

      // Wait for the action to be resolved
      await new Promise((resolve) => setTimeout(resolve, 110));

      // We should have updated the context
      expect(myMachine.context.title).toEqual("Updated");

      // The machine is in the done state
      expect(getState(myMachine)).toEqual("done");
    });

    it("should throw a fatal error if an error ocurred in the done producer", async () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      };

      let updateContext = (context) => {
        throw new Error("Error");
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated")), state("updated", action(setTitle, producer(updateContext, "done"))), state("done")),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      expect(invoke(myMachine, "updateTitle")).rejects.toThrow("Error");

      // The machine is in the updating state and the action was fired but not yet resolved
      expect(getState(myMachine)).toEqual("updated");
    });

    it("should go to an error state if an error ocurred in the done producer and we have an error transition", async () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      };

      let updateContext = (context) => {
        throw new Error("Error");
      };

      const myMachine = machine(
        "My machine",
        states(
          state("idle", transition("updateTitle", "updated")),
          state("updated", action(setTitle, producer(updateContext, "done")), transition("error", "error")),
          state("done"),
          state("error")
        ),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      expect(invoke(myMachine, "updateTitle")).rejects.toThrow("Error");

      // Await for the error transition to be resolved
      await new Promise((resolve) => setTimeout(resolve, 110));

      // The machine is in the error state
      expect(getState(myMachine)).toEqual("error");
    });

    it("should move to a fatal state if an error ocurred in the done producer and we have a fatal state", async () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      };

      let updateContext = (context) => {
        throw new Error("Error");
      };

      const myMachine = machine(
        "My machine",
        states(
          state("idle", transition("updateTitle", "updated")),
          state("updated", action(setTitle, producer(updateContext, "done"))),
          state("done"),
          state("fatal")
        ),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      expect(invoke(myMachine, "updateTitle")).rejects.toThrow("Error");

      // Await for the error transition to be resolved
      await new Promise((resolve) => setTimeout(resolve, 110));

      // The machine is in the fatal state
      expect(getState(myMachine)).toEqual("fatal");
    });

    it("should be able to get the catched error if an error ocurred in the done producer and we have a fatal state", async () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      };

      let updateContext = (context) => {
        throw new Error("Error");
      };

      const myMachine = machine(
        "My machine",
        states(
          state("idle", transition("updateTitle", "updated")),
          state("updated", action(setTitle, producer(updateContext, "done"))),
          state("done"),
          state("fatal")
        ),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      expect(invoke(myMachine, "updateTitle")).rejects.toThrow("Error");

      // Await for the error transition to be resolved
      await new Promise((resolve) => setTimeout(resolve, 110));

      // The machine is in the fatal state
      expect(myMachine.fatal).toEqual(new Error("Error"));
    });

    it("should allow to pass an error transition", async () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        throw new Error("Error");
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated")), state("updated", action(setTitle, "done", "error")), state("done"), state("error")),
        initial("idle")
      );

      expect(myMachine.states.updated.run).toHaveLength(1);
      expect(myMachine.states.updated.run[0]).toEqual({
        action: setTitle,
        success: "done",
        failure: "error",
      });

      // Should create the transition if it does not exists in the state
      expect(myMachine.states.updated.on).toEqual({
        done: {
          guards: [],
          target: "done",
          transition: "done",
        },
        error: {
          guards: [],
          target: "error",
          transition: "error",
        },
      });
    });

    it("should go to the error state if the action throws an error and have an error transition", async () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        throw new Error("Error");
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated")), state("updated", action(setTitle, "done", "error")), state("done"), state("error")),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      expect(invoke(myMachine, "updateTitle")).rejects.toThrow("Error");

      // The machine is in the updating state and the action was fired but not yet resolved
      expect(getState(myMachine)).toEqual("updated");

      // Await for the error transition to be resolved
      await new Promise((resolve) => setTimeout(resolve, 110));

      // The machine is in the error state
      expect(getState(myMachine)).toEqual("error");
    });

    it("should be able to pass a producer as error handler to update the context if the action throws an error", async () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        throw new Error("Error");
      };

      let updateContextWithError = (context, error) => {
        return {
          ...context,
          error,
        };
      };

      const myMachine = machine(
        "My machine",
        states(
          state("idle", transition("updateTitle", "updated")),
          state("updated", action(setTitle, "done", producer(updateContextWithError))),
          state("done")
        ),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      expect(invoke(myMachine, "updateTitle")).rejects.toThrow("Error");

      // The machine is in the updating state and the action was fired but not yet resolved
      expect(getState(myMachine)).toEqual("updated");

      // Wait for the action to be resolved
      await new Promise((resolve) => setTimeout(resolve, 110));

      // We should have updated the context
      expect(myMachine.context.error).toEqual(new Error("Error"));

      // The machine is in the updated state
      expect(getState(myMachine)).toEqual("updated");
    });

    it("should be able to pass a transition to the error handler", async () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        throw new Error("Error");
      };
      let updateContextWithError = (context, error) => {
        return {
          ...context,
          error,
        };
      };

      const myMachine = machine(
        "My machine",
        states(
          state("idle", transition("updateTitle", "updated")),
          state("updated", action(setTitle, "done", producer(updateContextWithError, "error"))),
          state("done"),
          state("error")
        ),
        initial("idle")
      );

      expect(myMachine.states.updated.run).toHaveLength(1);
      expect(myMachine.states.updated.run[0]).toEqual({
        action: setTitle,
        success: "done",
        failure: {
          producer: updateContextWithError,
          transition: "error",
        },
      });

      // Should create the transition if it does not exists in the state
      expect(myMachine.states.updated.on).toEqual({
        done: {
          guards: [],
          target: "done",
          transition: "done",
        },
        error: {
          guards: [],
          target: "error",
          transition: "error",
        },
      });
    });

    it("should go to the error state if we passed a producer error handler with a transition", async () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        throw new Error("Error");
      };
      let updateContextWithError = (context, error) => {
        return {
          ...context,
          error,
        };
      };

      const myMachine = machine(
        "My machine",
        states(
          state("idle", transition("updateTitle", "updated")),
          state("updated", action(setTitle, "done", producer(updateContextWithError, "error"))),
          state("done"),
          state("error")
        ),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      expect(invoke(myMachine, "updateTitle")).rejects.toThrow("Error");

      // The machine is in the updating state and the action was fired but not yet resolved
      expect(getState(myMachine)).toEqual("updated");

      // Wait for the action to be resolved
      await new Promise((resolve) => setTimeout(resolve, 110));

      // We should have updated the context
      expect(myMachine.context.error).toEqual(new Error("Error"));

      // The machine is in the error state
      expect(getState(myMachine)).toEqual("error");
    });

    it("should throw a fatal error if an error ocurred in the error producer", async () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        throw new Error("Error");
      };
      let updateContextWithError = (context, error) => {
        throw new Error("Error handler error");
      };

      const myMachine = machine(
        "My machine",
        states(
          state("idle", transition("updateTitle", "updated")),
          state("updated", action(setTitle, "done", producer(updateContextWithError))),
          state("done")
        ),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      expect(invoke(myMachine, "updateTitle")).rejects.toThrow("Error handler error");

      // The machine is in the updating state and the action was fired but not yet resolved
      expect(getState(myMachine)).toEqual("updated");

      // Wait for the action to be resolved
      await new Promise((resolve) => setTimeout(resolve, 110));

      // We shouldn't have updated the context
      expect(myMachine.context.error).toBeUndefined();

      // The machine is still in the updated state
      expect(getState(myMachine)).toEqual("updated");

      // The error should be in the machine fatal property
      expect(myMachine.fatal).toEqual(new Error("Error handler error"));
    });

    it("should go to an error state if an error ocurred in the error producer and we have an error transition", async () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        throw new Error("Error");
      };
      let updateContextWithError = (context, error) => {
        throw new Error("Error handler error");
      };

      const myMachine = machine(
        "My machine",
        states(
          state("idle", transition("updateTitle", "updated")),
          state("updated", action(setTitle, "done", producer(updateContextWithError)), transition("error", "error")),
          state("done"),
          state("error")
        ),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      expect(invoke(myMachine, "updateTitle")).rejects.toThrow("Error");

      // The machine is in the updating state and the action was fired but not yet resolved
      expect(getState(myMachine)).toEqual("updated");

      // Wait for the action to be resolved
      await new Promise((resolve) => setTimeout(resolve, 110));

      // We shouldn't have updated the context
      expect(myMachine.context.error).toBeUndefined();

      // The machine is in the error state
      expect(getState(myMachine)).toEqual("error");
    });

    it("should move to a fatal state if an error ocurred in the error producer and we have a fatal state", async () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        throw new Error("Error");
      };
      let updateContextWithError = (context, error) => {
        throw new Error("Error handler error");
      };

      const myMachine = machine(
        "My machine",
        states(
          state("idle", transition("updateTitle", "updated")),
          state("updated", action(setTitle, "done", producer(updateContextWithError))),
          state("done"),
          state("fatal")
        ),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      expect(invoke(myMachine, "updateTitle")).rejects.toThrow("Error");

      // The machine is in the updating state and the action was fired but not yet resolved
      expect(getState(myMachine)).toEqual("updated");

      // Wait for the action to be resolved
      await new Promise((resolve) => setTimeout(resolve, 110));

      // We shouldn't have updated the context
      expect(myMachine.context.error).toBeUndefined();

      // The machine is in the fatal state
      expect(getState(myMachine)).toEqual("fatal");

      // The error should be in the machine fatal property
      expect(myMachine.fatal).toEqual(new Error("Error handler error"));
    });

    it("should validate that actions are created before any transitions", () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        throw new Error("Error");
      };

      expect(() => {
        validate(
          machine(
            "My machine",
            states(state("idle", transition("updateTitle", "updated")), state("updated", transition("done", "done"), action(setTitle, "done")), state("done")),
            initial("idle")
          )
        );
      }).toThrow("The action 'setTitle' of the state 'updated' must be created before any transitions.");
    });

    it("should validate that actions have an error transition or an error producer with a transition", () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        throw new Error("Error");
      };

      expect(() => {
        validate(
          machine(
            "My machine",
            states(state("idle", transition("updateTitle", "updated")), state("updated", action(setTitle, "done")), state("done")),
            initial("idle")
          )
        );
      }).toThrow(
        "The action 'setTitle' of the state 'updated' must have an error transition, an error producer with a transition or an 'error' transition in the state."
      );
    });

    it("should validate that the action error transition exists in the machine", () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        throw new Error("Error");
      };

      expect(() => {
        validate(
          machine(
            "My machine",
            states(state("idle", transition("updateTitle", "updated")), state("updated", action(setTitle, "done", "error")), state("done")),
            initial("idle")
          )
        );
      }).toThrow("The action 'setTitle' of the state 'updated' has an error transition 'error' that does not exists.");
    });

    it("should validate that the action producer error transition exists in the machine", () => {
      let setTitle = async (context) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        throw new Error("Error");
      };
      let updateContextWithError = (context, error) => {
        throw new Error("Error handler error");
      };

      expect(() => {
        validate(
          machine(
            "My machine",
            states(
              state("idle", transition("updateTitle", "updated")),
              state("updated", action(setTitle, "done", producer(updateContextWithError, "error"))),
              state("done")
            ),
            initial("idle")
          )
        );
      }).toThrow("The action 'setTitle' of the state 'updated' has an error transition 'error' that does not exists.");
    });
  });

  // Guards
  describe("Guards", () => {
    it("should create a machine with a transition with guards", () => {
      let validateTitle = (context) => context.title.length > 0;

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated", guard(validateTitle))), state("updated")),
        initial("idle")
      );

      expect(myMachine.states.idle.on.updateTitle.guards).toHaveLength(1);
      expect(myMachine.states.idle.on.updateTitle.guards[0]).toEqual({
        guard: validateTitle,
      });
    });

    it("should move to the state if the guard returns true", () => {
      let validateTitle = (context, payload) => typeof payload === "string" && payload.length > 0;

      const myMachine = machine(
        "My machine",
        states(
          state("idle", transition("updateTitle", "updated", guard(validateTitle))),
          state(
            "updated",
            producer((context) => ({ title: context.title }))
          )
        ),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      invoke(myMachine, "updateTitle", "Title");

      // The machine is in the updated state
      expect(getState(myMachine)).toEqual("updated");
    });

    it("should not move to the next state if the guard returns other than true", () => {
      let validateTitle = (context, payload) => typeof payload === "string" && payload.length > 0;

      const myMachine = machine(
        "My machine",
        states(
          state("idle", transition("updateTitle", "updated", guard(validateTitle))),
          state(
            "updated",
            producer((context) => ({ title: context.title }))
          )
        ),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      invoke(myMachine, "updateTitle", null);

      // The machine is in the idle state still
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      invoke(myMachine, "updateTitle", "Title2");

      // The machine is in the updated state
      expect(getState(myMachine)).toEqual("updated");
    });

    it("should not change the state if the guard returns other than true", () => {
      let validateTitle = (context, payload) => (typeof payload === "string" && payload.length > 0 ? true : "Must pass a valid title");

      const myMachine = machine(
        "My machine",
        states(
          state("idle", transition("updateTitle", "updated", guard(validateTitle))),
          state(
            "updated",
            producer((context, payload) => ({ ...context, title: payload }))
          )
        ),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      invoke(myMachine, "updateTitle", null);

      // The machine is in the idle state still and the context was not updated
      expect(getState(myMachine)).toEqual("idle");
      expect(myMachine.context.title).toBeUndefined();

      // Invoke the transition
      invoke(myMachine, "updateTitle", "Title2");

      // The machine is in the updated state and the context was updated
      expect(getState(myMachine)).toEqual("updated");
      expect(myMachine.context.title).toEqual("Title2");
    });

    it("should throw a fatal error if an error ocurred in a guard", () => {
      let validateTitle = (context, payload) => {
        throw new Error("Error");
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated", guard(validateTitle))), state("updated")),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      expect(() => invoke(myMachine, "updateTitle", "Title")).toThrow(new Error("Error"));

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // The error should be in the machine fatal property
      expect(myMachine.fatal).toEqual(new Error("Error"));
    });

    it("should go to an error state if a fatal error ocurred in a guard and we have an error transition", () => {
      let validateTitle = (context, payload) => {
        throw new Error("Error");
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated", guard(validateTitle)), transition("error", "error")), state("updated"), state("error")),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      expect(() => invoke(myMachine, "updateTitle", "Title")).not.toThrow(new Error("Error"));

      // The machine is in the error state
      expect(getState(myMachine)).toEqual("error");
    });

    it("should move to a fatal state if a fatal error ocurred in a guard and we have a fatal state", () => {
      let validateTitle = (context, payload) => {
        throw new Error("Error");
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated", guard(validateTitle))), state("updated"), state("fatal")),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      expect(() => invoke(myMachine, "updateTitle", "Title")).not.toThrow(new Error("Error"));

      // The machine is in the fatal state
      expect(getState(myMachine)).toEqual("fatal");
    });

    it("should be able to get the catched error if a fatal error ocurred in a guard and we have a fatal state", () => {
      let validateTitle = (context, payload) => {
        throw new Error("Error");
      };

      const myMachine = machine(
        "My machine",
        states(state("idle", transition("updateTitle", "updated", guard(validateTitle))), state("updated"), state("fatal")),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      invoke(myMachine, "updateTitle", "Title");

      // The machine is in the fatal state
      expect(getState(myMachine)).toEqual("fatal");

      // The error should be in the machine fatal property
      expect(myMachine.fatal).toEqual(new Error("Error"));
    });

    it("should allow to pass a producer to update the context as the error event handler for a guard", () => {
      let validateTitle = (context, payload) => (typeof payload === "string" && payload.length > 0 ? true : "Must pass a valid title");
      let guardFailureProducer = (context, payload) => ({ ...context, title: payload });

      const myMachine = machine(
        "My machine",
        states(
          state("idle", transition("updateTitle", "updated", guard(validateTitle, producer(guardFailureProducer)))),
          state(
            "updated",
            producer((context, payload) => ({ ...context, title: payload, error: null }))
          )
        ),
        initial("idle")
      );

      expect(myMachine.states.idle.on.updateTitle.guards).toHaveLength(1);
      expect(myMachine.states.idle.on.updateTitle.guards[0]).toEqual({
        guard: validateTitle,
        failure: {
          producer: guardFailureProducer,
        },
      });
    });

    it("should validate that the passed producer does not have a done transition", () => {
      let validateTitle = (context, payload) => (typeof payload === "string" && payload.length > 0 ? true : "Must pass a valid title");

      expect(() =>
        validate(
          machine(
            "My machine",
            states(
              state(
                "idle",
                transition(
                  "updateTitle",
                  "updated",
                  guard(
                    validateTitle,
                    producer((context, payload) => ({ ...context, error: payload }), "error")
                  )
                )
              ),
              state(
                "updated",
                producer((context, payload) => ({ ...context, title: payload, error: null }))
              )
            ),
            initial("idle")
          )
        )
      ).toThrow(new Error("The guard 'validateTitle' of the transition 'idle.updateTitle' cannot have a transition."));
    });

    it("should update the context with the producer if the guard returns other than true", () => {
      let validateTitle = (context, payload) => (typeof payload === "string" && payload.length > 0 ? true : "Must pass a valid title");

      const myMachine = machine(
        "My machine",
        states(
          state(
            "idle",
            transition(
              "updateTitle",
              "updated",
              guard(
                validateTitle,
                producer((context, payload) => ({ ...context, error: payload }))
              )
            )
          ),
          state(
            "updated",
            producer((context, payload) => ({ ...context, title: payload, error: null }))
          )
        ),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      invoke(myMachine, "updateTitle", null);

      // The machine is in the idle state still and the context was not updated but the error was
      expect(getState(myMachine)).toEqual("idle");
      expect(myMachine.context.error).toEqual("Must pass a valid title");

      // Invoke the transition
      invoke(myMachine, "updateTitle", "Title2");

      // The machine is in the updated state and the context was updated
      expect(getState(myMachine)).toEqual("updated");
      expect(myMachine.context.error).toBeNull();
    });

    it("should throw a fatal error if an error ocurred in the guard producer", () => {
      let validateTitle = (context, payload) => (typeof payload === "string" && payload.length > 0 ? true : "Must pass a valid title");
      let guardFailureProducer = (context, payload) => {
        throw new Error("Error");
      };

      const myMachine = machine(
        "My machine",
        states(
          state("idle", transition("updateTitle", "updated", guard(validateTitle, producer(guardFailureProducer)))),
          state(
            "updated",
            producer((context, payload) => ({ ...context, title: payload, error: null }))
          )
        ),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      expect(() => invoke(myMachine, "updateTitle", null)).toThrow(new Error("Error"));

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // The error should be in the machine fatal property
      expect(myMachine.fatal).toEqual(new Error("Error"));
    });

    it("should go to an error state if an error ocurred in the guard producer and we have an error transition", () => {
      let validateTitle = (context, payload) => (typeof payload === "string" && payload.length > 0 ? true : "Must pass a valid title");
      let guardFailureProducer = (context, payload) => {
        throw new Error("Error");
      };

      const myMachine = machine(
        "My machine",
        states(
          state("idle", transition("updateTitle", "updated", guard(validateTitle, producer(guardFailureProducer))), transition("error", "error")),
          state("updated"),
          state("error")
        ),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      expect(() => invoke(myMachine, "updateTitle", null)).not.toThrow(new Error("Error"));

      // The machine is in the error state
      expect(getState(myMachine)).toEqual("error");
    });

    it("should move to a fatal state if an error ocurred in the guard producer and we have a fatal state", () => {
      let validateTitle = (context, payload) => (typeof payload === "string" && payload.length > 0 ? true : "Must pass a valid title");
      let guardFailureProducer = (context, payload) => {
        throw new Error("Error");
      };

      const myMachine = machine(
        "My machine",
        states(
          state("idle", transition("updateTitle", "updated", guard(validateTitle, producer(guardFailureProducer)))),
          state(
            "updated",
            producer((context, payload) => ({ ...context, title: payload, error: null }))
          ),
          state("fatal")
        ),
        initial("idle")
      );

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      expect(() => invoke(myMachine, "updateTitle", null)).not.toThrow(new Error("Error"));

      // The machine is in the error state
      expect(getState(myMachine)).toEqual("fatal");

      // The error should be in the machine fatal property
      expect(myMachine.fatal).toEqual(new Error("Error"));
    });
  });

  // History
  describe("History", () => {
    // Should be able to get the history of the machine
    it("should be able to get the history of the machine", async () => {
      let updateTitle = (context, payload) => ({ ...context, title: payload });
      let saveTitle = (context, payload) => new Promise((resolve) => setTimeout(() => resolve(1), 100));
      let canUpdateTitle = (context, payload) => (typeof payload === "string" && payload.length ? true : "Must pass a valid title");

      const myMachine = machine(
        "My machine",
        states(
          state("idle", transition("updateTitle", "updated", guard(canUpdateTitle))),
          state("updated", action(saveTitle), producer(updateTitle), immediate("idle"))
        ),
        initial("idle")
      );

      // Invoke the transition with an invalid title
      await invoke(myMachine, "updateTitle", "");

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // Invoke the transition
      await invoke(myMachine, "updateTitle", "Title");

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // The history should be an array with the current state and the initial state
      expect(myMachine.history).toEqual([
        "State: idle", // The initial state
        "Transition: updateTitle", // First try to update the title
        "Guard: canUpdateTitle", // Runs the guard
        "State: idle", // As the guard failed, the machine stays in the initial state
        "Transition: updateTitle", // Second try to update the title
        "Guard: canUpdateTitle", // Runs the guard
        "State: updated", // As the guard passed, the machine goes to the updated state
        "Action: saveTitle", // Runs the action
        "Producer: updateTitle", // Runs the producer
        "Transition: idle", // The immediate transition
        "State: idle", // The machine goes back to the initial state
      ]);
    });
  });

  // Start
  describe("Start", () => {
    // Should be able to start the machine
    it("should be able to start the machine", async () => {
      let updateTitle = (context, payload) => ({ ...context, title: payload });
      let saveTitle = (context, payload) => new Promise((resolve) => setTimeout(() => resolve(1), 100));
      let canUpdateTitle = (context, payload) => (typeof payload === "string" && payload.length ? true : "Must pass a valid title");

      const myMachine = machine(
        "My machine",
        states(
          state("idle", action(saveTitle), producer(updateTitle), transition("updateTitle", "updated", guard(canUpdateTitle))),
          state("updated", action(saveTitle), producer(updateTitle), immediate("idle"))
        ),
        initial("idle")
      );

      // Check the machine is in the initial state
      expect(getState(myMachine)).toEqual("idle");
      expect(myMachine.history).toEqual(["State: idle"]);

      // Start the machine with a title
      await start(myMachine, "Initial title");

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // The history should have the initial state, the idle action and the idle producer
      expect(myMachine.history).toEqual(["State: idle", "Action: saveTitle", "Producer: updateTitle"]);
    });

    it("should not be able to start the machine if already started it", async () => {
      let updateTitle = (context, payload) => ({ ...context, title: payload });
      let saveTitle = (context, payload) => new Promise((resolve) => setTimeout(() => resolve(1), 100));
      let canUpdateTitle = (context, payload) => (typeof payload === "string" && payload.length ? true : "Must pass a valid title");

      const myMachine = machine(
        "My machine",
        states(
          state("idle", action(saveTitle), producer(updateTitle), transition("updateTitle", "updated", guard(canUpdateTitle))),
          state("updated", action(saveTitle), producer(updateTitle), immediate("idle"))
        ),
        initial("idle")
      );

      // Check the machine is in the initial state
      expect(getState(myMachine)).toEqual("idle");
      expect(myMachine.history).toEqual(["State: idle"]);

      // Start the machine with a title
      await start(myMachine, "Initial title");

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // The history should have the initial state, the idle action and the idle producer
      expect(myMachine.history).toEqual(["State: idle", "Action: saveTitle", "Producer: updateTitle"]);

      // Try to start the machine again
      await expect(() => start(myMachine, "Initial title")).toThrow(new Error("The machine has already been started."));

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // The history should not be updated
      expect(myMachine.history).toEqual(["State: idle", "Action: saveTitle", "Producer: updateTitle"]);
    });

    it("should not be able to start the machine if already moved it to another state", async () => {
      let updateTitle = (context, payload) => ({ ...context, title: payload });
      let saveTitle = (context, payload) => new Promise((resolve) => setTimeout(() => resolve(1), 100));
      let canUpdateTitle = (context, payload) => (typeof payload === "string" && payload.length ? true : "Must pass a valid title");

      const myMachine = machine(
        "My machine",
        states(
          state("idle", action(saveTitle), producer(updateTitle), transition("updateTitle", "updated", guard(canUpdateTitle))),
          state("updated", action(saveTitle), producer(updateTitle), immediate("idle"))
        ),
        initial("idle")
      );

      // Check the machine is in the initial state
      expect(getState(myMachine)).toEqual("idle");
      expect(myMachine.history).toEqual(["State: idle"]);

      // Update the machine with a title
      await invoke(myMachine, "updateTitle", "Initial title");

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // The history should have the initial state, plus the transitions and actions of update and then the ones of the idle state
      expect(myMachine.history).toEqual([
        "State: idle",
        "Transition: updateTitle",
        "Guard: canUpdateTitle",
        "State: updated",
        "Action: saveTitle",
        "Producer: updateTitle",
        "Transition: idle",
        "State: idle",
        "Action: saveTitle",
        "Producer: updateTitle",
      ]);

      // Try to start the machine again
      await expect(() => start(myMachine, "Initial title")).toThrow(new Error("The machine has already been started."));

      // The machine is in the idle state
      expect(getState(myMachine)).toEqual("idle");

      // The history should not be updated
      expect(myMachine.history).toEqual([
        "State: idle",
        "Transition: updateTitle",
        "Guard: canUpdateTitle",
        "State: updated",
        "Action: saveTitle",
        "Producer: updateTitle",
        "Transition: idle",
        "State: idle",
        "Action: saveTitle",
        "Producer: updateTitle",
      ]);
    });
  });
});

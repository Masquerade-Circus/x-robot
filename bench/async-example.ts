import {
  action,
  immediate,
  initial,
  invoke,
  machine,
  producer,
  state,
  states,
  transition
} from "../lib";
import { assign, createMachine, interpret } from "xstate";
import { beforeEach, benchmark, compare } from "buffalo-test";
import {
  reduce,
  createMachine as robotCreateMachine,
  immediate as robotImmediate,
  interpret as robotInterpret,
  invoke as robotInvoke,
  state as robotState,
  transition as robotTransition
} from "robot3";

import expect from "expect";

compare("Async example", () => {
  let getXStateMachine = () => {
    const dogApiMachine = createMachine({
      id: "dog-api",
      initial: "idle",
      context: {},
      states: {
        idle: {
          on: {
            FETCH: "loading"
          }
        },
        loading: {
          invoke: {
            id: "fetchDog",
            src: (context, event) =>
              new Promise((resolve) =>
                setTimeout(() => resolve({ name: "fido" }), 0)
              ),
            onDone: {
              target: "resolved",
              actions: assign({
                dog: (_, event) => event.data
              })
            },
            onError: "rejected"
          },
          on: {
            CANCEL: "idle"
          }
        },
        resolved: {
          always: {
            target: "idle"
          }
        },
        rejected: {
          on: {
            FETCH: "loading"
          }
        }
      }
    });

    const dogApiService = interpret(dogApiMachine).start();

    // We need to simulate the await of the fetchDog invocation because it's async and with the current
    // implementation of xstate we can't await for an async transition to complete.
    // The only way we can do this is by creating a custom interpreter and add this behavior to it.
    // So for now we'll just use the xstate interpreter and simulate the async/await.
    let onDone;
    dogApiService.onEvent(
      () => dogApiService.state.value === "idle" && onDone()
    );

    let sendFetch = async () => {
      dogApiService.send("FETCH");
      await new Promise((resolve) => {
        onDone = resolve;
      });
    };

    return { dogApiService, sendFetch };
  };

  let getRobot3Machine = () => {
    let dogApiMachine = robotCreateMachine(
      {
        idle: robotState(robotTransition("FETCH", "loading")),
        loading: robotInvoke(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ name: "fido" }), 0)
            ),
          robotTransition(
            "done",
            "resolved",
            reduce((ctx: object, ev: { data }) => ({
              ...ctx,
              dog: { name: ev.data.name }
            }))
          ),
          robotTransition("error", "rejected"),
          robotTransition("CANCEL", "idle")
        ),
        resolved: robotState(robotImmediate("idle")),
        rejected: robotState()
      },
      () => ({})
    );

    let dogApiService = robotInterpret(dogApiMachine, () => {});

    // Same as xstate here, we need to simulate the async behavior of the fetchDog invocation.
    // We'll just use the robot interpreter and simulate the async/await.
    let sendFetch = async () => {
      dogApiService.send("FETCH");
      await new Promise((resolve) => {
        let interval = setInterval(() => {
          if (dogApiService.machine.current === "idle") {
            clearInterval(interval);
            resolve(0);
          }
        }, 0);
      });
    };

    return { dogApiService, sendFetch };
  };

  let getXRobotMachine = () => {
    let dogApiMachine = machine(
      "Dog api",
      states(
        state("idle", transition("FETCH", "loading")),
        state(
          "loading",
          action(
            () =>
              new Promise((resolve) =>
                setTimeout(() => resolve({ name: "fido" }), 0)
              ),
            producer((ctx, data) => ({ dog: data }), "resolved"),
            "rejected"
          ),
          transition("CANCEL", "idle")
        ),
        state("resolved", immediate("idle")),
        state("rejected")
      ),
      initial("idle")
    );

    // We don't need to simulate the async behavior of the fetchDog invocation because X-Robot handles that for us.
    // We just need to async the invocation

    return dogApiMachine;
  };

  beforeEach(async () => {
    let { dogApiService: xStateMachine, sendFetch } = getXStateMachine();
    expect(xStateMachine.state.value).toEqual("idle");
    await sendFetch();
    expect(xStateMachine.state.value).toEqual("idle");
    expect(xStateMachine.state.context).toEqual({ dog: { name: "fido" } });
  });

  beforeEach(async () => {
    let { dogApiService: robot3Machine, sendFetch } = getRobot3Machine();
    expect(robot3Machine.machine.current).toEqual("idle");
    await sendFetch();
    expect(robot3Machine.machine.current).toEqual("idle");
    expect(robot3Machine.context).toEqual({ dog: { name: "fido" } });
  });

  beforeEach(async () => {
    let xRobotMachine = getXRobotMachine();
    expect(xRobotMachine.current).toEqual("idle");
    await invoke(xRobotMachine, "FETCH");
    expect(xRobotMachine.current).toEqual("idle");
    expect(xRobotMachine.context).toEqual({ dog: { name: "fido" } });
  });

  let xStateMachine = getXStateMachine();
  let robot3Machine = getRobot3Machine();
  let xRobotMachine = getXRobotMachine();

  benchmark("XState", async () => {
    await xStateMachine.sendFetch();
  });

  benchmark("Robot3", async () => {
    await robot3Machine.sendFetch();
  });

  benchmark("X-Robot", async () => {
    await invoke(xRobotMachine, "FETCH");
  });
});

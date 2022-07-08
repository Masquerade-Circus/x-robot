import { beforeEach, benchmark, compare } from "buffalo-test";
import { createMachine, interpret } from "xstate";
import { initial, invoke, machine, state, states, transition } from "../lib";
import {
  createMachine as robotCreateMachine,
  interpret as robotInterpret,
  state as robotState,
  transition as robotTransition
} from "robot3";

import expect from "expect";

compare("Simple example", () => {
  let getXStateMachine = () => {
    const stoplightMachine = createMachine({
      id: "stoplight",
      initial: "green",
      states: {
        green: {
          on: {
            next: "yellow"
          }
        },
        yellow: {
          on: {
            next: "red"
          }
        },
        red: {
          on: {
            next: "green"
          }
        }
      }
    });

    const stoplightService = interpret(stoplightMachine).start();
    return stoplightService;
  };

  let getRobot3Machine = () => {
    let stoplightMachine = robotCreateMachine({
      green: robotState(robotTransition("next", "yellow")),
      yellow: robotState(robotTransition("next", "red")),
      red: robotState(robotTransition("next", "green"))
    });

    let stoplightService = robotInterpret(stoplightMachine, () => {});
    return stoplightService;
  };

  let getXRobotMachine = () => {
    let stoplightMachine = machine(
      "StopLight Machine",
      states(
        state("green", transition("next", "yellow")),
        state("yellow", transition("next", "red")),
        state("red", transition("next", "green"))
      ),
      initial("green")
    );

    return stoplightMachine;
  };

  beforeEach(() => {
    let xStateMachine = getXStateMachine();
    expect(xStateMachine.state.value).toBe("green");
    xStateMachine.send("next");
    expect(xStateMachine.state.value).toBe("yellow");
    xStateMachine.send("next");
    expect(xStateMachine.state.value).toBe("red");
    xStateMachine.send("next");
    expect(xStateMachine.state.value).toBe("green");
  });

  beforeEach(() => {
    let robot3Machine = getRobot3Machine();
    expect(robot3Machine.machine.current).toBe("green");
    robot3Machine.send("next");
    expect(robot3Machine.machine.current).toBe("yellow");
    robot3Machine.send("next");
    expect(robot3Machine.machine.current).toBe("red");
    robot3Machine.send("next");
    expect(robot3Machine.machine.current).toBe("green");
  });

  beforeEach(() => {
    let xRobotMachine = getXRobotMachine();
    expect(xRobotMachine.current).toBe("green");
    invoke(xRobotMachine, "next");
    expect(xRobotMachine.current).toBe("yellow");
    invoke(xRobotMachine, "next");
    expect(xRobotMachine.current).toBe("red");
    invoke(xRobotMachine, "next");
    expect(xRobotMachine.current).toBe("green");
  });

  let xStateMachine = getXStateMachine();
  let robot3Machine = getRobot3Machine();
  let xRobotMachine = getXRobotMachine();

  benchmark("XState", () => {
    xStateMachine.send("next");
  });

  benchmark("Robot3", () => {
    robot3Machine.send("next");
  });

  benchmark("X-Robot", () => {
    invoke(xRobotMachine, "next");
  });
});

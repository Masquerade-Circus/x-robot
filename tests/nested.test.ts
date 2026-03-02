import { context, getState, guard, immediate, init, initial, invoke, machine, nested, nestedGuard, pulse, state, transition } from "../lib";
import { describe, it } from "mocha";

import expect from "expect";

describe("Nested states", () => {
  it("should create a machine with a state with a nested machine", () => {
    const stopwalk = machine("Stopwalk", init(initial("wait")), state("wait", transition("start", "walk")), state("walk", transition("stop", "wait")));

    const stoplight = machine(
      "Stoplight",
      init(initial("green")),
      state("green", nested(stopwalk, "stop"), transition("next", "yellow")),
      state("yellow", transition("next", "red")),
      state("red", nested(stopwalk, "start"), transition("next", "green"))
    );

    expect(stoplight.states.red.nested).toHaveLength(1);
    expect(stoplight.states.red.nested[0].machine).toEqual(stopwalk);
  });

  it("should allow to move the nested machine when enters the state", () => {
    const stopwalk = machine("Stopwalk", init(initial("wait")), state("wait", transition("start", "walk")), state("walk", transition("stop", "wait")));

    const stoplight = machine(
      "Stoplight",
      init(initial("green")),
      state("green", nested(stopwalk, "stop"), transition("next", "yellow")),
      state("yellow", transition("next", "red")),
      state("red", nested(stopwalk, "start"), transition("next", "green"))
    );

    expect(getState(stoplight)).toEqual("green");
    expect(getState(stoplight, "green")).toEqual("wait");
    expect(getState(stoplight, "stopwalk")).toEqual("wait");
    expect(getState(stopwalk)).toEqual("wait");

    invoke(stoplight, "next");
    expect(getState(stoplight)).toEqual("yellow");
    expect(getState(stoplight, "yellow")).toEqual(null);
    expect(getState(stoplight, "stopwalk")).toEqual("wait");
    expect(getState(stopwalk)).toEqual("wait");

    invoke(stoplight, "next");
    expect(getState(stoplight)).toEqual("red");
    expect(getState(stoplight, "red")).toEqual("walk");
    expect(getState(stoplight, "stopwalk")).toEqual("walk");
    expect(getState(stopwalk)).toEqual("walk");

    invoke(stoplight, "next");
    expect(getState(stoplight)).toEqual("green");
    expect(getState(stoplight, "green")).toEqual("wait");
    expect(getState(stoplight, "stopwalk")).toEqual("wait");
    expect(getState(stopwalk)).toEqual("wait");
  });

  it("should allow to move the nested machine if it is in the correct state", () => {
    function doorWayIsEmpty(context) {
      return context.doorWayCount === 0;
    }

    function doorWayIsNotEmpty(context) {
      return !doorWayIsEmpty(context);
    }

    function aPersonEnters(context) {
      context.doorWayCount = context.doorWayCount + 1;
    }

    function aPersonLeaves(context) {
      context.doorWayCount = context.doorWayCount - 1;
    }

    let doorWayMachine = machine(
      "doorWay",
      init(initial("idle"), context({ doorWayCount: 0 })),
      state("idle", transition("enter", "enter"), transition("leave", "leave", guard(doorWayIsNotEmpty))),
      state("enter", pulse(aPersonEnters), immediate("idle")),
      state("leave", pulse(aPersonLeaves), immediate("idle"))
    );

    let doorMachine = machine(
      "door",
      init(initial("closed"), context({})),
      state("opened", nested(doorWayMachine), transition("close", "closed", nestedGuard(doorWayMachine, doorWayIsEmpty))),
      state("closed", transition("open", "opened"), transition("lock", "locked")),
      state("locked", transition("unlock", "closed"))
    );

    // Door is closed
    expect(getState(doorMachine)).toEqual("closed");
    expect(getState(doorWayMachine)).toEqual("idle");
    expect(doorWayMachine.context.doorWayCount).toEqual(0);

    // Open the door
    invoke(doorMachine, "open");
    expect(getState(doorMachine)).toEqual("opened");
    expect(getState(doorWayMachine)).toEqual("idle");
    expect(doorWayMachine.context.doorWayCount).toEqual(0);

    // Person enters the door
    invoke(doorMachine, "opened.enter");
    expect(getState(doorMachine)).toEqual("opened");
    expect(getState(doorWayMachine)).toEqual("idle");
    expect(doorWayMachine.context.doorWayCount).toEqual(1);
  });

  it("should not allow to move the nested machine if it is in the wrong state", () => {
    function doorWayIsEmpty(context) {
      return context.doorWayCount === 0;
    }

    function doorWayIsNotEmpty(context) {
      return !doorWayIsEmpty(context);
    }

    function aPersonEnters(context) {
      context.doorWayCount = context.doorWayCount + 1;
    }

    function aPersonLeaves(context) {
      context.doorWayCount = context.doorWayCount - 1;
    }

    let doorWayMachine = machine(
      "doorWay",
      init(initial("idle"), context({ doorWayCount: 0 })),
      state("idle", transition("enter", "enter"), transition("leave", "leave", guard(doorWayIsNotEmpty))),
      state("enter", pulse(aPersonEnters), immediate("idle")),
      state("leave", pulse(aPersonLeaves), immediate("idle"))
    );

    let doorMachine = machine(
      "door",
      init(initial("closed"), context({})),
      state("opened", nested(doorWayMachine), transition("close", "closed", nestedGuard(doorWayMachine, doorWayIsEmpty))),
      state("closed", transition("open", "opened"), transition("lock", "locked")),
      state("locked", transition("unlock", "closed"))
    );

    // Door is closed
    expect(getState(doorMachine)).toEqual("closed");
    expect(getState(doorWayMachine)).toEqual("idle");
    expect(doorWayMachine.context.doorWayCount).toEqual(0);

    // Person enters the door
    expect(() => invoke(doorMachine, "opened.enter")).toThrow("The transition 'opened.enter' does not exist in the current state 'closed'");
    expect(getState(doorMachine)).toEqual("closed");
    expect(getState(doorWayMachine)).toEqual("idle");
    expect(doorWayMachine.context.doorWayCount).toEqual(0);
  });

  it.skip("should allow to use a nested guard in the parent machine", () => {
    function doorWayIsEmpty(context) {
      return context.doorWayCount === 0 ? true : "Doorway is not empty";
    }

    function doorWayIsNotEmpty(context) {
      return doorWayIsEmpty(context) !== true;
    }

    function aPersonEnters(context) {
      context.doorWayCount = context.doorWayCount + 1;
    }

    function aPersonLeaves(context) {
      context.doorWayCount = context.doorWayCount - 1;
    }

    function updateError(context, error) {
      context.error = error;
    }

    let doorWayMachine = machine(
      "doorWay",
      init(initial("idle"), context({ doorWayCount: 0 })),
      state("idle", transition("enter", "enter"), transition("leave", "leave", guard(doorWayIsNotEmpty))),
      state("enter", pulse(aPersonEnters), immediate("idle")),
      state("leave", pulse(aPersonLeaves), immediate("idle"))
    );

    let doorMachine = machine(
      "door",
      init(initial("closed"), context({ error: null })),
      state("opened", nested(doorWayMachine), transition("close", "closed", nestedGuard(doorWayMachine, doorWayIsEmpty))),
      state("closed", transition("open", "opened"), transition("lock", "locked")),
      state("locked", transition("unlock", "closed"))
    );

    // Door is closed
    expect(getState(doorMachine)).toEqual("closed");
    expect(getState(doorWayMachine)).toEqual("idle");
    expect(doorWayMachine.context.doorWayCount).toEqual(0);
    expect(doorMachine.context.error).toBeNull();

    // Open the door
    invoke(doorMachine, "open");
    expect(getState(doorMachine)).toEqual("opened");
    expect(getState(doorWayMachine)).toEqual("idle");
    expect(doorWayMachine.context.doorWayCount).toEqual(0);
    expect(doorMachine.context.error).toBeNull();

    // Person enters the door
    invoke(doorMachine, "opened.enter");
    expect(getState(doorMachine)).toEqual("opened");
    expect(getState(doorWayMachine)).toEqual("idle");
    expect(doorWayMachine.context.doorWayCount).toEqual(1);
    expect(doorMachine.context.error).toBeNull();

    // Close the door
    invoke(doorMachine, "close");
    expect(getState(doorMachine)).toEqual("opened");
    expect(getState(doorWayMachine)).toEqual("idle");
    expect(doorWayMachine.context.doorWayCount).toEqual(1);
    expect(doorMachine.context.error).toEqual("Doorway is not empty");
  });

  it("should allow to immediately move the machine when a nestedGuard returns true", () => {
    const stopwalk = machine("Stopwalk", init(initial("wait")), state("wait", transition("start", "walk")), state("walk", transition("stop", "wait")));

    const canGoToGreen = (context) => {
      return stopwalk.current === "wait";
    };

    const stoplight = machine(
      "Stoplight",
      init(initial("green")),
      state("green", transition("next", "yellow")),
      state("yellow", transition("next", "red")),
      state("red", nested(stopwalk, "start"), immediate("green", nestedGuard(stopwalk, canGoToGreen)))
    );

    expect(getState(stoplight)).toEqual("green");
    expect(getState(stopwalk)).toEqual("wait");

    invoke(stoplight, "next");
    expect(getState(stoplight)).toEqual("yellow");
    expect(getState(stopwalk)).toEqual("wait");

    invoke(stoplight, "next");
    expect(getState(stoplight)).toEqual("red");
    expect(getState(stopwalk)).toEqual("walk");

    invoke(stoplight, "red.stop");
    expect(getState(stoplight)).toEqual("green");
    expect(getState(stopwalk)).toEqual("wait");
  });

  it("should allow to move multiple nested machines if they have the same event", () => {
    let leftWingMachine = machine(
      "Left wing",
      init(initial("closed")),
      state("closed", transition("open", "opened")),
      state("opened", transition("close", "closed"))
    );
    let rightWingMachine = machine(
      "Right wing",
      init(initial("closed")),
      state("closed", transition("open", "opened")),
      state("opened", transition("close", "closed"))
    );

    function wingsAreOpened(context) {
      return leftWingMachine.current === "opened" && rightWingMachine.current === "opened";
    }

    function wingsAreClosed(context) {
      return !wingsAreOpened(context);
    }

    let bird = machine(
      "Bird",
      init(initial("land")),
      state("land", transition("takeoff", "takingoff")),
      state("takingoff", nested(leftWingMachine), nested(rightWingMachine), immediate("flying", guard(wingsAreOpened))),
      state("flying", transition("land", "landing")),
      state("landing", nested(leftWingMachine), nested(rightWingMachine), immediate("land", guard(wingsAreClosed)))
    );

    expect(getState(bird)).toEqual("land");
    expect(getState(bird, "land")).toEqual(null);
    expect(getState(bird, "leftwing")).toEqual("closed");
    expect(getState(bird, "rightwing")).toEqual("closed");
    expect(getState(leftWingMachine)).toEqual("closed");
    expect(getState(rightWingMachine)).toEqual("closed");

    invoke(bird, "takeoff");
    expect(getState(bird)).toEqual("takingoff");
    expect(getState(bird, "takingoff")).toEqual({
      leftwing: "closed",
      rightwing: "closed",
    });
    expect(getState(bird, "leftwing")).toEqual("closed");
    expect(getState(bird, "rightwing")).toEqual("closed");
    expect(getState(leftWingMachine)).toEqual("closed");
    expect(getState(rightWingMachine)).toEqual("closed");

    invoke(bird, "takingoff.open");
    expect(getState(bird)).toEqual("flying");
    expect(getState(bird, "flying")).toEqual(null);
    expect(getState(bird, "leftwing")).toEqual("opened");
    expect(getState(bird, "rightwing")).toEqual("opened");
    expect(getState(leftWingMachine)).toEqual("opened");
    expect(getState(rightWingMachine)).toEqual("opened");

    invoke(bird, "land");
    expect(getState(bird)).toEqual("landing");
    expect(getState(bird, "landing")).toEqual({
      leftwing: "opened",
      rightwing: "opened",
    });
    expect(getState(bird, "leftwing")).toEqual("opened");
    expect(getState(bird, "rightwing")).toEqual("opened");
    expect(getState(leftWingMachine)).toEqual("opened");
    expect(getState(rightWingMachine)).toEqual("opened");

    invoke(bird, "landing.close");
    expect(getState(bird)).toEqual("land");
    expect(getState(bird, "land")).toEqual(null);
    expect(getState(bird, "leftwing")).toEqual("closed");
    expect(getState(bird, "rightwing")).toEqual("closed");
    expect(getState(leftWingMachine)).toEqual("closed");
    expect(getState(rightWingMachine)).toEqual("closed");
  });
});

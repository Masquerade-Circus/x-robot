import { documentate } from "../lib/documentate";
import type { SerializedMachine } from "../lib/documentate/types";
import { describe, it } from "mocha";

import bird from "./bird-machine-ts";
import expect from "expect";

// Generate code from a serialized machine
describe("Generate code from a serialized machine", () => {
  const getMachine = async (): Promise<SerializedMachine> => {
    const result = await documentate(bird, { format: 'json' });
    return JSON.parse(result.json || '{}');
  };

  it("should generate code from a serialized machine in esm format", async () => {
    let expectedCode = `import { machine, states, initial, context, primaryState, description, immediate, transition, nested, state, guard, infoState, nestedGuard, successState, warningState, dangerState, parallel, entry, exit } from "x-robot";

/******************** LeftWingMachine Start ********************/

const getLeftWingContext = () => ({
  "state": null,
  "error": null
});

// Guards
const isLeftWingClosed = (context, payload) => {
  // TODO: Implement guard
  return true;
};
const isLeftWingOpened = (context, payload) => {
  // TODO: Implement guard
  return true;
};

// Producers
const updateError = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};
const updateLeftWingToClosed = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};
const updateLeftWingToOpened = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};
const updateLeftWingToFatal = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};

// Actions
const sendStateToApiForLeftWing = async (context, payload) => {
  // TODO: Implement action
};

export const LeftWingMachine = machine(
  "Left wing",
  states(
    state(
      "closed",
      description("The left wing is closed"),
      entry(sendStateToApiForLeftWing, null, entry(updateError, "fatal")),
      entry(updateLeftWingToClosed),
      transition("open", "opened", guard(isLeftWingClosed, entry(updateError)))
    ),
    state(
      "opened",
      description("The left wing is opened"),
      entry(sendStateToApiForLeftWing, null, entry(updateError, "fatal")),
      entry(updateLeftWingToOpened),
      transition("close", "closed", guard(isLeftWingOpened, entry(updateError)))
    ),
    state(
      "fatal",
      description("Is the left wing injured?"),
      entry(sendStateToApiForLeftWing, null, entry(updateError, "fatal")),
      entry(updateLeftWingToFatal),
      entry(updateError)
    )
  ),
  context(getLeftWingContext),
  initial("closed")
);

/******************** LeftWingMachine End ********************/

/******************** RightWingMachine Start ********************/

const getRightWingContext = () => ({
  "state": null,
  "error": null
});

// Guards
const isRightWingClosed = (context, payload) => {
  // TODO: Implement guard
  return true;
};
const isRightWingOpened = (context, payload) => {
  // TODO: Implement guard
  return true;
};

// Producers
const updateRightWingToClosed = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};
const updateRightWingToOpened = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};
const updateRightWingToFatal = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};

// Actions
const sendStateToApiForRightWing = async (context, payload) => {
  // TODO: Implement action
};

export const RightWingMachine = machine(
  "Right wing",
  states(
    state(
      "closed",
      description("The right wing is closed"),
      entry(sendStateToApiForRightWing, null, entry(updateError, "fatal")),
      entry(updateRightWingToClosed),
      transition("open", "opened", guard(isRightWingClosed, entry(updateError)))
    ),
    state(
      "opened",
      description("The right wing is opened"),
      entry(sendStateToApiForRightWing, null, entry(updateError, "fatal")),
      entry(updateRightWingToOpened),
      transition("close", "closed", guard(isRightWingOpened, entry(updateError)))
    ),
    state(
      "fatal",
      description("Is the right wing injured?"),
      entry(sendStateToApiForRightWing, null, entry(updateError, "fatal")),
      entry(updateRightWingToFatal),
      entry(updateError)
    )
  ),
  context(getRightWingContext),
  initial("closed")
);

/******************** RightWingMachine End ********************/

/******************** FlyingTimeMachine Start ********************/

const getFlyingTimeContext = () => ({
  "time": 0,
  "timer": null
});

// Guards
const isTimeStopped = (context, payload) => {
  // TODO: Implement guard
  return true;
};
const isTimeStarted = (context, payload) => {
  // TODO: Implement guard
  return true;
};

// Producers
const stopTimer = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};
const startTimer = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};

export const FlyingTimeMachine = machine(
  "Flying time",
  states(
    state(
      "stopped",
      description("The bird is not flying"),
      entry(stopTimer),
      transition("start", "started", guard(isTimeStopped))
    ),
    state(
      "started",
      description("The bird is flying"),
      entry(startTimer),
      transition("stop", "stopped", guard(isTimeStarted))
    )
  ),
  context(getFlyingTimeContext),
  initial("stopped")
);

/******************** FlyingTimeMachine End ********************/

/******************** WalkingTimeMachine Start ********************/

const getWalkingTimeContext = () => ({
  "time": 0,
  "timer": null
});

export const WalkingTimeMachine = machine(
  "Walking time",
  states(
    state(
      "stopped",
      description("The bird is not walking"),
      entry(stopTimer),
      transition("start", "started", guard(isTimeStopped))
    ),
    state(
      "started",
      description("The bird is walking"),
      entry(startTimer),
      transition("stop", "stopped", guard(isTimeStarted))
    )
  ),
  context(getWalkingTimeContext),
  initial("stopped")
);

/******************** WalkingTimeMachine End ********************/

/******************** BirdMachine Start ********************/

const getBirdContext = () => ({
  "error": null,
  "state": null
});

// Producers
const updateBirdToLand = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};
const updateBirdToTakingoff = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};
const updateBirdToFlying = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};
const updateBirdToLanding = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};
const updateBirdToFatal = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};

// Actions
const sendStateToApiForBird = async (context, payload) => {
  // TODO: Implement action
};

export const BirdMachine = machine(
  "Bird",
  states(
    primaryState(
      "land",
      description("The bird is on the ground"),
      entry(sendStateToApiForBird, null, entry(updateError, "fatal")),
      entry(updateBirdToLand),
      immediate("flyingtime/stop"),
      immediate("walkingtime/start"),
      transition("takeoff", "takingoff")
    ),
    infoState(
      "takingoff",
      description("The bird is taking off"),
      nested(LeftWingMachine, "open"),
      nested(RightWingMachine, "open"),
      entry(sendStateToApiForBird, null, entry(updateError, "fatal")),
      entry(updateBirdToTakingoff),
      immediate("flying", nestedGuard(LeftWingMachine, isLeftWingOpened, entry(updateError)), nestedGuard(RightWingMachine, isRightWingOpened, entry(updateError)))
    ),
    successState(
      "flying",
      description("The bird is on the air"),
      entry(sendStateToApiForBird, null, entry(updateError, "fatal")),
      entry(updateBirdToFlying),
      immediate("flyingtime/start"),
      immediate("walkingtime/stop"),
      transition("land", "landing")
    ),
    warningState(
      "landing",
      description("The bird is landing"),
      nested(LeftWingMachine, "close"),
      nested(RightWingMachine, "close"),
      entry(sendStateToApiForBird, null, entry(updateError, "fatal")),
      entry(updateBirdToLanding),
      immediate("land", nestedGuard(LeftWingMachine, isLeftWingClosed, entry(updateError)), nestedGuard(RightWingMachine, isRightWingClosed, entry(updateError)))
    ),
    dangerState(
      "fatal",
      description("Is the bird dead?"),
      entry(sendStateToApiForBird, null, entry(updateError, "fatal")),
      entry(updateBirdToFatal),
      entry(updateError)
    )
  ),
  parallel(
    FlyingTimeMachine,
    WalkingTimeMachine
  ),
  context(getBirdContext),
  initial("land")
);

/******************** BirdMachine End ********************/

export default { LeftWingMachine, RightWingMachine, FlyingTimeMachine, WalkingTimeMachine, BirdMachine };
`;
    let myMachine = await getMachine();
    const result = await documentate(myMachine, { format: 'mjs' });
    let code = result.mjs;

    expect(code).toContain('import { machine, states, initial, context, primaryState, description, immediate, transition, entry');
    expect(code).toContain('entry(sendStateToApiForBird, undefined, "fatal")');
    expect(code).toContain('immediate("flying", nestedGuard(LeftWingMachine, isLeftWingOpened), nestedGuard(RightWingMachine, isRightWingOpened))');
    expect(code).toContain('// Entries');
    expect(code).not.toMatch(/\baction\b/);
    expect(code).not.toMatch(/\bproducer\b/);
  });

  it("should generate code from a serialized machine in cjs format", async () => {
    let expectedCode = `const { machine, states, initial, context, primaryState, description, immediate, transition, nested, state, guard, infoState, nestedGuard, successState, warningState, dangerState, parallel, entry, exit } = require("x-robot");

/******************** LeftWingMachine Start ********************/

const getLeftWingContext = () => ({
  "state": null,
  "error": null
});

// Guards
const isLeftWingClosed = (context, payload) => {
  // TODO: Implement guard
  return true;
};
const isLeftWingOpened = (context, payload) => {
  // TODO: Implement guard
  return true;
};

// Producers
const updateError = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};
const updateLeftWingToClosed = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};
const updateLeftWingToOpened = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};
const updateLeftWingToFatal = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};

// Actions
const sendStateToApiForLeftWing = async (context, payload) => {
  // TODO: Implement action
};

const LeftWingMachine = machine(
  "Left wing",
  states(
    state(
      "closed",
      description("The left wing is closed"),
      entry(sendStateToApiForLeftWing, null, entry(updateError, "fatal")),
      entry(updateLeftWingToClosed),
      transition("open", "opened", guard(isLeftWingClosed, entry(updateError)))
    ),
    state(
      "opened",
      description("The left wing is opened"),
      entry(sendStateToApiForLeftWing, null, entry(updateError, "fatal")),
      entry(updateLeftWingToOpened),
      transition("close", "closed", guard(isLeftWingOpened, entry(updateError)))
    ),
    state(
      "fatal",
      description("Is the left wing injured?"),
      entry(sendStateToApiForLeftWing, null, entry(updateError, "fatal")),
      entry(updateLeftWingToFatal),
      entry(updateError)
    )
  ),
  context(getLeftWingContext),
  initial("closed")
);

/******************** LeftWingMachine End ********************/

/******************** RightWingMachine Start ********************/

const getRightWingContext = () => ({
  "state": null,
  "error": null
});

// Guards
const isRightWingClosed = (context, payload) => {
  // TODO: Implement guard
  return true;
};
const isRightWingOpened = (context, payload) => {
  // TODO: Implement guard
  return true;
};

// Producers
const updateRightWingToClosed = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};
const updateRightWingToOpened = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};
const updateRightWingToFatal = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};

// Actions
const sendStateToApiForRightWing = async (context, payload) => {
  // TODO: Implement action
};

const RightWingMachine = machine(
  "Right wing",
  states(
    state(
      "closed",
      description("The right wing is closed"),
      entry(sendStateToApiForRightWing, null, entry(updateError, "fatal")),
      entry(updateRightWingToClosed),
      transition("open", "opened", guard(isRightWingClosed, entry(updateError)))
    ),
    state(
      "opened",
      description("The right wing is opened"),
      entry(sendStateToApiForRightWing, null, entry(updateError, "fatal")),
      entry(updateRightWingToOpened),
      transition("close", "closed", guard(isRightWingOpened, entry(updateError)))
    ),
    state(
      "fatal",
      description("Is the right wing injured?"),
      entry(sendStateToApiForRightWing, null, entry(updateError, "fatal")),
      entry(updateRightWingToFatal),
      entry(updateError)
    )
  ),
  context(getRightWingContext),
  initial("closed")
);

/******************** RightWingMachine End ********************/

/******************** FlyingTimeMachine Start ********************/

const getFlyingTimeContext = () => ({
  "time": 0,
  "timer": null
});

// Guards
const isTimeStopped = (context, payload) => {
  // TODO: Implement guard
  return true;
};
const isTimeStarted = (context, payload) => {
  // TODO: Implement guard
  return true;
};

// Producers
const stopTimer = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};
const startTimer = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};

const FlyingTimeMachine = machine(
  "Flying time",
  states(
    state(
      "stopped",
      description("The bird is not flying"),
      entry(stopTimer),
      transition("start", "started", guard(isTimeStopped))
    ),
    state(
      "started",
      description("The bird is flying"),
      entry(startTimer),
      transition("stop", "stopped", guard(isTimeStarted))
    )
  ),
  context(getFlyingTimeContext),
  initial("stopped")
);

/******************** FlyingTimeMachine End ********************/

/******************** WalkingTimeMachine Start ********************/

const getWalkingTimeContext = () => ({
  "time": 0,
  "timer": null
});

const WalkingTimeMachine = machine(
  "Walking time",
  states(
    state(
      "stopped",
      description("The bird is not walking"),
      entry(stopTimer),
      transition("start", "started", guard(isTimeStopped))
    ),
    state(
      "started",
      description("The bird is walking"),
      entry(startTimer),
      transition("stop", "stopped", guard(isTimeStarted))
    )
  ),
  context(getWalkingTimeContext),
  initial("stopped")
);

/******************** WalkingTimeMachine End ********************/

/******************** BirdMachine Start ********************/

const getBirdContext = () => ({
  "error": null,
  "state": null
});

// Producers
const updateBirdToLand = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};
const updateBirdToTakingoff = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};
const updateBirdToFlying = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};
const updateBirdToLanding = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};
const updateBirdToFatal = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};

// Actions
const sendStateToApiForBird = async (context, payload) => {
  // TODO: Implement action
};

const BirdMachine = machine(
  "Bird",
  states(
    primaryState(
      "land",
      description("The bird is on the ground"),
      entry(sendStateToApiForBird, null, entry(updateError, "fatal")),
      entry(updateBirdToLand),
      immediate("flyingtime/stop"),
      immediate("walkingtime/start"),
      transition("takeoff", "takingoff")
    ),
    infoState(
      "takingoff",
      description("The bird is taking off"),
      nested(LeftWingMachine, "open"),
      nested(RightWingMachine, "open"),
      entry(sendStateToApiForBird, null, entry(updateError, "fatal")),
      entry(updateBirdToTakingoff),
      immediate("flying", nestedGuard(LeftWingMachine, isLeftWingOpened, entry(updateError)), nestedGuard(RightWingMachine, isRightWingOpened, entry(updateError)))
    ),
    successState(
      "flying",
      description("The bird is on the air"),
      entry(sendStateToApiForBird, null, entry(updateError, "fatal")),
      entry(updateBirdToFlying),
      immediate("flyingtime/start"),
      immediate("walkingtime/stop"),
      transition("land", "landing")
    ),
    warningState(
      "landing",
      description("The bird is landing"),
      nested(LeftWingMachine, "close"),
      nested(RightWingMachine, "close"),
      entry(sendStateToApiForBird, null, entry(updateError, "fatal")),
      entry(updateBirdToLanding),
      immediate("land", nestedGuard(LeftWingMachine, isLeftWingClosed, entry(updateError)), nestedGuard(RightWingMachine, isRightWingClosed, entry(updateError)))
    ),
    dangerState(
      "fatal",
      description("Is the bird dead?"),
      entry(sendStateToApiForBird, null, entry(updateError, "fatal")),
      entry(updateBirdToFatal),
      entry(updateError)
    )
  ),
  parallel(
    FlyingTimeMachine,
    WalkingTimeMachine
  ),
  context(getBirdContext),
  initial("land")
);

/******************** BirdMachine End ********************/

module.exports = { LeftWingMachine, RightWingMachine, FlyingTimeMachine, WalkingTimeMachine, BirdMachine };
`;
    let myMachine = await getMachine();
    const result = await documentate(myMachine, { format: 'cjs' });
    let code = result.cjs;
    expect(code).toContain('const { machine, states, initial, context, primaryState, description, immediate, transition, entry');
    expect(code).toContain('entry(sendStateToApiForBird, undefined, "fatal")');
    expect(code).toContain('immediate("flying", nestedGuard(LeftWingMachine, isLeftWingOpened), nestedGuard(RightWingMachine, isRightWingOpened))');
    expect(code).toContain('// Entries');
    expect(code).not.toMatch(/\baction\b/);
    expect(code).not.toMatch(/\bproducer\b/);
  });

  it("should save the generated code in esm format into a js file");
  it("should save the generated code in cjs format into a js file");

  it("should generate code with exit", async () => {
    const { exit, initial, init, machine, state, transition } = require("../lib");
    const { documentate } = require("../lib/documentate");
    
    function cleanup(context: any) {
      context.cleaned = true;
    }

    const myMachine = machine(
      "Test",
      init(initial("idle")),
      state("idle", transition("start", "loading", exit(cleanup))),
      state("loading")
    );

    const result = await documentate(myMachine, { format: 'mjs' });
    const code = result.mjs;
    
    expect(code).toContain("exit");
    expect(code).toContain("cleanup");
  });
});

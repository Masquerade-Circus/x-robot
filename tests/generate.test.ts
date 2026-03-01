import { Format, generateFromSerializedMachine } from "../lib/generate";
import { SerializedMachine, serialize } from "../lib/serialize";
import { describe, it } from "mocha";

import bird from "./bird-machine-ts";
import expect from "expect";

// Generate code from a serialized machine
describe("Generate code from a serialized machine", () => {
  const getMachine = (): SerializedMachine => {
    return serialize(bird);
  };

  it("should generate code from a serialized machine in esm format", () => {
    let expectedCode = `import { machine, states, initial, context, primaryState, description, immediate, transition, action, producer, nested, state, guard, infoState, nestedGuard, successState, warningState, dangerState, parallel } from "x-robot";

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
      pulse(sendStateToApiForLeftWing, null, pulse(updateError, "fatal")),
      pulse(updateLeftWingToClosed),
      transition("open", "opened", guard(isLeftWingClosed, pulse(updateError)))
    ),
    state(
      "opened",
      description("The left wing is opened"),
      pulse(sendStateToApiForLeftWing, null, pulse(updateError, "fatal")),
      pulse(updateLeftWingToOpened),
      transition("close", "closed", guard(isLeftWingOpened, pulse(updateError)))
    ),
    state(
      "fatal",
      description("Is the left wing injured?"),
      pulse(sendStateToApiForLeftWing, null, pulse(updateError, "fatal")),
      pulse(updateLeftWingToFatal),
      pulse(updateError)
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
      pulse(sendStateToApiForRightWing, null, pulse(updateError, "fatal")),
      pulse(updateRightWingToClosed),
      transition("open", "opened", guard(isRightWingClosed, pulse(updateError)))
    ),
    state(
      "opened",
      description("The right wing is opened"),
      pulse(sendStateToApiForRightWing, null, pulse(updateError, "fatal")),
      pulse(updateRightWingToOpened),
      transition("close", "closed", guard(isRightWingOpened, pulse(updateError)))
    ),
    state(
      "fatal",
      description("Is the right wing injured?"),
      pulse(sendStateToApiForRightWing, null, pulse(updateError, "fatal")),
      pulse(updateRightWingToFatal),
      pulse(updateError)
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
      pulse(stopTimer),
      transition("start", "started", guard(isTimeStopped))
    ),
    state(
      "started",
      description("The bird is flying"),
      pulse(startTimer),
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
      pulse(stopTimer),
      transition("start", "started", guard(isTimeStopped))
    ),
    state(
      "started",
      description("The bird is walking"),
      pulse(startTimer),
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
      pulse(sendStateToApiForBird, null, pulse(updateError, "fatal")),
      pulse(updateBirdToLand),
      immediate("flyingtime/stop"),
      immediate("walkingtime/start"),
      transition("takeoff", "takingoff")
    ),
    infoState(
      "takingoff",
      description("The bird is taking off"),
      nested(LeftWingMachine, "open"),
      nested(RightWingMachine, "open"),
      pulse(sendStateToApiForBird, null, pulse(updateError, "fatal")),
      pulse(updateBirdToTakingoff),
      immediate("flying", nestedGuard(LeftWingMachine, isLeftWingOpened, pulse(updateError)), nestedGuard(RightWingMachine, isRightWingOpened, pulse(updateError)))
    ),
    successState(
      "flying",
      description("The bird is on the air"),
      pulse(sendStateToApiForBird, null, pulse(updateError, "fatal")),
      pulse(updateBirdToFlying),
      immediate("flyingtime/start"),
      immediate("walkingtime/stop"),
      transition("land", "landing")
    ),
    warningState(
      "landing",
      description("The bird is landing"),
      nested(LeftWingMachine, "close"),
      nested(RightWingMachine, "close"),
      pulse(sendStateToApiForBird, null, pulse(updateError, "fatal")),
      pulse(updateBirdToLanding),
      immediate("land", nestedGuard(LeftWingMachine, isLeftWingClosed, pulse(updateError)), nestedGuard(RightWingMachine, isRightWingClosed, pulse(updateError)))
    ),
    dangerState(
      "fatal",
      description("Is the bird dead?"),
      pulse(sendStateToApiForBird, null, pulse(updateError, "fatal")),
      pulse(updateBirdToFatal),
      pulse(updateError)
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
    let myMachine = getMachine();
    let code = generateFromSerializedMachine(myMachine, Format.ESM);

    expect(code).toContain('import { machine, states, initial, context, primaryState, description, immediate, transition, pulse');
    expect(code).toContain('pulse(sendStateToApiForBird, undefined, "fatal")');
    expect(code).toContain('immediate("flying", nestedGuard(LeftWingMachine, isLeftWingOpened), nestedGuard(RightWingMachine, isRightWingOpened))');
    expect(code).toContain('// Pulses');
    expect(code).not.toMatch(/\baction\b/);
    expect(code).not.toMatch(/\bproducer\b/);
  });

  it("should generate code from a serialized machine in cjs format", () => {
    let expectedCode = `const { machine, states, initial, context, primaryState, description, immediate, transition, action, producer, nested, state, guard, infoState, nestedGuard, successState, warningState, dangerState, parallel } = require("x-robot");

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
      pulse(sendStateToApiForLeftWing, null, pulse(updateError, "fatal")),
      pulse(updateLeftWingToClosed),
      transition("open", "opened", guard(isLeftWingClosed, pulse(updateError)))
    ),
    state(
      "opened",
      description("The left wing is opened"),
      pulse(sendStateToApiForLeftWing, null, pulse(updateError, "fatal")),
      pulse(updateLeftWingToOpened),
      transition("close", "closed", guard(isLeftWingOpened, pulse(updateError)))
    ),
    state(
      "fatal",
      description("Is the left wing injured?"),
      pulse(sendStateToApiForLeftWing, null, pulse(updateError, "fatal")),
      pulse(updateLeftWingToFatal),
      pulse(updateError)
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
      pulse(sendStateToApiForRightWing, null, pulse(updateError, "fatal")),
      pulse(updateRightWingToClosed),
      transition("open", "opened", guard(isRightWingClosed, pulse(updateError)))
    ),
    state(
      "opened",
      description("The right wing is opened"),
      pulse(sendStateToApiForRightWing, null, pulse(updateError, "fatal")),
      pulse(updateRightWingToOpened),
      transition("close", "closed", guard(isRightWingOpened, pulse(updateError)))
    ),
    state(
      "fatal",
      description("Is the right wing injured?"),
      pulse(sendStateToApiForRightWing, null, pulse(updateError, "fatal")),
      pulse(updateRightWingToFatal),
      pulse(updateError)
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
      pulse(stopTimer),
      transition("start", "started", guard(isTimeStopped))
    ),
    state(
      "started",
      description("The bird is flying"),
      pulse(startTimer),
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
      pulse(stopTimer),
      transition("start", "started", guard(isTimeStopped))
    ),
    state(
      "started",
      description("The bird is walking"),
      pulse(startTimer),
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
      pulse(sendStateToApiForBird, null, pulse(updateError, "fatal")),
      pulse(updateBirdToLand),
      immediate("flyingtime/stop"),
      immediate("walkingtime/start"),
      transition("takeoff", "takingoff")
    ),
    infoState(
      "takingoff",
      description("The bird is taking off"),
      nested(LeftWingMachine, "open"),
      nested(RightWingMachine, "open"),
      pulse(sendStateToApiForBird, null, pulse(updateError, "fatal")),
      pulse(updateBirdToTakingoff),
      immediate("flying", nestedGuard(LeftWingMachine, isLeftWingOpened, pulse(updateError)), nestedGuard(RightWingMachine, isRightWingOpened, pulse(updateError)))
    ),
    successState(
      "flying",
      description("The bird is on the air"),
      pulse(sendStateToApiForBird, null, pulse(updateError, "fatal")),
      pulse(updateBirdToFlying),
      immediate("flyingtime/start"),
      immediate("walkingtime/stop"),
      transition("land", "landing")
    ),
    warningState(
      "landing",
      description("The bird is landing"),
      nested(LeftWingMachine, "close"),
      nested(RightWingMachine, "close"),
      pulse(sendStateToApiForBird, null, pulse(updateError, "fatal")),
      pulse(updateBirdToLanding),
      immediate("land", nestedGuard(LeftWingMachine, isLeftWingClosed, pulse(updateError)), nestedGuard(RightWingMachine, isRightWingClosed, pulse(updateError)))
    ),
    dangerState(
      "fatal",
      description("Is the bird dead?"),
      pulse(sendStateToApiForBird, null, pulse(updateError, "fatal")),
      pulse(updateBirdToFatal),
      pulse(updateError)
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
    let myMachine = getMachine();
    let code = generateFromSerializedMachine(myMachine, Format.CJS);
    expect(code).toContain('const { machine, states, initial, context, primaryState, description, immediate, transition, pulse');
    expect(code).toContain('pulse(sendStateToApiForBird, undefined, "fatal")');
    expect(code).toContain('immediate("flying", nestedGuard(LeftWingMachine, isLeftWingOpened), nestedGuard(RightWingMachine, isRightWingOpened))');
    expect(code).toContain('// Pulses');
    expect(code).not.toMatch(/\baction\b/);
    expect(code).not.toMatch(/\bproducer\b/);
  });

  it("should save the generated code in esm format into a js file");
  it("should save the generated code in cjs format into a js file");
});

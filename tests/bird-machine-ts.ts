import {
  context,
  dangerState,
  description,
  guard,
  immediate,
  infoState,
  init,
  initial,
  machine,
  nested,
  nestedGuard,
  parallel,
  primaryState,
  pulse,
  state,
  successState,
  transition,
  warningState
} from "../lib";

import { validate } from "../lib/validate";

/******************** LeftWingMachine Start ********************/

const getLeftWingContext = () => ({
  state: null,
  error: null
});

// Guards
const isLeftWingClosed = (context) => context.state === "closed";
const isLeftWingOpened = (context) => context.state === "opened";

// Producers
const updateError = (context, payload) => {
  context.error = payload;
};
const updateLeftWingToClosed = (context) => {
  context.state = "closed";
};
const updateLeftWingToOpened = (context) => {
  context.state = "opened";
};
const updateLeftWingToFatal = (context) => {
  context.state = "fatal";
};

// Actions
const sendStateToApiForLeftWing = async (context, payload) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

export const LeftWingMachine = machine(
  "Left wing",
  init(
    context(getLeftWingContext),
    initial("closed")
  ),
  state(
    "closed",
    description("The left wing is closed"),
    pulse(sendStateToApiForLeftWing, undefined, "fatal"),
    pulse(updateLeftWingToClosed),
    transition("open", "opened", guard(isLeftWingClosed))
  ),
  state(
    "opened",
    description("The left wing is opened"),
    pulse(sendStateToApiForLeftWing, undefined, "fatal"),
    pulse(updateLeftWingToOpened),
    transition("close", "closed", guard(isLeftWingOpened))
  ),
  state(
    "fatal",
    description("Is the left wing injured?"),
    pulse(sendStateToApiForLeftWing, undefined, "fatal"),
    pulse(updateLeftWingToFatal),
    pulse(updateError)
  )
);

/******************** LeftWingMachine End ********************/

/******************** RightWingMachine Start ********************/

const getRightWingContext = () => ({
  state: null,
  error: null
});

// Guards
const isRightWingClosed = (context) => context.state === "closed";
const isRightWingOpened = (context) => context.state === "opened";

// Producers
const updateRightWingToClosed = (context) => {
  context.state = "closed";
};
const updateRightWingToOpened = (context) => {
  context.state = "opened";
};
const updateRightWingToFatal = (context) => {
  context.state = "fatal";
};

// Actions
const sendStateToApiForRightWing = async (context, payload) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

export const RightWingMachine = machine(
  "Right wing",
  init(
    context(getRightWingContext),
    initial("closed")
  ),
  state(
    "closed",
    description("The right wing is closed"),
    pulse(sendStateToApiForRightWing, undefined, "fatal"),
    pulse(updateRightWingToClosed),
    transition("open", "opened", guard(isRightWingClosed))
  ),
  state(
    "opened",
    description("The right wing is opened"),
    pulse(sendStateToApiForRightWing, undefined, "fatal"),
    pulse(updateRightWingToOpened),
    transition("close", "closed", guard(isRightWingOpened))
  ),
  state(
    "fatal",
    description("Is the right wing injured?"),
    pulse(sendStateToApiForRightWing, undefined, "fatal"),
    pulse(updateRightWingToFatal),
    pulse(updateError)
  )
);

/******************** RightWingMachine End ********************/

/******************** FlyingTimeCounter Start ********************/

// Producers
function startTimer(context) {
  context.timer = setInterval(() => {
    context.time = context.time + 1;
  }, 1000);
}
function stopTimer(context) {
  clearInterval(context.timer);
  context.timer = null;
}

// Guards
const isTimeStarted = (context) => context.timer !== null;
const isTimeStopped = (context) => context.timer === null;

const FlyingTimeCounter = machine(
  "Flying time",
  init(
    context({
      time: 0,
      timer: null
    }),
    initial("stopped")
  ),
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
);

/******************** FlyingTimeCounter End ********************/

/******************** WalkingTimeCounter Start ********************/

const WalkingTimeCounter = machine(
  "Walking time",
  init(
    context({
      time: 0,
      timer: null
    }),
    initial("stopped")
  ),
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
);

/******************** WalkingTimeCounter End ********************/

/******************** BirdMachine Start ********************/

const getBirdContext = () => ({
  error: null,
  state: null
});

// Producers
const updateBirdToLand = (context) => {
  context.state = "land";
};
const updateBirdToTakingoff = (context) => {
  context.state = "takingoff";
};
const updateBirdToFlying = (context) => {
  context.state = "flying";
};
const updateBirdToLanding = (context) => {
  context.state = "landing";
};
const updateBirdToFatal = (context) => {
  context.state = "fatal";
};

// Actions
const sendStateToApiForBird = async (context, payload) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

export const BirdMachine = machine(
  "Bird",
  init(
    context(getBirdContext),
    initial("land")
  ),
  parallel(FlyingTimeCounter, WalkingTimeCounter),
  primaryState(
    "land",
    description("The bird is on the ground"),
    pulse(sendStateToApiForBird, undefined, "fatal"),
    pulse(updateBirdToLand),
    transition("takeoff", "takingoff"),
    immediate("flyingtime/stop"),
    immediate("walkingtime/start")
  ),
  infoState(
    "takingoff",
    description("The bird is taking off"),
    nested(LeftWingMachine, "open"),
    nested(RightWingMachine, "open"),
    pulse(sendStateToApiForBird, undefined, "fatal"),
    pulse(updateBirdToTakingoff),
    immediate(
      "flying",
      nestedGuard(LeftWingMachine, isLeftWingOpened),
      nestedGuard(RightWingMachine, isRightWingOpened)
    )
  ),
  successState(
    "flying",
    description("The bird is on the air"),
    pulse(sendStateToApiForBird, undefined, "fatal"),
    pulse(updateBirdToFlying),
    transition("land", "landing"),
    immediate("flyingtime/start"),
    immediate("walkingtime/stop")
  ),
  warningState(
    "landing",
    description("The bird is landing"),
    nested(LeftWingMachine, "close"),
    nested(RightWingMachine, "close"),
    pulse(sendStateToApiForBird, undefined, "fatal"),
    pulse(updateBirdToLanding),
    immediate(
      "land",
      nestedGuard(LeftWingMachine, isLeftWingClosed),
      nestedGuard(RightWingMachine, isRightWingClosed)
    )
  ),
  dangerState(
    "fatal",
    description("Is the bird dead?"),
    pulse(sendStateToApiForBird, undefined, "fatal"),
    pulse(updateBirdToFatal),
    pulse(updateError)
  )
);

/******************** BirdMachine End ********************/

validate(BirdMachine);

export default BirdMachine;

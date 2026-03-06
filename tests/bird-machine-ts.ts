import {
  context,
  dangerState,
  description,
  entry,
  exit,
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

// Entries
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

// Async entries
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
    entry(sendStateToApiForLeftWing, undefined, "fatal"),
    entry(updateLeftWingToClosed),
    transition("open", "opened", guard(isLeftWingClosed))
  ),
  state(
    "opened",
    description("The left wing is opened"),
    entry(sendStateToApiForLeftWing, undefined, "fatal"),
    entry(updateLeftWingToOpened),
    transition("close", "closed", guard(isLeftWingOpened))
  ),
  state(
    "fatal",
    description("Is the left wing injured?"),
    entry(sendStateToApiForLeftWing, undefined, "fatal"),
    entry(updateLeftWingToFatal),
    entry(updateError)
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

// Entries
const updateRightWingToClosed = (context) => {
  context.state = "closed";
};
const updateRightWingToOpened = (context) => {
  context.state = "opened";
};
const updateRightWingToFatal = (context) => {
  context.state = "fatal";
};

// Async entries
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
    entry(sendStateToApiForRightWing, undefined, "fatal"),
    entry(updateRightWingToClosed),
    transition("open", "opened", guard(isRightWingClosed))
  ),
  state(
    "opened",
    description("The right wing is opened"),
    entry(sendStateToApiForRightWing, undefined, "fatal"),
    entry(updateRightWingToOpened),
    transition("close", "closed", guard(isRightWingOpened))
  ),
  state(
    "fatal",
    description("Is the right wing injured?"),
    entry(sendStateToApiForRightWing, undefined, "fatal"),
    entry(updateRightWingToFatal),
    entry(updateError)
  )
);

/******************** RightWingMachine End ********************/

/******************** FlyingTimeCounter Start ********************/

// Entries
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
    entry(stopTimer),
    transition("start", "started", guard(isTimeStopped))
  ),
  state(
    "started",
    description("The bird is flying"),
    entry(startTimer),
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
    entry(stopTimer),
    transition("start", "started", guard(isTimeStopped))
  ),
  state(
    "started",
    description("The bird is walking"),
    entry(startTimer),
    transition("stop", "stopped", guard(isTimeStarted))
  )
);

/******************** WalkingTimeCounter End ********************/

/******************** BirdMachine Start ********************/

const getBirdContext = () => ({
  error: null,
  state: null
});

// Entries
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

// Async entries
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
    entry(sendStateToApiForBird, undefined, "fatal"),
    entry(updateBirdToLand),
    transition("takeoff", "takingoff"),
    immediate("flyingtime/stop"),
    immediate("walkingtime/start")
  ),
  infoState(
    "takingoff",
    description("The bird is taking off"),
    nested(LeftWingMachine, "open"),
    nested(RightWingMachine, "open"),
    entry(sendStateToApiForBird, undefined, "fatal"),
    entry(updateBirdToTakingoff),
    immediate(
      "flying",
      nestedGuard(LeftWingMachine, isLeftWingOpened),
      nestedGuard(RightWingMachine, isRightWingOpened)
    )
  ),
  successState(
    "flying",
    description("The bird is on the air"),
    entry(sendStateToApiForBird, undefined, "fatal"),
    entry(updateBirdToFlying),
    transition("land", "landing"),
    immediate("flyingtime/start"),
    immediate("walkingtime/stop")
  ),
  warningState(
    "landing",
    description("The bird is landing"),
    nested(LeftWingMachine, "close"),
    nested(RightWingMachine, "close"),
    entry(sendStateToApiForBird, undefined, "fatal"),
    entry(updateBirdToLanding),
    immediate(
      "land",
      nestedGuard(LeftWingMachine, isLeftWingClosed),
      nestedGuard(RightWingMachine, isRightWingClosed)
    )
  ),
  dangerState(
    "fatal",
    description("Is the bird dead?"),
    entry(sendStateToApiForBird, undefined, "fatal"),
    entry(updateBirdToFatal),
    entry(updateError)
  )
);

/******************** BirdMachine End ********************/

validate(BirdMachine);

export default BirdMachine;

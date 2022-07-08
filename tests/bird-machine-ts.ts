import {
  action,
  context,
  dangerState,
  description,
  guard,
  immediate,
  infoState,
  initial,
  machine,
  nested,
  nestedGuard,
  parallel,
  primaryState,
  producer,
  state,
  states,
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
  states(
    state(
      "closed",
      description("The left wing is closed"),
      action(sendStateToApiForLeftWing, null, producer(updateError, "fatal")),
      producer(updateLeftWingToClosed),
      transition(
        "open",
        "opened",
        guard(isLeftWingClosed, producer(updateError))
      )
    ),
    state(
      "opened",
      description("The left wing is opened"),
      action(sendStateToApiForLeftWing, null, producer(updateError, "fatal")),
      producer(updateLeftWingToOpened),
      transition(
        "close",
        "closed",
        guard(isLeftWingOpened, producer(updateError))
      )
    ),
    state(
      "fatal",
      description("Is the left wing injured?"),
      action(sendStateToApiForLeftWing, null, producer(updateError, "fatal")),
      producer(updateLeftWingToFatal),
      producer(updateError)
    )
  ),
  context(getLeftWingContext),
  initial("closed")
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
  states(
    state(
      "closed",
      description("The right wing is closed"),
      action(sendStateToApiForRightWing, null, producer(updateError, "fatal")),
      producer(updateRightWingToClosed),
      transition(
        "open",
        "opened",
        guard(isRightWingClosed, producer(updateError))
      )
    ),
    state(
      "opened",
      description("The right wing is opened"),
      action(sendStateToApiForRightWing, null, producer(updateError, "fatal")),
      producer(updateRightWingToOpened),
      transition(
        "close",
        "closed",
        guard(isRightWingOpened, producer(updateError))
      )
    ),
    state(
      "fatal",
      description("Is the right wing injured?"),
      action(sendStateToApiForRightWing, null, producer(updateError, "fatal")),
      producer(updateRightWingToFatal),
      producer(updateError)
    )
  ),
  context(getRightWingContext),
  initial("closed")
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
  states(
    state(
      "stopped",
      description("The bird is not flying"),
      producer(stopTimer),
      transition("start", "started", guard(isTimeStopped))
    ),
    state(
      "started",
      description("The bird is flying"),
      producer(startTimer),
      transition("stop", "stopped", guard(isTimeStarted))
    )
  ),
  context({
    time: 0,
    timer: null
  }),
  initial("stopped")
);

/******************** FlyingTimeCounter End ********************/

/******************** WalkingTimeCounter Start ********************/

const WalkingTimeCounter = machine(
  "Walking time",
  states(
    state(
      "stopped",
      description("The bird is not walking"),
      producer(stopTimer),
      transition("start", "started", guard(isTimeStopped))
    ),
    state(
      "started",
      description("The bird is walking"),
      producer(startTimer),
      transition("stop", "stopped", guard(isTimeStarted))
    )
  ),
  context({
    time: 0,
    timer: null
  }),
  initial("stopped")
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
  states(
    primaryState(
      "land",
      description("The bird is on the ground"),
      action(sendStateToApiForBird, null, producer(updateError, "fatal")),
      producer(updateBirdToLand),
      transition("takeoff", "takingoff"),
      immediate("flyingtime/stop"),
      immediate("walkingtime/start")
    ),
    infoState(
      "takingoff",
      description("The bird is taking off"),
      nested(LeftWingMachine, "open"),
      nested(RightWingMachine, "open"),
      action(sendStateToApiForBird, null, producer(updateError, "fatal")),
      producer(updateBirdToTakingoff),
      immediate(
        "flying",
        nestedGuard(LeftWingMachine, isLeftWingOpened, producer(updateError)),
        nestedGuard(RightWingMachine, isRightWingOpened, producer(updateError))
      )
    ),
    successState(
      "flying",
      description("The bird is on the air"),
      action(sendStateToApiForBird, null, producer(updateError, "fatal")),
      producer(updateBirdToFlying),
      transition("land", "landing"),
      immediate("flyingtime/start"),
      immediate("walkingtime/stop")
    ),
    warningState(
      "landing",
      description("The bird is landing"),
      nested(LeftWingMachine, "close"),
      nested(RightWingMachine, "close"),
      action(sendStateToApiForBird, null, producer(updateError, "fatal")),
      producer(updateBirdToLanding),
      immediate(
        "land",
        nestedGuard(LeftWingMachine, isLeftWingClosed, producer(updateError)),
        nestedGuard(RightWingMachine, isRightWingClosed, producer(updateError))
      )
    ),
    dangerState(
      "fatal",
      description("Is the bird dead?"),
      action(sendStateToApiForBird, null, producer(updateError, "fatal")),
      producer(updateBirdToFatal),
      producer(updateError)
    )
  ),
  parallel(FlyingTimeCounter, WalkingTimeCounter),
  context(getBirdContext),
  initial("land")
);

/******************** BirdMachine End ********************/

validate(BirdMachine);

export default BirdMachine;

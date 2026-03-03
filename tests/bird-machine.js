const {
  machine,
  init,
  initial,
  context,
  primaryState,
  description,
  immediate,
  transition,
  pulse,
  nested,
  state,
  guard,
  infoState,
  nestedGuard,
  successState,
  warningState,
  dangerState,
  parallel
} = require('../dist/index');

/******************** LeftWingMachine Start ********************/

const getLeftWingContext = () => ({
  state: null,
  error: null
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
  return { ...context };
};
const updateLeftWingToClosed = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};
const updateLeftWingToOpened = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};
const updateLeftWingToFatal = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};

// Actions
const sendStateToApiForLeftWing = async (context, payload) => {
  // TODO: Implement action
};

const LeftWingMachine = machine(
  'Left wing',
  init(initial('closed'), context(getLeftWingContext)),
  state(
    'closed',
    description('The left wing is closed'),
    entry(sendStateToApiForLeftWing, undefined, 'fatal'),
    entry(updateLeftWingToClosed),
    transition('open', 'opened', guard(isLeftWingClosed))
  ),
  state(
    'opened',
    description('The left wing is opened'),
    entry(sendStateToApiForLeftWing, undefined, 'fatal'),
    entry(updateLeftWingToOpened),
    transition('close', 'closed', guard(isLeftWingOpened))
  ),
  state(
    'fatal',
    description('Is the left wing injured?'),
    entry(sendStateToApiForLeftWing, undefined, 'fatal'),
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
  return { ...context };
};
const updateRightWingToOpened = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};
const updateRightWingToFatal = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};

// Actions
const sendStateToApiForRightWing = async (context, payload) => {
  // TODO: Implement action
};

const RightWingMachine = machine(
  'Right wing',
  init(initial('closed'), context(getRightWingContext)),
  state(
    'closed',
    description('The right wing is closed'),
    entry(sendStateToApiForRightWing, undefined, 'fatal'),
    entry(updateRightWingToClosed),
    transition('open', 'opened', guard(isRightWingClosed))
  ),
  state(
    'opened',
    description('The right wing is opened'),
    entry(sendStateToApiForRightWing, undefined, 'fatal'),
    entry(updateRightWingToOpened),
    transition('close', 'closed', guard(isRightWingOpened))
  ),
  state(
    'fatal',
    description('Is the right wing injured?'),
    entry(sendStateToApiForRightWing, undefined, 'fatal'),
    entry(updateRightWingToFatal),
    entry(updateError)
  )
);

/******************** RightWingMachine End ********************/

/******************** FlyingTimeMachine Start ********************/

const getFlyingTimeContext = () => ({
  time: 0,
  timer: null
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
  return { ...context };
};
const startTimer = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};

const FlyingTimeMachine = machine(
  'Flying time',
  init(initial('stopped'), context(getFlyingTimeContext)),
  state('stopped', description('The bird is not flying'), entry(stopTimer), transition('start', 'started', guard(isTimeStopped))),
  state('started', description('The bird is flying'), entry(startTimer), transition('stop', 'stopped', guard(isTimeStarted)))
);

/******************** FlyingTimeMachine End ********************/

/******************** WalkingTimeMachine Start ********************/

const getWalkingTimeContext = () => ({
  time: 0,
  timer: null
});

const WalkingTimeMachine = machine(
  'Walking time',
  init(initial('stopped'), context(getWalkingTimeContext)),
  state('stopped', description('The bird is not walking'), entry(stopTimer), transition('start', 'started', guard(isTimeStopped))),
  state('started', description('The bird is walking'), entry(startTimer), transition('stop', 'stopped', guard(isTimeStarted)))
);

/******************** WalkingTimeMachine End ********************/

/******************** BirdMachine Start ********************/

const getBirdContext = () => ({
  error: null,
  state: null
});

// Producers
const updateBirdToLand = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};
const updateBirdToTakingoff = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};
const updateBirdToFlying = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};
const updateBirdToLanding = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};
const updateBirdToFatal = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};

// Actions
const sendStateToApiForBird = async (context, payload) => {
  // TODO: Implement action
};

const BirdMachine = machine(
  'Bird',
  init(initial('land'), context(getBirdContext)),
  primaryState(
    'land',
    description('The bird is on the ground'),
    entry(sendStateToApiForBird, undefined, 'fatal'),
    entry(updateBirdToLand),
    immediate('flyingtime/stop'),
    immediate('walkingtime/start'),
    transition('takeoff', 'takingoff')
  ),
  infoState(
    'takingoff',
    description('The bird is taking off'),
    nested(LeftWingMachine, 'open'),
    nested(RightWingMachine, 'open'),
    entry(sendStateToApiForBird, undefined, 'fatal'),
    entry(updateBirdToTakingoff),
    immediate(
      'flying',
      nestedGuard(LeftWingMachine, isLeftWingOpened),
      nestedGuard(RightWingMachine, isRightWingOpened)
    )
  ),
  successState(
    'flying',
    description('The bird is on the air'),
    entry(sendStateToApiForBird, undefined, 'fatal'),
    entry(updateBirdToFlying),
    immediate('flyingtime/start'),
    immediate('walkingtime/stop'),
    transition('land', 'landing')
  ),
  warningState(
    'landing',
    description('The bird is landing'),
    nested(LeftWingMachine, 'close'),
    nested(RightWingMachine, 'close'),
    entry(sendStateToApiForBird, undefined, 'fatal'),
    entry(updateBirdToLanding),
    immediate(
      'land',
      nestedGuard(LeftWingMachine, isLeftWingClosed),
      nestedGuard(RightWingMachine, isRightWingClosed)
    )
  ),
  dangerState(
    'fatal',
    description('Is the bird dead?'),
    entry(sendStateToApiForBird, undefined, 'fatal'),
    entry(updateBirdToFatal),
    entry(updateError)
  ),
  parallel(FlyingTimeMachine, WalkingTimeMachine)
);

/******************** BirdMachine End ********************/

module.exports = { LeftWingMachine, RightWingMachine, FlyingTimeMachine, WalkingTimeMachine, BirdMachine };

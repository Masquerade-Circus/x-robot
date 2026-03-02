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
    pulse(sendStateToApiForLeftWing, undefined, 'fatal'),
    pulse(updateLeftWingToClosed),
    transition('open', 'opened', guard(isLeftWingClosed))
  ),
  state(
    'opened',
    description('The left wing is opened'),
    pulse(sendStateToApiForLeftWing, undefined, 'fatal'),
    pulse(updateLeftWingToOpened),
    transition('close', 'closed', guard(isLeftWingOpened))
  ),
  state(
    'fatal',
    description('Is the left wing injured?'),
    pulse(sendStateToApiForLeftWing, undefined, 'fatal'),
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
    pulse(sendStateToApiForRightWing, undefined, 'fatal'),
    pulse(updateRightWingToClosed),
    transition('open', 'opened', guard(isRightWingClosed))
  ),
  state(
    'opened',
    description('The right wing is opened'),
    pulse(sendStateToApiForRightWing, undefined, 'fatal'),
    pulse(updateRightWingToOpened),
    transition('close', 'closed', guard(isRightWingOpened))
  ),
  state(
    'fatal',
    description('Is the right wing injured?'),
    pulse(sendStateToApiForRightWing, undefined, 'fatal'),
    pulse(updateRightWingToFatal),
    pulse(updateError)
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
  state('stopped', description('The bird is not flying'), pulse(stopTimer), transition('start', 'started', guard(isTimeStopped))),
  state('started', description('The bird is flying'), pulse(startTimer), transition('stop', 'stopped', guard(isTimeStarted)))
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
  state('stopped', description('The bird is not walking'), pulse(stopTimer), transition('start', 'started', guard(isTimeStopped))),
  state('started', description('The bird is walking'), pulse(startTimer), transition('stop', 'stopped', guard(isTimeStarted)))
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
    pulse(sendStateToApiForBird, undefined, 'fatal'),
    pulse(updateBirdToLand),
    immediate('flyingtime/stop'),
    immediate('walkingtime/start'),
    transition('takeoff', 'takingoff')
  ),
  infoState(
    'takingoff',
    description('The bird is taking off'),
    nested(LeftWingMachine, 'open'),
    nested(RightWingMachine, 'open'),
    pulse(sendStateToApiForBird, undefined, 'fatal'),
    pulse(updateBirdToTakingoff),
    immediate(
      'flying',
      nestedGuard(LeftWingMachine, isLeftWingOpened),
      nestedGuard(RightWingMachine, isRightWingOpened)
    )
  ),
  successState(
    'flying',
    description('The bird is on the air'),
    pulse(sendStateToApiForBird, undefined, 'fatal'),
    pulse(updateBirdToFlying),
    immediate('flyingtime/start'),
    immediate('walkingtime/stop'),
    transition('land', 'landing')
  ),
  warningState(
    'landing',
    description('The bird is landing'),
    nested(LeftWingMachine, 'close'),
    nested(RightWingMachine, 'close'),
    pulse(sendStateToApiForBird, undefined, 'fatal'),
    pulse(updateBirdToLanding),
    immediate(
      'land',
      nestedGuard(LeftWingMachine, isLeftWingClosed),
      nestedGuard(RightWingMachine, isRightWingClosed)
    )
  ),
  dangerState(
    'fatal',
    description('Is the bird dead?'),
    pulse(sendStateToApiForBird, undefined, 'fatal'),
    pulse(updateBirdToFatal),
    pulse(updateError)
  ),
  parallel(FlyingTimeMachine, WalkingTimeMachine)
);

/******************** BirdMachine End ********************/

module.exports = { LeftWingMachine, RightWingMachine, FlyingTimeMachine, WalkingTimeMachine, BirdMachine };

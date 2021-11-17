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
} from '../dist/index.mjs';

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

export const LeftWingMachine = machine(
  'Left wing',
  states(
    state(
      'closed',
      description('The left wing is closed'),
      action(sendStateToApiForLeftWing, null, producer(updateError, 'fatal')),
      producer(updateLeftWingToClosed),
      transition('open', 'opened', guard(isLeftWingClosed, producer(updateError)))
    ),
    state(
      'opened',
      description('The left wing is opened'),
      action(sendStateToApiForLeftWing, null, producer(updateError, 'fatal')),
      producer(updateLeftWingToOpened),
      transition('close', 'closed', guard(isLeftWingOpened, producer(updateError)))
    ),
    state(
      'fatal',
      description('Is the left wing injured?'),
      action(sendStateToApiForLeftWing, null, producer(updateError, 'fatal')),
      producer(updateLeftWingToFatal),
      producer(updateError)
    )
  ),
  context(getLeftWingContext),
  initial('closed')
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

export const RightWingMachine = machine(
  'Right wing',
  states(
    state(
      'closed',
      description('The right wing is closed'),
      action(sendStateToApiForRightWing, null, producer(updateError, 'fatal')),
      producer(updateRightWingToClosed),
      transition('open', 'opened', guard(isRightWingClosed, producer(updateError)))
    ),
    state(
      'opened',
      description('The right wing is opened'),
      action(sendStateToApiForRightWing, null, producer(updateError, 'fatal')),
      producer(updateRightWingToOpened),
      transition('close', 'closed', guard(isRightWingOpened, producer(updateError)))
    ),
    state(
      'fatal',
      description('Is the right wing injured?'),
      action(sendStateToApiForRightWing, null, producer(updateError, 'fatal')),
      producer(updateRightWingToFatal),
      producer(updateError)
    )
  ),
  context(getRightWingContext),
  initial('closed')
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

export const FlyingTimeMachine = machine(
  'Flying time',
  states(
    state('stopped', description('The bird is not flying'), producer(stopTimer), transition('start', 'started', guard(isTimeStopped))),
    state('started', description('The bird is flying'), producer(startTimer), transition('stop', 'stopped', guard(isTimeStarted)))
  ),
  context(getFlyingTimeContext),
  initial('stopped')
);

/******************** FlyingTimeMachine End ********************/

/******************** WalkingTimeMachine Start ********************/

const getWalkingTimeContext = () => ({
  time: 0,
  timer: null
});

export const WalkingTimeMachine = machine(
  'Walking time',
  states(
    state('stopped', description('The bird is not walking'), producer(stopTimer), transition('start', 'started', guard(isTimeStopped))),
    state('started', description('The bird is walking'), producer(startTimer), transition('stop', 'stopped', guard(isTimeStarted)))
  ),
  context(getWalkingTimeContext),
  initial('stopped')
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

export const BirdMachine = machine(
  'Bird',
  states(
    primaryState(
      'land',
      description('The bird is on the ground'),
      action(sendStateToApiForBird, null, producer(updateError, 'fatal')),
      producer(updateBirdToLand),
      immediate('flyingtime/stop'),
      immediate('walkingtime/start'),
      transition('takeoff', 'takingoff')
    ),
    infoState(
      'takingoff',
      description('The bird is taking off'),
      nested(LeftWingMachine, 'open'),
      nested(RightWingMachine, 'open'),
      action(sendStateToApiForBird, null, producer(updateError, 'fatal')),
      producer(updateBirdToTakingoff),
      immediate(
        'flying',
        nestedGuard(LeftWingMachine, isLeftWingOpened, producer(updateError)),
        nestedGuard(RightWingMachine, isRightWingOpened, producer(updateError))
      )
    ),
    successState(
      'flying',
      description('The bird is on the air'),
      action(sendStateToApiForBird, null, producer(updateError, 'fatal')),
      producer(updateBirdToFlying),
      immediate('flyingtime/start'),
      immediate('walkingtime/stop'),
      transition('land', 'landing')
    ),
    warningState(
      'landing',
      description('The bird is landing'),
      nested(LeftWingMachine, 'close'),
      nested(RightWingMachine, 'close'),
      action(sendStateToApiForBird, null, producer(updateError, 'fatal')),
      producer(updateBirdToLanding),
      immediate(
        'land',
        nestedGuard(LeftWingMachine, isLeftWingClosed, producer(updateError)),
        nestedGuard(RightWingMachine, isRightWingClosed, producer(updateError))
      )
    ),
    dangerState(
      'fatal',
      description('Is the bird dead?'),
      action(sendStateToApiForBird, null, producer(updateError, 'fatal')),
      producer(updateBirdToFatal),
      producer(updateError)
    )
  ),
  parallel(FlyingTimeMachine, WalkingTimeMachine),
  context(getBirdContext),
  initial('land')
);

/******************** BirdMachine End ********************/

export default { LeftWingMachine, RightWingMachine, FlyingTimeMachine, WalkingTimeMachine, BirdMachine };

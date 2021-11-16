const {
  machine,
  states,
  initial,
  context,
  primaryState,
  description,
  transition,
  action,
  producer,
  nested,
  state,
  guard,
  infoState,
  immediate,
  nestedGuard,
  successState,
  warningState,
  dangerState
} = require('../dist/index');

/******************** LeftWingMachine Start ********************/

const getLeftWingContext = () => ({
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
const updateLeftWingToclosed = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};
const updateLeftWingToopened = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};
const updateLeftWingTofatal = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};

// Actions
const sendStateToApiForLeftWing = async (context, payload) => {
  // TODO: Implement action
};

const LeftWingMachine = machine(
  'Left wing',
  states(
    state(
      'closed',
      description('The left wing is closed'),
      action(sendStateToApiForLeftWing, null, producer(updateError, 'fatal')),
      producer(updateLeftWingToclosed),
      transition('open', 'opened', guard(isLeftWingClosed, producer(updateError)))
    ),
    state(
      'opened',
      description('The left wing is opened'),
      action(sendStateToApiForLeftWing, null, producer(updateError, 'fatal')),
      producer(updateLeftWingToopened),
      transition('close', 'closed', guard(isLeftWingOpened, producer(updateError)))
    ),
    state(
      'fatal',
      description('Is the left wing injured?'),
      action(sendStateToApiForLeftWing, null, producer(updateError, 'fatal')),
      producer(updateLeftWingTofatal),
      producer(updateError)
    )
  ),
  context(getLeftWingContext),
  initial('closed')
);

/******************** LeftWingMachine End ********************/

/******************** RightWingMachine Start ********************/

const getRightWingContext = () => ({
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
const updateRightWingToclosed = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};
const updateRightWingToopened = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};
const updateRightWingTofatal = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};

// Actions
const sendStateToApiForRightWing = async (context, payload) => {
  // TODO: Implement action
};

const RightWingMachine = machine(
  'Right wing',
  states(
    state(
      'closed',
      description('The right wing is closed'),
      action(sendStateToApiForRightWing, null, producer(updateError, 'fatal')),
      producer(updateRightWingToclosed),
      transition('open', 'opened', guard(isRightWingClosed, producer(updateError)))
    ),
    state(
      'opened',
      description('The right wing is opened'),
      action(sendStateToApiForRightWing, null, producer(updateError, 'fatal')),
      producer(updateRightWingToopened),
      transition('close', 'closed', guard(isRightWingOpened, producer(updateError)))
    ),
    state(
      'fatal',
      description('Is the right wing injured?'),
      action(sendStateToApiForRightWing, null, producer(updateError, 'fatal')),
      producer(updateRightWingTofatal),
      producer(updateError)
    )
  ),
  context(getRightWingContext),
  initial('closed')
);

/******************** RightWingMachine End ********************/

/******************** BirdMachine Start ********************/

const getBirdContext = () => ({
  error: null,
  state: null
});

// Producers
const updateBirdToland = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};
const updateBirdTotakingoff = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};
const updateBirdToflying = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};
const updateBirdTolanding = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};
const updateBirdTofatal = (context, payload) => {
  // TODO: Implement producer
  return { ...context };
};

// Actions
const sendStateToApiForBird = async (context, payload) => {
  // TODO: Implement action
};

const BirdMachine = machine(
  'Bird',
  states(
    primaryState(
      'land',
      description('The bird is on the ground'),
      action(sendStateToApiForBird, null, producer(updateError, 'fatal')),
      producer(updateBirdToland),
      transition('takeoff', 'takingoff')
    ),
    infoState(
      'takingoff',
      description('The bird is taking off'),
      nested(LeftWingMachine, 'open'),
      nested(RightWingMachine, 'open'),
      action(sendStateToApiForBird, null, producer(updateError, 'fatal')),
      producer(updateBirdTotakingoff),
      producer(updateBirdToland),
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
      producer(updateBirdToflying),
      transition('land', 'landing')
    ),
    warningState(
      'landing',
      description('The bird is landing'),
      nested(LeftWingMachine, 'close'),
      nested(RightWingMachine, 'close'),
      action(sendStateToApiForBird, null, producer(updateError, 'fatal')),
      producer(updateBirdTolanding),
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
      producer(updateBirdTofatal),
      producer(updateError)
    )
  ),
  context(getBirdContext),
  initial('land')
);

/******************** BirdMachine End ********************/

module.exports = { LeftWingMachine, RightWingMachine, BirdMachine };

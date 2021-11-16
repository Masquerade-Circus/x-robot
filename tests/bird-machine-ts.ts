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
  primaryState,
  producer,
  state,
  states,
  successState,
  transition,
  warningState
} from '../lib';

import { validate } from '../lib/validate';

function updateError(context, error) {
  return { ...context, error };
}
let updateErrorProducerWithTransitionToFatal = producer(updateError, 'fatal');
let updateErrorProducer = producer(updateError);

let getSendAction = (machineName) => {
  let actionName = `sendStateToApiFor${machineName}`;
  let sendAction = {
    async [actionName](context) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };
  return action(sendAction[actionName], null, updateErrorProducerWithTransitionToFatal);
};

let getUpdateProducer = (machineName, state) => {
  let producerName = `update${machineName}To${state}`;
  let updateProducer = {
    [producerName](context) {
      return { ...context, state };
    }
  };
  return producer(updateProducer[producerName]);
};

function isLeftWingOpened(context) {
  return context.state === 'opened';
}
function isLeftWingClosed(context) {
  return context.state === 'closed';
}
function isRightWingOpened(context) {
  return context.state === 'opened';
}
function isRightWingClosed(context) {
  return context.state === 'closed';
}

let leftWingMachine = machine(
  'Left wing',
  states(
    state(
      'closed',
      description('The left wing is closed'),
      getSendAction('LeftWing'),
      getUpdateProducer('LeftWing', 'closed'),
      transition('open', 'opened', guard(isLeftWingClosed, updateErrorProducer))
    ),
    state(
      'opened',
      description('The left wing is opened'),
      getSendAction('LeftWing'),
      getUpdateProducer('LeftWing', 'opened'),
      transition('close', 'closed', guard(isLeftWingOpened, updateErrorProducer))
    ),
    state('fatal', description('Is the left wing injured?'), getSendAction('LeftWing'), getUpdateProducer('LeftWing', 'fatal'), updateErrorProducer)
  ),
  initial('closed'),
  context({ error: null, state })
);

let rightWingMachine = machine(
  'Right wing',
  states(
    state(
      'closed',
      description('The right wing is closed'),
      getSendAction('RightWing'),
      getUpdateProducer('RightWing', 'closed'),
      transition('open', 'opened', guard(isRightWingClosed, updateErrorProducer))
    ),
    state(
      'opened',
      description('The right wing is opened'),
      getSendAction('RightWing'),
      getUpdateProducer('RightWing', 'opened'),
      transition('close', 'closed', guard(isRightWingOpened, updateErrorProducer))
    ),
    state('fatal', description('Is the right wing injured?'), getSendAction('RightWing'), getUpdateProducer('RightWing', 'fatal'), updateErrorProducer)
  ),
  initial('closed'),
  context({ error: null })
);

let bird = machine(
  'Bird',
  states(
    primaryState(
      'land',
      description('The bird is on the ground'),
      getSendAction('Bird'),
      getUpdateProducer('Bird', 'land'),
      transition('takeoff', 'takingoff')
    ),
    infoState(
      'takingoff',
      description('The bird is taking off'),
      nested(leftWingMachine, 'open'),
      nested(rightWingMachine, 'open'),
      getSendAction('Bird'),
      getUpdateProducer('Bird', 'takingoff'),
      getUpdateProducer('Bird', 'land'),
      immediate(
        'flying',
        nestedGuard(leftWingMachine, isLeftWingOpened, updateErrorProducer),
        nestedGuard(rightWingMachine, isRightWingOpened, updateErrorProducer)
      )
    ),
    successState('flying', description('The bird is on the air'), getSendAction('Bird'), getUpdateProducer('Bird', 'flying'), transition('land', 'landing')),
    warningState(
      'landing',
      description('The bird is landing'),
      nested(leftWingMachine, 'close'),
      nested(rightWingMachine, 'close'),
      getSendAction('Bird'),
      getUpdateProducer('Bird', 'landing'),
      immediate(
        'land',
        nestedGuard(leftWingMachine, isLeftWingClosed, updateErrorProducer),
        nestedGuard(rightWingMachine, isRightWingClosed, updateErrorProducer)
      )
    ),
    dangerState('fatal', description('Is the bird dead?'), getSendAction('Bird'), getUpdateProducer('Bird', 'fatal'), updateErrorProducer)
  ),
  initial('land'),
  context({ error: null, state: null })
);

validate(bird);

export default bird;

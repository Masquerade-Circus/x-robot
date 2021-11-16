import {
  ActionDirective,
  GuardDirective,
  GuardsDirective,
  Machine,
  NestedGuardDirective,
  NestedMachineDirective,
  ProducerDirective,
  RunCollection,
  TransitionDirective,
  TransitionsDirective
} from '../machine/interfaces';
import { cloneContext, isAction, isProducer, isProducerWithTransition, isValidString } from '../utils';

export interface SerializedProducer {
  producer: string;
  transition?: string;
}

export interface SerializedAction {
  action: string;
  success?: string | SerializedProducer;
  failure?: string | SerializedProducer;
}

export interface SerializedGuard {
  guard: string;
  failure?: string | SerializedProducer;
  machine?: SerializedMachine;
}

interface SerializedCollection extends Array<SerializedAction | SerializedProducer> {}

interface SerializedTransition {
  target: string;
  guards?: SerializedGuard[];
}

interface SerializedTransitions {
  [key: string]: SerializedTransition;
}

interface SerializedState {
  name: string;
  nested?: SerializedNestedMachine[];
  on?: SerializedTransitions;
  run?: SerializedCollection;
  immediate?: string;
  type?: string;
  description?: string;
}

interface SerializedStates {
  [key: string]: SerializedState;
}

export interface SerializedMachine {
  title?: string;
  states: SerializedStates;
  context: any;
  initial: any;
}

export interface SerializedNestedMachine {
  machine: SerializedMachine;
  transition?: string;
}

// Serializes a producer
// @param {Producer} producer
// @returns {Object}
function serializeProducer(producer: ProducerDirective): SerializedProducer {
  let serialized: SerializedProducer = {
    producer: producer.producer.name
  };

  if (isProducerWithTransition(producer)) {
    serialized.transition = producer.transition;
  }

  return serialized;
}

// Serializes an action
// @param {Action} action
// @returns {Object}
function serializeAction(action: ActionDirective): SerializedAction {
  let serialized: SerializedAction = {
    action: action.action.name
  };

  if (action.success) {
    if (isValidString(action.success)) {
      serialized.success = action.success;
    } else if (isProducer(action.success)) {
      serialized.success = serializeProducer(action.success);
    }
  }

  if (action.failure) {
    if (isValidString(action.failure)) {
      serialized.failure = action.failure;
    } else if (isProducer(action.failure)) {
      serialized.failure = serializeProducer(action.failure);
    }
  }

  return serialized;
}

// Serializes a guard
// @param {Guard} guard
// @returns {Object}
function serializeGuard(guard: GuardDirective | NestedGuardDirective): SerializedGuard {
  let serialized: SerializedGuard = {
    guard: guard.guard.name
  };

  if (isValidString(guard.failure)) {
    serialized.failure = guard.failure;
  } else if (isProducer(guard.failure)) {
    serialized.failure = serializeProducer(guard.failure);
  }

  if ('machine' in guard) {
    serialized.machine = serialize(guard.machine);
  }

  return serialized;
}

// Serialize run arguments
// @param {Array} run
// @returns {Array}
function serializeRunArguments(run: RunCollection): SerializedCollection | null {
  if (!Array.isArray(run) || run.length === 0) {
    return null;
  }

  return run.map((item) => {
    if (isAction(item)) {
      return serializeAction(item);
    }

    if (isProducer(item)) {
      return serializeProducer(item);
    }
  }) as SerializedCollection;
}

function serializeGuards(guards: GuardsDirective): SerializedGuard[] | null {
  if (!guards || guards.length === 0) {
    return null;
  }

  return guards.map((guard) => serializeGuard(guard));
}

// Serialize transitions
// @param {Object} events
// @returns {Array}
function serializeTransitions(events: TransitionsDirective): SerializedTransitions | null {
  if (!events || Object.keys(events).length === 0) {
    return null;
  }

  let serialized: SerializedTransitions = {};
  for (let event in events) {
    let transition: TransitionDirective = events[event];
    serialized[event] = { target: events[event].target };
    let guards = serializeGuards(transition.guards);

    if (guards) {
      serialized[event].guards = guards;
    }
  }

  return serialized;
}

// Serialize context
// This will do a deep copy of the context
// @param {Object} context
// @returns {Object}
function serializeContext(context: any) {
  return cloneContext(context);
}

function serializeNested(nested: NestedMachineDirective[]): SerializedNestedMachine[] | null {
  if (!nested || nested.length === 0) {
    return null;
  }

  return nested.map(({ machine, transition }) => {
    let serializedNestedMachine: SerializedNestedMachine = {
      machine: serialize(machine)
    };

    if (transition) {
      serializedNestedMachine.transition = transition;
    }

    return serializedNestedMachine;
  });
}

// Serializes a state machine
// @param {Machine} machine
// @returns {Object}
export function serialize(machine: Machine): SerializedMachine {
  let serialized: SerializedMachine = {
    states: {},
    context: serializeContext(machine.context),
    initial: machine.initial
  };

  if (machine.title) {
    serialized.title = machine.title;
  }

  for (let state in machine.states) {
    serialized.states[state] = {} as SerializedState;

    let nested = serializeNested(machine.states[state].nested);
    if (nested) {
      serialized.states[state].nested = nested;
    }

    let run = serializeRunArguments(machine.states[state].run);
    if (run) {
      serialized.states[state].run = run;
    }

    let on = serializeTransitions(machine.states[state].on);
    if (on) {
      serialized.states[state].on = on;
    }

    let immediate = machine.states[state].immediate;
    if (isValidString(immediate)) {
      serialized.states[state].immediate = immediate;
    }

    if (isValidString(machine.states[state].type)) {
      serialized.states[state].type = machine.states[state].type;
    }

    if (isValidString(machine.states[state].description)) {
      serialized.states[state].description = machine.states[state].description;
    }
  }

  return serialized;
}

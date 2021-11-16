import {
  Action,
  ActionDirective,
  Context,
  ContextDirective,
  DescriptionDirective,
  Guard,
  GuardDirective,
  GuardsDirective,
  HistoryType,
  ImmediateDirective,
  InitialDirective,
  Machine,
  NestedGuardDirective,
  NestedMachineDirective,
  Producer,
  ProducerDirective,
  ProducerDirectiveWithoutTransition,
  RunCollection,
  ShouldFreezeDirective,
  StateDirective,
  StatesDirective,
  TransitionDirective,
  TransitionsDirective
} from './interfaces';
import {
  deepFreeze,
  hasTransition,
  isAction,
  isContextDirective,
  isDescriptionDirective,
  isImmediate,
  isInitialDirective,
  isNestedMachineDirective,
  isProducer,
  isProducerWithTransition,
  isShouldFreezeDirective,
  isStatesDirective,
  isTransition,
  isValidObject,
  isValidString
} from '../utils';

/**
 * We will create a finite state machine manager
 *
 * This manager will handle the creation of the finite state machine
 * It must be functional and immutable
 * And it must be able to be serialized and return a JSON object representing the state machine
 * */

interface MachineArguments extends Array<string | ContextDirective | InitialDirective | ShouldFreezeDirective | StatesDirective | GuardDirective> {}

// Creates a new state machine manager
// @param {Object} states
// @param {Object|Function} context
// @param {String} initialState
// @returns {Machine}
export function machine(title: string, ...args: MachineArguments): Machine {
  let states: StatesDirective = {};
  let context: Context = {};
  let initial: string = '';
  let current: string = '';
  let frozen: boolean = true;
  let isAsync: boolean = false;
  let history: string[] = [];

  for (let arg of args) {
    // If arg is a string then it is the title
    if (isValidString(arg)) {
      title = arg;
    }

    // If the argument is a states directive then merge it into the states
    if (isStatesDirective(arg)) {
      states = { ...states, ...arg };
    }

    // If the argument is a context directive then merge it into the context
    if (isContextDirective(arg)) {
      let newContext = typeof arg.context === 'function' ? arg.context() : arg.context;
      if (!isValidObject(newContext)) {
        throw new Error('The context passed to the machine must be an object or a function that returns an object.');
      }

      context = { ...context, ...newContext };
    }

    // If the argument is an initial directive then set the initial state
    if (isInitialDirective(arg)) {
      initial = arg.initial;
      current = initial;
      history.push(`${HistoryType.State}: ${initial}`);
    }

    // If the argument is a shouldFreeze directive then set the freeze flag
    if (isShouldFreezeDirective(arg)) {
      frozen = arg.freeze;
    }
  }

  // If freeze is true, we will deep freeze the context
  if (frozen) {
    deepFreeze(context);
  }

  // Find if the machine is async, if so, add the async property
  // Machin is async if there is a state with an action in the run array
  for (let state in states) {
    if (states[state].run.length > 0) {
      // Find an action in the run array
      let action = states[state].run.find(isAction);
      if (action) {
        isAsync = true;
        break;
      }
    }
  }

  // If machine isn't async, we should check if there are any nested machines that are async, if so, we should turn the async flag on
  if (isAsync === false) {
    for (let state in states) {
      if (states[state].nested.length > 0) {
        for (let nestedMachine of states[state].nested) {
          if (nestedMachine.machine.isAsync) {
            isAsync = true;
            break;
          }
        }
      }
    }
  }

  // Create the machine
  let myMachine: Machine = {
    title,
    states,
    context,
    initial,
    current,
    frozen,
    isAsync,
    history
  };

  // Return the machine
  return myMachine;
}

export function states(...states: StateDirective[]): StatesDirective {
  let newStates: StatesDirective = {};

  for (let state of states) {
    newStates[state.name] = state;
  }

  return newStates;
}

export function context(context: Context | Function): ContextDirective {
  return {
    context
  };
}

export function initial(initial: string): InitialDirective {
  return {
    initial
  };
}

export function shouldFreeze(freeze: boolean): ShouldFreezeDirective {
  return {
    freeze
  };
}

// Creates a new state
// @params {Array} args: transitions, actions or producers
// @returns {State}
export function state(name: string, ...args: RunCollection): StateDirective {
  let run: (ActionDirective | ProducerDirective)[] = [];
  let on: TransitionsDirective = {};
  let immediate;
  let nested: NestedMachineDirective[] = [];
  let description;

  for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    // If is a nested machine
    if (isNestedMachineDirective(arg)) {
      nested.push(arg);
      // If is action or producer add it to the run array
    } else if (isAction(arg) || isProducer(arg)) {
      run.push(arg);

      // If is an action and has a success transition or a failure transition, then try to add them to the on object
      if (isAction(arg)) {
        let successTransition = isValidString(arg.success) ? arg.success : isProducerWithTransition(arg.success) ? arg.success.transition : null;
        // If success is a transition
        if (isValidString(successTransition) && hasTransition({ on } as StateDirective, successTransition) === false) {
          on[successTransition] = { transition: successTransition, target: successTransition, guards: [] };
        }

        let failureTransition = isValidString(arg.failure) ? arg.failure : isProducerWithTransition(arg.failure) ? arg.failure.transition : null;
        // If failure is a transition
        if (isValidString(failureTransition) && hasTransition({ on } as StateDirective, failureTransition) === false) {
          on[failureTransition] = { transition: failureTransition, target: failureTransition, guards: [] };
        }
      }

      // If is immediate transition
    } else if (isImmediate(arg)) {
      // We have an immediate transition already set so we turn it into an array to let the machine know that we have multiple immediate transitions
      if (immediate) {
        if (Array.isArray(immediate)) {
          immediate.push(arg.immediate);
          continue;
        }
        immediate = [immediate, arg.immediate];
        continue;
      }

      immediate = arg.immediate;
      // We turn the immediate transition into a normal transition so that the machine can handle it
      on[immediate] = { target: immediate, transition: immediate, guards: arg.guards };

      // if is a transition
    } else if (isTransition(arg)) {
      on[arg.transition] = arg;
    } else if (isDescriptionDirective(arg)) {
      description = arg.description;
    }
  }

  return {
    name,
    nested,
    run,
    on,
    immediate,
    args,
    type: 'default',
    description
  };
}

// Creates a new transition
// @param {String} event
// @param {String} target
// @returns {Transition}
export function transition(transitionName: string, target: string, ...guards: GuardsDirective): TransitionDirective {
  return {
    transition: transitionName,
    target,
    guards
  };
}

// Creates a new action
// @param {String} event
// @param {Function} action
// @param {Function} onSuccessProducer (optional)
// @param {Function} onFailureProducer (optional)
// @returns {Action}
export function action(action: Action, onSuccessProducer?: ProducerDirective | string | null, onFailureProducer?: ProducerDirective | string): ActionDirective {
  return {
    action,
    success: onSuccessProducer,
    failure: onFailureProducer
  };
}

// Creates a new guard function
// @param {Function} guard
export function guard(guard: Guard, onFailureProducer?: ProducerDirectiveWithoutTransition): GuardDirective {
  return {
    guard,
    failure: onFailureProducer
  };
}

// Creates a new producer
// @param {Function} producer
// @param {String} event, optional
// @returns {Producer}
export function producer(producer: Producer, transition?: string): ProducerDirective | ProducerDirectiveWithoutTransition {
  return {
    producer,
    transition
  };
}

export function immediate(target: string, ...guards: GuardsDirective): ImmediateDirective {
  return {
    immediate: target,
    guards
  };
}

export function nestedGuard(machine: Machine, guard: Guard, onFailureProducer?: ProducerDirectiveWithoutTransition): NestedGuardDirective {
  return {
    guard,
    machine,
    failure: onFailureProducer
  };
}

export function nested(machine: Machine, transition?: string): NestedMachineDirective {
  return {
    machine,
    transition
  };
}

export function description(description: string): DescriptionDirective {
  return {
    description
  };
}

// States with types
let makeStateType =
  (type: string) =>
  (name: string, ...args: RunCollection): StateDirective => {
    let stateObject = state(name, ...args);
    stateObject.type = type;
    return stateObject;
  };

export const infoState = makeStateType('info');
export const primaryState = makeStateType('primary');
export const successState = makeStateType('success');
export const warningState = makeStateType('warning');
export const dangerState = makeStateType('danger');

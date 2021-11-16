// Gets a property from a state machine
// @param {Machine} machine
// @param {String} property
// @param {Any} defaultValue

import { ActionDirective, HistoryType, Machine, ProducerDirective, StateDirective, TransitionDirective } from './interfaces';
import {
  cloneContext,
  deepFreeze,
  hasTransition,
  isAction,
  isGuard,
  isNestedGuard,
  isNestedMachineWithTransitionDirective,
  isProducer,
  isProducerWithTransition,
  isValidObject,
  isValidString
} from '../utils';

// @returns {Any}
function getProperty(machine: Machine, property: string, defaultValue?: any): any {
  let result = machine.context;

  if (typeof property === 'undefined') {
    throw new Error('Property is undefined');
  }

  let parsed = property.split('.');
  let next;

  while (parsed.length) {
    next = parsed.shift();

    if (typeof next === 'undefined') {
      break;
    }

    if (next.indexOf('[') > -1) {
      let idx = next.replace(/\D/gi, '');
      next = next.split('[')[0];
      parsed.unshift(idx);
    }

    if (next in result === false || (parsed.length > 0 && typeof result[next] !== 'object')) {
      return defaultValue;
    }

    result = result[next];
  }

  return typeof result === 'undefined' ? defaultValue : result;
}

// Run producer
// @param {Machine} machine
// @param {Producer} producer
// @returns {Void}
function runProducer(machine: Machine, producer?: ProducerDirective | string | null, payload?: any) {
  // If it is a producer then we run it
  if (isProducer(producer)) {
    // Add the producer to the history
    machine.history.push(`${HistoryType.Producer}: ${producer.producer.name}`);

    // Get the context
    let context = machine.context;

    // If the machine is frozen we need to clone the context
    if (machine.frozen) {
      context = cloneContext(context);
    }

    // Run the producer
    let newContext = producer.producer(context, payload);

    // Check if the producer returned a context and if so we update the context
    if (isValidObject(newContext)) {
      context = newContext;
    }

    // Set the new context
    machine.context = context;

    // If the machine is frozen, we will deep freeze the context again
    if (machine.frozen) {
      deepFreeze(machine.context);
    }

    // If the producer has a transition then we run it
    if (isProducerWithTransition(producer)) {
      return invoke(machine, producer.transition);
    }

    // If is a string, we assume it is a transition instead of a producer and we run it
  } else if (isValidString(producer)) {
    return invoke(machine, producer);
  }
}

// Run action
// @param {Machine} machine
// @param {Action} action
// @returns {Void}
async function runAction(machine: Machine, action: ActionDirective, payload?: any): Promise<void> {
  // Add the action to the history
  machine.history.push(`${HistoryType.Action}: ${action.action.name}`);

  // Run the action
  try {
    let result = await action.action(machine.context, payload);
    await runProducer(machine, action.success, result);
  } catch (error) {
    if (isProducer(action.failure) || isValidString(action.failure)) {
      await runProducer(machine, action.failure, error);
    } else {
      throw error;
    }
  }
}

function hasFatalError(machine: Machine): boolean {
  return machine.fatal instanceof Error;
}

function catchError(machine: Machine, state: StateDirective, error: Error) {
  // Check if we have a local error transition and invoke it if so
  if (hasTransition(state, 'error')) {
    return invoke(machine, 'error', error);
  }

  // Check if we have a fatal state and set it as the current state if so
  if ('fatal' in machine.states) {
    machine.current = 'fatal';
    machine.fatal = error as Error;
    return;
  }

  // If we don't have a fatal state, we throw the error
  // But we also assign the error to the machine so that it can be accessed
  // from the outside
  machine.fatal = error as Error;
  throw error;
}

async function runActionsAndProducers(machine: Machine, state: StateDirective, payload: any, index = 0) {
  if (index >= state.run.length) {
    return;
  }

  try {
    let item = state.run[index];

    let result;
    if (isAction(item)) {
      result = await runAction(machine, item, payload);
    } else if (isProducer(item)) {
      runProducer(machine, item, payload);
    }
  } catch (error) {
    await catchError(machine, state, error as Error);
  }

  await runActionsAndProducers(machine, state, payload, index + 1);
}

function runProducers(machine: Machine, state: StateDirective, payload: any, index = 0) {
  if (index >= state.run.length) {
    return;
  }

  try {
    let item = state.run[index];

    if (isProducer(item)) {
      runProducer(machine, item, payload);
    }
  } catch (error) {
    catchError(machine, state, error as Error);
  }

  runProducers(machine, state, payload, index + 1);
}

function runGuards(machine: Machine, state: StateDirective, transition: TransitionDirective, payload: any, index = 0): boolean {
  // If there are no guards, we can return true
  if (index >= transition.guards.length) {
    return true;
  }

  // Run the guard
  let guard = transition.guards[index];

  try {
    if (isGuard(guard)) {
      // Add the guard to the history
      machine.history.push(`${HistoryType.Guard}: ${guard.guard.name}`);

      let result = false;
      // If the guard is a nested guard run it with the nested machine context
      if (isNestedGuard(guard)) {
        result = guard.guard(guard.machine.context, payload);
      } else {
        result = guard.guard(machine.context, payload);
      }

      // If the result is equals to true, we can run the next guard if any
      if (result === true) {
        return runGuards(machine, state, transition, payload, index + 1);
      }

      // If the result is other than true, we can return false and check if we have a failure producer and invoke it if so
      if (isProducer(guard.failure)) {
        runProducer(machine, guard.failure, result);
      }
    }
    // If we get here, we have a failure and we can return false
    return false;
  } catch (error) {
    // Catch the error and invoke the error transition if we have one
    catchError(machine, state, error as Error);

    return false;
  }
}

// Run nested machines
// @param {Machine} machine
// @param {State} state
function runNestedMachines(machine: Machine, state: StateDirective, payload: any) {
  // If there are no nested machines, we can return
  if (state.nested.length === 0) {
    return;
  }

  if (machine.isAsync) {
    // Run the actions and producers
    let promise = Promise.resolve();

    // If the state has a nested machine, we run it
    for (let nestedMachine of state.nested) {
      // If the nested machine is a nested machine with a transition we run the transition on it
      if (isNestedMachineWithTransitionDirective(nestedMachine)) {
        let transition = nestedMachine.transition;
        promise.then(() => invoke(nestedMachine.machine, transition, payload));
      }
    }

    // Return the promise
    return promise;
  }

  // If the state has a nested machine, we run it
  for (let nestedMachine of state.nested) {
    // If the nested machine is a nested machine with a transition we run the transition on it
    if (isNestedMachineWithTransitionDirective(nestedMachine)) {
      invoke(nestedMachine.machine, nestedMachine.transition, payload);
    }
  }
}

function canMakeTransition(machine: Machine, transition: string): boolean {
  if (!isValidString(transition)) {
    throw new Error(`Invalid transition: ${transition}`);
  }

  let trimmedTransition = transition.trim();
  let currentStateObject = machine.states[machine.current];

  // Check if we have a normal transition or a nested transition (nested transitions are dot separated)
  if (trimmedTransition.indexOf('.') > -1) {
    // Get the nested transition parts
    let nestedTransitionParts = trimmedTransition.split('.');
    // The first part must be the current state
    let stateName = nestedTransitionParts.shift();

    // If the current state name is not the same as the stateName, we throw an error
    if (stateName !== currentStateObject.name) {
      return false;
    }

    // If the current state doesn't have a nested machine we throw an error
    if (currentStateObject.nested.length === 0) {
      return false;
    }

    // All the other parts are the nested states and the transition
    let nestedStatesAndTransition = nestedTransitionParts.join('.');

    // We loop through the nested machines and check if we can make the transition
    for (let nestedMachine of currentStateObject.nested) {
      if (canMakeTransition(nestedMachine.machine, nestedStatesAndTransition)) {
        return true;
      }
    }
  }

  // If we get here, we have a normal transition
  return hasTransition(currentStateObject, trimmedTransition);
}

function runNestedTransition(machine: Machine, transition: string, payload: any) {
  // We know that we have a nested transition and that the first part is the current state
  // so we get rid of the first part and split the rest
  let nestedTransitionParts = transition.split('.');
  nestedTransitionParts.shift();
  let nestedTransition = nestedTransitionParts.join('.');
  let currentStateObject = machine.states[machine.current];

  let immediate = currentStateObject.immediate;

  if (machine.isAsync) {
    let promise = Promise.resolve();
    // We loop through the nested machines and invoke the transition if we can
    for (let nestedMachine of currentStateObject.nested) {
      if (canMakeTransition(nestedMachine.machine, nestedTransition)) {
        promise.then(() => invoke(nestedMachine.machine, nestedTransition, payload));
      }
    }

    // If immediate is set, invoke the immediate event
    if (isValidString(immediate) && hasFatalError(machine) === false) {
      promise = promise.then(() => invoke(machine, immediate as string));
    }

    return promise;
  }

  // We loop through the nested machines and invoke the transition if we can
  for (let nestedMachine of currentStateObject.nested) {
    if (canMakeTransition(nestedMachine.machine, nestedTransition)) {
      invoke(nestedMachine.machine, nestedTransition, payload);
    }
  }

  // If immediate is set, invoke the immediate event
  if (isValidString(immediate) && hasFatalError(machine) === false) {
    invoke(machine, immediate as string);
  }
}

// Invokes a transition
// @param {Machine} machine
// @param {String} event
// @returns {Void}
export function invoke(machine: Machine, transition: string, payload?: any): Promise<void> | void {
  // If the machine has a fatal error, we will return immediately
  if (hasFatalError(machine)) {
    return;
  }

  // Check if we have received a valid transition as string and throw an error if not
  if (isValidString(transition) === false) {
    throw new Error(`Trying to invoke a transition with an invalid string: ${transition}`);
  }

  let trimmedTransition = transition.trim();

  let hasTransition = canMakeTransition(machine, trimmedTransition);

  // Check if the transition exists in the current state and throw an error if not
  if (!hasTransition) {
    throw new Error(`The transition '${trimmedTransition}' does not exist in the current state '${machine.current}'`);
  }

  // Check if we have a nested transition
  if (trimmedTransition.indexOf('.') > -1) {
    return runNestedTransition(machine, trimmedTransition, payload);
  }

  // Add the transition to the history
  machine.history.push(`${HistoryType.Transition}: ${trimmedTransition}`);

  // Get the current state object
  let currentStateObject = machine.states[machine.current];

  // Get the transition object
  let transitionObject = currentStateObject.on[trimmedTransition];

  // If the transition has guards, run them and decide if we should continue
  let shouldContinue = runGuards(machine, currentStateObject, transitionObject, payload);
  if (shouldContinue === false) {
    // As we tried to make a transition, we need to add the current state to the history
    machine.history.push(`${HistoryType.State}: ${currentStateObject.name}`);
    return;
  }

  // Get the target state
  let targetState = currentStateObject.on[trimmedTransition].target;

  // Check if we have a valid target state as string and throw an error if not
  if (isValidString(targetState) === false) {
    throw new Error(`Trying to invoke a transition with an invalid target state: ${targetState}`);
  }

  // Check if the target state exists in the machine and throw an error if not
  if (targetState in machine.states === false) {
    throw new Error(`Invalid target state '${targetState}' for '${machine.current}.${trimmedTransition}' transition`);
  }

  // Get the target state
  let targetStateObject = machine.states[targetState];

  // Set the current state
  machine.current = targetState;
  machine.history.push(`${HistoryType.State}: ${targetState}`);

  let immediate = targetStateObject.immediate;

  if (machine.isAsync) {
    // Run the actions and producers
    let promise = runActionsAndProducers(machine, targetStateObject, payload);

    // Try to run nested machines if any
    promise.then(() => runNestedMachines(machine, targetStateObject, payload));

    // If immediate is set, invoke the immediate event
    if (isValidString(immediate) && hasFatalError(machine) === false) {
      promise = promise.then(() => invoke(machine, immediate as string));
    }

    // Return the promise
    return promise;
  }

  // Run the actions or producers of the target state
  runProducers(machine, targetStateObject, payload);

  // Try to run nested machines if any
  runNestedMachines(machine, targetStateObject, payload);

  // If immediate is set, invoke the immediate transition
  if (isValidString(immediate) && hasFatalError(machine) === false) {
    invoke(machine, immediate);
  }
}

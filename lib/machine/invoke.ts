// Gets a property from a state machine
// @param {Machine} machine
// @param {String} property
// @param {Any} defaultValue

import { ActionDirective, HistoryType, Machine, ProducerDirective, StateDirective, TransitionDirective } from "./interfaces";
import {
  canMakeTransition,
  cloneContext,
  deepFreeze,
  hasTransition,
  isAction,
  isGuard,
  isNestedGuard,
  isNestedMachineWithTransitionDirective,
  isNestedTransition,
  isParallelTransition,
  isProducer,
  isProducerWithTransition,
  isValidObject,
  isValidString,
} from "../utils";

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
  if (hasTransition(state, "error")) {
    return invoke(machine, "error", error);
  }

  // Check if we have a fatal state and set it as the current state if so
  if ("fatal" in machine.states) {
    machine.current = "fatal";
    machine.fatal = error as Error;
    return;
  }

  // If we don't have a fatal state, we throw the error
  // But we also assign the error to the machine so that it can be accessed
  // from the outside
  machine.fatal = error as Error;
  throw error;
}

async function runActionsAndProducers(machine: Machine, state: StateDirective, payload: any) {
  for (let i = 0; i < state.run.length; i++) {
    let item = state.run[i];
    try {
      if (isAction(item)) {
        await runAction(machine, item, payload);
      } else if (isProducer(item)) {
        await runProducer(machine, item, payload);
      }
    } catch (error) {
      await catchError(machine, state, error as Error);
      return;
    }
  }
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
        promise = promise.then(() => invoke(nestedMachine.machine, transition, payload));
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

function runNestedTransition(machine: Machine, transition: string, payload: any): Promise<void> | void {
  // We know that we have a nested transition and that the first part is the current state
  // so we get rid of the first part and split the rest
  let nestedTransitionParts = transition.split(".");
  let stateName = nestedTransitionParts.shift();
  let nestedTransition = nestedTransitionParts.join(".");
  let promise = machine.isAsync ? Promise.resolve() : null;

  // If we have no stateName, we can't make a transition
  if (!stateName) {
    return;
  }

  let currentStateObject = machine.states[machine.current];

  // We loop through the nested machines and invoke the transition if we can
  for (let nestedMachineDirective of currentStateObject.nested) {
    let nestedMachine = nestedMachineDirective.machine;
    let currentNestedState = nestedMachine.states[nestedMachine.current];
    if (canMakeTransition(nestedMachine, currentNestedState, nestedTransition)) {
      if (promise) {
        promise = promise.then(() => invoke(nestedMachine, nestedTransition, payload));
      } else {
        invoke(nestedMachine, nestedTransition, payload);
      }
    }
  }

  // If we have an immediate transitions we can run it
  if (promise) {
    promise = promise.then(() => invokeImmediateDirectives(machine, currentStateObject, payload));
  } else {
    invokeImmediateDirectives(machine, currentStateObject, payload);
  }

  return promise || void 0;
}

function runParallelTransition(machine: Machine, transition: string, payload: any): Promise<void> | void {
  // We know that we have a parallel transition and that the first part is the parallelMachineId
  // so we get rid of the first part and split the rest
  let parallelTransitionParts = isNestedTransition(transition) ? transition.split(".") : transition.split("/");
  let parallelMachineId = parallelTransitionParts.shift();
  let parallelTransition = parallelTransitionParts.join("/");

  // If we have no stateName, we can't make a transition
  if (!parallelMachineId) {
    throw new Error(`Invalid transition ${transition}`);
  }

  // If there is no parallel machine with the given id, we can't make a transition
  let parallelMachine = machine.parallel[parallelMachineId];
  if (!parallelMachine) {
    throw new Error(`Invalid transition ${transition}`);
  }

  // If the parallelMachineId is in the parallel object try to run the transition in the parallel machine
  return invoke(parallelMachine, parallelTransition, payload);
}

function invokeImmediateDirectives(machine: Machine, state: StateDirective, payload: any): Promise<void> | void {
  // If there are no immediate directives, we can return
  if (state.immediate.length === 0) {
    return;
  }

  let immediate = state.immediate;
  let promise = machine.isAsync ? Promise.resolve() : null;

  // For each immediate directive
  for (let immediateDirective of immediate) {
    if (hasFatalError(machine)) {
      return;
    }

    // If is a parallel transition we run the transition in the parallel machine
    if (isParallelTransition(immediateDirective.immediate)) {
      let transitionParts = immediateDirective.immediate.split("/");
      let parallelMachineId = transitionParts.shift() as string;
      let parallelTransition = transitionParts.join("/");
      let parallelMachine = machine.parallel[parallelMachineId];
      if (promise) {
        promise.then(() => invoke(parallelMachine, parallelTransition, payload));
      } else {
        invoke(parallelMachine, parallelTransition, payload);
      }
    }

    // If is a nested transition we run the transition in the nested machine
    else if (isNestedTransition(immediateDirective.immediate)) {
      if (promise) {
        promise.then(() => invoke(machine, immediateDirective.immediate, payload));
      } else {
        invoke(machine, immediateDirective.immediate, payload);
      }
    }

    // If is a transition we run the transition
    else {
      if (promise) {
        promise.then(async () => {
          // Only run the next immediate if the current state is equal to the state we are in now
          if (machine.current === state.name) {
            await invoke(machine, immediateDirective.immediate, payload);
          }
        });
      } else {
        // Only run the next immediate if the current state is equal to the state we are in now
        if (machine.current === state.name) {
          invoke(machine, immediateDirective.immediate, payload);
        }
      }
    }
  }

  return promise || void 0;
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

  // Get the current state object
  let currentStateObject = machine.states[machine.current];

  let hasTransition = canMakeTransition(machine, currentStateObject, trimmedTransition);

  // Check if the transition exists in the current state and throw an error if not
  if (!hasTransition) {
    throw new Error(`The transition '${trimmedTransition}' does not exist in the current state '${machine.current}'`);
  }

  // Check if we have a nested or parallel transition
  if (isParallelTransition(trimmedTransition)) {
    return runParallelTransition(machine, trimmedTransition, payload);
  }

  if (isNestedTransition(trimmedTransition)) {
    return runNestedTransition(machine, trimmedTransition, payload);
  }

  // Add the transition to the history
  machine.history.push(`${HistoryType.Transition}: ${trimmedTransition}`);

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

  if (machine.isAsync) {
    let promise = Promise.resolve();

    // Try to run nested machines if any
    promise = promise.then(() => runNestedMachines(machine, targetStateObject, payload));

    // Run the actions and producers
    promise = promise.then(() => runActionsAndProducers(machine, targetStateObject, payload));

    // If there are immediate directives, run them
    promise = promise.then(() => invokeImmediateDirectives(machine, targetStateObject, payload));

    // Return the promise
    return promise;
  }

  // Try to run nested machines if any
  runNestedMachines(machine, targetStateObject, payload);

  // Run the actions or producers of the target state
  runProducers(machine, targetStateObject, payload);

  // If there are immediate directives, run them
  invokeImmediateDirectives(machine, targetStateObject, payload);
}

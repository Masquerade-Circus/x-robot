import { ActionDirective, Machine, ProducerDirective, StateDirective } from '../machine/interfaces';
import { Result, err, ok } from './result';
import { hasState, hasTransition, isAction, isGuard, isProducer, isProducerWithTransition, isTransition, isValidString } from '../utils';

function validateInitialState(machine: Machine): Result<void, Error> {
  // If we dont get a valid initial state, throw an error
  if (isValidString(machine.initial) === false) {
    return err(new Error('The initial state passed to the machine must be a string.'));
  }

  // If the initial state is not in the states, throw an error
  if (!(machine.initial in machine.states)) {
    return err(new Error(`The initial state '${machine.initial}' is not in the machine's states.`));
  }

  return ok(void 0);
}

function validateThatAllStatesHaveTransitionsToThem(machine: Machine): Result<void, Error> {
  for (let state in machine.states) {
    if (state !== machine.initial && state !== 'fatal') {
      let hasPreviousState = false;
      for (let otherState in machine.states) {
        if (otherState !== state) {
          // Check for other transitions declared in the state
          for (let transition in machine.states[otherState].on) {
            if (machine.states[otherState].on[transition].target === state) {
              hasPreviousState = true;
              break;
            }
          }

          // Check for a transition declared in the actions of the state
          for (let item of machine.states[otherState].run) {
            if (isAction(item)) {
              // Success is a transition string
              if (isValidString(item.success) && item.success === state) {
                hasPreviousState = true;
                break;
              }

              // Success is a producer with a transition string
              if (isProducerWithTransition(item.failure) && item.failure.transition === state) {
                hasPreviousState = true;
                break;
              }

              // Failure is a transition string
              if (isValidString(item.failure) && item.failure === state) {
                hasPreviousState = true;
                break;
              }

              // Failure is a producer with a transition string
              if (isProducerWithTransition(item.failure) && item.failure.transition === state) {
                hasPreviousState = true;
                break;
              }
            }
          }

          // If has a previous state, break
          if (hasPreviousState) {
            break;
          }
        }
      }

      if (!hasPreviousState) {
        return err(new Error(`The state '${state}' does not have a transition to it.`));
      }
    }
  }

  return ok(void 0);
}

function validateImmediateTransitions(machine: Machine): Result<void, Error> {
  for (let stateName in machine.states) {
    let state = machine.states[stateName];
    let immediate = state.immediate;

    // If immediate is an array then we have multiple immediate transitions and must throw an error
    if (Array.isArray(immediate)) {
      return err(new Error(`The state '${stateName}' has multiple immediate transitions.`));
    }

    if (typeof immediate !== 'undefined') {
      // Validate that the target is a valid state
      if (!isValidString(immediate)) {
        return err(new Error(`The immediate transition of the state '${stateName}' must have a target state.`));
      }

      // Validate that the target exists
      if (hasState(machine, immediate) === false) {
        return err(new Error(`The immediate transition of the state '${stateName}' has a target state '${immediate}' that does not exists.`));
      }
    }
  }

  return ok(void 0);
}

function validateStateProducer(item: ProducerDirective, stateName: string, state: StateDirective): Result<void, Error> {
  // Validate that the producer is a valid function
  if (typeof item.producer !== 'function') {
    return err(new Error(`The producer '${item.producer}' of the state '${stateName}' must be a function.`));
  }

  // Validate that the producer is not an async function or a promise
  if (item.producer.constructor.name === 'AsyncFunction') {
    return err(new Error(`The producer '${item.producer.name}' of the state '${stateName}' must be a synchronous function.`));
  }

  // We can't validate that the producer is not a function returning a promise but we will validate its return value at runtime

  // Validate that the producer hasn't a transition
  if (isProducerWithTransition(item)) {
    return err(new Error(`The producer '${item.producer.name}' of the state '${stateName}' cannot have a transition.`));
  }

  // Validate that the producer is created before any transitions
  let firstTransitionIndex = state.args.findIndex((arg: any) => isTransition(arg));
  let indexOfCurrentProducer = state.args.findIndex((arg: any) => arg === item);
  if (firstTransitionIndex >= 0 && indexOfCurrentProducer > firstTransitionIndex) {
    return err(new Error(`The producer '${item.producer.name}' of the state '${stateName}' must be created before any transitions.`));
  }

  return ok(void 0);
}

function validateAction(machine: Machine, state: StateDirective, stateName: string, item: ActionDirective): Result<void, Error> {
  // Validate that the action is a valid function
  if (typeof item.action !== 'function') {
    return err(new Error(`The action '${item.action}' of the state '${stateName}' must be a function.`));
  }

  // Validate that the action is created before any transitions
  let firstTransitionIndex = state.args.findIndex((arg: any) => isTransition(arg));
  let indexOfCurrentAction = state.args.findIndex((arg: any) => arg === item);
  if (firstTransitionIndex >= 0 && indexOfCurrentAction > firstTransitionIndex) {
    return err(new Error(`The action '${item.action.name}' of the state '${stateName}' must be created before any transitions.`));
  }

  // Validate that the action has an error transition, a producer with an error transition or there is an error transition in the state
  if ('fatal' in machine.states === false && !isProducerWithTransition(item.failure) && !isValidString(item.failure) && !hasTransition(state, 'error')) {
    return err(
      new Error(
        `The action '${item.action.name}' of the state '${stateName}' must have an error transition, an error producer with a transition or an 'error' transition in the state.`
      )
    );
  }

  // Validate that the error transition exists
  let errorTransition = isProducerWithTransition(item.failure)
    ? item.failure.transition
    : isValidString(item.failure)
    ? item.failure
    : isTransition(state.on.error)
    ? 'error'
    : 'fatal';
  if (!hasState(machine, errorTransition)) {
    return err(new Error(`The action '${item.action.name}' of the state '${stateName}' has an error transition '${errorTransition}' that does not exists.`));
  }

  return ok(void 0);
}

function validateRunCollections(machine: Machine): Result<void, Error> {
  // Validate the transitions of each state
  for (let stateName in machine.states) {
    let state = machine.states[stateName];

    // Validate run collection
    for (let item of state.run) {
      // Validate that the run item is an action, a producer or a guard
      if (!(isAction(item) || isProducer(item) || isGuard(item))) {
        return err(new Error(`The state '${stateName}' has a run collection that contains an item that is not an action, a producer or a guard.`));
      }

      // If the run item is a producer
      if (isProducer(item)) {
        let isStateProducerValidResult = validateStateProducer(item, stateName, state);
        if (isStateProducerValidResult.isErr()) {
          return isStateProducerValidResult;
        }
      }

      // If the run item is an action
      if (isAction(item)) {
        let isActionValidResult = validateAction(machine, state, stateName, item);
        if (isActionValidResult.isErr()) {
          return isActionValidResult;
        }
      }
    }
  }

  return ok(void 0);
}

function validateTransitions(machine: Machine): Result<void, Error> {
  // Validate the transitions of each state
  for (let stateName in machine.states) {
    let state = machine.states[stateName];

    // Validate the transitions of the state
    for (let transitionName in state.on) {
      let transition = state.on[transitionName];

      // Validate that the transition is a string
      if (isValidString(transition.target) === false) {
        return err(new Error(`The transition '${transitionName}' of the state '${stateName}' must have a target state.`));
      }

      // Validate that the transition is a valid state
      if (!(transition.target in machine.states)) {
        return err(new Error(`The transition '${transitionName}' of the state '${stateName}' has a target state '${transition.target}' that does not exists.`));
      }
    }
  }

  return ok(void 0);
}

function validateGuards(machine: Machine): Result<void, Error> {
  // Validate the guards of each state
  for (let stateName in machine.states) {
    let state = machine.states[stateName];

    for (let transitionName in state.on) {
      let transition = state.on[transitionName];

      // Validate the guards of the state
      for (let guard of transition.guards) {
        if (isGuard(guard)) {
          // Validate that the guard is a function
          if (typeof guard.guard !== 'function') {
            return err(new Error(`The guard '${guard.guard}' of the transition '${stateName}.${transitionName}' must be a function.`));
          }

          // If the guard has a failure producer validate that the producer hasn't a transition
          if (isValidString(guard.failure) || isProducerWithTransition(guard.failure)) {
            return err(new Error(`The guard '${guard.guard.name}' of the transition '${stateName}.${transitionName}' cannot have a transition.`));
          }
        }
      }
    }
  }

  return ok(void 0);
}

function validateNestedMachines(machine: Machine): Result<void, Error> {
  for (let stateName in machine.states) {
    let state = machine.states[stateName];

    // Validate that the nested machines are valid
    for (let nestedMachine of state.nested) {
      try {
        validate(nestedMachine.machine);
      } catch (error) {
        return err(new Error(`The nested machine '${nestedMachine.machine.title}' of the state '${stateName}' is not valid: ${(error as Error).message}`));
      }
    }
  }

  return ok(void 0);
}

function validateStates(machine: Machine): Result<void, Error> {
  // Validate that all nested machines are valid
  let nestedMachinesValidResult = validateNestedMachines(machine);
  if (nestedMachinesValidResult.isErr()) {
    return nestedMachinesValidResult;
  }

  // Validate that all immediate transitions are valid
  let areImmediateTransitionsValidResult = validateImmediateTransitions(machine);
  if (areImmediateTransitionsValidResult.isErr()) {
    return areImmediateTransitionsValidResult;
  }

  // Validate that all guards are valid
  let areGuardsValidResult = validateGuards(machine);
  if (areGuardsValidResult.isErr()) {
    return areGuardsValidResult;
  }

  // Validate that all run collections are valid
  let areRunCollectionsValidResult = validateRunCollections(machine);
  if (areRunCollectionsValidResult.isErr()) {
    return areRunCollectionsValidResult;
  }

  // Validate that all transitions are valid
  let areTransitionsValidResult = validateTransitions(machine);
  if (areTransitionsValidResult.isErr()) {
    return areTransitionsValidResult;
  }

  return ok(void 0);
}

export function validate(machine: Machine) {
  // Validate that the machine has a title
  if (isValidString(machine.title) === false) {
    throw new Error('The machine must have a title.');
  }

  // Validate initial state
  let isInitialStateValidResult = validateInitialState(machine);
  if (isInitialStateValidResult.isErr()) {
    throw isInitialStateValidResult.unwrapErr();
  }

  // Validate that all states have a previous state with a transition to it, the only exception is the initial state and the fatal state
  let allStatesHaveTransitionsToThemResult = validateThatAllStatesHaveTransitionsToThem(machine);
  if (allStatesHaveTransitionsToThemResult.isErr()) {
    throw allStatesHaveTransitionsToThemResult.unwrapErr();
  }

  // Validate the states
  let allStatesAreValidResult = validateStates(machine);
  if (allStatesAreValidResult.isErr()) {
    throw allStatesAreValidResult.unwrapErr();
  }
}

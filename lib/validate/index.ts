/**
 * @module x-robot/validate
 * @description Validates the machine prior to its use.
 * */
import {
  Machine,
  PulseDirective,
  StateDirective
} from "../machine/interfaces";
import { Result, err, ok } from "./result";
import {
  canMakeTransition,
  hasState,
  hasTransition,
  isEntry,
  isGuard,
  isNestedTransition,
  isParallelTransition,
  isTransition,
  isValidString
} from "../utils";

function validateInitialState(machine: Machine): Result<void, Error> {
  let hasStates = Object.keys(machine.states).length > 0;
  let hasParallelStates = Object.keys(machine.parallel).length > 0;

  // Only if the machine has states or if there are no parallel states, the initial is required
  if (
    (hasStates || !hasParallelStates) &&
    isValidString(machine.initial) === false
  ) {
    // If we dont get a valid initial state, throw an error
    return err(
      new Error("The initial state passed to the machine must be a string.")
    );
  }

  // Validate that the initial state exists if it is defined
  if (
    isValidString(machine.initial) &&
    machine.initial in machine.states === false
  ) {
    // If the initial state is not in the states, throw an error
    return err(
      new Error(
        `The initial state '${machine.initial}' is not in the machine's states.`
      )
    );
  }

  return ok(void 0);
}

function validateThatAllStatesHaveTransitionsToThem(
  machine: Machine
): Result<void, Error> {
  for (let state in machine.states) {
    if (state !== machine.initial && state !== "fatal") {
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

          // Check for a transition declared in the pulses of the state
          for (let item of machine.states[otherState].run) {
            if (isEntry(item)) {
              // Success is a transition string
              if (isValidString(item.success) && item.success === state) {
                hasPreviousState = true;
                break;
              }

              // Failure is a transition string
              if (isValidString(item.failure) && item.failure === state) {
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
        return err(
          new Error(`The state '${state}' does not have a transition to it.`)
        );
      }
    }
  }

  return ok(void 0);
}

function validateImmediateTransitions(machine: Machine): Result<void, Error> {
  for (let stateName in machine.states) {
    let state = machine.states[stateName];

    for (let immediate of state.immediate) {
      // Validate that the target is a valid state
      if (!isValidString(immediate.immediate)) {
        return err(
          new Error(
            `The immediate transition of the state '${stateName}' must have a target state.`
          )
        );
      }

      // If is a nested immediate transition, validate that we can make the transition to the nested machine
      if (isNestedTransition(immediate.immediate)) {
        let nestedMachineId = immediate.immediate.split(".")[0];
        if (canMakeTransition(machine, state, immediate.immediate) === false) {
          return err(
            new Error(
              `The immediate transition '${immediate.immediate}' of the state '${stateName}' cannot be made to the nested machine '${nestedMachineId}'.`
            )
          );
        }
      }

      // If is a parallel immediate transition, validate that we can make the transition to the parallel machine
      else if (isParallelTransition(immediate.immediate)) {
        let transitionParts = immediate.immediate.split("/");
        let parallelMachineId = transitionParts.shift();
        let transitionName = transitionParts.join("/");

        // If we have no parallel machine id, throw an error
        if (!parallelMachineId) {
          return err(
            new Error(
              `The immediate transition '${immediate.immediate}' of the state '${stateName}' is not valid.`
            )
          );
        }

        // Check that the parallel machine exists
        if (machine.parallel[parallelMachineId] === undefined) {
          return err(
            new Error(
              `The immediate transition '${immediate.immediate}' of the state '${stateName}' has a target parallel machine '${parallelMachineId}' that does not exists.`
            )
          );
        }

        // Check that the parallel machine has at least one state or parallel state that can handle the transition
        let canHandleTransition = false;
        let parallelMachine = machine.parallel[parallelMachineId];

        for (let otherStateName in parallelMachine.states) {
          let otherState = parallelMachine.states[otherStateName];
          if (canMakeTransition(parallelMachine, otherState, transitionName)) {
            canHandleTransition = true;
            break;
          }
        }

        if (!canHandleTransition) {
          return err(
            new Error(
              `The immediate transition '${immediate.immediate}' of the state '${stateName}' cannot be made to the parallel machine '${parallelMachineId}'.`
            )
          );
        }
      }

      // If is a normal transition validate that the target exists in the machine
      else if (hasState(machine, immediate.immediate) === false) {
        return err(
          new Error(
            `The immediate transition of the state '${stateName}' has a target state '${immediate.immediate}' that does not exists.`
          )
        );
      }
    }
  }

  return ok(void 0);
}

function validatePulse(
  machine: Machine,
  state: StateDirective,
  stateName: string,
  item: PulseDirective
): Result<void, Error> {
  // Validate that the pulse is a valid function
  if (typeof item.pulse !== "function") {
    return err(
      new Error(
        `The pulse '${item.pulse}' of the state '${stateName}' must be a function.`
      )
    );
  }

  // Validate that the pulse is created before any transitions
  let firstTransitionIndex = state.args.findIndex((arg: any) =>
    isTransition(arg)
  );
  let indexOfCurrentPulse = state.args.findIndex((arg: any) => arg === item);
  if (
    firstTransitionIndex >= 0 &&
    indexOfCurrentPulse > firstTransitionIndex
  ) {
    return err(
      new Error(
        `The pulse '${item.pulse.name}' of the state '${stateName}' must be created before any transitions.`
      )
    );
  }

  // Validate success transition if declared
  if (isValidString(item.success) && !hasState(machine, item.success)) {
    return err(
      new Error(
        `The pulse '${item.pulse.name}' of the state '${stateName}' has a success transition '${item.success}' that does not exists.`
      )
    );
  }

  // Validate failure transition if declared
  if (isValidString(item.failure) && !hasState(machine, item.failure)) {
    return err(
      new Error(
        `The pulse '${item.pulse.name}' of the state '${stateName}' has a failure transition '${item.failure}' that does not exists.`
      )
    );
  }

  // Validate that success is not a PulseDirective (use multiple pulses instead)
  if (isEntry(item.success)) {
    return err(
      new Error(
        `The pulse '${item.pulse.name}' of the state '${stateName}' has an invalid success parameter. Use multiple pulses instead.`
      )
    );
  }

  // Validate that failure is not a PulseDirective (use multiple pulses instead)
  if (isEntry(item.failure)) {
    return err(
      new Error(
        `The pulse '${item.pulse.name}' of the state '${stateName}' has an invalid failure parameter. Use multiple pulses instead.`
      )
    );
  }

  return ok(void 0);
}

function validateRunCollections(machine: Machine): Result<void, Error> {
  // Validate the transitions of each state
  for (let stateName in machine.states) {
    let state = machine.states[stateName];

    // Validate that guards are not used directly in states (they must be inside transitions)
    for (let arg of state.args) {
      if (isGuard(arg)) {
        return err(
          new Error(
            `The guard must be used inside a transition.`
          )
        );
      }
    }

    // Validate run collection
    for (let item of state.run) {
      // Validate that the run item is a pulse
      if (!isEntry(item)) {
        return err(
          new Error(
            `The state '${stateName}' has a run collection that contains an item that is not a pulse.`
          )
        );
      }

      // Validate pulse
      if (isEntry(item)) {
        let isEntryValidResult = validatePulse(
          machine,
          state,
          stateName,
          item
        );
        if (isEntryValidResult.isErr()) {
          return isEntryValidResult;
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
        return err(
          new Error(
            `The transition '${transitionName}' of the state '${stateName}' must have a target state.`
          )
        );
      }

      // Validate that the transition is a valid state
      if (!(transition.target in machine.states)) {
        return err(
          new Error(
            `The transition '${transitionName}' of the state '${stateName}' has a target state '${transition.target}' that does not exists.`
          )
        );
      }

      // Validate exit if present
      if (transition.exit) {
        const exitArr = Array.isArray(transition.exit) 
          ? transition.exit 
          : [transition.exit];
        
        for (const exitItem of exitArr) {
          if (isEntry(exitItem)) {
            // Validate failure transition if present
            if (typeof exitItem.failure === "string" && !(exitItem.failure in machine.states)) {
              return err(
                new Error(
                  `The exit '${exitItem.pulse.name}' of the transition '${stateName}.${transitionName}' has a failure transition '${exitItem.failure}' that does not exists.`
                )
              );
            }
          }
        }
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
          if (typeof guard.guard !== "function") {
            return err(
              new Error(
                `The guard '${guard.guard}' of the transition '${stateName}.${transitionName}' must be a function.`
              )
            );
          }

          if (
            guard.failure !== undefined &&
            !isValidString(guard.failure)
          ) {
            return err(
              new Error(
                `The guard '${guard.guard.name}' of the transition '${stateName}.${transitionName}' failure must be a string.`
              )
            );
          }

          if (
            isValidString(guard.failure) &&
            !hasTransition(state, guard.failure)
          ) {
            return err(
              new Error(
                `The guard '${guard.guard.name}' of the transition '${stateName}.${transitionName}' has a failure transition '${guard.failure}' that does not exists.`
              )
            );
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
        return err(
          new Error(
            `The nested machine '${
              nestedMachine.machine.title
            }' of the state '${stateName}' is not valid: ${
              (error as Error).message
            }`
          )
        );
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
  let areImmediateTransitionsValidResult =
    validateImmediateTransitions(machine);
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

function validateParallelStates(machine: Machine): Result<void, Error> {
  // Validate that all parallel states are valid
  for (let parallelMachine in machine.parallel) {
    try {
      validate(machine.parallel[parallelMachine]);
    } catch (error) {
      return err(
        new Error(
          `The parallel machine '${
            machine.parallel[parallelMachine].title
          }' is not valid: ${(error as Error).message}`
        )
      );
    }
  }

  return ok(void 0);
}

/**
 * This function validates a machine and all its nested and parallel machines if any.
 * @param machine The machine to validate
 * @returns Void if the machine is valid, throws an error otherwise
 * @category Validation
 */
export function validate(machine: Machine) {
  // Validate that the machine has a title
  if (isValidString(machine.title) === false) {
    throw new Error("The machine must have a title.");
  }

  // Validate the parallel states
  let allParallelStatesAreValidResult = validateParallelStates(machine);
  if (allParallelStatesAreValidResult.isErr()) {
    throw allParallelStatesAreValidResult.unwrapErr();
  }

  // Validate initial state
  let isInitialStateValidResult = validateInitialState(machine);
  if (isInitialStateValidResult.isErr()) {
    throw isInitialStateValidResult.unwrapErr();
  }

  // Validate that all states have a previous state with a transition to it, the only exception is the initial state and the fatal state
  let allStatesHaveTransitionsToThemResult =
    validateThatAllStatesHaveTransitionsToThem(machine);
  if (allStatesHaveTransitionsToThemResult.isErr()) {
    throw allStatesHaveTransitionsToThemResult.unwrapErr();
  }

  // Validate the states
  let allStatesAreValidResult = validateStates(machine);
  if (allStatesAreValidResult.isErr()) {
    throw allStatesAreValidResult.unwrapErr();
  }
}

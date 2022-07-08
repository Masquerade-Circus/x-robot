// lib/validate/result.ts
var Ok = class {
  constructor(value) {
    this.value = value;
  }
  isOk() {
    return true;
  }
  isErr() {
    return false;
  }
  unwrap() {
    return this.value;
  }
  unwrapErr() {
    throw new Error("Called `unwrapErr()` on an `Ok` value.");
  }
};
var Err = class {
  constructor(error) {
    this.error = error;
  }
  isOk() {
    return false;
  }
  isErr() {
    return true;
  }
  unwrap() {
    throw new Error("Called `unwrap()` on an `Err` value.");
  }
  unwrapErr() {
    return this.error;
  }
};
function ok(value) {
  return new Ok(value);
}
function err(err2) {
  return new Err(err2);
}

// lib/machine/interfaces.ts
var START_EVENT = "__start__";

// lib/utils.ts
function isValidString(str) {
  return str !== null && typeof str === "string" && str.trim().length > 0;
}
function isValidObject(obj) {
  return obj !== null && typeof obj === "object";
}
function isProducer(producer) {
  return isValidObject(producer) && "producer" in producer;
}
function isProducerWithTransition(producer) {
  return isProducer(producer) && isValidString(producer.transition);
}
function isAction(action) {
  return isValidObject(action) && "action" in action;
}
function isGuard(guard) {
  return isValidObject(guard) && "guard" in guard;
}
function isTransition(transition) {
  return isValidObject(transition) && "transition" in transition && "target" in transition;
}
function hasTransition(state, transition) {
  return isValidString(transition) && transition in state.on;
}
function hasState(machine, state) {
  return isValidString(state) && state in machine.states;
}
function isNestedTransition(transition) {
  return isValidString(transition) && /^\w+\..+$/gi.test(transition);
}
function isParallelTransition(transition) {
  return isValidString(transition) && /^\w+\/.+$/gi.test(transition);
}
function canMakeTransition(machine, currentStateObject, transition) {
  if (!isValidString(transition)) {
    throw new Error(`Invalid transition: ${transition}`);
  }
  let trimmedTransition = transition.trim();
  if (trimmedTransition === START_EVENT) {
    return currentStateObject.name === machine.initial && machine.history.length === 1;
  }
  if (isNestedTransition(trimmedTransition) || isParallelTransition(trimmedTransition)) {
    let transitionParts = isNestedTransition(trimmedTransition) ? trimmedTransition.split(".") : trimmedTransition.split("/");
    let stateName = transitionParts.shift();
    let transitionName = isNestedTransition(trimmedTransition) ? transitionParts.join(".") : transitionParts.join("/");
    if (!stateName) {
      return false;
    }
    if (stateName in machine.parallel) {
      let parallelMachine = machine.parallel[stateName];
      return canMakeTransition(parallelMachine, parallelMachine.states[parallelMachine.current], transitionName);
    }
    if (stateName !== currentStateObject.name) {
      return false;
    }
    if (currentStateObject.nested.length === 0) {
      return false;
    }
    for (let nestedMachine of currentStateObject.nested) {
      if (canMakeTransition(nestedMachine.machine, nestedMachine.machine.states[nestedMachine.machine.current], transitionName)) {
        return true;
      }
    }
  }
  return hasTransition(currentStateObject, trimmedTransition);
}

// lib/validate/index.ts
function validateInitialState(machine) {
  let hasStates = Object.keys(machine.states).length > 0;
  let hasParallelStates = Object.keys(machine.parallel).length > 0;
  if ((hasStates || !hasParallelStates) && isValidString(machine.initial) === false) {
    return err(new Error("The initial state passed to the machine must be a string."));
  }
  if (isValidString(machine.initial) && machine.initial in machine.states === false) {
    return err(new Error(`The initial state '${machine.initial}' is not in the machine's states.`));
  }
  return ok(void 0);
}
function validateThatAllStatesHaveTransitionsToThem(machine) {
  for (let state in machine.states) {
    if (state !== machine.initial && state !== "fatal") {
      let hasPreviousState = false;
      for (let otherState in machine.states) {
        if (otherState !== state) {
          for (let transition in machine.states[otherState].on) {
            if (machine.states[otherState].on[transition].target === state) {
              hasPreviousState = true;
              break;
            }
          }
          for (let item of machine.states[otherState].run) {
            if (isAction(item)) {
              if (isValidString(item.success) && item.success === state) {
                hasPreviousState = true;
                break;
              }
              if (isProducerWithTransition(item.failure) && item.failure.transition === state) {
                hasPreviousState = true;
                break;
              }
              if (isValidString(item.failure) && item.failure === state) {
                hasPreviousState = true;
                break;
              }
              if (isProducerWithTransition(item.failure) && item.failure.transition === state) {
                hasPreviousState = true;
                break;
              }
            }
          }
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
function validateImmediateTransitions(machine) {
  for (let stateName in machine.states) {
    let state = machine.states[stateName];
    for (let immediate of state.immediate) {
      if (!isValidString(immediate.immediate)) {
        return err(new Error(`The immediate transition of the state '${stateName}' must have a target state.`));
      }
      if (isNestedTransition(immediate.immediate)) {
        let nestedMachineId = immediate.immediate.split(".")[0];
        if (canMakeTransition(machine, state, immediate.immediate) === false) {
          return err(new Error(`The immediate transition '${immediate.immediate}' of the state '${stateName}' cannot be made to the nested machine '${nestedMachineId}'.`));
        }
      } else if (isParallelTransition(immediate.immediate)) {
        let transitionParts = immediate.immediate.split("/");
        let parallelMachineId = transitionParts.shift();
        let transitionName = transitionParts.join("/");
        if (!parallelMachineId) {
          return err(new Error(`The immediate transition '${immediate.immediate}' of the state '${stateName}' is not valid.`));
        }
        if (machine.parallel[parallelMachineId] === void 0) {
          return err(new Error(`The immediate transition '${immediate.immediate}' of the state '${stateName}' has a target parallel machine '${parallelMachineId}' that does not exists.`));
        }
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
          return err(new Error(`The immediate transition '${immediate.immediate}' of the state '${stateName}' cannot be made to the parallel machine '${parallelMachineId}'.`));
        }
      } else if (hasState(machine, immediate.immediate) === false) {
        return err(new Error(`The immediate transition of the state '${stateName}' has a target state '${immediate.immediate}' that does not exists.`));
      }
    }
  }
  return ok(void 0);
}
function validateStateProducer(item, stateName, state) {
  if (typeof item.producer !== "function") {
    return err(new Error(`The producer '${item.producer}' of the state '${stateName}' must be a function.`));
  }
  if (item.producer.constructor.name === "AsyncFunction") {
    return err(new Error(`The producer '${item.producer.name}' of the state '${stateName}' must be a synchronous function.`));
  }
  if (isProducerWithTransition(item)) {
    return err(new Error(`The producer '${item.producer.name}' of the state '${stateName}' cannot have a transition.`));
  }
  let firstTransitionIndex = state.args.findIndex((arg) => isTransition(arg));
  let indexOfCurrentProducer = state.args.findIndex((arg) => arg === item);
  if (firstTransitionIndex >= 0 && indexOfCurrentProducer > firstTransitionIndex) {
    return err(new Error(`The producer '${item.producer.name}' of the state '${stateName}' must be created before any transitions.`));
  }
  return ok(void 0);
}
function validateAction(machine, state, stateName, item) {
  if (typeof item.action !== "function") {
    return err(new Error(`The action '${item.action}' of the state '${stateName}' must be a function.`));
  }
  let firstTransitionIndex = state.args.findIndex((arg) => isTransition(arg));
  let indexOfCurrentAction = state.args.findIndex((arg) => arg === item);
  if (firstTransitionIndex >= 0 && indexOfCurrentAction > firstTransitionIndex) {
    return err(new Error(`The action '${item.action.name}' of the state '${stateName}' must be created before any transitions.`));
  }
  if ("fatal" in machine.states === false && !isProducerWithTransition(item.failure) && !isValidString(item.failure) && !hasTransition(state, "error")) {
    return err(new Error(`The action '${item.action.name}' of the state '${stateName}' must have an error transition, an error producer with a transition or an 'error' transition in the state.`));
  }
  let errorTransition = isProducerWithTransition(item.failure) ? item.failure.transition : isValidString(item.failure) ? item.failure : isTransition(state.on.error) ? "error" : "fatal";
  if (!hasState(machine, errorTransition)) {
    return err(new Error(`The action '${item.action.name}' of the state '${stateName}' has an error transition '${errorTransition}' that does not exists.`));
  }
  return ok(void 0);
}
function validateRunCollections(machine) {
  for (let stateName in machine.states) {
    let state = machine.states[stateName];
    for (let item of state.run) {
      if (!(isAction(item) || isProducer(item) || isGuard(item))) {
        return err(new Error(`The state '${stateName}' has a run collection that contains an item that is not an action, a producer or a guard.`));
      }
      if (isProducer(item)) {
        let isStateProducerValidResult = validateStateProducer(item, stateName, state);
        if (isStateProducerValidResult.isErr()) {
          return isStateProducerValidResult;
        }
      }
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
function validateTransitions(machine) {
  for (let stateName in machine.states) {
    let state = machine.states[stateName];
    for (let transitionName in state.on) {
      let transition = state.on[transitionName];
      if (isValidString(transition.target) === false) {
        return err(new Error(`The transition '${transitionName}' of the state '${stateName}' must have a target state.`));
      }
      if (!(transition.target in machine.states)) {
        return err(new Error(`The transition '${transitionName}' of the state '${stateName}' has a target state '${transition.target}' that does not exists.`));
      }
    }
  }
  return ok(void 0);
}
function validateGuards(machine) {
  for (let stateName in machine.states) {
    let state = machine.states[stateName];
    for (let transitionName in state.on) {
      let transition = state.on[transitionName];
      for (let guard of transition.guards) {
        if (isGuard(guard)) {
          if (typeof guard.guard !== "function") {
            return err(new Error(`The guard '${guard.guard}' of the transition '${stateName}.${transitionName}' must be a function.`));
          }
          if (isValidString(guard.failure) || isProducerWithTransition(guard.failure)) {
            return err(new Error(`The guard '${guard.guard.name}' of the transition '${stateName}.${transitionName}' cannot have a transition.`));
          }
        }
      }
    }
  }
  return ok(void 0);
}
function validateNestedMachines(machine) {
  for (let stateName in machine.states) {
    let state = machine.states[stateName];
    for (let nestedMachine of state.nested) {
      try {
        validate(nestedMachine.machine);
      } catch (error) {
        return err(new Error(`The nested machine '${nestedMachine.machine.title}' of the state '${stateName}' is not valid: ${error.message}`));
      }
    }
  }
  return ok(void 0);
}
function validateStates(machine) {
  let nestedMachinesValidResult = validateNestedMachines(machine);
  if (nestedMachinesValidResult.isErr()) {
    return nestedMachinesValidResult;
  }
  let areImmediateTransitionsValidResult = validateImmediateTransitions(machine);
  if (areImmediateTransitionsValidResult.isErr()) {
    return areImmediateTransitionsValidResult;
  }
  let areGuardsValidResult = validateGuards(machine);
  if (areGuardsValidResult.isErr()) {
    return areGuardsValidResult;
  }
  let areRunCollectionsValidResult = validateRunCollections(machine);
  if (areRunCollectionsValidResult.isErr()) {
    return areRunCollectionsValidResult;
  }
  let areTransitionsValidResult = validateTransitions(machine);
  if (areTransitionsValidResult.isErr()) {
    return areTransitionsValidResult;
  }
  return ok(void 0);
}
function validateParallelStates(machine) {
  for (let parallelMachine in machine.parallel) {
    try {
      validate(machine.parallel[parallelMachine]);
    } catch (error) {
      return err(new Error(`The parallel machine '${machine.parallel[parallelMachine].title}' is not valid: ${error.message}`));
    }
  }
  return ok(void 0);
}
function validate(machine) {
  if (isValidString(machine.title) === false) {
    throw new Error("The machine must have a title.");
  }
  let allParallelStatesAreValidResult = validateParallelStates(machine);
  if (allParallelStatesAreValidResult.isErr()) {
    throw allParallelStatesAreValidResult.unwrapErr();
  }
  let isInitialStateValidResult = validateInitialState(machine);
  if (isInitialStateValidResult.isErr()) {
    throw isInitialStateValidResult.unwrapErr();
  }
  let allStatesHaveTransitionsToThemResult = validateThatAllStatesHaveTransitionsToThem(machine);
  if (allStatesHaveTransitionsToThemResult.isErr()) {
    throw allStatesHaveTransitionsToThemResult.unwrapErr();
  }
  let allStatesAreValidResult = validateStates(machine);
  if (allStatesAreValidResult.isErr()) {
    throw allStatesAreValidResult.unwrapErr();
  }
}
export {
  validate
};

import {
  ActionDirective,
  ContextDirective,
  DescriptionDirective,
  GuardDirective,
  ImmediateDirective,
  InitialDirective,
  Machine,
  NestedGuardDirective,
  NestedImmediateDirective,
  NestedMachineDirective,
  NestedMachineWithTransitionDirective,
  ParallelDirective,
  ParallelImmediateDirective,
  ProducerDirective,
  ProducerDirectiveWithTransition,
  ProducerDirectiveWithoutTransition,
  ShouldFreezeDirective,
  StateDirective,
  StatesDirective,
  TransitionDirective,
} from "./machine/interfaces";

export function isValidString(str?: any): str is string {
  return str !== null && typeof str === "string" && str.trim().length > 0;
}

export function isValidObject(obj: any): obj is object {
  return obj !== null && typeof obj === "object";
}

export function isProducer(producer?: any): producer is ProducerDirective {
  return isValidObject(producer) && "producer" in producer;
}

export function isProducerWithTransition(producer?: any): producer is ProducerDirectiveWithTransition {
  return isProducer(producer) && isValidString(producer.transition);
}

export function isProducerWithoutTransition(producer?: any): producer is ProducerDirectiveWithoutTransition {
  return !isProducerWithTransition(producer);
}

export function isAction(action?: any): action is ActionDirective {
  return isValidObject(action) && "action" in action;
}

export function isImmediate(immediate?: any): immediate is ImmediateDirective {
  return isValidObject(immediate) && "immediate" in immediate;
}

export function isGuard(guard?: any): guard is GuardDirective {
  return isValidObject(guard) && "guard" in guard;
}

export function isNestedGuard(guard?: any): guard is NestedGuardDirective {
  return isGuard(guard) && "machine" in guard;
}

export function isTransition(transition?: any): transition is TransitionDirective {
  return isValidObject(transition) && "transition" in transition && "target" in transition;
}

export function hasTransition(state: StateDirective, transition: string): boolean {
  return isValidString(transition) && transition in state.on;
}

export function hasState(machine: Machine, state: string): boolean {
  return isValidString(state) && state in machine.states;
}

export function isNestedMachineDirective(machine?: any): machine is NestedMachineDirective {
  return isValidObject(machine) && "machine" in machine;
}

export function isNestedMachineWithTransitionDirective(machine?: any): machine is NestedMachineWithTransitionDirective {
  return isNestedMachineDirective(machine) && isValidString(machine.transition);
}

export function isMachine(machine?: any): machine is Machine {
  return isValidObject(machine) && "states" in machine && "initial" in machine && "current" in machine;
}

export function isStateDirective(state?: any): state is StateDirective {
  return isValidObject(state) && "name" in state && "run" in state && "on" in state && "args" in state;
}

export function isContextDirective(context?: any): context is ContextDirective {
  return isValidObject(context) && "context" in context;
}

export function isStatesDirective(states?: any): states is StatesDirective {
  return isValidObject(states) && Object.keys(states).every((key) => isValidString(key)) && Object.values(states).every((state) => isStateDirective(state));
}

export function isParallelDirective(parallel?: any): parallel is ParallelDirective {
  return isValidObject(parallel) && "parallel" in parallel;
}

export function isShouldFreezeDirective(shouldFreeze?: any): shouldFreeze is ShouldFreezeDirective {
  return isValidObject(shouldFreeze) && "freeze" in shouldFreeze;
}

export function isInitialDirective(initial?: any): initial is InitialDirective {
  return isValidObject(initial) && "initial" in initial;
}

export function isDescriptionDirective(description?: any): description is DescriptionDirective {
  return isValidObject(description) && "description" in description;
}

export function isNestedTransition(transition?: any): boolean {
  return isValidString(transition) && /^\w+\..+$/gi.test(transition);
}

export function isParallelTransition(transition?: any): boolean {
  return isValidString(transition) && /^\w+\/.+$/gi.test(transition);
}

export function isNestedImmediateDirective(immediate?: any): immediate is NestedImmediateDirective {
  return isImmediate(immediate) && isNestedTransition(immediate.immediate);
}

export function isParallelImmediateDirective(immediate?: any): immediate is ParallelImmediateDirective {
  return isImmediate(immediate) && isParallelTransition(immediate.immediate);
}

/**
 * This method is used to deep freeze an object
 * @param {Object} obj The object to freeze
 * @returns {Object} Object frozen
 */
export function deepFreeze(obj: any) {
  if (typeof obj === "object" && obj !== null && !Object.isFrozen(obj)) {
    if (Array.isArray(obj)) {
      for (let i = 0, l = obj.length; i < l; i++) {
        deepFreeze(obj[i]);
      }
    } else {
      for (let prop in obj) {
        deepFreeze(obj[prop]);
      }
    }
    Object.freeze(obj);
  }

  return obj;
}

// Creates a deep copy of the context
// @param {Object} context
// @returns {Object}
export function cloneContext(context: any, weakMap = new WeakMap()): any {
  // If context is in the weak map, we will use the weak map value
  if (weakMap.has(context)) {
    return weakMap.get(context);
  }

  // If context is null or undefined, we will return it as is
  if (context === null || context === undefined) {
    return context;
  }

  let result;

  // Check for every type of object property and clone it accordingly
  // If is an array, we will clone it recursively
  if (Array.isArray(context)) {
    result = context.map((item) => cloneContext(item, weakMap));
  }

  // If it is an object, we will clone it recursively
  else if (typeof context === "object") {
    result = {} as any;
    for (let key in context) {
      result[key] = cloneContext(context[key], weakMap);
    }
  }

  // If it is a date, we will clone it
  else if (context instanceof Date) {
    result = new Date(context.getTime());
  }

  // If it is a Set, we will clone it recursively
  else if (context instanceof Set) {
    result = new Set(context);
  }

  // If it is a Map, we will clone it recursively
  else if (context instanceof Map) {
    let array = Array.from(context, ([key, val]) => [key, cloneContext(val, weakMap)]) as [any, any][];
    result = new Map(array);
  }

  // If it is a RegExp, we will clone it
  else if (context instanceof RegExp) {
    return new RegExp(context.source, context.flags);
  }

  // If it is a instance of a class, we create a new instance of the class
  // Only if we turn the first parameter to true
  else if (false && context instanceof Object && context.constructor) {
    result = new context.constructor(context);
  }

  // If it is a primitive, we will just assign it
  else {
    result = context;
    return result;
  }

  // Add the context to the weak map
  weakMap.set(context, result);

  // Return the cloned context
  return result;
}

type CurrentState = string | null;
interface AllStates {
  [key: string]: CurrentState | AllStates;
}

export function getState(machine: Machine, path?: string): AllStates | CurrentState {
  // If there is no machine we will return null
  if (!isMachine(machine)) {
    return null;
  }

  // If there is no path we will return the current state
  if (!isValidString(path)) {
    let result = {} as AllStates;

    // We will iterate over all the parallel states
    if (Object.keys(machine.parallel).length > 0) {
      for (let parallelName in machine.parallel) {
        result[parallelName] = getState(machine.parallel[parallelName]);
      }
    }

    if (isValidString(machine.current)) {
      result.current = machine.current;
    }

    // If there is only one state and it is the current state we will return it
    if (isValidString(result.current) && Object.keys(result).length === 1) {
      return result.current;
    }

    // If we have more than one state or the state is not the current state we will return the object
    if (Object.keys(result).length > 0) {
      return result;
    }

    // If there is no current state and no parallel states we will return null
    return null;
  }

  let pathParts = path.split(".");
  let stateName = pathParts.shift();

  // If the state name is not a string we will return null
  if (!isValidString(stateName)) {
    return null;
  }

  // Find the state in the parallel states
  if (stateName in machine.parallel) {
    return getState(machine.parallel[stateName], pathParts.join("."));
  }

  // Find the state in the states
  if (stateName in machine.states) {
    // If we have a state we will find the states in the nested machines
    let obj: AllStates = {};

    // Find a nested machine in the state
    for (let nested of machine.states[stateName].nested) {
      obj[nested.machine.id] = getState(nested.machine, pathParts.join("."));
    }

    // If the object is empty we will return null
    if (Object.keys(obj).length === 0) {
      return null;
    }

    // If the object only has one property we will return the value of the property
    if (Object.keys(obj).length === 1) {
      return obj[Object.keys(obj)[0]];
    }

    // If we are here we will return the whole object
    return obj;
  }

  // If we are here check if we have a machine id as the stateName
  let nestedMachineId = stateName;

  // Find a nested machine in the state
  for (stateName in machine.states) {
    for (let nested of machine.states[stateName].nested) {
      if (nested.machine.id === nestedMachineId) {
        return getState(nested.machine, pathParts.join("."));
      }
    }
  }

  // If we are here we will return null
  return null;
}

function getProperty(obj: Record<string | number | symbol, any>, property: string, defaultValue?: any): any {
  let result = obj;

  if (typeof property === "undefined") {
    throw new Error("Property is undefined");
  }

  let parsed = property.split(".");
  let next;

  while (parsed.length) {
    next = parsed.shift();

    if (typeof next === "undefined") {
      break;
    }

    if (next.indexOf("[") > -1) {
      let idx = next.replace(/\D/gi, "");
      next = next.split("[")[0];
      parsed.unshift(idx);
    }

    if (next in result === false || (parsed.length > 0 && typeof result[next] !== "object")) {
      return defaultValue;
    }

    result = result[next];
  }

  return typeof result === "undefined" ? defaultValue : result;
}

export function canMakeTransition(machine: Machine, currentStateObject: StateDirective, transition: string): boolean {
  if (!isValidString(transition)) {
    throw new Error(`Invalid transition: ${transition}`);
  }

  let trimmedTransition = transition.trim();

  // Check if we have a normal transition or a nested transition (nested transitions are dot separated)
  if (isNestedTransition(trimmedTransition) || isParallelTransition(trimmedTransition)) {
    // Get the nested transition parts
    let transitionParts = isNestedTransition(trimmedTransition) ? trimmedTransition.split(".") : trimmedTransition.split("/");
    // The first part must be the current state
    let stateName = transitionParts.shift();
    // The second part must be the transition
    let transitionName = isNestedTransition(trimmedTransition) ? transitionParts.join(".") : transitionParts.join("/");

    // If we have no stateName, we can't make a transition
    if (!stateName) {
      return false;
    }

    // If the stateName is in the parallel object check if we can make the transition in the parallel machine
    if (stateName in machine.parallel) {
      let parallelMachine = machine.parallel[stateName];
      return canMakeTransition(parallelMachine, parallelMachine.states[parallelMachine.current], transitionName);
    }

    // If the current state name is not the same as the stateName return false
    if (stateName !== currentStateObject.name) {
      return false;
    }

    // If the current state doesn't have a nested machine return false
    if (currentStateObject.nested.length === 0) {
      return false;
    }

    // We loop through the nested machines and check if we can make the transition
    for (let nestedMachine of currentStateObject.nested) {
      if (canMakeTransition(nestedMachine.machine, nestedMachine.machine.states[nestedMachine.machine.current], transitionName)) {
        return true;
      }
    }
  }

  // If we get here, we have a normal transition
  return hasTransition(currentStateObject, trimmedTransition);
}

export const titleToId = (str: string) => str.toLowerCase().replace(/(\s|\W)/g, "");

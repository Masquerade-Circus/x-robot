/** @module x-robot/utils */
import {
  ContextDirective,
  DescriptionDirective,
  ExitDirective,
  GuardDirective,
  HistoryDirective,
  ImmediateDirective,
  InitialDirective,
  InitDirective,
  Machine,
  NestedGuardDirective,
  NestedImmediateDirective,
  ParallelDirective,
  ParallelImmediateDirective,
  PulseDirective,
  START_EVENT,
  ShouldFreezeDirective,
  StateDirective,
  StatesDirective,
  TransitionDirective,
  NestedMachineDirective,
  NestedMachineWithTransitionDirective
} from "../machine/interfaces";

export function isValidString(str?: any): str is string {
  return str !== null && typeof str === "string" && str.trim().length > 0;
}

export function isValidObject(obj: any): obj is object {
  return obj !== null && typeof obj === "object";
}

export function isEntry(entry?: any): entry is PulseDirective {
  return isValidObject(entry) && "pulse" in entry;
}

export function isExit(exit?: any): exit is { exit: ExitDirective[] } {
  return isValidObject(exit) && "exit" in exit;
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

export function isTransition(
  transition?: any
): transition is TransitionDirective {
  return (
    isValidObject(transition) &&
    "transition" in transition &&
    "target" in transition
  );
}

export function hasTransition(
  state: StateDirective,
  transition: string
): boolean {
  return isValidString(transition) && transition in state.on;
}

export function hasState(machine: Machine, state: string): boolean {
  return isValidString(state) && state in machine.states;
}

export function isNestedMachineDirective(
  machine?: any
): machine is NestedMachineDirective {
  return isValidObject(machine) && "machine" in machine;
}

export function isNestedMachineWithTransitionDirective(
  machine?: any
): machine is NestedMachineWithTransitionDirective {
  return isNestedMachineDirective(machine) && isValidString(machine.transition);
}

export function isMachine(machine?: any): machine is Machine {
  return (
    isValidObject(machine) &&
    "states" in machine &&
    "initial" in machine &&
    "current" in machine
  );
}

export function isStateDirective(state?: any): state is StateDirective {
  return (
    isValidObject(state) &&
    "name" in state &&
    "run" in state &&
    "on" in state &&
    "args" in state
  );
}

export function isContextDirective(context?: any): context is ContextDirective {
  return isValidObject(context) && "context" in context;
}

export function isStatesDirective(states?: any): states is StatesDirective {
  return (
    isValidObject(states) &&
    Object.keys(states).every((key) => isValidString(key)) &&
    Object.values(states).every((state) => isStateDirective(state))
  );
}

export function isParallelDirective(
  parallel?: any
): parallel is ParallelDirective {
  return isValidObject(parallel) && "parallel" in parallel;
}

export function isShouldFreezeDirective(
  shouldFreeze?: any
): shouldFreeze is ShouldFreezeDirective {
  return isValidObject(shouldFreeze) && "freeze" in shouldFreeze;
}

export function isInitialDirective(initial?: any): initial is InitialDirective {
  return isValidObject(initial) && "initial" in initial;
}

export function isHistoryDirective(history?: any): history is HistoryDirective {
  return isValidObject(history) && "history" in history && typeof (history as HistoryDirective).history === "number" && (history as HistoryDirective).history >= 0;
}

export function isInitDirective(init?: any): init is InitDirective {
  if (!isValidObject(init)) return false;
  const hasInitial = "initial" in init;
  const hasContext = "context" in init;
  const hasFreeze = "freeze" in init;
  const hasHistory = "history" in init;
  return hasInitial || hasContext || hasFreeze || hasHistory;
}

export function isDescriptionDirective(
  description?: any
): description is DescriptionDirective {
  return isValidObject(description) && "description" in description;
}

export function isNestedTransition(transition?: any): boolean {
  return isValidString(transition) && /^\w+\..+$/gi.test(transition);
}

export function isParallelTransition(transition?: any): boolean {
  return isValidString(transition) && /^\w+\/.+$/gi.test(transition);
}

export function isNestedImmediateDirective(
  immediate?: any
): immediate is NestedImmediateDirective {
  return isImmediate(immediate) && isNestedTransition(immediate.immediate);
}

export function isParallelImmediateDirective(
  immediate?: any
): immediate is ParallelImmediateDirective {
  return isImmediate(immediate) && isParallelTransition(immediate.immediate);
}

export function deepFreeze(
  obj: any,
  freezeClassInstances: boolean = false,
  seen = new WeakSet()
): any {
  if (
    obj === null ||
    typeof obj !== "object" ||
    seen.has(obj) ||
    Object.isFrozen(obj)
  ) {
    return obj;
  }

  seen.add(obj);

  if (Array.isArray(obj)) {
    for (let i = 0, l = obj.length; i < l; i++) {
      deepFreeze(obj[i], freezeClassInstances, seen);
    }
  } else {
    const props = Reflect.ownKeys(obj);
    for (let i = 0, l = props.length; i < l; i++) {
      deepFreeze(obj[props[i]], freezeClassInstances, seen);
    }

    if (freezeClassInstances) {
      const proto = Object.getPrototypeOf(obj);
      if (proto && proto !== Object.prototype) {
        deepFreeze(proto, freezeClassInstances, seen);
      }
    }
  }

  Object.freeze(obj);

  return obj;
}

function isPlainObject(value: any): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export { isPlainObject };

function canUseStructuredClone(value: any): boolean {
  if (typeof structuredClone !== "function") {
    return false;
  }

  if (typeof Buffer !== "undefined" && value instanceof Buffer) {
    return false;
  }

  return (
    Array.isArray(value) ||
    isPlainObject(value) ||
    value instanceof Date ||
    value instanceof RegExp ||
    value instanceof Map ||
    value instanceof Set ||
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value)
  );
}

export function deepCloneUnfreeze<T>(
  obj: T,
  cloneClassInstances = false,
  seen = new WeakMap()
): T {
  if (typeof obj === "undefined" || obj === null || typeof obj !== "object") {
    return obj;
  }

  const source = obj as any;

  if (seen.has(source)) {
    return seen.get(source);
  }

  if (canUseStructuredClone(source)) {
    const cloned = structuredClone(source);
    seen.set(source, cloned);
    return cloned;
  }

  let clone: any;

  switch (true) {
    case Array.isArray(source): {
      clone = [];
      seen.set(source, clone);
      for (let i = 0, l = source.length; i < l; i++) {
        clone[i] = deepCloneUnfreeze(source[i], cloneClassInstances, seen);
      }
      return clone;
    }
    case source instanceof Date: {
      clone = new Date(source.getTime());
      seen.set(source, clone);
      return clone;
    }
    case source instanceof RegExp: {
      clone = new RegExp(source.source, source.flags);
      seen.set(source, clone);
      return clone;
    }
    case source instanceof Map: {
      clone = new Map();
      seen.set(source, clone);
      for (const [key, value] of source.entries()) {
        clone.set(
          deepCloneUnfreeze(key, cloneClassInstances, seen),
          deepCloneUnfreeze(value, cloneClassInstances, seen)
        );
      }
      return clone;
    }
    case source instanceof Set: {
      clone = new Set();
      seen.set(source, clone);
      for (const value of source.values()) {
        clone.add(deepCloneUnfreeze(value, cloneClassInstances, seen));
      }
      return clone;
    }
    case source instanceof ArrayBuffer: {
      clone = source.slice(0);
      seen.set(source, clone);
      return clone;
    }
    case ArrayBuffer.isView(source): {
      clone = new source.constructor(source.buffer.slice(0));
      seen.set(source, clone);
      return clone;
    }
    case typeof Buffer !== "undefined" && source instanceof Buffer: {
      clone = Buffer.from(source);
      seen.set(source, clone);
      return clone;
    }
    case source instanceof Error: {
      clone = new source.constructor(source.message);
      seen.set(source, clone);
      break;
    }
    case source instanceof Promise ||
      source instanceof WeakMap ||
      source instanceof WeakSet: {
      clone = source;
      seen.set(source, clone);
      return clone;
    }
    case source.constructor && source.constructor !== Object: {
      if (!cloneClassInstances) {
        clone = source;
        seen.set(source, clone);
        return clone;
      }
      clone = Object.create(Object.getPrototypeOf(source));
      seen.set(source, clone);
      break;
    }
    default: {
      clone = {};
      seen.set(source, clone);

      const keys = Reflect.ownKeys(source);
      for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        clone[key as string] = deepCloneUnfreeze(
          source[key as string],
          cloneClassInstances,
          seen
        );
      }
      return clone;
    }
  }

  const descriptors = Object.getOwnPropertyDescriptors(source);
  for (const key of Reflect.ownKeys(descriptors)) {
    const descriptor = descriptors[key as string];
    if ("value" in descriptor) {
      descriptor.value = deepCloneUnfreeze(
        descriptor.value,
        cloneClassInstances,
        seen
      );
    }
    Object.defineProperty(clone, key, descriptor);
  }

  return clone;
}

// This method allows to get a value from a passed object using dot notation path, it is not used in the library at the moment
function getProperty(
  obj: Record<string | number | symbol, any>,
  property: string,
  defaultValue?: any
): any {
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

    if (
      next in result === false ||
      (parsed.length > 0 && typeof result[next] !== "object")
    ) {
      return defaultValue;
    }

    result = result[next];
  }

  return typeof result === "undefined" ? defaultValue : result;
}

/**
 *
 * @param machine The machine that is currently running
 * @param currentStateObject The current state of the machine
 * @param transition The transition that we want to execute
 * @returns boolean true if the transition can be executed, false otherwise
 */
export function canMakeTransition(
  machine: Machine,
  currentStateObject: StateDirective,
  transition: string
): boolean {
  if (!isValidString(transition)) {
    throw new Error(`Invalid transition: ${transition}`);
  }

  let trimmedTransition = transition.trim();

  // If the transition is the START_EVENT we will return true if the current state is the initial state and we have no history
  if (trimmedTransition === START_EVENT) {
    return (
      currentStateObject.name === machine.initial &&
      machine.history.length === 1
    );
  }

  // Check if we have a normal transition or a nested transition (nested transitions are dot separated)
  if (
    isNestedTransition(trimmedTransition) ||
    isParallelTransition(trimmedTransition)
  ) {
    // Get the nested transition parts
    let transitionParts = isNestedTransition(trimmedTransition)
      ? trimmedTransition.split(".")
      : trimmedTransition.split("/");
    // The first part must be the current state
    let stateName = transitionParts.shift();
    // The second part must be the transition
    let transitionName = isNestedTransition(trimmedTransition)
      ? transitionParts.join(".")
      : transitionParts.join("/");

    // If we have no stateName, we can't make a transition
    if (!stateName) {
      return false;
    }

    // If the stateName is in the parallel object check if we can make the transition in the parallel machine
    if (stateName in machine.parallel) {
      let parallelMachine = machine.parallel[stateName];
      return canMakeTransition(
        parallelMachine,
        parallelMachine.states[parallelMachine.current],
        transitionName
      );
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
      if (
        canMakeTransition(
          nestedMachine.machine,
          nestedMachine.machine.states[nestedMachine.machine.current],
          transitionName
        )
      ) {
        return true;
      }
    }
  }

  // If we get here, we have a normal transition
  return hasTransition(currentStateObject, trimmedTransition);
}

export const titleToId = (str: string) =>
  str.toLowerCase().replace(/(\s|\W)/g, "");

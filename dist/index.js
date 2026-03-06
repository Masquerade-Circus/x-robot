"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// lib/index.ts
var lib_exports = {};
__export(lib_exports, {
  context: () => context,
  dangerState: () => dangerState,
  description: () => description,
  entry: () => entry,
  exit: () => exit,
  getState: () => getState,
  guard: () => guard,
  history: () => history,
  immediate: () => immediate,
  infoState: () => infoState,
  init: () => init,
  initial: () => initial,
  invoke: () => invoke,
  invokeAfter: () => invokeAfter,
  machine: () => machine,
  nested: () => nested,
  nestedGuard: () => nestedGuard,
  parallel: () => parallel,
  primaryState: () => primaryState,
  shouldFreeze: () => shouldFreeze,
  snapshot: () => snapshot,
  start: () => start,
  state: () => state,
  successState: () => successState,
  transition: () => transition,
  warningState: () => warningState
});
module.exports = __toCommonJS(lib_exports);

// lib/machine/interfaces.ts
var START_EVENT = "__start__";

// lib/utils/utils.ts
function isValidString(str) {
  return str !== null && typeof str === "string" && str.trim().length > 0;
}
function isValidObject(obj) {
  return obj !== null && typeof obj === "object";
}
function isEntry(entry2) {
  return isValidObject(entry2) && "pulse" in entry2;
}
function isExit(exit2) {
  return isValidObject(exit2) && "exit" in exit2;
}
function isImmediate(immediate2) {
  return isValidObject(immediate2) && "immediate" in immediate2;
}
function isGuard(guard2) {
  return isValidObject(guard2) && "guard" in guard2;
}
function isNestedGuard(guard2) {
  return isGuard(guard2) && "machine" in guard2;
}
function isTransition(transition2) {
  return isValidObject(transition2) && "transition" in transition2 && "target" in transition2;
}
function hasTransition(state2, transition2) {
  return isValidString(transition2) && transition2 in state2.on;
}
function isNestedMachineDirective(machine2) {
  return isValidObject(machine2) && "machine" in machine2;
}
function isNestedMachineWithTransitionDirective(machine2) {
  return isNestedMachineDirective(machine2) && isValidString(machine2.transition);
}
function isMachine(machine2) {
  return isValidObject(machine2) && "states" in machine2 && "initial" in machine2 && "current" in machine2;
}
function isStateDirective(state2) {
  return isValidObject(state2) && "name" in state2 && "run" in state2 && "on" in state2 && "args" in state2;
}
function isContextDirective(context2) {
  return isValidObject(context2) && "context" in context2;
}
function isStatesDirective(states) {
  return isValidObject(states) && Object.keys(states).every((key) => isValidString(key)) && Object.values(states).every((state2) => isStateDirective(state2));
}
function isParallelDirective(parallel2) {
  return isValidObject(parallel2) && "parallel" in parallel2;
}
function isShouldFreezeDirective(shouldFreeze2) {
  return isValidObject(shouldFreeze2) && "freeze" in shouldFreeze2;
}
function isInitialDirective(initial2) {
  return isValidObject(initial2) && "initial" in initial2;
}
function isHistoryDirective(history2) {
  return isValidObject(history2) && "history" in history2 && typeof history2.history === "number" && history2.history >= 0;
}
function isInitDirective(init2) {
  if (!isValidObject(init2))
    return false;
  const hasInitial = "initial" in init2;
  const hasContext = "context" in init2;
  const hasFreeze = "freeze" in init2;
  const hasHistory = "history" in init2;
  return hasInitial || hasContext || hasFreeze || hasHistory;
}
function isDescriptionDirective(description2) {
  return isValidObject(description2) && "description" in description2;
}
function isNestedTransition(transition2) {
  return isValidString(transition2) && /^\w+\..+$/gi.test(transition2);
}
function isParallelTransition(transition2) {
  return isValidString(transition2) && /^\w+\/.+$/gi.test(transition2);
}
function isNestedImmediateDirective(immediate2) {
  return isImmediate(immediate2) && isNestedTransition(immediate2.immediate);
}
function isParallelImmediateDirective(immediate2) {
  return isImmediate(immediate2) && isParallelTransition(immediate2.immediate);
}
function deepFreeze(obj, freezeClassInstances = false, seen = /* @__PURE__ */ new WeakSet()) {
  if (obj === null || typeof obj !== "object" || seen.has(obj) || Object.isFrozen(obj)) {
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
function isPlainObject(value) {
  if (!value || typeof value !== "object") {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
function canUseStructuredClone(value) {
  if (typeof structuredClone !== "function") {
    return false;
  }
  if (typeof Buffer !== "undefined" && value instanceof Buffer) {
    return false;
  }
  return Array.isArray(value) || isPlainObject(value) || value instanceof Date || value instanceof RegExp || value instanceof Map || value instanceof Set || value instanceof ArrayBuffer || ArrayBuffer.isView(value);
}
function deepCloneUnfreeze(obj, cloneClassInstances = false, seen = /* @__PURE__ */ new WeakMap()) {
  if (typeof obj === "undefined" || obj === null || typeof obj !== "object") {
    return obj;
  }
  const source = obj;
  if (seen.has(source)) {
    return seen.get(source);
  }
  if (canUseStructuredClone(source)) {
    const cloned = structuredClone(source);
    seen.set(source, cloned);
    return cloned;
  }
  let clone;
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
      clone = /* @__PURE__ */ new Map();
      seen.set(source, clone);
      for (const [key, value] of source.entries()) {
        clone.set(deepCloneUnfreeze(key, cloneClassInstances, seen), deepCloneUnfreeze(value, cloneClassInstances, seen));
      }
      return clone;
    }
    case source instanceof Set: {
      clone = /* @__PURE__ */ new Set();
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
    case (typeof Buffer !== "undefined" && source instanceof Buffer): {
      clone = Buffer.from(source);
      seen.set(source, clone);
      return clone;
    }
    case source instanceof Error: {
      clone = new source.constructor(source.message);
      seen.set(source, clone);
      break;
    }
    case (source instanceof Promise || source instanceof WeakMap || source instanceof WeakSet): {
      clone = source;
      seen.set(source, clone);
      return clone;
    }
    case (source.constructor && source.constructor !== Object): {
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
        clone[key] = deepCloneUnfreeze(source[key], cloneClassInstances, seen);
      }
      return clone;
    }
  }
  const descriptors = Object.getOwnPropertyDescriptors(source);
  for (const key of Reflect.ownKeys(descriptors)) {
    const descriptor = descriptors[key];
    if ("value" in descriptor) {
      descriptor.value = deepCloneUnfreeze(descriptor.value, cloneClassInstances, seen);
    }
    Object.defineProperty(clone, key, descriptor);
  }
  return clone;
}
function canMakeTransition(machine2, currentStateObject, transition2) {
  if (!isValidString(transition2)) {
    throw new Error(`Invalid transition: ${transition2}`);
  }
  let trimmedTransition = transition2.trim();
  if (trimmedTransition === START_EVENT) {
    return currentStateObject.name === machine2.initial && machine2.history.length === 1;
  }
  if (isNestedTransition(trimmedTransition) || isParallelTransition(trimmedTransition)) {
    let transitionParts = isNestedTransition(trimmedTransition) ? trimmedTransition.split(".") : trimmedTransition.split("/");
    let stateName = transitionParts.shift();
    let transitionName = isNestedTransition(trimmedTransition) ? transitionParts.join(".") : transitionParts.join("/");
    if (!stateName) {
      return false;
    }
    if (stateName in machine2.parallel) {
      let parallelMachine = machine2.parallel[stateName];
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
var titleToId = (str) => str.toLowerCase().replace(/(\s|\W)/g, "");

// lib/machine/create.ts
function init(...directives) {
  let initObj = {};
  for (const directive of directives) {
    if (isInitialDirective(directive)) {
      if (initObj.initial) {
        throw new Error("Cannot have more than one initial directive in init");
      }
      initObj.initial = directive;
    } else if (isContextDirective(directive)) {
      if (initObj.context) {
        throw new Error("Cannot have more than one context directive in init");
      }
      initObj.context = directive;
    } else if (isShouldFreezeDirective(directive)) {
      if (initObj.freeze) {
        throw new Error("Cannot have more than one shouldFreeze directive in init");
      }
      initObj.freeze = directive;
    } else if (isHistoryDirective(directive)) {
      if (initObj.history) {
        throw new Error("Cannot have more than one history directive in init");
      }
      initObj.history = directive;
    }
  }
  return initObj;
}
function machine(title, ...args) {
  let myMachine = {
    id: titleToId(title || "x-robot"),
    title,
    states: {},
    context: {},
    initial: "",
    current: "",
    frozen: true,
    isAsync: false,
    history: [],
    historyLimit: 10,
    parallel: {}
  };
  let foundInit = null;
  let firstStateName = null;
  for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    if (isInitDirective(arg)) {
      if (foundInit !== null) {
        throw new Error("Cannot have more than one init directive");
      }
      foundInit = arg;
    }
    if (isStateDirective(arg)) {
      if (!firstStateName) {
        firstStateName = arg.name;
      }
    }
  }
  for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    if (isInitDirective(arg)) {
      if (arg.history) {
        myMachine.historyLimit = arg.history.history;
      }
      if (arg.initial) {
        myMachine.initial = arg.initial.initial;
        myMachine.current = myMachine.initial;
        if (myMachine.historyLimit !== 0) {
          myMachine.history.push(`${"State" /* State */}: ${myMachine.initial}`);
        }
      }
      if (arg.context) {
        let newContext = typeof arg.context.context === "function" ? arg.context.context() : arg.context.context;
        if (!isValidObject(newContext)) {
          throw new Error("The context passed to the machine must be an object or a function that returns an object.");
        }
        myMachine.context = { ...myMachine.context, ...newContext };
      }
      if (arg.freeze) {
        myMachine.frozen = arg.freeze.freeze;
      }
      continue;
    }
    if (isParallelDirective(arg)) {
      myMachine.parallel = { ...myMachine.parallel, ...arg.parallel };
      continue;
    }
    if (isStateDirective(arg)) {
      myMachine.states[arg.name] = arg;
      continue;
    }
    if (isStatesDirective(arg)) {
      throw new Error("states() wrapper is no longer supported. Pass states directly to machine().");
    }
  }
  if (!myMachine.initial && firstStateName) {
    myMachine.initial = firstStateName;
    myMachine.current = myMachine.initial;
    if (myMachine.historyLimit !== 0) {
      myMachine.history.push(`${"State" /* State */}: ${myMachine.initial}`);
    }
  }
  if (myMachine.frozen) {
    deepFreeze(myMachine.context);
  }
  for (let state2 in myMachine.states) {
    if (myMachine.states[state2].run.length > 0) {
      let hasAsyncPulse = myMachine.states[state2].run.some((item) => isEntry(item) && typeof item.pulse === "function" && item.pulse.constructor.name === "AsyncFunction");
      if (hasAsyncPulse) {
        myMachine.isAsync = true;
        break;
      }
    }
  }
  if (myMachine.isAsync === false) {
    for (let state2 in myMachine.states) {
      if (myMachine.states[state2].nested.length > 0) {
        for (let nestedMachine of myMachine.states[state2].nested) {
          if (nestedMachine.machine.isAsync) {
            myMachine.isAsync = true;
            break;
          }
        }
      }
    }
  }
  if (myMachine.isAsync === false) {
    for (let parallel2 in myMachine.parallel) {
      if (myMachine.parallel[parallel2].isAsync) {
        myMachine.isAsync = true;
        break;
      }
    }
  }
  return myMachine;
}
function parallel(...machines) {
  let obj = { parallel: {} };
  for (let machine2 of machines) {
    obj.parallel[machine2.id] = machine2;
  }
  return obj;
}
function context(context2) {
  return {
    context: context2
  };
}
function initial(initial2) {
  return {
    initial: initial2
  };
}
function shouldFreeze(freeze) {
  return {
    freeze
  };
}
function history(limit) {
  if (limit < 0) {
    throw new Error("History limit must be >= 0");
  }
  return {
    history: limit
  };
}
function state(name, ...args) {
  let run = [];
  let on = {};
  let immediate2 = [];
  let nested2 = [];
  let description2;
  for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    if (isNestedMachineDirective(arg)) {
      nested2.push(arg);
    } else if (isEntry(arg)) {
      run.push(arg);
      if (arg.success) {
        let successTransition = arg.success;
        if (isValidString(successTransition) && hasTransition({ on }, successTransition) === false) {
          on[successTransition] = {
            transition: successTransition,
            target: successTransition,
            guards: []
          };
        } else if (typeof successTransition === "object" && "transition" in successTransition) {
          let transitionValue = successTransition.transition;
          if (isValidString(transitionValue) && hasTransition({ on }, transitionValue) === false) {
            on[transitionValue] = {
              transition: transitionValue,
              target: transitionValue,
              guards: []
            };
          }
        }
      }
      if (arg.transition) {
        let transitionValue = arg.transition;
        if (isValidString(transitionValue) && hasTransition({ on }, transitionValue) === false) {
          on[transitionValue] = {
            transition: transitionValue,
            target: transitionValue,
            guards: []
          };
        }
      }
      if (arg.failure) {
        let failureTransition = arg.failure;
        if (isValidString(failureTransition) && hasTransition({ on }, failureTransition) === false) {
          on[failureTransition] = {
            transition: failureTransition,
            target: failureTransition,
            guards: []
          };
        } else if (typeof failureTransition === "object" && "transition" in failureTransition) {
          let transitionValue = failureTransition.transition;
          if (isValidString(transitionValue) && hasTransition({ on }, transitionValue) === false) {
            on[transitionValue] = {
              transition: transitionValue,
              target: transitionValue,
              guards: []
            };
          }
        }
      }
    } else if (isImmediate(arg)) {
      immediate2.push(arg);
      let transition2 = arg.immediate;
      let guards = arg.guards;
      if (!isNestedImmediateDirective(arg) && !isParallelImmediateDirective(arg)) {
        on[transition2] = { target: transition2, transition: transition2, guards };
      }
    } else if (isTransition(arg)) {
      on[arg.transition] = arg;
    } else if (isDescriptionDirective(arg)) {
      description2 = arg.description;
    }
  }
  return {
    name,
    nested: nested2,
    run,
    on,
    immediate: immediate2,
    args,
    type: "default",
    description: description2
  };
}
function transition(transitionName, target, ...args) {
  let guards = [];
  let exit2;
  for (const arg of args) {
    if (isGuard(arg)) {
      guards.push(arg);
    } else if (Array.isArray(arg)) {
      guards = arg;
    } else if (isExit(arg)) {
      exit2 = arg.exit;
    }
  }
  return {
    transition: transitionName,
    target,
    guards,
    exit: exit2
  };
}
function entry(pulse, success, failure) {
  let successValue = success;
  if (success && typeof success === "object" && "pulse" in success) {
    const innerPulse = success;
    successValue = {
      pulse: innerPulse.pulse,
      failure: innerPulse.failure,
      transition: innerPulse.success
    };
  }
  let failureValue = failure;
  if (failure && typeof failure === "object" && "pulse" in failure) {
    const innerPulse = failure;
    failureValue = {
      pulse: innerPulse.pulse,
      failure: innerPulse.failure,
      transition: innerPulse.success
    };
  }
  return {
    pulse,
    success: successValue,
    failure: failureValue
  };
}
function exit(handler, failure) {
  return {
    exit: [
      {
        pulse: handler,
        failure
      }
    ]
  };
}
function guard(guard2, failure) {
  return {
    guard: guard2,
    failure
  };
}
function immediate(target, ...guards) {
  return {
    immediate: target,
    guards
  };
}
function nestedGuard(machine2, guard2, failure) {
  return {
    guard: guard2,
    machine: machine2,
    failure
  };
}
function nested(machine2, transition2) {
  return {
    machine: machine2,
    transition: transition2
  };
}
function description(description2) {
  return {
    description: description2
  };
}
function infoState(name, ...args) {
  let stateObject = state(name, ...args);
  stateObject.type = "info";
  return stateObject;
}
function primaryState(name, ...args) {
  let stateObject = state(name, ...args);
  stateObject.type = "primary";
  return stateObject;
}
function successState(name, ...args) {
  let stateObject = state(name, ...args);
  stateObject.type = "success";
  return stateObject;
}
function warningState(name, ...args) {
  let stateObject = state(name, ...args);
  stateObject.type = "warning";
  return stateObject;
}
function dangerState(name, ...args) {
  let stateObject = state(name, ...args);
  stateObject.type = "danger";
  return stateObject;
}
function getState(machine2, path) {
  if (!isMachine(machine2)) {
    return null;
  }
  if (!isValidString(path)) {
    let result = {};
    if (Object.keys(machine2.parallel).length > 0) {
      for (let parallelName in machine2.parallel) {
        result[parallelName] = getState(machine2.parallel[parallelName]);
      }
    }
    if (isValidString(machine2.current)) {
      result.current = machine2.current;
    }
    if (isValidString(result.current) && Object.keys(result).length === 1) {
      return result.current;
    }
    if (Object.keys(result).length > 0) {
      return result;
    }
    return null;
  }
  let pathParts = path.split(".");
  let stateName = pathParts.shift();
  if (!isValidString(stateName)) {
    return null;
  }
  if (stateName in machine2.parallel) {
    return getState(machine2.parallel[stateName], pathParts.join("."));
  }
  if (stateName in machine2.states) {
    let obj = {};
    for (let nested2 of machine2.states[stateName].nested) {
      obj[nested2.machine.id] = getState(nested2.machine, pathParts.join("."));
    }
    if (Object.keys(obj).length === 0) {
      return null;
    }
    if (Object.keys(obj).length === 1) {
      return obj[Object.keys(obj)[0]];
    }
    return obj;
  }
  let nestedMachineId = stateName;
  for (stateName in machine2.states) {
    for (let nested2 of machine2.states[stateName].nested) {
      if (nested2.machine.id === nestedMachineId) {
        return getState(nested2.machine, pathParts.join("."));
      }
    }
  }
  return null;
}

// lib/machine/invoke.ts
function addToHistory(machine2, entry2) {
  if (machine2.historyLimit === void 0)
    return;
  if (machine2.historyLimit === 0)
    return;
  machine2.history.push(entry2);
  if (machine2.history.length > machine2.historyLimit) {
    machine2.history.shift();
  }
}
function runPulse(machine2, pulse, payload) {
  if (isEntry(pulse)) {
    const isAsync = pulse.pulse.constructor.name === "AsyncFunction";
    addToHistory(machine2, isAsync ? `${"Async Pulse" /* AsyncPulse */}: ${pulse.pulse.name}` : `${"Pulse" /* Pulse */}: ${pulse.pulse.name}`);
    let context2 = machine2.context;
    if (machine2.frozen) {
      context2 = deepCloneUnfreeze(context2);
    }
    if (isAsync) {
      const runPulseFn = () => pulse.pulse(context2, payload);
      return Promise.resolve(runPulseFn()).then((result) => {
        if (isValidObject(result)) {
          context2 = result;
        }
        machine2.context = context2;
        if (machine2.frozen) {
          deepFreeze(machine2.context);
        }
        if (pulse.success) {
          if (isEntry(pulse.success)) {
            return runPulse(machine2, pulse.success);
          }
          return invoke(machine2, pulse.success);
        } else if (pulse.transition) {
          return invoke(machine2, pulse.transition);
        }
      }).catch((error) => {
        machine2.context = context2;
        if (machine2.frozen) {
          deepFreeze(machine2.context);
        }
        if (pulse.failure) {
          if (isEntry(pulse.failure)) {
            return runPulse(machine2, pulse.failure, error);
          }
          return invoke(machine2, pulse.failure, error);
        }
        throw error;
      });
    } else {
      try {
        const result = pulse.pulse(context2, payload);
        if (isValidObject(result)) {
          context2 = result;
        }
        machine2.context = context2;
        if (machine2.frozen) {
          deepFreeze(machine2.context);
        }
        if (pulse.success) {
          if (isEntry(pulse.success)) {
            return runPulse(machine2, pulse.success);
          }
          return invoke(machine2, pulse.success);
        } else if (pulse.transition) {
          return invoke(machine2, pulse.transition);
        }
      } catch (error) {
        machine2.context = context2;
        if (machine2.frozen) {
          deepFreeze(machine2.context);
        }
        if (pulse.failure) {
          if (isEntry(pulse.failure)) {
            return runPulse(machine2, pulse.failure, error);
          }
          return invoke(machine2, pulse.failure, error);
        }
        throw error;
      }
    }
  } else if (isValidString(pulse)) {
    return invoke(machine2, pulse);
  }
}
function hasFatalError(machine2) {
  return machine2.fatal instanceof Error;
}
function catchError(machine2, state2, error) {
  if (machine2.frozen) {
    machine2.context = deepCloneUnfreeze(machine2.context);
  }
  machine2.context.error = error;
  if (hasTransition(state2, "error")) {
    return invoke(machine2, "error", error);
  }
  if ("fatal" in machine2.states) {
    machine2.current = "fatal";
    machine2.fatal = error;
    return;
  }
  machine2.fatal = error;
  throw error;
}
async function runStatePulsesAsync(machine2, state2, payload) {
  for (let i = 0; i < state2.run.length; i++) {
    const item = state2.run[i];
    try {
      if (isEntry(item)) {
        await runPulse(machine2, item, payload);
      }
    } catch (error) {
      await catchError(machine2, state2, error);
      return;
    }
  }
}
function runStatePulsesSync(machine2, state2, payload) {
  for (let i = 0; i < state2.run.length; i++) {
    const item = state2.run[i];
    try {
      if (isEntry(item)) {
        runPulse(machine2, item, payload);
      }
    } catch (error) {
      catchError(machine2, state2, error);
      break;
    }
  }
}
function runGuards(machine2, state2, transition2, payload) {
  return runGuardsFromIndex(machine2, state2, transition2, payload, 0);
}
function runGuardsFromIndex(machine2, state2, transition2, payload, startIndex) {
  for (let i = startIndex; i < transition2.guards.length; i++) {
    let guard2 = transition2.guards[i];
    try {
      if (!isGuard(guard2)) {
        return false;
      }
      addToHistory(machine2, `${"Guard" /* Guard */}: ${guard2.guard.name}`);
      let guardContext = machine2.context;
      if (machine2.frozen) {
        guardContext = deepCloneUnfreeze(machine2.context);
      }
      let result;
      if (isNestedGuard(guard2)) {
        result = guard2.guard(guard2.machine.context, payload);
      } else {
        result = guard2.guard(guardContext, payload);
      }
      if (result instanceof Promise) {
        return result.then((resolvedResult) => {
          if (resolvedResult !== true) {
            if (isValidString(guard2.failure)) {
              invoke(machine2, guard2.failure, resolvedResult);
            } else if (isEntry(guard2.failure)) {
              runPulse(machine2, guard2.failure, resolvedResult);
            } else if (isValidString(resolvedResult)) {
              if (machine2.frozen) {
                machine2.context = deepCloneUnfreeze(machine2.context);
              }
              machine2.context.error = resolvedResult;
            }
            return false;
          }
          if (machine2.frozen && guardContext !== machine2.context) {
            machine2.context = guardContext;
            deepFreeze(machine2.context);
          }
          return runGuardsFromIndex(machine2, state2, transition2, payload, i + 1);
        });
      }
      if (result !== true) {
        if (isValidString(guard2.failure)) {
          invoke(machine2, guard2.failure, result);
        } else if (isEntry(guard2.failure)) {
          runPulse(machine2, guard2.failure, result);
        } else if (isValidString(result)) {
          if (machine2.frozen) {
            machine2.context = deepCloneUnfreeze(machine2.context);
          }
          machine2.context.error = result;
        }
        return false;
      }
    } catch (error) {
      catchError(machine2, state2, error);
      return false;
    }
  }
  return true;
}
function runNestedMachines(machine2, state2, payload) {
  if (state2.nested.length === 0) {
    return;
  }
  let promise;
  if (machine2.isAsync) {
    promise = Promise.resolve();
  }
  for (let nestedMachine of state2.nested) {
    if (isNestedMachineWithTransitionDirective(nestedMachine)) {
      let transition2 = nestedMachine.transition;
      if (promise) {
        promise = promise.then(() => invoke(nestedMachine.machine, transition2, payload));
      } else {
        invoke(nestedMachine.machine, transition2, payload);
      }
    }
  }
  return promise || void 0;
}
function runNestedTransition(machine2, transition2, payload) {
  let nestedTransitionParts = transition2.split(".");
  let stateName = nestedTransitionParts.shift();
  let nestedTransition = nestedTransitionParts.join(".");
  let promise = machine2.isAsync ? Promise.resolve() : null;
  if (!stateName) {
    return;
  }
  let currentStateObject = machine2.states[machine2.current];
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
  if (promise) {
    promise = promise.then(() => invokeImmediateDirectives(machine2, currentStateObject, payload));
  } else {
    invokeImmediateDirectives(machine2, currentStateObject, payload);
  }
  return promise || void 0;
}
function runParallelTransition(machine2, transition2, payload) {
  let parallelTransitionParts = transition2.split("/");
  let parallelMachineId = parallelTransitionParts.shift();
  let parallelTransition = parallelTransitionParts.join("/");
  if (!parallelMachineId) {
    throw new Error(`Invalid transition ${transition2}`);
  }
  let parallelMachine = machine2.parallel[parallelMachineId];
  if (!parallelMachine) {
    throw new Error(`Invalid transition ${transition2}`);
  }
  return invoke(parallelMachine, parallelTransition, payload);
}
function invokeImmediateDirectives(machine2, state2, payload) {
  if (state2.immediate.length === 0) {
    return;
  }
  let immediate2 = state2.immediate;
  let promise = machine2.isAsync ? Promise.resolve() : null;
  for (let immediateDirective of immediate2) {
    if (hasFatalError(machine2)) {
      return;
    }
    if (isParallelTransition(immediateDirective.immediate)) {
      let transitionParts = immediateDirective.immediate.split("/");
      let parallelMachineId = transitionParts.shift();
      let parallelTransition = transitionParts.join("/");
      let parallelMachine = machine2.parallel[parallelMachineId];
      if (promise) {
        promise = promise.then(() => invoke(parallelMachine, parallelTransition, payload));
      } else {
        invoke(parallelMachine, parallelTransition, payload);
      }
    } else if (isNestedTransition(immediateDirective.immediate)) {
      if (promise) {
        promise = promise.then(() => invoke(machine2, immediateDirective.immediate, payload));
      } else {
        invoke(machine2, immediateDirective.immediate, payload);
      }
    } else {
      if (promise) {
        promise = promise.then(async () => {
          if (machine2.current === state2.name) {
            await invoke(machine2, immediateDirective.immediate, payload);
          }
        });
      } else {
        if (machine2.current === state2.name) {
          invoke(machine2, immediateDirective.immediate, payload);
        }
      }
    }
  }
  return promise || void 0;
}
function invoke(machine2, transition2, payload) {
  if (hasFatalError(machine2)) {
    return;
  }
  if (isValidString(transition2) === false) {
    throw new Error(`Trying to invoke a transition with an invalid string: ${transition2}`);
  }
  let trimmedTransition = transition2.trim();
  if (trimmedTransition === START_EVENT) {
    transition2 = machine2.initial;
  }
  let currentStateObject = machine2.states[machine2.current];
  let hasTransition2 = canMakeTransition(machine2, currentStateObject, trimmedTransition);
  if (!hasTransition2) {
    throw new Error(`The transition '${trimmedTransition}' does not exist in the current state '${machine2.current}'`);
  }
  if (isParallelTransition(trimmedTransition)) {
    return runParallelTransition(machine2, trimmedTransition, payload);
  }
  if (isNestedTransition(trimmedTransition)) {
    return runNestedTransition(machine2, trimmedTransition, payload);
  }
  if (trimmedTransition !== START_EVENT) {
    addToHistory(machine2, `${"Transition" /* Transition */}: ${trimmedTransition}`);
    let transitionObject = currentStateObject.on[trimmedTransition];
    let guardsResult = runGuards(machine2, currentStateObject, transitionObject, payload);
    if (guardsResult instanceof Promise) {
      return guardsResult.then((shouldContinue) => {
        if (shouldContinue === false) {
          addToHistory(machine2, `${"State" /* State */}: ${currentStateObject.name}`);
          return;
        }
        return handleExitAndContinue(machine2, currentStateObject, transitionObject, trimmedTransition, payload);
      });
    }
    if (guardsResult === false) {
      addToHistory(machine2, `${"State" /* State */}: ${currentStateObject.name}`);
      return;
    }
    return handleExitAndContinue(machine2, currentStateObject, transitionObject, trimmedTransition, payload);
  }
  return continueTransition(machine2, currentStateObject, trimmedTransition, payload);
}
function handleExitAndContinue(machine2, currentStateObject, transitionObject, trimmedTransition, payload) {
  const exitItems = transitionObject.exit;
  if (exitItems && Array.isArray(exitItems)) {
    const pulsesToRun = Array.isArray(exitItems[0]) ? exitItems[0] : exitItems;
    for (const exitItem of pulsesToRun) {
      if (machine2.isAsync) {
        let promise = Promise.resolve();
        promise = promise.then(() => runPulse(machine2, exitItem, payload));
        return promise.then(() => {
          return continueTransition(machine2, currentStateObject, trimmedTransition, payload);
        });
      } else {
        runPulse(machine2, exitItem, payload);
      }
    }
    return continueTransition(machine2, currentStateObject, trimmedTransition, payload);
  }
  return continueTransition(machine2, currentStateObject, trimmedTransition, payload);
}
function continueTransition(machine2, currentStateObject, trimmedTransition, payload) {
  let targetState = trimmedTransition === START_EVENT ? machine2.initial : currentStateObject.on[trimmedTransition].target;
  if (isValidString(targetState) === false) {
    throw new Error(`Trying to invoke a transition with an invalid target state: ${targetState}`);
  }
  if (targetState in machine2.states === false) {
    throw new Error(`Invalid target state '${targetState}' for '${machine2.current}.${trimmedTransition}' transition`);
  }
  let targetStateObject = machine2.states[targetState];
  if (trimmedTransition !== START_EVENT) {
    machine2.current = targetState;
    addToHistory(machine2, `${"State" /* State */}: ${targetState}`);
  }
  if (machine2.isAsync) {
    let promise = Promise.resolve();
    promise = promise.then(() => runNestedMachines(machine2, targetStateObject, payload));
    promise = promise.then(() => runStatePulsesAsync(machine2, targetStateObject, payload));
    promise = promise.then(() => invokeImmediateDirectives(machine2, targetStateObject, payload));
    return promise;
  }
  runNestedMachines(machine2, targetStateObject, payload);
  runStatePulsesSync(machine2, targetStateObject, payload);
  invokeImmediateDirectives(machine2, targetStateObject, payload);
}
function start(machine2, snapshotOrPayload) {
  if (snapshotOrPayload && typeof snapshotOrPayload === "object" && "current" in snapshotOrPayload) {
    return restoreFromSnapshot(machine2, snapshotOrPayload);
  }
  let canStartMachine = canMakeTransition(machine2, machine2.states[machine2.current], START_EVENT);
  if (!canStartMachine) {
    throw new Error(`The machine has already been started.`);
  }
  return invoke(machine2, START_EVENT, snapshotOrPayload);
}
function restoreFromSnapshot(machine2, snapshot2) {
  machine2.current = snapshot2.current;
  machine2.context = deepCloneUnfreeze(snapshot2.context);
  machine2.history = [...snapshot2.history];
  if (machine2.historyLimit !== 0 && machine2.history.length > 0) {
    const lastEntry = machine2.history[machine2.history.length - 1];
    if (!lastEntry.startsWith("State: ")) {
      machine2.history.push(`${"State" /* State */}: ${snapshot2.current}`);
    }
  }
  if (snapshot2.parallel) {
    for (let parallelName in snapshot2.parallel) {
      if (machine2.parallel[parallelName]) {
        restoreFromSnapshot(machine2.parallel[parallelName], snapshot2.parallel[parallelName]);
      }
    }
  }
  if (snapshot2.nested) {
    for (let stateName in snapshot2.nested) {
      const state2 = machine2.states[stateName];
      if (state2 && state2.nested) {
        for (let nested2 of state2.nested) {
          if (snapshot2.nested[stateName] && snapshot2.nested[stateName][nested2.machine.id]) {
            restoreFromSnapshot(nested2.machine, snapshot2.nested[stateName][nested2.machine.id]);
          }
        }
      }
    }
  }
}
function invokeAfter(machine2, timeInMilliseconds, event, payload) {
  const timeoutId = setTimeout(() => {
    invoke(machine2, event, payload);
  }, timeInMilliseconds);
  return () => clearTimeout(timeoutId);
}
function snapshot(machine2) {
  const snap = {
    current: machine2.current,
    context: deepCloneUnfreeze(machine2.context),
    history: [...machine2.history]
  };
  if (Object.keys(machine2.parallel).length > 0) {
    snap.parallel = {};
    for (let parallelName in machine2.parallel) {
      snap.parallel[parallelName] = snapshot(machine2.parallel[parallelName]);
    }
  }
  for (let stateName in machine2.states) {
    const state2 = machine2.states[stateName];
    if (state2.nested && state2.nested.length > 0) {
      if (!snap.nested) {
        snap.nested = {};
      }
      snap.nested[stateName] = {};
      for (let nested2 of state2.nested) {
        snap.nested[stateName][nested2.machine.id] = snapshot(nested2.machine);
      }
    }
  }
  return snap;
}

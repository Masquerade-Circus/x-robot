// lib/machine/interfaces.ts
var START_EVENT = "__start__";

// lib/utils/utils.ts
function isValidString(str) {
  return str !== null && typeof str === "string" && str.trim().length > 0;
}
function isValidObject(obj) {
  return obj !== null && typeof obj === "object";
}
function isEntry(entry) {
  return isValidObject(entry) && "pulse" in entry;
}
function isGuard(guard) {
  return isValidObject(guard) && "guard" in guard;
}
function isNestedGuard(guard) {
  return isGuard(guard) && "machine" in guard;
}
function hasTransition(state, transition) {
  return isValidString(transition) && transition in state.on;
}
function isNestedMachineDirective(machine) {
  return isValidObject(machine) && "machine" in machine;
}
function isNestedMachineWithTransitionDirective(machine) {
  return isNestedMachineDirective(machine) && isValidString(machine.transition);
}
function isNestedTransition(transition) {
  return isValidString(transition) && /^\w+\..+$/gi.test(transition);
}
function isParallelTransition(transition) {
  return isValidString(transition) && /^\w+\/.+$/gi.test(transition);
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

// lib/machine/invoke.ts
function addToHistory(machine, entry) {
  if (machine.historyLimit === void 0)
    return;
  if (machine.historyLimit === 0)
    return;
  machine.history.push(entry);
  if (machine.history.length > machine.historyLimit) {
    machine.history.shift();
  }
}
function runPulse(machine, pulse, payload) {
  if (isEntry(pulse)) {
    const isAsync = pulse.pulse.constructor.name === "AsyncFunction";
    addToHistory(machine, isAsync ? `${"Async Pulse" /* AsyncPulse */}: ${pulse.pulse.name}` : `${"Pulse" /* Pulse */}: ${pulse.pulse.name}`);
    let context = machine.context;
    if (machine.frozen) {
      context = deepCloneUnfreeze(context);
    }
    if (isAsync) {
      const runPulseFn = () => pulse.pulse(context, payload);
      return Promise.resolve(runPulseFn()).then((result) => {
        if (isValidObject(result)) {
          context = result;
        }
        machine.context = context;
        if (machine.frozen) {
          deepFreeze(machine.context);
        }
        if (pulse.success) {
          if (isEntry(pulse.success)) {
            return runPulse(machine, pulse.success);
          }
          return invoke(machine, pulse.success);
        } else if (pulse.transition) {
          return invoke(machine, pulse.transition);
        }
      }).catch((error) => {
        machine.context = context;
        if (machine.frozen) {
          deepFreeze(machine.context);
        }
        if (pulse.failure) {
          if (isEntry(pulse.failure)) {
            return runPulse(machine, pulse.failure, error);
          }
          return invoke(machine, pulse.failure, error);
        }
        throw error;
      });
    } else {
      try {
        const result = pulse.pulse(context, payload);
        if (isValidObject(result)) {
          context = result;
        }
        machine.context = context;
        if (machine.frozen) {
          deepFreeze(machine.context);
        }
        if (pulse.success) {
          if (isEntry(pulse.success)) {
            return runPulse(machine, pulse.success);
          }
          return invoke(machine, pulse.success);
        } else if (pulse.transition) {
          return invoke(machine, pulse.transition);
        }
      } catch (error) {
        machine.context = context;
        if (machine.frozen) {
          deepFreeze(machine.context);
        }
        if (pulse.failure) {
          if (isEntry(pulse.failure)) {
            return runPulse(machine, pulse.failure, error);
          }
          return invoke(machine, pulse.failure, error);
        }
        throw error;
      }
    }
  } else if (isValidString(pulse)) {
    return invoke(machine, pulse);
  }
}
function hasFatalError(machine) {
  return machine.fatal instanceof Error;
}
function catchError(machine, state, error) {
  if (machine.frozen) {
    machine.context = deepCloneUnfreeze(machine.context);
  }
  machine.context.error = error;
  if (hasTransition(state, "error")) {
    return invoke(machine, "error", error);
  }
  if ("fatal" in machine.states) {
    machine.current = "fatal";
    machine.fatal = error;
    return;
  }
  machine.fatal = error;
  throw error;
}
async function runStatePulsesAsync(machine, state, payload) {
  for (let i = 0; i < state.run.length; i++) {
    const item = state.run[i];
    try {
      if (isEntry(item)) {
        await runPulse(machine, item, payload);
      }
    } catch (error) {
      await catchError(machine, state, error);
      return;
    }
  }
}
function runStatePulsesSync(machine, state, payload) {
  for (let i = 0; i < state.run.length; i++) {
    const item = state.run[i];
    try {
      if (isEntry(item)) {
        runPulse(machine, item, payload);
      }
    } catch (error) {
      catchError(machine, state, error);
      break;
    }
  }
}
function runGuards(machine, state, transition, payload) {
  return runGuardsFromIndex(machine, state, transition, payload, 0);
}
function runGuardsFromIndex(machine, state, transition, payload, startIndex) {
  for (let i = startIndex; i < transition.guards.length; i++) {
    let guard = transition.guards[i];
    try {
      if (!isGuard(guard)) {
        return false;
      }
      addToHistory(machine, `${"Guard" /* Guard */}: ${guard.guard.name}`);
      let guardContext = machine.context;
      if (machine.frozen) {
        guardContext = deepCloneUnfreeze(machine.context);
      }
      let result;
      if (isNestedGuard(guard)) {
        result = guard.guard(guard.machine.context, payload);
      } else {
        result = guard.guard(guardContext, payload);
      }
      if (result instanceof Promise) {
        return result.then((resolvedResult) => {
          if (resolvedResult !== true) {
            if (isValidString(guard.failure)) {
              invoke(machine, guard.failure, resolvedResult);
            } else if (isEntry(guard.failure)) {
              runPulse(machine, guard.failure, resolvedResult);
            } else if (isValidString(resolvedResult)) {
              if (machine.frozen) {
                machine.context = deepCloneUnfreeze(machine.context);
              }
              machine.context.error = resolvedResult;
            }
            return false;
          }
          if (machine.frozen && guardContext !== machine.context) {
            machine.context = guardContext;
            deepFreeze(machine.context);
          }
          return runGuardsFromIndex(machine, state, transition, payload, i + 1);
        });
      }
      if (result !== true) {
        if (isValidString(guard.failure)) {
          invoke(machine, guard.failure, result);
        } else if (isEntry(guard.failure)) {
          runPulse(machine, guard.failure, result);
        } else if (isValidString(result)) {
          if (machine.frozen) {
            machine.context = deepCloneUnfreeze(machine.context);
          }
          machine.context.error = result;
        }
        return false;
      }
    } catch (error) {
      catchError(machine, state, error);
      return false;
    }
  }
  return true;
}
function runNestedMachines(machine, state, payload) {
  if (state.nested.length === 0) {
    return;
  }
  let promise;
  if (machine.isAsync) {
    promise = Promise.resolve();
  }
  for (let nestedMachine of state.nested) {
    if (isNestedMachineWithTransitionDirective(nestedMachine)) {
      let transition = nestedMachine.transition;
      if (promise) {
        promise = promise.then(() => invoke(nestedMachine.machine, transition, payload));
      } else {
        invoke(nestedMachine.machine, transition, payload);
      }
    }
  }
  return promise || void 0;
}
function runNestedTransition(machine, transition, payload) {
  let nestedTransitionParts = transition.split(".");
  let stateName = nestedTransitionParts.shift();
  let nestedTransition = nestedTransitionParts.join(".");
  let promise = machine.isAsync ? Promise.resolve() : null;
  if (!stateName) {
    return;
  }
  let currentStateObject = machine.states[machine.current];
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
    promise = promise.then(() => invokeImmediateDirectives(machine, currentStateObject, payload));
  } else {
    invokeImmediateDirectives(machine, currentStateObject, payload);
  }
  return promise || void 0;
}
function runParallelTransition(machine, transition, payload) {
  let parallelTransitionParts = transition.split("/");
  let parallelMachineId = parallelTransitionParts.shift();
  let parallelTransition = parallelTransitionParts.join("/");
  if (!parallelMachineId) {
    throw new Error(`Invalid transition ${transition}`);
  }
  let parallelMachine = machine.parallel[parallelMachineId];
  if (!parallelMachine) {
    throw new Error(`Invalid transition ${transition}`);
  }
  return invoke(parallelMachine, parallelTransition, payload);
}
function invokeImmediateDirectives(machine, state, payload) {
  if (state.immediate.length === 0) {
    return;
  }
  let immediate = state.immediate;
  let promise = machine.isAsync ? Promise.resolve() : null;
  for (let immediateDirective of immediate) {
    if (hasFatalError(machine)) {
      return;
    }
    if (isParallelTransition(immediateDirective.immediate)) {
      let transitionParts = immediateDirective.immediate.split("/");
      let parallelMachineId = transitionParts.shift();
      let parallelTransition = transitionParts.join("/");
      let parallelMachine = machine.parallel[parallelMachineId];
      if (promise) {
        promise = promise.then(() => invoke(parallelMachine, parallelTransition, payload));
      } else {
        invoke(parallelMachine, parallelTransition, payload);
      }
    } else if (isNestedTransition(immediateDirective.immediate)) {
      if (promise) {
        promise = promise.then(() => invoke(machine, immediateDirective.immediate, payload));
      } else {
        invoke(machine, immediateDirective.immediate, payload);
      }
    } else {
      if (promise) {
        promise = promise.then(async () => {
          if (machine.current === state.name) {
            await invoke(machine, immediateDirective.immediate, payload);
          }
        });
      } else {
        if (machine.current === state.name) {
          invoke(machine, immediateDirective.immediate, payload);
        }
      }
    }
  }
  return promise || void 0;
}
function invoke(machine, transition, payload) {
  if (hasFatalError(machine)) {
    return;
  }
  if (isValidString(transition) === false) {
    throw new Error(`Trying to invoke a transition with an invalid string: ${transition}`);
  }
  let trimmedTransition = transition.trim();
  if (trimmedTransition === START_EVENT) {
    transition = machine.initial;
  }
  let currentStateObject = machine.states[machine.current];
  let hasTransition2 = canMakeTransition(machine, currentStateObject, trimmedTransition);
  if (!hasTransition2) {
    throw new Error(`The transition '${trimmedTransition}' does not exist in the current state '${machine.current}'`);
  }
  if (isParallelTransition(trimmedTransition)) {
    return runParallelTransition(machine, trimmedTransition, payload);
  }
  if (isNestedTransition(trimmedTransition)) {
    return runNestedTransition(machine, trimmedTransition, payload);
  }
  if (trimmedTransition !== START_EVENT) {
    addToHistory(machine, `${"Transition" /* Transition */}: ${trimmedTransition}`);
    let transitionObject = currentStateObject.on[trimmedTransition];
    let guardsResult = runGuards(machine, currentStateObject, transitionObject, payload);
    if (guardsResult instanceof Promise) {
      return guardsResult.then((shouldContinue) => {
        if (shouldContinue === false) {
          addToHistory(machine, `${"State" /* State */}: ${currentStateObject.name}`);
          return;
        }
        return handleExitAndContinue(machine, currentStateObject, transitionObject, trimmedTransition, payload);
      });
    }
    if (guardsResult === false) {
      addToHistory(machine, `${"State" /* State */}: ${currentStateObject.name}`);
      return;
    }
    return handleExitAndContinue(machine, currentStateObject, transitionObject, trimmedTransition, payload);
  }
  return continueTransition(machine, currentStateObject, trimmedTransition, payload);
}
function handleExitAndContinue(machine, currentStateObject, transitionObject, trimmedTransition, payload) {
  const exitItems = transitionObject.exit;
  if (exitItems && Array.isArray(exitItems)) {
    const pulsesToRun = Array.isArray(exitItems[0]) ? exitItems[0] : exitItems;
    for (const exitItem of pulsesToRun) {
      if (machine.isAsync) {
        let promise = Promise.resolve();
        promise = promise.then(() => runPulse(machine, exitItem, payload));
        return promise.then(() => {
          return continueTransition(machine, currentStateObject, trimmedTransition, payload);
        });
      } else {
        runPulse(machine, exitItem, payload);
      }
    }
    return continueTransition(machine, currentStateObject, trimmedTransition, payload);
  }
  return continueTransition(machine, currentStateObject, trimmedTransition, payload);
}
function continueTransition(machine, currentStateObject, trimmedTransition, payload) {
  let targetState = trimmedTransition === START_EVENT ? machine.initial : currentStateObject.on[trimmedTransition].target;
  if (isValidString(targetState) === false) {
    throw new Error(`Trying to invoke a transition with an invalid target state: ${targetState}`);
  }
  if (targetState in machine.states === false) {
    throw new Error(`Invalid target state '${targetState}' for '${machine.current}.${trimmedTransition}' transition`);
  }
  let targetStateObject = machine.states[targetState];
  if (trimmedTransition !== START_EVENT) {
    machine.current = targetState;
    addToHistory(machine, `${"State" /* State */}: ${targetState}`);
  }
  if (machine.isAsync) {
    let promise = Promise.resolve();
    promise = promise.then(() => runNestedMachines(machine, targetStateObject, payload));
    promise = promise.then(() => runStatePulsesAsync(machine, targetStateObject, payload));
    promise = promise.then(() => invokeImmediateDirectives(machine, targetStateObject, payload));
    return promise;
  }
  runNestedMachines(machine, targetStateObject, payload);
  runStatePulsesSync(machine, targetStateObject, payload);
  invokeImmediateDirectives(machine, targetStateObject, payload);
}
function start(machine, snapshotOrPayload) {
  if (snapshotOrPayload && typeof snapshotOrPayload === "object" && "current" in snapshotOrPayload) {
    return restoreFromSnapshot(machine, snapshotOrPayload);
  }
  let canStartMachine = canMakeTransition(machine, machine.states[machine.current], START_EVENT);
  if (!canStartMachine) {
    throw new Error(`The machine has already been started.`);
  }
  return invoke(machine, START_EVENT, snapshotOrPayload);
}
function restoreFromSnapshot(machine, snapshot2) {
  machine.current = snapshot2.current;
  machine.context = deepCloneUnfreeze(snapshot2.context);
  machine.history = [...snapshot2.history];
  if (machine.historyLimit !== 0 && machine.history.length > 0) {
    const lastEntry = machine.history[machine.history.length - 1];
    if (!lastEntry.startsWith("State: ")) {
      machine.history.push(`${"State" /* State */}: ${snapshot2.current}`);
    }
  }
  if (snapshot2.parallel) {
    for (let parallelName in snapshot2.parallel) {
      if (machine.parallel[parallelName]) {
        restoreFromSnapshot(machine.parallel[parallelName], snapshot2.parallel[parallelName]);
      }
    }
  }
  if (snapshot2.nested) {
    for (let stateName in snapshot2.nested) {
      const state = machine.states[stateName];
      if (state && state.nested) {
        for (let nested of state.nested) {
          if (snapshot2.nested[stateName] && snapshot2.nested[stateName][nested.machine.id]) {
            restoreFromSnapshot(nested.machine, snapshot2.nested[stateName][nested.machine.id]);
          }
        }
      }
    }
  }
}
function snapshot(machine) {
  const snap = {
    current: machine.current,
    context: deepCloneUnfreeze(machine.context),
    history: [...machine.history]
  };
  if (Object.keys(machine.parallel).length > 0) {
    snap.parallel = {};
    for (let parallelName in machine.parallel) {
      snap.parallel[parallelName] = snapshot(machine.parallel[parallelName]);
    }
  }
  for (let stateName in machine.states) {
    const state = machine.states[stateName];
    if (state.nested && state.nested.length > 0) {
      if (!snap.nested) {
        snap.nested = {};
      }
      snap.nested[stateName] = {};
      for (let nested of state.nested) {
        snap.nested[stateName][nested.machine.id] = snapshot(nested.machine);
      }
    }
  }
  return snap;
}

// lib/devtools/index.ts
function getDevTools() {
  const globalWindow = globalThis.window;
  if (globalWindow && globalWindow.__REDUX_DEVTOOLS_EXTENSION__) {
    return globalWindow.__REDUX_DEVTOOLS_EXTENSION__;
  }
  return null;
}
function isPromiseLike(value) {
  return !!value && typeof value.then === "function";
}
function isMachineSnapshot(value) {
  return !!value && typeof value === "object" && "current" in value;
}
function parseDevtoolsState(value) {
  if (typeof value === "string") {
    return JSON.parse(value);
  }
  if (value && typeof value === "object") {
    return value;
  }
  return null;
}
function reviveFatalState(fatal) {
  if (!fatal) {
    return void 0;
  }
  const error = new Error(fatal.message);
  error.name = fatal.name;
  return error;
}
function getFatalState(machine) {
  if (!(machine.fatal instanceof Error)) {
    return void 0;
  }
  return {
    name: machine.fatal.name,
    message: machine.fatal.message
  };
}
function getXRobotDevtoolsState(machine) {
  return {
    ...snapshot(machine),
    id: machine.id,
    title: machine.title,
    isAsync: machine.isAsync,
    fatal: getFatalState(machine)
  };
}
function restoreMachineFromDevtoolsState(machine, stateValue) {
  const parsedState = parseDevtoolsState(stateValue);
  if (!parsedState || !isMachineSnapshot(parsedState)) {
    return;
  }
  start(machine, parsedState);
  machine.fatal = reviveFatalState(parsedState.fatal);
}
function getBooleanStatus(payload, currentValue) {
  return typeof payload.status === "boolean" ? payload.status : !currentValue;
}
function connectXRobot(machine, options = {}) {
  const devTools = getDevTools();
  const { name: optionName, onSnapshot, ...devtoolsOptions } = options;
  const name = optionName || machine.title || machine.id || "x-robot";
  const connection = devTools ? devTools.connect({ name, ...devtoolsOptions }) : null;
  const initialSnapshot = getXRobotDevtoolsState(machine);
  let isRecordingPaused = false;
  let isChangesLocked = false;
  let unsubscribeListener;
  let isDisconnected = false;
  function emitSnapshot() {
    if (onSnapshot) {
      onSnapshot(getXRobotDevtoolsState(machine));
    }
  }
  if (connection) {
    connection.init(initialSnapshot);
  }
  if (connection && connection.subscribe) {
    unsubscribeListener = connection.subscribe((message) => {
      if (message.type !== "DISPATCH" || !message.payload) {
        return;
      }
      if (message.payload.type === "JUMP_TO_STATE" || message.payload.type === "JUMP_TO_ACTION") {
        restoreMachineFromDevtoolsState(machine, message.state);
        emitSnapshot();
        return;
      }
      if (message.payload.type === "COMMIT") {
        connection.init(getXRobotDevtoolsState(machine));
        return;
      }
      if (message.payload.type === "RESET") {
        restoreMachineFromDevtoolsState(machine, initialSnapshot);
        connection.init(getXRobotDevtoolsState(machine));
        emitSnapshot();
        return;
      }
      if (message.payload.type === "ROLLBACK") {
        restoreMachineFromDevtoolsState(machine, message.state);
        connection.init(getXRobotDevtoolsState(machine));
        emitSnapshot();
        return;
      }
      if (message.payload.type === "PAUSE_RECORDING") {
        isRecordingPaused = getBooleanStatus(message.payload, isRecordingPaused);
        return;
      }
      if (message.payload.type === "LOCK_CHANGES") {
        isChangesLocked = getBooleanStatus(message.payload, isChangesLocked);
        return;
      }
      if (message.payload.type === "IMPORT_STATE") {
        const nextLiftedState = message.payload.nextLiftedState;
        const currentStateIndex = nextLiftedState?.currentStateIndex;
        const computedStates = nextLiftedState?.computedStates;
        const selectedState = typeof currentStateIndex === "number" && computedStates?.[currentStateIndex] ? computedStates[currentStateIndex].state : computedStates?.[computedStates.length - 1]?.state;
        restoreMachineFromDevtoolsState(machine, selectedState);
        connection.send(null, nextLiftedState);
        emitSnapshot();
      }
    });
  }
  function disconnect() {
    if (isDisconnected) {
      return;
    }
    isDisconnected = true;
    if (unsubscribeListener) {
      unsubscribeListener();
      unsubscribeListener = void 0;
    }
  }
  function send(action) {
    if (connection && !isRecordingPaused) {
      connection.send(action, getXRobotDevtoolsState(machine));
    }
  }
  function runTrackedOperation(action, operation) {
    if (isChangesLocked) {
      return;
    }
    const result = operation();
    if (isPromiseLike(result)) {
      return result.then(() => {
        send(action);
      });
    }
    send(action);
    return result;
  }
  function start2(snapshotOrPayload) {
    const actionType = isMachineSnapshot(snapshotOrPayload) ? "@@x-robot/restore" : "@@x-robot/start";
    return runTrackedOperation({ type: actionType, payload: snapshotOrPayload }, () => start(machine, snapshotOrPayload));
  }
  function invoke2(transition, payload) {
    return runTrackedOperation({ type: transition, payload }, () => invoke(machine, transition, payload));
  }
  function invokeAfter(timeInMilliseconds, transition, payload) {
    if (isChangesLocked) {
      return () => void 0;
    }
    send({
      type: "@@x-robot/invokeAfter",
      payload: {
        timeInMilliseconds,
        transition,
        payload
      }
    });
    const timeoutId = setTimeout(() => {
      invoke2(transition, payload);
    }, timeInMilliseconds);
    return () => clearTimeout(timeoutId);
  }
  return {
    machine,
    start: start2,
    invoke: invoke2,
    invokeAfter,
    snapshot: () => getXRobotDevtoolsState(machine),
    disconnect,
    cleanup: disconnect
  };
}
export {
  connectXRobot,
  getXRobotDevtoolsState
};

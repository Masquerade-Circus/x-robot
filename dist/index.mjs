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
function isEntry(entry2) {
  return isValidObject(entry2) && "pulse" in entry2;
}
function isExit(exit2) {
  return isValidObject(exit2) && "exit" in exit2;
}
function isAction(action) {
  return isValidObject(action) && "action" in action;
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
function isShouldFreezeDirective(shouldFreeze) {
  return isValidObject(shouldFreeze) && "freeze" in shouldFreeze;
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
    exit: [{
      pulse: handler,
      failure
    }]
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
function runProducer(machine2, producer, payload) {
  if (isProducer(producer)) {
    addToHistory(machine2, `${"Producer" /* Producer */}: ${producer.producer.name}`);
    let context2 = machine2.context;
    if (machine2.frozen) {
      context2 = deepCloneUnfreeze(context2);
    }
    let newContext = producer.producer(context2, payload);
    if (isValidObject(newContext)) {
      context2 = newContext;
    }
    machine2.context = context2;
    if (machine2.frozen) {
      deepFreeze(machine2.context);
    }
    if (isProducerWithTransition(producer)) {
      return invoke(machine2, producer.transition);
    }
  } else if (isValidString(producer)) {
    return invoke(machine2, producer);
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
async function runAction(machine2, action, payload) {
  addToHistory(machine2, `${"Action" /* Action */}: ${action.action.name}`);
  try {
    let result = await action.action(machine2.context, payload);
    await runProducer(machine2, action.success, result);
  } catch (error) {
    if (isProducer(action.failure) || isValidString(action.failure)) {
      await runProducer(machine2, action.failure, error);
    } else {
      throw error;
    }
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
async function runActionsAndProducers(machine2, state2, payload) {
  for (let i = 0; i < state2.run.length; i++) {
    let item = state2.run[i];
    try {
      if (isAction(item)) {
        await runAction(machine2, item, payload);
      } else if (isProducer(item)) {
        await runProducer(machine2, item, payload);
      } else if (isEntry(item)) {
        await runPulse(machine2, item, payload);
      }
    } catch (error) {
      await catchError(machine2, state2, error);
      return;
    }
  }
}
function runProducers(machine2, state2, payload) {
  for (let i = 0; i < state2.run.length; i++) {
    let item = state2.run[i];
    try {
      if (isProducer(item)) {
        runProducer(machine2, item, payload);
      } else if (isEntry(item)) {
        runPulse(machine2, item, payload);
      }
    } catch (error) {
      catchError(machine2, state2, error);
      break;
    }
  }
}
function runGuards(machine2, state2, transition2, payload) {
  for (let i = 0; i < transition2.guards.length; i++) {
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
          if (machine2.frozen && guardContext !== machine2.context) {
            machine2.context = guardContext;
            deepFreeze(machine2.context);
          }
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
    promise = promise.then(() => runActionsAndProducers(machine2, targetStateObject, payload));
    promise = promise.then(() => invokeImmediateDirectives(machine2, targetStateObject, payload));
    return promise;
  }
  runNestedMachines(machine2, targetStateObject, payload);
  runProducers(machine2, targetStateObject, payload);
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

// lib/scxml/index.ts
function toSCXML(machine2) {
  let xml = "";
  const initial2 = machine2.initial || Object.keys(machine2.states)[0] || "";
  const name = machine2.title || "Machine";
  xml += `<?xml version="1.0" encoding="UTF-8"?>
`;
  xml += `<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0" initial="${initial2}" name="${name}">
`;
  for (const [parallelName, parallelMachine] of Object.entries(machine2.parallel)) {
    xml += `  <parallel id="${parallelMachine.title || parallelName}">
`;
    xml += generateStates(parallelMachine.states, "    ");
    xml += `  </parallel>
`;
  }
  xml += generateStates(machine2.states, "  ");
  xml += "</scxml>";
  return xml;
}
function generateStates(states, indent) {
  let xml = "";
  for (const [stateName, state2] of Object.entries(states)) {
    xml += generateState(stateName, state2, indent);
  }
  return xml;
}
function generateState(stateName, state2, indent) {
  let xml = "";
  const isFinal = !state2.on || Object.keys(state2.on).length === 0;
  if (isFinal && !state2.nested) {
    xml += `${indent}<final id="${stateName}"/>
`;
  } else {
    xml += `${indent}<state id="${stateName}">
`;
    if (state2.run && state2.run.length > 0) {
      xml += `${indent}  <onentry>
`;
      for (const pulse of state2.run) {
        xml += `${indent}    <script>${pulse.pulse}()<\/script>
`;
      }
      xml += `${indent}  </onentry>
`;
    }
    if (state2.nested && state2.nested.length > 0) {
      for (const nested2 of state2.nested) {
        xml += generateNestedMachine(nested2, indent + "  ");
      }
    }
    if (state2.on) {
      for (const [event, transition2] of Object.entries(state2.on)) {
        xml += generateTransition(event, transition2, indent + "  ");
      }
    }
    if (state2.immediate) {
      for (const immediate2 of state2.immediate) {
        xml += generateImmediateTransition(immediate2, indent + "  ");
      }
    }
    xml += `${indent}</state>
`;
  }
  return xml;
}
function generateTransition(event, transition2, indent) {
  let xml = `${indent}<transition event="${event}"`;
  if (transition2.target) {
    xml += ` target="${transition2.target}"`;
  }
  if (transition2.guards && transition2.guards.length > 0) {
    const conditions = transition2.guards.map((g) => g.guard).join(" && ");
    xml += ` cond="${conditions}"`;
  }
  xml += "/>\n";
  return xml;
}
function generateImmediateTransition(immediate2, indent) {
  let xml = `${indent}<transition`;
  if (immediate2.immediate) {
    xml += ` target="${immediate2.immediate}"`;
  }
  if (immediate2.guards && immediate2.guards.length > 0) {
    const conditions = immediate2.guards.map((g) => g.guard).join(" && ");
    xml += ` cond="${conditions}"`;
  }
  xml += "/>\n";
  return xml;
}
function generateNestedMachine(nested2, indent) {
  let xml = "";
  const machineTitle = nested2.machine.title || "nested";
  const initial2 = nested2.machine.initial || Object.keys(nested2.machine.states)[0] || "";
  xml += `${indent}<state id="${machineTitle}">
`;
  xml += `${indent}  <initial id="${initial2}">
`;
  xml += `${indent}    <transition target="${initial2}"/>
`;
  xml += `${indent}  </initial>
`;
  xml += generateStates(nested2.machine.states, indent + "  ");
  for (const [parallelName, parallelMachine] of Object.entries(nested2.machine.parallel)) {
    xml += `${indent}  <parallel id="${parallelMachine.title || parallelName}">
`;
    xml += generateStates(parallelMachine.states, indent + "    ");
    xml += `${indent}  </parallel>
`;
  }
  xml += `${indent}</state>
`;
  return xml;
}
function fromSCXML(scxmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(scxmlString, "text/xml");
  const root = doc.documentElement;
  if (root.tagName !== "scxml") {
    throw new Error("Invalid SCXML document: root element must be <scxml>");
  }
  const machine2 = {
    title: root.getAttribute("name") || void 0,
    initial: root.getAttribute("initial") || "",
    states: {},
    parallel: {},
    context: {}
  };
  const children = Array.from(root.childNodes);
  for (const child of children) {
    if (child.nodeType !== 1)
      continue;
    const element = child;
    const tagName = element.tagName;
    if (tagName === "state") {
      const state2 = parseStateElement(element);
      if (state2.name) {
        machine2.states[state2.name] = state2;
      }
    } else if (tagName === "parallel") {
      const parallelMachine = parseParallelElement(element);
      const id = element.getAttribute("id");
      if (id) {
        machine2.parallel[id] = parallelMachine;
      }
    }
  }
  return machine2;
}
function parseStateElement(element) {
  const state2 = {
    name: element.getAttribute("id") || ""
  };
  const onentry = element.getElementsByTagName("onentry")[0];
  if (onentry) {
    state2.run = parsePulseElements(onentry);
  }
  const transitions = element.getElementsByTagName("transition");
  if (transitions.length > 0) {
    state2.on = {};
    for (const trans of Array.from(transitions)) {
      const event = trans.getAttribute("event");
      const target = trans.getAttribute("target");
      const cond = trans.getAttribute("cond");
      if (event) {
        state2.on[event] = {
          target: target || "",
          guards: cond ? [{ guard: cond }] : void 0
        };
      }
    }
  }
  const nestedStates = Array.from(element.getElementsByTagName("state"));
  const hasNestedStates = nestedStates.length > 0 && nestedStates.some((s) => s.parentElement === element);
  if (hasNestedStates) {
    state2.nested = [];
    for (const nestedEl of nestedStates) {
      if (nestedEl.parentElement !== element)
        continue;
      const nestedMachine = parseNestedMachine(nestedEl);
      state2.nested.push(nestedMachine);
    }
  }
  return state2;
}
function parsePulseElements(onentry) {
  const pulses = [];
  const scripts = onentry.getElementsByTagName("script");
  for (const script of Array.from(scripts)) {
    const content = script.textContent || "";
    const fnMatch = content.match(/^(\w+)\(/);
    if (fnMatch) {
      pulses.push({ pulse: fnMatch[1] });
    }
  }
  return pulses;
}
function parseParallelElement(element) {
  const machine2 = {
    states: {},
    parallel: {},
    context: {},
    initial: ""
  };
  const initialEl = element.getElementsByTagName("initial")[0];
  if (initialEl) {
    const initialTrans = initialEl.getElementsByTagName("transition")[0];
    if (initialTrans) {
      machine2.initial = initialTrans.getAttribute("target") || "";
    }
  }
  const childStates = element.getElementsByTagName("state");
  for (const stateEl of Array.from(childStates)) {
    if (stateEl.parentElement !== element)
      continue;
    const state2 = parseStateElement(stateEl);
    if (state2.name) {
      machine2.states[state2.name] = state2;
    }
  }
  return machine2;
}
function parseNestedMachine(element) {
  const machine2 = {
    states: {},
    parallel: {},
    context: {},
    initial: ""
  };
  const initialEl = element.getElementsByTagName("initial")[0];
  if (initialEl) {
    const initialTrans = initialEl.getElementsByTagName("transition")[0];
    if (initialTrans) {
      machine2.initial = initialTrans.getAttribute("target") || "";
    }
  }
  const states = element.getElementsByTagName("state");
  for (const stateEl of Array.from(states)) {
    if (stateEl.parentElement !== element)
      continue;
    const state2 = parseStateElement(stateEl);
    if (state2.name) {
      machine2.states[state2.name] = state2;
    }
  }
  return {
    machine: machine2,
    transition: machine2.initial
  };
}

// lib/generate/index.ts
var Format = /* @__PURE__ */ ((Format2) => {
  Format2["ESM"] = "esm";
  Format2["CJS"] = "cjs";
  Format2["TS"] = "ts";
  return Format2;
})(Format || {});
function getGuards(transition2, guards = [], declaredGuards = []) {
  let code = "";
  if (transition2.guards) {
    for (let item of transition2.guards) {
      let guardName = item.guard;
      if (!guards.includes(guardName) && !declaredGuards.includes(guardName)) {
        guards.push(guardName);
        declaredGuards.push(guardName);
      }
      if (item.machine) {
        let { machineName } = getMachineName(item.machine);
        code += `, nestedGuard(${machineName}, ${guardName}`;
      } else {
        code += `, guard(${guardName}`;
      }
      if (isValidString(item.failure)) {
        code += `, "${item.failure}"`;
      }
      code += `)`;
    }
  }
  return code;
}
function getExitPulses(transition2, pulses = [], declaredPulses = []) {
  let code = "";
  if (transition2.exit && transition2.exit.length > 0) {
    code += `, exit(`;
    for (let i = 0; i < transition2.exit.length; i++) {
      const exitPulse = transition2.exit[i];
      if (!pulses.includes(exitPulse.pulse) && !declaredPulses.includes(exitPulse.pulse)) {
        pulses.push(exitPulse.pulse);
        declaredPulses.push(exitPulse.pulse);
      }
      code += `entry(${exitPulse.pulse}`;
      if (isValidString(exitPulse.failure)) {
        code += `, "${exitPulse.failure}"`;
      }
      code += `)`;
      if (i < transition2.exit.length - 1) {
        code += `, `;
      }
    }
    code += `)`;
  }
  return code;
}
function getCodeParts(serializedMachine, declaredPulses = [], declaredGuards = []) {
  let pulses = [];
  let guards = [];
  let states = {};
  for (let stateName in serializedMachine.states) {
    let state2 = serializedMachine.states[stateName];
    let stateCode = "";
    let implicitStateTransitions = [];
    let stateTypeName = state2.type === "default" ? "state" : `${state2.type}State`;
    stateCode += `${stateTypeName}(
      "${stateName}",
`;
    if (isValidString(state2.description)) {
      stateCode += `      description("${state2.description}"),
`;
    }
    if (state2.nested && state2.nested.length > 0) {
      for (let nestedMachine of state2.nested) {
        let { machineName } = getMachineName(nestedMachine.machine);
        stateCode += `      nested(${machineName}`;
        if (nestedMachine.transition) {
          stateCode += `, "${nestedMachine.transition}"`;
        }
        stateCode += "),\n";
      }
    }
    if (state2.run && state2.run.length > 0) {
      for (let runItem of state2.run) {
        if ("pulse" in runItem) {
          if (!pulses.includes(runItem.pulse) && !declaredPulses.includes(runItem.pulse)) {
            pulses.push(runItem.pulse);
            declaredPulses.push(runItem.pulse);
          }
          stateCode += `      entry(${runItem.pulse}`;
          if (isValidString(runItem.success)) {
            stateCode += `, "${runItem.success}"`;
            implicitStateTransitions.push(runItem.success);
          }
          if (isValidString(runItem.failure)) {
            if (!isValidString(runItem.success)) {
              stateCode += `, undefined`;
            }
            stateCode += `, "${runItem.failure}"`;
            implicitStateTransitions.push(runItem.failure);
          }
          stateCode += `),
`;
        }
      }
    }
    if (state2.immediate) {
      for (let immediate2 of state2.immediate) {
        stateCode += `      immediate("${immediate2.immediate}"`;
        stateCode += getGuards({ target: immediate2.immediate, guards: immediate2.guards }, guards, declaredGuards);
        stateCode += `),
`;
      }
    }
    for (let transitionName in state2.on) {
      let transition2 = state2.on[transitionName];
      if (!implicitStateTransitions.includes(transition2.target) || transition2.guards) {
        if (!state2.immediate || !state2.immediate.find((immediate2) => immediate2.immediate === transition2.target)) {
          stateCode += `      transition("${transitionName}", "${transition2.target}"`;
          stateCode += getGuards(transition2, guards, declaredGuards);
          stateCode += getExitPulses(transition2, pulses, declaredPulses);
          stateCode += `),
`;
        }
      }
    }
    stateCode = stateCode.replace(/,\n$/, `
`);
    stateCode += `    )`;
    states[stateName] = stateCode.replace(/\(\n\s+\)$/, "()");
  }
  return { pulses, guards, states };
}
function addImport(importName, imports = ["machine"]) {
  if (!imports.includes(importName)) {
    imports.push(importName);
  }
}
function getImports(serializedMachine, imports = ["machine"]) {
  if (Object.keys(serializedMachine.states).length > 0) {
    addImport("states", imports);
  }
  if (serializedMachine.initial) {
    addImport("initial", imports);
  }
  if (serializedMachine.context) {
    addImport("context", imports);
  }
  if (isValidObject(serializedMachine.states) && Object.keys(serializedMachine.states).length > 0) {
    addImport("states", imports);
    for (let stateName in serializedMachine.states) {
      let state2 = serializedMachine.states[stateName];
      if (state2.nested && state2.nested.length > 0) {
        addImport("nested", imports);
        for (let nestedMachine of state2.nested) {
          getImports(nestedMachine.machine, imports);
        }
      }
      let stateImport = state2.type !== "default" ? `${state2.type}State` : "state";
      addImport(stateImport, imports);
      if (isValidString(state2.description)) {
        addImport("description", imports);
      }
      if (state2.immediate) {
        addImport("immediate", imports);
      }
      if (isValidObject(state2.on)) {
        if (!imports.includes("transition") || !imports.includes("guard") || !imports.includes("nestedGuard")) {
          for (let transitionName in state2.on) {
            if (!imports.includes("transition") && (!isValidString(state2.immediate) || state2.immediate !== transitionName)) {
              addImport("transition", imports);
            }
            let transition2 = state2.on[transitionName];
            if (transition2.guards) {
              for (let item of transition2.guards) {
                if (item.machine) {
                  addImport("nestedGuard", imports);
                } else {
                  addImport("guard", imports);
                }
                if (isValidString(item.failure)) {
                  addImport("transition", imports);
                }
              }
            }
            if (transition2.exit && transition2.exit.length > 0) {
              addImport("exit", imports);
              for (let exitItem of transition2.exit) {
                addImport("entry", imports);
                if (isValidString(exitItem.failure)) {
                  addImport("transition", imports);
                }
              }
            }
          }
        }
      }
      if (state2.run && state2.run.length > 0) {
        for (let runItem of state2.run) {
          if ("pulse" in runItem) {
            addImport("entry", imports);
            if (isValidString(runItem.success) || isValidString(runItem.failure)) {
              addImport("transition", imports);
            }
          }
        }
      }
    }
  }
  if (serializedMachine.parallel && Object.keys(serializedMachine.parallel).length > 0) {
    addImport("parallel", imports);
  }
  return imports;
}
var toCammelCase = (str) => str.replace(/(^\w)/g, ($1) => $1.toUpperCase()).replace(/\s(.)/g, ($1) => $1.toUpperCase()).replace(/\W/g, "");
function getMachineName(serializedMachine) {
  let randomString = Math.random().toString(36).substring(2, 15);
  let camelizedTitle = toCammelCase(serializedMachine.title || randomString);
  let machineName = `${camelizedTitle}Machine`;
  return { machineName, camelizedTitle };
}
function getMachineCode(serializedMachine, format, machines = /* @__PURE__ */ new Map(), declaredPulses = [], declaredGuards = []) {
  let code = "";
  for (let stateName in serializedMachine.states) {
    let state2 = serializedMachine.states[stateName];
    if (state2.nested && state2.nested.length > 0) {
      for (let nestedMachine of state2.nested) {
        let { machineName: machineName2 } = getMachineName(nestedMachine.machine);
        if (!machines.has(machineName2)) {
          code += getMachineCode(nestedMachine.machine, format, machines, declaredPulses, declaredGuards);
        }
      }
    }
  }
  for (let parallelMachineId in serializedMachine.parallel) {
    let parallelMachine = serializedMachine.parallel[parallelMachineId];
    let { machineName: machineName2 } = getMachineName(parallelMachine);
    if (!machines.has(machineName2)) {
      code += getMachineCode(parallelMachine, format, machines, declaredPulses, declaredGuards);
    }
  }
  let { machineName, camelizedTitle } = getMachineName(serializedMachine);
  let { pulses, guards, states } = getCodeParts(serializedMachine, declaredPulses, declaredGuards);
  code += `
/******************** ${machineName} Start ********************/

`;
  code += `const get${camelizedTitle}Context = () => (${JSON.stringify(serializedMachine.context, null, 2)});

`;
  if (guards.length > 0) {
    let guardCode = `// Guards
`;
    for (let guard2 of guards) {
      guardCode += `const ${guard2} = (context, payload) => {
  // TODO: Implement guard
  return true;
};
`;
    }
    code += `${guardCode}
`;
  }
  if (pulses.length > 0) {
    let pulseCode = `// Entries
`;
    for (let pulse of pulses) {
      pulseCode += `const ${pulse} = (context, payload) => {
  // TODO: Implement entry
  return {...context};
};
`;
    }
    code += `${pulseCode}
`;
  }
  if (format === "esm" /* ESM */) {
    code += `export `;
  }
  code += `const ${machineName} = machine(
  "${serializedMachine.title ? serializedMachine.title : ""}",`;
  if (Object.keys(states).length > 0) {
    code += `
  states(
`;
    for (let stateName in states) {
      code += `    ${states[stateName]},
`;
    }
    code = code.replace(/,\n$/, `
`);
    code += `  ),
`;
  }
  if (Object.keys(serializedMachine.parallel).length > 0) {
    code += `  parallel(
`;
    for (let parallelMachineId in serializedMachine.parallel) {
      let parallelMachine = serializedMachine.parallel[parallelMachineId];
      let { machineName: machineName2 } = getMachineName(parallelMachine);
      code += `    ${machineName2},
`;
    }
    code = code.replace(/,\n$/, `
`);
    code += `  ),
`;
  }
  code += `  context(get${camelizedTitle}Context),
`;
  code += `  initial("${serializedMachine.initial}")
);

`;
  machines.set(machineName, code);
  code += `/******************** ${machineName} End ********************/
`;
  return code;
}
function generateFromSerializedMachine(serializedMachine, format) {
  if (format === "ts" /* TS */) {
    return generateTypeScriptCode(serializedMachine);
  }
  let code = "";
  let imports = getImports(serializedMachine);
  let importCode = "";
  let importItems = imports.join(", ");
  if (format === "cjs" /* CJS */) {
    importCode += `const { ${importItems} } = require("x-robot");
`;
  } else {
    importCode += `import { ${importItems} } from "x-robot";
`;
  }
  code += importCode;
  let machines = /* @__PURE__ */ new Map();
  let machineCode = getMachineCode(serializedMachine, format, machines);
  code += machineCode;
  if (format === "cjs" /* CJS */) {
    code += `
module.exports = { ${Array.from(machines.keys()).join(", ")} };
`;
  } else if (format === "ts" /* TS */) {
  } else {
    code += `
export default { ${Array.from(machines.keys()).join(", ")} };
`;
  }
  return code;
}
function toCamelCase(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, "");
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function analyzeMachineTypes(serializedMachine) {
  const stateNames = [];
  const contextProperties = [];
  const stateContextModifiers = /* @__PURE__ */ new Map();
  const entryActions = /* @__PURE__ */ new Map();
  const exitActions = /* @__PURE__ */ new Map();
  if (serializedMachine.context && typeof serializedMachine.context === "object") {
    for (const key of Object.keys(serializedMachine.context)) {
      contextProperties.push(key);
    }
  }
  for (const [stateName, state2] of Object.entries(serializedMachine.states)) {
    stateNames.push(stateName);
    if (state2.run && state2.run.length > 0) {
      const actions = [];
      for (const pulse of state2.run) {
        actions.push(pulse.pulse);
      }
      entryActions.set(stateName, actions);
    }
    if (state2.on) {
      for (const [event, transition2] of Object.entries(state2.on)) {
        if (transition2.exit && transition2.exit.length > 0) {
          if (!stateContextModifiers.has(stateName)) {
            stateContextModifiers.set(stateName, []);
          }
          for (const exit2 of transition2.exit) {
            stateContextModifiers.get(stateName).push(exit2.pulse);
          }
        }
      }
    }
  }
  return {
    stateNames,
    contextProperties,
    stateContextModifiers,
    entryActions,
    exitActions
  };
}
function generateStateInterface(name, analysis) {
  const lines = [];
  lines.push(`export interface ${name}States {`);
  for (const stateName of analysis.stateNames) {
    const modifiers = analysis.stateContextModifiers.get(stateName);
    if (modifiers && modifiers.length > 0) {
      lines.push(`  ${stateName}: { context: ${name}${capitalize(stateName)}Context };`);
    } else {
      lines.push(`  ${stateName}: {};`);
    }
  }
  lines.push("}");
  return lines.join("\n");
}
function generateContextInterface(name, contextProperties) {
  if (contextProperties.length === 0) {
    return `export interface ${name}Context {
  [key: string]: any;
}`;
  }
  const props = contextProperties.map((prop) => `  ${prop}: any;`).join("\n");
  return `export interface ${name}Context {
${props}
}`;
}
function generateStateSpecificContexts(name, analysis) {
  const lines = [];
  for (const [stateName, modifiers] of analysis.stateContextModifiers) {
    if (modifiers && modifiers.length > 0) {
      lines.push(`export interface ${name}${capitalize(stateName)}Context extends ${name}Context {`);
      for (const mod of modifiers) {
        lines.push(`  ${mod}Result?: any;`);
      }
      lines.push("}");
    }
  }
  return lines.join("\n\n");
}
function generateTypeScriptCode(serializedMachine) {
  const machineName = toCamelCase(serializedMachine.title || "Machine");
  const analysis = analyzeMachineTypes(serializedMachine);
  let code = "";
  code += "// ===========================================\n";
  code += `// Type definitions for ${serializedMachine.title || "Machine"}
`;
  code += "// Generated by x-robot\n";
  code += "// ===========================================\n\n";
  code += generateStateInterface(machineName, analysis);
  code += "\n\n";
  code += generateContextInterface(machineName, analysis.contextProperties);
  code += "\n\n";
  const stateSpecificContexts = generateStateSpecificContexts(machineName, analysis);
  if (stateSpecificContexts) {
    code += stateSpecificContexts;
    code += "\n\n";
  }
  const jsCode = generateFromSerializedMachine(serializedMachine, "esm" /* ESM */);
  const tsMachineCode = jsCode.replace(/machine\(/g, `machine<${machineName}States, ${machineName}Context>(`).replace(/export default/g, "// Type-safe machine\nexport default");
  code += tsMachineCode;
  return code;
}

// lib/serialize/index.ts
function serializePulse(pulse) {
  const pulseFn = pulse.pulse;
  const serialized = {
    pulse: pulseFn.name || "anonymous",
    isAsync: pulseFn.constructor.name === "AsyncFunction"
  };
  if (isValidString(pulse.success)) {
    serialized.success = pulse.success;
  }
  if (isValidString(pulse.failure)) {
    serialized.failure = pulse.failure;
  }
  return serialized;
}
function serializeGuard(guard2) {
  let serialized = {
    guard: guard2.guard.name
  };
  if (isValidString(guard2.failure)) {
    serialized.failure = guard2.failure;
  }
  if ("machine" in guard2) {
    serialized.machine = serialize(guard2.machine);
  }
  return serialized;
}
function serializeRunArguments(run) {
  if (!Array.isArray(run) || run.length === 0) {
    return null;
  }
  return run.map((item) => {
    if (isEntry(item)) {
      return serializePulse(item);
    }
  });
}
function serializeGuards(guards) {
  if (!guards || guards.length === 0) {
    return null;
  }
  return guards.map((guard2) => serializeGuard(guard2));
}
function serializeTransition(transition2) {
  let serialized = {
    target: transition2.target
  };
  let guards = serializeGuards(transition2.guards);
  if (guards) {
    serialized.guards = guards;
  }
  if (transition2.exit) {
    const exitArray = Array.isArray(transition2.exit) ? transition2.exit : [transition2.exit];
    serialized.exit = exitArray.map((pulse) => serializePulse(pulse));
  }
  return serialized;
}
function serializeImmediate(immediate2) {
  let serialized = {
    immediate: immediate2.immediate
  };
  let guards = serializeGuards(immediate2.guards);
  if (guards) {
    serialized.guards = guards;
  }
  return serialized;
}
function serializeTransitions(events) {
  if (!events || Object.keys(events).length === 0) {
    return null;
  }
  let serialized = {};
  for (let event in events) {
    serialized[event] = serializeTransition(events[event]);
  }
  return serialized;
}
function serializeContext(context2) {
  return deepCloneUnfreeze(context2);
}
function serializeNested(nested2) {
  if (!nested2 || nested2.length === 0) {
    return null;
  }
  return nested2.map(({ machine: machine2, transition: transition2 }) => {
    let serializedNestedMachine = {
      machine: serialize(machine2)
    };
    if (transition2) {
      serializedNestedMachine.transition = transition2;
    }
    return serializedNestedMachine;
  });
}
function serialize(machine2) {
  let serialized = {
    states: {},
    parallel: {},
    context: serializeContext(machine2.context),
    initial: machine2.initial
  };
  if (machine2.title) {
    serialized.title = machine2.title;
  }
  for (let state2 in machine2.states) {
    serialized.states[state2] = {};
    let nested2 = serializeNested(machine2.states[state2].nested);
    if (nested2) {
      serialized.states[state2].nested = nested2;
    }
    let run = serializeRunArguments(machine2.states[state2].run);
    if (run) {
      serialized.states[state2].run = run;
    }
    let on = serializeTransitions(machine2.states[state2].on);
    if (on) {
      serialized.states[state2].on = on;
    }
    let immediate2 = machine2.states[state2].immediate;
    if (immediate2.length) {
      let serializedImmediate = [];
      for (let immediateDirective of immediate2) {
        serializedImmediate.push(serializeImmediate(immediateDirective));
      }
      serialized.states[state2].immediate = serializedImmediate;
    }
    if (isValidString(machine2.states[state2].type)) {
      serialized.states[state2].type = machine2.states[state2].type;
    }
    if (isValidString(machine2.states[state2].description)) {
      serialized.states[state2].description = machine2.states[state2].description;
    }
  }
  for (let parallel2 in machine2.parallel) {
    serialized.parallel[parallel2] = serialize(machine2.parallel[parallel2]);
  }
  return serialized;
}
export {
  Format,
  context,
  dangerState,
  description,
  entry,
  exit,
  fromSCXML,
  generateFromSerializedMachine,
  getState,
  guard,
  history,
  immediate,
  infoState,
  init,
  initial,
  invoke,
  invokeAfter,
  machine,
  nested,
  nestedGuard,
  parallel,
  primaryState,
  serialize,
  snapshot,
  start,
  state,
  successState,
  toSCXML,
  transition,
  warningState
};

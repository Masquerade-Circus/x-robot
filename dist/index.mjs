// lib/machine/interfaces.ts
var START_EVENT = "__start__";

// lib/utils.ts
function isValidString(str) {
  return str !== null && typeof str === "string" && str.trim().length > 0;
}
function isValidObject(obj) {
  return obj !== null && typeof obj === "object";
}
function isProducer(producer2) {
  return isValidObject(producer2) && "producer" in producer2;
}
function isProducerWithTransition(producer2) {
  return isProducer(producer2) && isValidString(producer2.transition);
}
function isAction(action2) {
  return isValidObject(action2) && "action" in action2;
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
function isStatesDirective(states2) {
  return isValidObject(states2) && Object.keys(states2).every((key) => isValidString(key)) && Object.values(states2).every((state2) => isStateDirective(state2));
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
function deepFreeze(obj) {
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
function cloneContext(context2, weakMap = /* @__PURE__ */ new WeakMap()) {
  if (weakMap.has(context2)) {
    return weakMap.get(context2);
  }
  if (context2 === null || context2 === void 0) {
    return context2;
  }
  let result;
  if (Array.isArray(context2)) {
    result = context2.map((item) => cloneContext(item, weakMap));
  } else if (typeof context2 === "object") {
    result = {};
    for (let key in context2) {
      result[key] = cloneContext(context2[key], weakMap);
    }
  } else if (context2 instanceof Date) {
    result = new Date(context2.getTime());
  } else if (context2 instanceof Set) {
    result = new Set(context2);
  } else if (context2 instanceof Map) {
    let array = Array.from(context2, ([key, val]) => [
      key,
      cloneContext(val, weakMap)
    ]);
    result = new Map(array);
  } else if (context2 instanceof RegExp) {
    return new RegExp(context2.source, context2.flags);
  } else if (false) {
    result = new context2.constructor(context2);
  } else {
    result = context2;
    return result;
  }
  weakMap.set(context2, result);
  return result;
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
    parallel: {}
  };
  for (let arg of args) {
    if (isValidString(arg)) {
      title = arg;
    }
    if (isStatesDirective(arg)) {
      myMachine.states = { ...myMachine.states, ...arg };
    }
    if (isParallelDirective(arg)) {
      myMachine.parallel = { ...myMachine.parallel, ...arg.parallel };
    }
    if (isContextDirective(arg)) {
      let newContext = typeof arg.context === "function" ? arg.context() : arg.context;
      if (!isValidObject(newContext)) {
        throw new Error("The context passed to the machine must be an object or a function that returns an object.");
      }
      myMachine.context = { ...myMachine.context, ...newContext };
    }
    if (isInitialDirective(arg)) {
      myMachine.initial = arg.initial;
      myMachine.current = myMachine.initial;
      myMachine.history.push(`${"State" /* State */}: ${myMachine.initial}`);
    }
    if (isShouldFreezeDirective(arg)) {
      myMachine.frozen = arg.freeze;
    }
  }
  if (myMachine.frozen) {
    deepFreeze(myMachine.context);
  }
  for (let state2 in myMachine.states) {
    if (myMachine.states[state2].run.length > 0) {
      let action2 = myMachine.states[state2].run.find(isAction);
      if (action2) {
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
function states(...states2) {
  let newStates = {};
  for (let state2 of states2) {
    newStates[state2.name] = state2;
  }
  return newStates;
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
    } else if (isAction(arg) || isProducer(arg)) {
      run.push(arg);
      if (isAction(arg)) {
        let successTransition = isValidString(arg.success) ? arg.success : isProducerWithTransition(arg.success) ? arg.success.transition : null;
        if (isValidString(successTransition) && hasTransition({ on }, successTransition) === false) {
          on[successTransition] = {
            transition: successTransition,
            target: successTransition,
            guards: []
          };
        }
        let failureTransition = isValidString(arg.failure) ? arg.failure : isProducerWithTransition(arg.failure) ? arg.failure.transition : null;
        if (isValidString(failureTransition) && hasTransition({ on }, failureTransition) === false) {
          on[failureTransition] = {
            transition: failureTransition,
            target: failureTransition,
            guards: []
          };
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
function transition(transitionName, target, ...guards) {
  return {
    transition: transitionName,
    target,
    guards
  };
}
function action(action2, onSuccessProducer, onFailureProducer) {
  return {
    action: action2,
    success: onSuccessProducer,
    failure: onFailureProducer
  };
}
function guard(guard2, onFailureProducer) {
  return {
    guard: guard2,
    failure: onFailureProducer
  };
}
function producer(producer2, transition2) {
  return {
    producer: producer2,
    transition: transition2
  };
}
function immediate(target, ...guards) {
  return {
    immediate: target,
    guards
  };
}
function nestedGuard(machine2, guard2, onFailureProducer) {
  return {
    guard: guard2,
    machine: machine2,
    failure: onFailureProducer
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
function runProducer(machine2, producer2, payload) {
  if (isProducer(producer2)) {
    machine2.history.push(`${"Producer" /* Producer */}: ${producer2.producer.name}`);
    let context2 = machine2.context;
    if (machine2.frozen) {
      context2 = cloneContext(context2);
    }
    let newContext = producer2.producer(context2, payload);
    if (isValidObject(newContext)) {
      context2 = newContext;
    }
    machine2.context = context2;
    if (machine2.frozen) {
      deepFreeze(machine2.context);
    }
    if (isProducerWithTransition(producer2)) {
      return invoke(machine2, producer2.transition);
    }
  } else if (isValidString(producer2)) {
    return invoke(machine2, producer2);
  }
}
async function runAction(machine2, action2, payload) {
  machine2.history.push(`${"Action" /* Action */}: ${action2.action.name}`);
  try {
    let result = await action2.action(machine2.context, payload);
    await runProducer(machine2, action2.success, result);
  } catch (error) {
    if (isProducer(action2.failure) || isValidString(action2.failure)) {
      await runProducer(machine2, action2.failure, error);
    } else {
      throw error;
    }
  }
}
function hasFatalError(machine2) {
  return machine2.fatal instanceof Error;
}
function catchError(machine2, state2, error) {
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
      machine2.history.push(`${"Guard" /* Guard */}: ${guard2.guard.name}`);
      let result;
      if (isNestedGuard(guard2)) {
        result = guard2.guard(guard2.machine.context, payload);
      } else {
        result = guard2.guard(machine2.context, payload);
      }
      if (result !== true) {
        if (isProducer(guard2.failure)) {
          runProducer(machine2, guard2.failure, result);
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
    machine2.history.push(`${"Transition" /* Transition */}: ${trimmedTransition}`);
    let transitionObject = currentStateObject.on[trimmedTransition];
    let shouldContinue = runGuards(machine2, currentStateObject, transitionObject, payload);
    if (shouldContinue === false) {
      machine2.history.push(`${"State" /* State */}: ${currentStateObject.name}`);
      return;
    }
  }
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
    machine2.history.push(`${"State" /* State */}: ${targetState}`);
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
function start(machine2, payload) {
  let canStartMachine = canMakeTransition(machine2, machine2.states[machine2.current], START_EVENT);
  if (!canStartMachine) {
    throw new Error(`The machine has already been started.`);
  }
  return invoke(machine2, START_EVENT, payload);
}
export {
  action,
  context,
  dangerState,
  description,
  getState,
  guard,
  immediate,
  infoState,
  initial,
  invoke,
  machine,
  nested,
  nestedGuard,
  parallel,
  primaryState,
  producer,
  start,
  state,
  states,
  successState,
  transition,
  warningState
};

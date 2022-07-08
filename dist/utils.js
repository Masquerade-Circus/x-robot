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

// lib/utils.ts
var utils_exports = {};
__export(utils_exports, {
  canMakeTransition: () => canMakeTransition,
  cloneContext: () => cloneContext,
  deepFreeze: () => deepFreeze,
  hasState: () => hasState,
  hasTransition: () => hasTransition,
  isAction: () => isAction,
  isContextDirective: () => isContextDirective,
  isDescriptionDirective: () => isDescriptionDirective,
  isGuard: () => isGuard,
  isImmediate: () => isImmediate,
  isInitialDirective: () => isInitialDirective,
  isMachine: () => isMachine,
  isNestedGuard: () => isNestedGuard,
  isNestedImmediateDirective: () => isNestedImmediateDirective,
  isNestedMachineDirective: () => isNestedMachineDirective,
  isNestedMachineWithTransitionDirective: () => isNestedMachineWithTransitionDirective,
  isNestedTransition: () => isNestedTransition,
  isParallelDirective: () => isParallelDirective,
  isParallelImmediateDirective: () => isParallelImmediateDirective,
  isParallelTransition: () => isParallelTransition,
  isProducer: () => isProducer,
  isProducerWithTransition: () => isProducerWithTransition,
  isProducerWithoutTransition: () => isProducerWithoutTransition,
  isShouldFreezeDirective: () => isShouldFreezeDirective,
  isStateDirective: () => isStateDirective,
  isStatesDirective: () => isStatesDirective,
  isTransition: () => isTransition,
  isValidObject: () => isValidObject,
  isValidString: () => isValidString,
  titleToId: () => titleToId
});
module.exports = __toCommonJS(utils_exports);

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
function isProducerWithoutTransition(producer) {
  return !isProducerWithTransition(producer);
}
function isAction(action) {
  return isValidObject(action) && "action" in action;
}
function isImmediate(immediate) {
  return isValidObject(immediate) && "immediate" in immediate;
}
function isGuard(guard) {
  return isValidObject(guard) && "guard" in guard;
}
function isNestedGuard(guard) {
  return isGuard(guard) && "machine" in guard;
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
function isNestedMachineDirective(machine) {
  return isValidObject(machine) && "machine" in machine;
}
function isNestedMachineWithTransitionDirective(machine) {
  return isNestedMachineDirective(machine) && isValidString(machine.transition);
}
function isMachine(machine) {
  return isValidObject(machine) && "states" in machine && "initial" in machine && "current" in machine;
}
function isStateDirective(state) {
  return isValidObject(state) && "name" in state && "run" in state && "on" in state && "args" in state;
}
function isContextDirective(context) {
  return isValidObject(context) && "context" in context;
}
function isStatesDirective(states) {
  return isValidObject(states) && Object.keys(states).every((key) => isValidString(key)) && Object.values(states).every((state) => isStateDirective(state));
}
function isParallelDirective(parallel) {
  return isValidObject(parallel) && "parallel" in parallel;
}
function isShouldFreezeDirective(shouldFreeze) {
  return isValidObject(shouldFreeze) && "freeze" in shouldFreeze;
}
function isInitialDirective(initial) {
  return isValidObject(initial) && "initial" in initial;
}
function isDescriptionDirective(description) {
  return isValidObject(description) && "description" in description;
}
function isNestedTransition(transition) {
  return isValidString(transition) && /^\w+\..+$/gi.test(transition);
}
function isParallelTransition(transition) {
  return isValidString(transition) && /^\w+\/.+$/gi.test(transition);
}
function isNestedImmediateDirective(immediate) {
  return isImmediate(immediate) && isNestedTransition(immediate.immediate);
}
function isParallelImmediateDirective(immediate) {
  return isImmediate(immediate) && isParallelTransition(immediate.immediate);
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
function cloneContext(context, weakMap = /* @__PURE__ */ new WeakMap()) {
  if (weakMap.has(context)) {
    return weakMap.get(context);
  }
  if (context === null || context === void 0) {
    return context;
  }
  let result;
  if (Array.isArray(context)) {
    result = context.map((item) => cloneContext(item, weakMap));
  } else if (typeof context === "object") {
    result = {};
    for (let key in context) {
      result[key] = cloneContext(context[key], weakMap);
    }
  } else if (context instanceof Date) {
    result = new Date(context.getTime());
  } else if (context instanceof Set) {
    result = new Set(context);
  } else if (context instanceof Map) {
    let array = Array.from(context, ([key, val]) => [
      key,
      cloneContext(val, weakMap)
    ]);
    result = new Map(array);
  } else if (context instanceof RegExp) {
    return new RegExp(context.source, context.flags);
  } else if (false) {
    result = new context.constructor(context);
  } else {
    result = context;
    return result;
  }
  weakMap.set(context, result);
  return result;
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
var titleToId = (str) => str.toLowerCase().replace(/(\s|\W)/g, "");

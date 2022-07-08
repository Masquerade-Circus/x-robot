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

// lib/serialize/index.ts
var serialize_exports = {};
__export(serialize_exports, {
  serialize: () => serialize
});
module.exports = __toCommonJS(serialize_exports);

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

// lib/serialize/index.ts
function serializeProducer(producer) {
  let serialized = {
    producer: producer.producer.name
  };
  if (isProducerWithTransition(producer)) {
    serialized.transition = producer.transition;
  }
  return serialized;
}
function serializeAction(action) {
  let serialized = {
    action: action.action.name
  };
  if (action.success) {
    if (isValidString(action.success)) {
      serialized.success = action.success;
    } else if (isProducer(action.success)) {
      serialized.success = serializeProducer(action.success);
    }
  }
  if (action.failure) {
    if (isValidString(action.failure)) {
      serialized.failure = action.failure;
    } else if (isProducer(action.failure)) {
      serialized.failure = serializeProducer(action.failure);
    }
  }
  return serialized;
}
function serializeGuard(guard) {
  let serialized = {
    guard: guard.guard.name
  };
  if (isValidString(guard.failure)) {
    serialized.failure = guard.failure;
  } else if (isProducer(guard.failure)) {
    serialized.failure = serializeProducer(guard.failure);
  }
  if ("machine" in guard) {
    serialized.machine = serialize(guard.machine);
  }
  return serialized;
}
function serializeRunArguments(run) {
  if (!Array.isArray(run) || run.length === 0) {
    return null;
  }
  return run.map((item) => {
    if (isAction(item)) {
      return serializeAction(item);
    }
    if (isProducer(item)) {
      return serializeProducer(item);
    }
  });
}
function serializeGuards(guards) {
  if (!guards || guards.length === 0) {
    return null;
  }
  return guards.map((guard) => serializeGuard(guard));
}
function serializeTransition(transition) {
  let serialized = {
    target: transition.target
  };
  let guards = serializeGuards(transition.guards);
  if (guards) {
    serialized.guards = guards;
  }
  return serialized;
}
function serializeImmediate(immediate) {
  let serialized = {
    immediate: immediate.immediate
  };
  let guards = serializeGuards(immediate.guards);
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
function serializeContext(context) {
  return cloneContext(context);
}
function serializeNested(nested) {
  if (!nested || nested.length === 0) {
    return null;
  }
  return nested.map(({ machine, transition }) => {
    let serializedNestedMachine = {
      machine: serialize(machine)
    };
    if (transition) {
      serializedNestedMachine.transition = transition;
    }
    return serializedNestedMachine;
  });
}
function serialize(machine) {
  let serialized = {
    states: {},
    parallel: {},
    context: serializeContext(machine.context),
    initial: machine.initial
  };
  if (machine.title) {
    serialized.title = machine.title;
  }
  for (let state in machine.states) {
    serialized.states[state] = {};
    let nested = serializeNested(machine.states[state].nested);
    if (nested) {
      serialized.states[state].nested = nested;
    }
    let run = serializeRunArguments(machine.states[state].run);
    if (run) {
      serialized.states[state].run = run;
    }
    let on = serializeTransitions(machine.states[state].on);
    if (on) {
      serialized.states[state].on = on;
    }
    let immediate = machine.states[state].immediate;
    if (immediate.length) {
      let serializedImmediate = [];
      for (let immediateDirective of immediate) {
        serializedImmediate.push(serializeImmediate(immediateDirective));
      }
      serialized.states[state].immediate = serializedImmediate;
    }
    if (isValidString(machine.states[state].type)) {
      serialized.states[state].type = machine.states[state].type;
    }
    if (isValidString(machine.states[state].description)) {
      serialized.states[state].description = machine.states[state].description;
    }
  }
  for (let parallel in machine.parallel) {
    serialized.parallel[parallel] = serialize(machine.parallel[parallel]);
  }
  return serialized;
}

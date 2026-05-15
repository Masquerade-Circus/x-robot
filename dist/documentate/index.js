"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// lib/documentate/index.ts
var documentate_exports = {};
__export(documentate_exports, {
  documentate: () => documentate
});
module.exports = __toCommonJS(documentate_exports);

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
function isNestedMachineDirective(machine) {
  return isValidObject(machine) && "machine" in machine;
}
function isMachine(machine) {
  return isValidObject(machine) && "states" in machine && "initial" in machine && "current" in machine;
}
function isNestedTransition(transition) {
  return isValidString(transition) && /^\w+\..+$/gi.test(transition);
}
function isParallelTransition(transition) {
  return isValidString(transition) && /^\w+\/.+$/gi.test(transition);
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
var titleToId = (str) => str.toLowerCase().replace(/(\s|\W)/g, "");

// lib/utils/tree-adapter.ts
var Node = class {
  nodeType = 0;
  nodeName = "";
  nodeValue = "";
  childNodes = [];
  parentNode = null;
  attributes = [];
  appendChild(node) {
    if (node) {
      node.parentNode && node.parentNode.removeChild(node);
      this.childNodes.push(node);
      node.parentNode = this;
    }
    return node;
  }
  removeChild(child) {
    const idx = this.childNodes.indexOf(child);
    if (idx > -1) {
      this.childNodes.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }
  cloneNode(deep) {
    const node = new Node();
    node.nodeType = this.nodeType;
    node.nodeName = this.nodeName;
    node.nodeValue = this.nodeValue;
    if (this.attributes) {
      for (const attr of this.attributes) {
        const newAttr = { nodeName: attr.nodeName, nodeValue: attr.nodeValue };
        node.attributes.push(newAttr);
      }
    }
    if (deep) {
      for (const child of this.childNodes) {
        node.appendChild(child.cloneNode(deep));
      }
    }
    return node;
  }
};
var Element = class extends Node {
  nodeType = 1;
  get tagName() {
    return this.nodeName;
  }
  set tagName(name) {
    this.nodeName = name;
  }
  getAttribute(name) {
    for (const attr of this.attributes) {
      if (attr.nodeName === name) {
        return attr.nodeValue;
      }
    }
    return null;
  }
  setAttribute(name, value) {
    for (const attr of this.attributes) {
      if (attr.nodeName === name) {
        attr.nodeValue = value;
        return;
      }
    }
    this.attributes.push({ nodeName: name, nodeValue: value });
  }
  removeAttribute(name) {
    const idx = this.attributes.findIndex((a) => a.nodeName === name);
    if (idx > -1) {
      this.attributes.splice(idx, 1);
    }
  }
};
var Text = class extends Node {
  nodeType = 3;
  nodeName = "#text";
  textContent = "";
  constructor(textContent = "") {
    super();
    this.textContent = textContent;
    this.nodeValue = textContent;
  }
};
var Document = class extends Element {
  nodeType = 9;
  nodeName = "#document";
  createElement(tagName) {
    const el = new Element();
    el.nodeName = tagName.toLowerCase();
    return el;
  }
  createTextNode(text) {
    return new Text(text);
  }
};
function escapeXml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function domToScxml(node, indent = "") {
  if (node.nodeType === 3) {
    const text = node.nodeValue || node.textContent || "";
    return text ? escapeXml(text) : "";
  }
  if (node.nodeType === 1) {
    const el = node;
    const tagName = el.nodeName.toLowerCase();
    let xml = indent + "<" + tagName;
    for (const attr of el.attributes) {
      xml += ` ${attr.nodeName}="${escapeXml(attr.nodeValue)}"`;
    }
    const childElements = el.childNodes.filter((c) => c.nodeType === 1);
    const childTexts = el.childNodes.filter((c) => c.nodeType === 3 && c.nodeValue.trim());
    if (childElements.length > 0) {
      xml += ">\n";
      for (const child of el.childNodes) {
        xml += domToScxml(child, indent + "  ") + "\n";
      }
      xml += indent + "</" + tagName + ">";
    } else if (childTexts.length > 0) {
      xml += ">";
      for (const child of el.childNodes) {
        if (child.nodeType === 3) {
          xml += escapeXml(child.nodeValue || child.textContent || "");
        }
      }
      xml += "</" + tagName + ">";
    } else {
      xml += "/>";
    }
    return xml;
  }
  return "";
}
function parseXml(xmlString) {
  const doc = new Document();
  const tagRegex = /<(\/?)([a-zA-Z_][\w.-]*)([^>]*?)(\/?)>/g;
  let lastIndex = 0;
  let match;
  let rootElement = null;
  const elementStack = [];
  while ((match = tagRegex.exec(xmlString)) !== null) {
    if (match.index > lastIndex) {
      const textContent = xmlString.substring(lastIndex, match.index);
      if (textContent.trim() && elementStack.length > 0) {
        elementStack[elementStack.length - 1].appendChild(doc.createTextNode(textContent.trim()));
      }
    }
    const isClosing = match[1] === "/";
    const tagName = match[2];
    const attrString = match[3];
    const isSelfClosing = match[4] === "/";
    if (!tagName) {
      lastIndex = match.index + match[0].length;
      continue;
    }
    const attrs = [];
    const attrRegex = /([a-zA-Z_][\w.-]*)="([^"]*)"/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrString)) !== null) {
      attrs.push({ nodeName: attrMatch[1], nodeValue: attrMatch[2] });
    }
    if (isClosing) {
      if (elementStack.length > 0) {
        elementStack.pop();
      }
    } else if (isSelfClosing) {
      const el = doc.createElement(tagName);
      for (const attr of attrs) {
        el.setAttribute(attr.nodeName, attr.nodeValue);
      }
      if (elementStack.length > 0) {
        elementStack[elementStack.length - 1].appendChild(el);
      } else if (!rootElement) {
        rootElement = el;
      }
    } else {
      const el = doc.createElement(tagName);
      for (const attr of attrs) {
        el.setAttribute(attr.nodeName, attr.nodeValue);
      }
      if (elementStack.length > 0) {
        elementStack[elementStack.length - 1].appendChild(el);
      } else {
        rootElement = el;
      }
      elementStack.push(el);
    }
    lastIndex = match.index + match[0].length;
  }
  return rootElement || doc.createElement("root");
}
function parseScxml(scxmlString) {
  const cleanString = scxmlString.replace(/^<\?xml[^?]*\?>/, "").trim();
  return parseXml(cleanString);
}
var document = new Document();

// lib/documentate/serialize.ts
var SERIALIZED_MACHINE_ID_PROPERTY = "__xRobotMachineIdentity";
function createSerializeContext() {
  return {
    identities: /* @__PURE__ */ new WeakMap(),
    nextIdentity: 0
  };
}
function getMachineIdentity(machine, context) {
  let identity = context.identities.get(machine);
  if (!identity) {
    identity = `m${context.nextIdentity}`;
    context.nextIdentity += 1;
    context.identities.set(machine, identity);
  }
  return identity;
}
function attachMachineIdentity(serialized, identity) {
  Object.defineProperty(serialized, SERIALIZED_MACHINE_ID_PROPERTY, {
    value: identity,
    enumerable: false,
    configurable: false,
    writable: false
  });
}
function getSerializedMachineIdentity(machine) {
  const descriptor = Object.getOwnPropertyDescriptor(machine, SERIALIZED_MACHINE_ID_PROPERTY);
  if (!descriptor || descriptor.enumerable || typeof descriptor.value !== "string") {
    return void 0;
  }
  return descriptor.value;
}
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
function serializeGuard(guard, context) {
  let serialized = {
    guard: guard.guard.name
  };
  if (isValidString(guard.failure)) {
    serialized.failure = guard.failure;
  }
  if ("machine" in guard) {
    serialized.machine = serializeWithContext(guard.machine, context);
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
function serializeGuards(guards, context) {
  if (!guards || guards.length === 0) {
    return null;
  }
  return guards.map((guard) => serializeGuard(guard, context));
}
function serializeTransition(transition, context) {
  let serialized = {
    target: transition.target
  };
  let guards = serializeGuards(transition.guards, context);
  if (guards) {
    serialized.guards = guards;
  }
  if (transition.exit) {
    const exitArray = Array.isArray(transition.exit) ? transition.exit : [transition.exit];
    serialized.exit = exitArray.map((pulse) => serializePulse(pulse));
  }
  return serialized;
}
function serializeImmediate(immediate, context) {
  let serialized = {
    immediate: immediate.immediate
  };
  let guards = serializeGuards(immediate.guards, context);
  if (guards) {
    serialized.guards = guards;
  }
  return serialized;
}
function serializeTransitions(events, context) {
  if (!events || Object.keys(events).length === 0) {
    return null;
  }
  let serialized = {};
  for (let event in events) {
    serialized[event] = serializeTransition(events[event], context);
  }
  return serialized;
}
function serializeContext(context) {
  return deepCloneUnfreeze(context);
}
function serializeNested(nested, context) {
  if (!nested || nested.length === 0) {
    return null;
  }
  return nested.map(({ machine, transition }) => {
    let serializedNestedMachine = {
      machine: serializeWithContext(machine, context)
    };
    if (transition) {
      serializedNestedMachine.transition = transition;
    }
    return serializedNestedMachine;
  });
}
function serializeWithContext(machine, context) {
  let serialized = {
    states: {},
    parallel: {},
    context: serializeContext(machine.context),
    initial: machine.initial
  };
  attachMachineIdentity(serialized, getMachineIdentity(machine, context));
  if (machine.title) {
    serialized.title = machine.title;
  }
  for (let state in machine.states) {
    serialized.states[state] = {};
    let nested = serializeNested(machine.states[state].nested, context);
    if (nested) {
      serialized.states[state].nested = nested;
    }
    let run = serializeRunArguments(machine.states[state].run);
    if (run) {
      serialized.states[state].run = run;
    }
    let on = serializeTransitions(machine.states[state].on, context);
    if (on) {
      serialized.states[state].on = on;
    }
    let immediate = machine.states[state].immediate;
    if (immediate.length) {
      let serializedImmediate = [];
      for (let immediateDirective of immediate) {
        serializedImmediate.push(serializeImmediate(immediateDirective, context));
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
    serialized.parallel[parallel] = serializeWithContext(machine.parallel[parallel], context);
  }
  return serialized;
}
function serialize(machine) {
  return serializeWithContext(machine, createSerializeContext());
}

// lib/documentate/generate.ts
function getGuards(transition, guards = [], declaredGuards = []) {
  let code = "";
  if (transition.guards) {
    for (let item of transition.guards) {
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
function getExitPulses(transition, pulses = [], declaredPulses = []) {
  let code = "";
  if (transition.exit && transition.exit.length > 0) {
    code += `, exit(`;
    for (let i = 0; i < transition.exit.length; i++) {
      const exitPulse = transition.exit[i];
      if (!pulses.includes(exitPulse.pulse) && !declaredPulses.includes(exitPulse.pulse)) {
        pulses.push(exitPulse.pulse);
        declaredPulses.push(exitPulse.pulse);
      }
      code += `entry(${exitPulse.pulse}`;
      if (isValidString(exitPulse.failure)) {
        code += `, "${exitPulse.failure}"`;
      }
      code += `)`;
      if (i < transition.exit.length - 1) {
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
    let state = serializedMachine.states[stateName];
    let stateCode = "";
    let implicitStateTransitions = [];
    let stateTypeName = state.type === "default" ? "state" : `${state.type}State`;
    stateCode += `${stateTypeName}(
      "${stateName}",
`;
    if (isValidString(state.description)) {
      stateCode += `      description("${state.description}"),
`;
    }
    if (state.nested && state.nested.length > 0) {
      for (let nestedMachine of state.nested) {
        let { machineName } = getMachineName(nestedMachine.machine);
        stateCode += `      nested(${machineName}`;
        if (nestedMachine.transition) {
          stateCode += `, "${nestedMachine.transition}"`;
        }
        stateCode += "),\n";
      }
    }
    if (state.run && state.run.length > 0) {
      for (let runItem of state.run) {
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
    if (state.immediate) {
      for (let immediate of state.immediate) {
        stateCode += `      immediate("${immediate.immediate}"`;
        stateCode += getGuards({ target: immediate.immediate, guards: immediate.guards }, guards, declaredGuards);
        stateCode += `),
`;
      }
    }
    for (let transitionName in state.on) {
      let transition = state.on[transitionName];
      if (!implicitStateTransitions.includes(transition.target) || transition.guards) {
        if (!state.immediate || !state.immediate.find((immediate) => immediate.immediate === transition.target)) {
          stateCode += `      transition("${transitionName}", "${transition.target}"`;
          stateCode += getGuards(transition, guards, declaredGuards);
          stateCode += getExitPulses(transition, pulses, declaredPulses);
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
      let state = serializedMachine.states[stateName];
      if (state.nested && state.nested.length > 0) {
        addImport("nested", imports);
        for (let nestedMachine of state.nested) {
          getImports(nestedMachine.machine, imports);
        }
      }
      let stateImport = state.type !== "default" ? `${state.type}State` : "state";
      addImport(stateImport, imports);
      if (isValidString(state.description)) {
        addImport("description", imports);
      }
      if (state.immediate) {
        addImport("immediate", imports);
      }
      if (isValidObject(state.on)) {
        if (!imports.includes("transition") || !imports.includes("guard") || !imports.includes("nestedGuard")) {
          for (let transitionName in state.on) {
            if (!imports.includes("transition") && (!isValidString(state.immediate) || state.immediate !== transitionName)) {
              addImport("transition", imports);
            }
            let transition = state.on[transitionName];
            if (transition.guards) {
              for (let item of transition.guards) {
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
            if (transition.exit && transition.exit.length > 0) {
              addImport("exit", imports);
              for (let exitItem of transition.exit) {
                addImport("entry", imports);
                if (isValidString(exitItem.failure)) {
                  addImport("transition", imports);
                }
              }
            }
          }
        }
      }
      if (state.run && state.run.length > 0) {
        for (let runItem of state.run) {
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
    let state = serializedMachine.states[stateName];
    if (state.nested && state.nested.length > 0) {
      for (let nestedMachine of state.nested) {
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
    for (let guard of guards) {
      guardCode += `const ${guard} = (context, payload) => {
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
  for (const [stateName, state] of Object.entries(serializedMachine.states)) {
    stateNames.push(stateName);
    if (state.run && state.run.length > 0) {
      const actions = [];
      for (const pulse of state.run) {
        actions.push(pulse.pulse);
      }
      entryActions.set(stateName, actions);
    }
    if (state.on) {
      for (const [event, transition] of Object.entries(state.on)) {
        if (transition.exit && transition.exit.length > 0) {
          if (!stateContextModifiers.has(stateName)) {
            stateContextModifiers.set(stateName, []);
          }
          for (const exit of transition.exit) {
            stateContextModifiers.get(stateName).push(exit.pulse);
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

// lib/documentate/scxml.ts
function toSCXML(machine) {
  const doc = new Document();
  const initial = machine.initial || Object.keys(machine.states)[0] || "";
  const name = machine.title || "Machine";
  const scxml = doc.createElement("scxml");
  scxml.setAttribute("xmlns", "http://www.w3.org/2005/07/scxml");
  scxml.setAttribute("version", "1.0");
  scxml.setAttribute("initial", initial);
  scxml.setAttribute("name", name);
  for (const [parallelName, parallelMachine] of Object.entries(machine.parallel)) {
    const parallel = doc.createElement("parallel");
    parallel.setAttribute("id", parallelMachine.title || parallelName);
    generateStatesElement(parallelMachine.states, parallel, doc);
    scxml.appendChild(parallel);
  }
  generateStatesElement(machine.states, scxml, doc);
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += domToScxml(scxml);
  return xml;
}
function generateStatesElement(states, parent, doc) {
  for (const [stateName, state] of Object.entries(states)) {
    const stateEl = generateStateElement(stateName, state, doc);
    parent.appendChild(stateEl);
  }
}
function generateStateElement(stateName, state, doc) {
  const isFinal = !state.on || Object.keys(state.on).length === 0;
  let stateEl;
  if (isFinal && !state.nested) {
    stateEl = doc.createElement("final");
    stateEl.setAttribute("id", stateName);
    return stateEl;
  }
  stateEl = doc.createElement("state");
  stateEl.setAttribute("id", stateName);
  if (state.description) {
    const datamodel = doc.createElement("datamodel");
    const data = doc.createElement("data");
    data.setAttribute("id", "description");
    data.appendChild(doc.createTextNode(state.description));
    datamodel.appendChild(data);
    stateEl.appendChild(datamodel);
  }
  if (state.run && state.run.length > 0) {
    const onentry = doc.createElement("onentry");
    for (const pulse of state.run) {
      const script = doc.createElement("script");
      script.appendChild(doc.createTextNode(pulse.pulse + "()"));
      onentry.appendChild(script);
    }
    stateEl.appendChild(onentry);
  }
  if (state.nested && state.nested.length > 0) {
    for (const nested of state.nested) {
      const nestedEl = generateNestedMachineElement(nested, doc);
      stateEl.appendChild(nestedEl);
    }
  }
  if (state.on) {
    for (const [event, transition] of Object.entries(state.on)) {
      const transEl = generateTransitionElement(event, transition, doc);
      stateEl.appendChild(transEl);
    }
  }
  if (state.immediate) {
    for (const immediate of state.immediate) {
      const transEl = generateImmediateTransitionElement(immediate, doc);
      stateEl.appendChild(transEl);
    }
  }
  return stateEl;
}
function generateTransitionElement(event, transition, doc) {
  const transEl = doc.createElement("transition");
  transEl.setAttribute("event", event);
  if (transition.target) {
    transEl.setAttribute("target", transition.target);
  }
  if (transition.guards && transition.guards.length > 0) {
    const conditions = transition.guards.map((g) => g.guard).join(" && ");
    transEl.setAttribute("cond", conditions);
  }
  if (transition.exit && transition.exit.length > 0) {
    const onexit = doc.createElement("onexit");
    for (const pulse of transition.exit) {
      const script = doc.createElement("script");
      script.appendChild(doc.createTextNode(pulse.pulse + "()"));
      onexit.appendChild(script);
    }
    transEl.appendChild(onexit);
  }
  return transEl;
}
function generateImmediateTransitionElement(immediate, doc) {
  const transEl = doc.createElement("transition");
  transEl.setAttribute("type", "internal");
  if (immediate.immediate) {
    transEl.setAttribute("target", immediate.immediate);
  }
  if (immediate.guards && immediate.guards.length > 0) {
    const conditions = immediate.guards.map((g) => g.guard).join(" && ");
    transEl.setAttribute("cond", conditions);
  }
  return transEl;
}
function generateNestedMachineElement(nested, doc) {
  const machineTitle = nested.machine.title || "nested";
  const initial = nested.machine.initial || Object.keys(nested.machine.states)[0] || "";
  const stateEl = doc.createElement("state");
  stateEl.setAttribute("id", machineTitle);
  const initialEl = doc.createElement("initial");
  initialEl.setAttribute("id", initial);
  const initialTrans = doc.createElement("transition");
  initialTrans.setAttribute("target", initial);
  initialEl.appendChild(initialTrans);
  stateEl.appendChild(initialEl);
  generateStatesElement(nested.machine.states, stateEl, doc);
  for (const [parallelName, parallelMachine] of Object.entries(nested.machine.parallel)) {
    const parallel = doc.createElement("parallel");
    parallel.setAttribute("id", parallelMachine.title || parallelName);
    generateStatesElement(parallelMachine.states, parallel, doc);
    stateEl.appendChild(parallel);
  }
  return stateEl;
}
function fromSCXML(scxmlString) {
  const root = parseScxml(scxmlString);
  if (root.nodeName.toLowerCase() !== "scxml") {
    throw new Error("Invalid SCXML document: root element must be <scxml>");
  }
  const machine = {
    title: root.getAttribute("name") || void 0,
    initial: root.getAttribute("initial") || "",
    states: {},
    parallel: {},
    context: {}
  };
  for (const child of root.childNodes) {
    if (child.nodeType !== 1)
      continue;
    const el = child;
    const tagName = el.nodeName.toLowerCase();
    if (tagName === "state") {
      const state = parseStateElement(el);
      if (state.name) {
        machine.states[state.name] = state;
      }
    } else if (tagName === "parallel") {
      const id = el.getAttribute("id");
      if (id) {
        machine.parallel[id] = parseParallelElement(el);
      }
    }
  }
  return machine;
}
function parseStateElement(el) {
  const state = {
    name: el.getAttribute("id") || ""
  };
  const datamodel = el.childNodes.find((c) => c.nodeType === 1 && c.nodeName.toLowerCase() === "datamodel");
  if (datamodel) {
    const data = datamodel.childNodes.find((c) => c.nodeType === 1 && c.nodeName.toLowerCase() === "data");
    if (data) {
      const textNode = data.childNodes.find((c) => c.nodeType === 3);
      if (textNode) {
        state.description = textNode.textContent || textNode.nodeValue;
      }
    }
  }
  const onentry = el.childNodes.find((c) => c.nodeType === 1 && c.nodeName.toLowerCase() === "onentry");
  if (onentry) {
    state.run = parseScriptElements(onentry);
  }
  const transitions = el.childNodes.filter((c) => c.nodeType === 1 && c.nodeName.toLowerCase() === "transition");
  if (transitions.length > 0) {
    state.on = {};
    for (const transEl of transitions) {
      const event = transEl.getAttribute("event");
      const target = transEl.getAttribute("target");
      const cond = transEl.getAttribute("cond");
      const type = transEl.getAttribute("type");
      if (type === "internal" && target) {
        if (!state.immediate)
          state.immediate = [];
        state.immediate.push({
          immediate: target,
          guards: cond ? [{ guard: cond }] : void 0
        });
        continue;
      }
      if (!event)
        continue;
      const transitionObj = { target: target || "" };
      if (cond) {
        transitionObj.guards = [{ guard: cond }];
      }
      const onexit = transEl.childNodes.find((c) => c.nodeType === 1 && c.nodeName.toLowerCase() === "onexit");
      if (onexit) {
        transitionObj.exit = parseScriptElements(onexit);
      }
      state.on[event] = transitionObj;
    }
  }
  const nestedStates = el.childNodes.filter((c) => c.nodeType === 1 && c.nodeName.toLowerCase() === "state");
  if (nestedStates.length > 0) {
    state.nested = [];
    for (const nestedEl of nestedStates) {
      const nestedMachine = parseNestedMachineFromElement(nestedEl);
      state.nested.push(nestedMachine);
    }
  }
  return state;
}
function parseScriptElements(parentEl) {
  const pulses = [];
  const scripts = parentEl.childNodes.filter((c) => c.nodeType === 1 && c.nodeName.toLowerCase() === "script");
  for (const script of scripts) {
    const textNode = script.childNodes.find((c) => c.nodeType === 3);
    const content = textNode?.textContent || textNode?.nodeValue || "";
    if (content) {
      const fnMatch = content.match(/^([\w.]+)\(/);
      if (fnMatch) {
        pulses.push({ pulse: fnMatch[1] });
      }
    }
  }
  return pulses;
}
function parseParallelElement(el) {
  const machine = {
    states: {},
    parallel: {},
    context: {},
    initial: ""
  };
  const initialEl = el.childNodes.find((c) => c.nodeType === 1 && c.nodeName.toLowerCase() === "initial");
  if (initialEl) {
    const transEl = initialEl.childNodes.find((c) => c.nodeType === 1 && c.nodeName.toLowerCase() === "transition");
    if (transEl) {
      machine.initial = transEl.getAttribute("target") || "";
    }
  }
  const stateElements = el.childNodes.filter((c) => c.nodeType === 1 && c.nodeName.toLowerCase() === "state");
  for (const stateEl of stateElements) {
    const state = parseStateElement(stateEl);
    if (state.name) {
      machine.states[state.name] = state;
    }
  }
  return machine;
}
function parseNestedMachineFromElement(el) {
  const machine = {
    states: {},
    parallel: {},
    context: {},
    initial: ""
  };
  const initialEl = el.childNodes.find((c) => c.nodeType === 1 && c.nodeName.toLowerCase() === "initial");
  if (initialEl) {
    const transEl = initialEl.childNodes.find((c) => c.nodeType === 1 && c.nodeName.toLowerCase() === "transition");
    if (transEl) {
      machine.initial = transEl.getAttribute("target") || "";
    }
  }
  const stateElements = el.childNodes.filter((c) => c.nodeType === 1 && c.nodeName.toLowerCase() === "state");
  for (const stateEl of stateElements) {
    const state = parseStateElement(stateEl);
    if (state.name) {
      machine.states[state.name] = state;
    }
  }
  return {
    machine,
    transition: machine.initial
  };
}

// lib/documentate/state-styles.ts
var BUILT_IN_STATE_STYLE_ORDER = [
  "danger",
  "info",
  "warning",
  "success",
  "primary",
  "default"
];
var MERMAID_STATE_STYLE_ORDER = [
  "danger",
  "warning",
  "success",
  "primary",
  "info",
  "default"
];
var BUILT_IN_STATE_STYLES = {
  danger: {
    mermaidClassName: "danger",
    mermaidDefinition: "fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24",
    plantUmlStereotype: "danger",
    plantUmlBackgroundColor: "Implementation",
    plantUmlBorderColor: "indianred"
  },
  warning: {
    mermaidClassName: "warning",
    mermaidDefinition: "fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404",
    plantUmlStereotype: "warning",
    plantUmlBackgroundColor: "Strategy",
    plantUmlBorderColor: "tan"
  },
  success: {
    mermaidClassName: "success",
    mermaidDefinition: "fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724",
    plantUmlStereotype: "success",
    plantUmlBackgroundColor: "Technology",
    plantUmlBorderColor: "mediumseagreen"
  },
  primary: {
    mermaidClassName: "primary",
    mermaidDefinition: "fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085",
    plantUmlStereotype: "primary",
    plantUmlBackgroundColor: "Motivation",
    plantUmlBorderColor: "lightsteelblue"
  },
  info: {
    mermaidClassName: "info",
    mermaidDefinition: "fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460",
    plantUmlStereotype: "info",
    plantUmlBackgroundColor: "Application",
    plantUmlBorderColor: "skyblue"
  },
  default: {
    mermaidClassName: "def",
    mermaidDefinition: "fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d",
    plantUmlStereotype: "default"
  }
};
function isBuiltInStateStyleRole(role) {
  return BUILT_IN_STATE_STYLE_ORDER.includes(role);
}
function resolveStateStyleRole(type) {
  if (typeof type !== "string") {
    return "default";
  }
  const normalizedType = type.trim();
  if (normalizedType.length === 0) {
    return "default";
  }
  return normalizedType;
}
function getMermaidStateClassName(type) {
  const role = resolveStateStyleRole(type);
  if (isBuiltInStateStyleRole(role)) {
    return BUILT_IN_STATE_STYLES[role].mermaidClassName;
  }
  return role;
}
function getPlantUmlStateStereotype(type) {
  const role = resolveStateStyleRole(type);
  if (isBuiltInStateStyleRole(role)) {
    return BUILT_IN_STATE_STYLES[role].plantUmlStereotype;
  }
  return role;
}
function getMermaidClassDefinitions() {
  return MERMAID_STATE_STYLE_ORDER.map((role) => {
    const { mermaidClassName, mermaidDefinition } = BUILT_IN_STATE_STYLES[role];
    return `classDef ${mermaidClassName} ${mermaidDefinition}`;
  });
}
function getPlantUmlStateSkinparamLines() {
  return BUILT_IN_STATE_STYLE_ORDER.filter((role) => role !== "default").flatMap((role) => {
    const style = BUILT_IN_STATE_STYLES[role];
    return [
      `BackgroundColor<<${style.plantUmlStereotype}>> ${style.plantUmlBackgroundColor}`,
      `BorderColor<<${style.plantUmlStereotype}>> ${style.plantUmlBorderColor}`
    ];
  });
}

// lib/documentate/diagram-model.ts
function toDiagramAlias(id) {
  const alias = id.replace(/[^A-Za-z0-9]/g, "_").replace(/^_+|_+$/g, "");
  return alias.length > 0 ? alias : "node";
}
function createAliasRegistry() {
  const aliases = {};
  const used = {};
  function aliasForId(id) {
    if (aliases[id]) {
      return aliases[id];
    }
    const base = toDiagramAlias(id);
    let alias = base;
    let suffix = 2;
    while (used[alias]) {
      alias = `${base}_${suffix}`;
      suffix += 1;
    }
    used[alias] = true;
    aliases[id] = alias;
    return alias;
  }
  return { aliases, aliasForId };
}
function escapeDiagramLabel(value) {
  return value.replace(/[\r\n]+/g, " ").replace(/\\/g, "\uFF3C").replace(/"/g, "\uFF02").replace(/\|/g, "\uFF5C").replace(/\(/g, "\uFF08").replace(/\)/g, "\uFF09").replace(/\[/g, "\uFF3B").replace(/\]/g, "\uFF3D").replace(/\{/g, "\uFF5B").replace(/\}/g, "\uFF5D");
}
function stateId(machinePath, stateName) {
  return `${machinePath}:${stateName}`;
}
function machineId(machinePath) {
  return `machine:${machinePath}`;
}
function eventId(eventName) {
  return `event:${eventName}`;
}
function displayStateLabel(machinePath, stateName) {
  return machinePath === "root" ? stateName : `${machinePath.replace(/^root\.?/, "")}.${stateName}`;
}
function complexityMachineLabel(scope) {
  if (scope.path === "root") {
    return "root";
  }
  if (scope.machine.title) {
    return scope.machine.title;
  }
  const parallelMatch = scope.path.match(/\.parallel\.([^.]+)$/);
  if (parallelMatch) {
    return parallelMatch[1];
  }
  return scope.path.replace(/^root\.?/, "");
}
function resolveState(scope, target) {
  if (!target) {
    return;
  }
  return scope.byName[target];
}
function collectScopes(serializedMachine, aliasForId) {
  const visits = [];
  const scopes = [];
  function visit(machine, path2, parentMachinePath, parentStateId, relation) {
    visits.push({ machine, path: path2, parentMachinePath, parentStateId, relation });
    const states = [];
    const byName = {};
    for (const name in machine.states) {
      const current = {
        id: stateId(path2, name),
        alias: aliasForId(stateId(path2, name)),
        label: displayStateLabel(path2, name),
        name,
        machinePath: path2,
        type: machine.states[name].type || "default"
      };
      states.push(current);
      byName[name] = current;
    }
    scopes.push({ path: path2, machine, states, byName });
    for (const name in machine.states) {
      const state = machine.states[name];
      if (!state.nested) {
        continue;
      }
      for (let i = 0; i < state.nested.length; i++) {
        visit(state.nested[i].machine, `${path2}.state.${name}.nested.${i}`, path2, stateId(path2, name), state.nested[i].transition ? `nested outcome: ${state.nested[i].transition}` : "nested");
      }
    }
    for (const key in machine.parallel) {
      visit(machine.parallel[key], `${path2}.parallel.${key}`, path2, void 0, `parallel: ${key}`);
    }
  }
  visit(serializedMachine, "root");
  return { visits, scopes };
}
function pushOutcome(edges, from, to, label) {
  if (!to) {
    return;
  }
  edges.push({ from: from.id, to: to.id, label, kind: "outcome" });
}
function pushGuardDecision(guardDecisions, outcomeEdges, scope, source, target, guard, triggerLabel, kind) {
  const failure = resolveState(scope, guard.failure);
  if (failure) {
    outcomeEdges.push({
      from: source.id,
      to: failure.id,
      label: `guard failure: ${guard.guard}`,
      kind: "guard-failure"
    });
  }
  guardDecisions.push({
    id: `guard:${guardDecisions.length}`,
    sourceStateId: source.id,
    sourceLabel: source.label,
    triggerLabel,
    guardName: guard.guard,
    successTargetId: target?.id,
    successTargetLabel: target?.label,
    failureTargetId: failure?.id,
    failureTargetLabel: failure?.label,
    kind
  });
}
function addIncoming(incoming, state) {
  if (!state) {
    return;
  }
  incoming[state.id] = (incoming[state.id] || 0) + 1;
}
function collectComplexity(scopes) {
  const outgoing = {};
  const incoming = {};
  const immediateCount = {};
  const entryPulses = {};
  const exitPulses = {};
  const pulseFailures = {};
  const points = [];
  for (const scope of scopes) {
    for (const stateInfo of scope.states) {
      const state = scope.machine.states[stateInfo.name];
      const transitions = state.on || {};
      outgoing[stateInfo.id] = Object.keys(transitions).length;
      immediateCount[stateInfo.id] = state.immediate ? state.immediate.length : 0;
      entryPulses[stateInfo.id] = state.run ? state.run.length : 0;
      exitPulses[stateInfo.id] = 0;
      pulseFailures[stateInfo.id] = 0;
      if (state.run) {
        for (const pulse of state.run) {
          addIncoming(incoming, resolveState(scope, pulse.success));
          addIncoming(incoming, resolveState(scope, pulse.failure));
          if (pulse.failure) {
            pulseFailures[stateInfo.id] += 1;
          }
        }
      }
      for (const event in transitions) {
        const transition = transitions[event];
        addIncoming(incoming, resolveState(scope, transition.target));
        if (transition.guards) {
          for (const guard of transition.guards) {
            addIncoming(incoming, resolveState(scope, guard.failure));
          }
        }
        if (transition.exit) {
          exitPulses[stateInfo.id] += transition.exit.length;
          for (const pulse of transition.exit) {
            addIncoming(incoming, resolveState(scope, pulse.success));
            addIncoming(incoming, resolveState(scope, pulse.failure));
            if (pulse.failure) {
              pulseFailures[stateInfo.id] += 1;
            }
          }
        }
      }
      if (state.immediate) {
        for (const immediate of state.immediate) {
          addIncoming(incoming, resolveState(scope, immediate.immediate));
          if (immediate.guards) {
            for (const guard of immediate.guards) {
              addIncoming(incoming, resolveState(scope, guard.failure));
            }
          }
        }
      }
      if (state.nested) {
        for (const nested of state.nested) {
          addIncoming(incoming, resolveState(scope, nested.transition));
        }
      }
    }
  }
  for (const scope of scopes) {
    const machineLabel = complexityMachineLabel(scope);
    for (const state of scope.states) {
      points.push({
        stateId: state.id,
        label: `${machineLabel}.${state.name}`,
        transitionLoad: (outgoing[state.id] || 0) + (incoming[state.id] || 0) + (immediateCount[state.id] || 0),
        actionLoad: (entryPulses[state.id] || 0) + (exitPulses[state.id] || 0) + (pulseFailures[state.id] || 0),
        x: 0,
        y: 0
      });
    }
  }
  let maxTransitionLoad = 1;
  let maxActionLoad = 1;
  for (const point of points) {
    if (point.transitionLoad > maxTransitionLoad) {
      maxTransitionLoad = point.transitionLoad;
    }
    if (point.actionLoad > maxActionLoad) {
      maxActionLoad = point.actionLoad;
    }
  }
  for (const point of points) {
    point.x = point.transitionLoad / maxTransitionLoad;
    point.y = point.actionLoad / maxActionLoad;
  }
  return points;
}
function collectAdditionalDiagramModel(serializedMachine) {
  const { aliases, aliasForId } = createAliasRegistry();
  const { visits, scopes } = collectScopes(serializedMachine, aliasForId);
  const machines = [];
  const states = [];
  const pulseEdges = [];
  const eventMap = {};
  const eventEdges = [];
  const outcomeEdges = [];
  const immediateEdges = [];
  const guardDecisions = [];
  const compositionEdges = [];
  for (const visit of visits) {
    machines.push({
      id: machineId(visit.path),
      alias: aliasForId(machineId(visit.path)),
      path: visit.path,
      label: visit.machine.title || (visit.path === "root" ? "Machine" : visit.path),
      initial: typeof visit.machine.initial === "string" ? visit.machine.initial : void 0,
      stateCount: Object.keys(visit.machine.states).length
    });
    if (visit.parentMachinePath && visit.relation) {
      compositionEdges.push({
        from: visit.parentStateId || machineId(visit.parentMachinePath),
        to: machineId(visit.path),
        label: visit.relation,
        kind: visit.relation.indexOf("parallel") === 0 ? "parallel" : "nested"
      });
    }
  }
  for (const scope of scopes) {
    for (const stateInfo of scope.states) {
      states.push(stateInfo);
      compositionEdges.push({
        from: machineId(scope.path),
        to: stateInfo.id,
        label: "has state",
        kind: "state"
      });
      const state = scope.machine.states[stateInfo.name];
      if (state.run) {
        for (const pulse of state.run) {
          const success = resolveState(scope, pulse.success);
          const failure = resolveState(scope, pulse.failure);
          if (success) {
            pulseEdges.push({
              from: stateInfo.id,
              to: success.id,
              label: `entry: ${pulse.pulse} \u2713`,
              kind: "entry-success"
            });
            outcomeEdges.push({
              from: stateInfo.id,
              to: success.id,
              label: `entry success: ${pulse.pulse}`,
              kind: "entry-success"
            });
          }
          if (failure) {
            pulseEdges.push({
              from: stateInfo.id,
              to: failure.id,
              label: `entry: ${pulse.pulse} \u2717`,
              kind: "entry-failure"
            });
            outcomeEdges.push({
              from: stateInfo.id,
              to: failure.id,
              label: `entry failure: ${pulse.pulse}`,
              kind: "entry-failure"
            });
          }
        }
      }
      const transitions = state.on || {};
      for (const event in transitions) {
        const transition = transitions[event];
        if (!eventMap[event]) {
          eventMap[event] = {
            id: eventId(event),
            alias: aliasForId(eventId(event)),
            name: event
          };
        }
        const target = resolveState(scope, transition.target);
        if (target) {
          let label = "target";
          if (transition.guards && transition.guards.length > 0) {
            const guards = transition.guards.map((guard) => guard.failure ? `${guard.guard} -> ${guard.failure}` : guard.guard).join(", ");
            label += ` [guard: ${guards}]`;
          }
          eventEdges.push({
            event,
            eventId: eventId(event),
            from: stateInfo.id,
            to: target.id,
            label
          });
          outcomeEdges.push({
            from: stateInfo.id,
            to: target.id,
            label: event,
            kind: "transition"
          });
        }
        if (transition.guards) {
          for (const guard of transition.guards) {
            pushGuardDecision(guardDecisions, outcomeEdges, scope, stateInfo, target, guard, `event: ${event}`, "transition");
          }
        }
        if (transition.exit) {
          for (const pulse of transition.exit) {
            const to = resolveState(scope, transition.target);
            if (to) {
              pulseEdges.push({
                from: stateInfo.id,
                to: to.id,
                label: `exit: ${pulse.pulse} on ${event}`,
                kind: "exit"
              });
            }
            pushOutcome(outcomeEdges, stateInfo, resolveState(scope, pulse.failure), `exit failure: ${pulse.pulse}`);
          }
        }
      }
      if (state.immediate) {
        for (const immediate of state.immediate) {
          const target = resolveState(scope, immediate.immediate);
          const guardText = immediate.guards && immediate.guards.length > 0 ? ` [guard: ${immediate.guards.map((guard) => guard.failure ? `${guard.guard}; failure: ${guard.failure}` : guard.guard).join(", ")}]` : "";
          if (target) {
            immediateEdges.push({
              from: stateInfo.id,
              to: target.id,
              label: `immediate${guardText}`,
              kind: "immediate"
            });
          }
          if (immediate.guards) {
            for (const guard of immediate.guards) {
              pushGuardDecision(guardDecisions, outcomeEdges, scope, stateInfo, target, guard, "immediate", "immediate");
            }
          }
        }
      }
    }
  }
  return {
    machines,
    states,
    pulseEdges,
    events: Object.keys(eventMap).map((name) => eventMap[name]),
    eventEdges,
    outcomeEdges,
    immediateEdges,
    guardDecisions,
    compositionEdges,
    complexityPoints: collectComplexity(scopes),
    aliases
  };
}

// lib/documentate/visualize.ts
var import_child_process = require("child_process");
var import_fs = __toESM(require("fs"));
var import_os = __toESM(require("os"));
var import_path = __toESM(require("path"));
var VISUALIZATION_LEVEL = {
  LOW: "low",
  HIGH: "high"
};
var MERMAID_THEME = {
  DEFAULT: "default",
  NEUTRAL: "neutral",
  DARK: "dark"
};
var MERMAID_INDENT_SPACE = "\u2007";
var MERMAID_DIRECTION = "TB";
var toCammelCase2 = (str) => str.replace(/(^\w)/g, ($1) => $1.toUpperCase()).replace(/\s(.)/g, ($1) => $1.toUpperCase()).replace(/\W/g, "");
function getInnerPlantUmlCode(serializedMachine, options, parentName = "", childLevel = 0) {
  let plantUmlCode = "";
  let { level } = options;
  const isChild = childLevel > 0;
  const cammelCasedTitle = toCammelCase2(`${parentName}${toCammelCase2(serializedMachine.title || "")}`);
  const space = Array.from({ length: childLevel }).map(() => "  ").join("");
  if (serializedMachine.title) {
    if (isChild) {
      plantUmlCode += `${space}note "${serializedMachine.title}" as N${cammelCasedTitle}

`;
    } else {
      plantUmlCode += `${space}title ${serializedMachine.title}

`;
    }
  }
  const stateNames = {};
  for (const stateName in serializedMachine.states) {
    const cammelCased = toCammelCase2(stateName);
    stateNames[stateName] = isChild ? `${cammelCasedTitle}${cammelCased}` : stateName;
  }
  let states = "";
  for (const stateName in serializedMachine.states) {
    const state = serializedMachine.states[stateName];
    if (isChild) {
      states += `${space}state "${stateName}" as ${stateNames[stateName]}`;
    } else {
      states += `${space}state ${stateName}`;
    }
    states += `<<${getPlantUmlStateStereotype(state.type)}>>
`;
  }
  if (states.trim().length > 0) {
    plantUmlCode += `${space}${states.trim()}
`;
  }
  let nestedMachines = "";
  for (const stateName in serializedMachine.states) {
    const state = serializedMachine.states[stateName];
    if (state.nested) {
      nestedMachines += `
${space}state ${stateNames[stateName]} {
`;
      for (let nested of state.nested) {
        let innerPlantUmlCode = getInnerPlantUmlCode(nested.machine, options, toCammelCase2(stateNames[stateName]), childLevel + 1);
        nestedMachines += innerPlantUmlCode + `
${space}  ||

`;
      }
      nestedMachines = nestedMachines.replace(/\n\s+\|\|\n\n$/, "\n") + `${space}}
`;
    }
  }
  if (nestedMachines.trim().length > 0) {
    plantUmlCode += `
${space}${nestedMachines.trim()}
`;
  }
  let parallelStates = "";
  if (Object.keys(serializedMachine.parallel).length > 0) {
    parallelStates += `
${space}state "Parallel states" as ${cammelCasedTitle}ParallelStates {
`;
    for (const parallel in serializedMachine.parallel) {
      const parallelState = serializedMachine.parallel[parallel];
      parallelStates += getInnerPlantUmlCode(parallelState, options, cammelCasedTitle, childLevel + 1);
      parallelStates += `
${space}  --

`;
    }
    parallelStates = parallelStates.replace(/\n\s+--\n\n$/, "\n") + `${space}}
`;
  }
  if (parallelStates.trim().length > 0) {
    plantUmlCode += `
${space}${parallelStates.trim()}
`;
  }
  if (level === VISUALIZATION_LEVEL.HIGH) {
    let stateDescriptionsPlantUmlCode = "";
    for (const stateName in serializedMachine.states) {
      const state = serializedMachine.states[stateName];
      if (state.description) {
        stateDescriptionsPlantUmlCode += `${space}${stateNames[stateName]}: ${state.description}
`;
      }
    }
    if (stateDescriptionsPlantUmlCode.trim().length > 0) {
      plantUmlCode += `
${space}${stateDescriptionsPlantUmlCode.trim()}
`;
    }
  }
  let highData = "";
  if (level === VISUALIZATION_LEVEL.HIGH) {
    for (const stateName in serializedMachine.states) {
      const state = serializedMachine.states[stateName];
      const run = [];
      if (state.nested) {
        for (let nested of state.nested) {
          if (nested.transition) {
            let nestedCammelCasedTitle = titleToId(nested.machine.title || "");
            let nestedTransition = `${nestedCammelCasedTitle}.${nested.transition}`;
            run.push({ ...nested, transition: nestedTransition });
          }
        }
      }
      run.push(...state.run || []);
      if (state.immediate && state.immediate.length > 0) {
        for (let immediate of state.immediate) {
          if (isNestedTransition(immediate.immediate) || isParallelTransition(immediate.immediate)) {
            run.push(immediate);
          }
        }
      }
      let asciiTree = getAsciiTree(run, "entry");
      if (asciiTree.length) {
        highData += `${space}${stateNames[stateName]}: ${asciiTree}
`;
      }
    }
    highData += `
`;
  }
  if (highData.trim().length > 0) {
    plantUmlCode += `
${space}${highData.trim()}
`;
  }
  let transitions = "";
  if (isValidString(serializedMachine.initial)) {
    transitions += `
${space}[*] --> ${stateNames[serializedMachine.initial]}
`;
  }
  for (const stateName in serializedMachine.states) {
    const state = serializedMachine.states[stateName];
    if (state.on) {
      for (const transitionName in state.on) {
        const stateTargetName = stateNames[state.on[transitionName].target];
        const stateTarget = serializedMachine.states[state.on[transitionName].target];
        let arrow = "";
        switch (stateTarget.type) {
          case "danger":
            arrow = "#indianred";
            break;
          case "info":
            arrow = "#skyblue";
            break;
          case "warning":
            arrow = "#tan";
            break;
          case "success":
            arrow = "#mediumseagreen";
            break;
          case "primary":
            arrow = "#lightsteelblue";
            break;
          default:
            arrow = "#slategray";
            break;
        }
        let isImmediate2 = state.immediate && state.immediate.find((immediate) => immediate.immediate === transitionName);
        if (isImmediate2) {
          arrow += ",dashed";
        }
        transitions += `${space}${stateNames[stateName]} -[${arrow}]-> ${stateTargetName}: ${transitionName}`;
        if (level === VISUALIZATION_LEVEL.HIGH) {
          if (state.on[transitionName].guards) {
            let asciiTree = getAsciiTree(state.on[transitionName].guards || [], "guard");
            if (asciiTree.length) {
              transitions += `\\n${asciiTree}`;
            }
          }
          const exitData = state.on[transitionName].exit;
          if (exitData && exitData.length > 0) {
            const exitNames = exitData.map((ep) => ep.pulse).join(", ");
            transitions += `\\n[exit: ${exitNames}]`;
          }
        }
        transitions += `
`;
      }
    }
  }
  if (transitions.trim().length > 0) {
    plantUmlCode += `
${space}${transitions.trim()}
`;
  }
  return plantUmlCode;
}
function getPlantUmlCode(serializedMachine, optionsOrLevel = VISUALIZATION_LEVEL.LOW) {
  let opts = typeof optionsOrLevel === "string" ? { level: optionsOrLevel } : optionsOrLevel;
  let { skinparam } = opts;
  const plantUmlStateSkinparamLines = getPlantUmlStateSkinparamLines().map((line) => `  ${line}`).join("\n");
  let plantUmlCode = `
@startuml

`;
  plantUmlCode += getInnerPlantUmlCode(serializedMachine, opts);
  plantUmlCode += `
hide empty description
skinparam backgroundColor white
skinparam shadowing false
skinparam note {
  BackgroundColor white
  BorderColor slategray
  FontName monospaced
}
skinparam ArrowFontName monospaced
skinparam state {
  FontName monospaced
  AttributeFontName monospaced
  BackgroundColor white
  BorderColor slategray
  ArrowColor slategray
  ArrowThickness 2
  MessageAlignment left
${plantUmlStateSkinparamLines}
}`;
  if (isValidString(skinparam)) {
    plantUmlCode += `
${skinparam}`;
  }
  plantUmlCode += `
@enduml
`;
  return plantUmlCode;
}
function getTree(collection, context = "entry") {
  if (collection.length === 0) {
    return null;
  }
  let tree = {
    name: "",
    children: []
  };
  let name = (type) => (value) => `${type}:${value}`;
  let guard = (isAsync) => name(isAsync ? "AG" : "G");
  let pulse = (isEntry2, isAsync) => {
    const prefix = isEntry2 ? isAsync ? "AEn" : "En" : isAsync ? "AEx" : "Ex";
    return name(prefix);
  };
  let transition = name("T");
  for (let i = 0, l = collection.length; i < l; i++) {
    const item = collection[i];
    if (!item) {
      continue;
    }
    let obj = {
      children: []
    };
    if ("guard" in item) {
      obj.name = guard(item.isAsync)(item.guard);
    }
    if ("pulse" in item) {
      const isEntry2 = context === "entry";
      obj.name = pulse(isEntry2, item.isAsync)(item.pulse);
    }
    if ("immediate" in item) {
      obj.name = transition(item.immediate);
    }
    if ("success" in item) {
      let child = {
        name: `success`,
        children: []
      };
      if (typeof item.success === "string") {
        child.children.push({ name: transition(item.success) });
      }
      obj.children.push(child);
    }
    if ("failure" in item) {
      let child = {
        name: `failure`,
        children: []
      };
      if (typeof item.failure === "string") {
        child.children.push({ name: transition(item.failure) });
      }
      obj.children.push(child);
    }
    if (isNestedMachineDirective(item) && isValidString(item.transition)) {
      obj.name = transition(item.transition);
    }
    if ("guards" in item) {
      if (Array.isArray(item.guards) && item.guards.length > 0) {
        let guards = getTree(item.guards, "guard");
        if (guards) {
          obj.children.push(...guards.children);
        }
      }
    }
    tree.children.push(obj);
  }
  return tree;
}
function getAsciiTree(collection, context) {
  let tree = getTree(collection, context || "entry");
  if (!tree) {
    return "";
  }
  return stringifyTree(tree, (t) => t.name, (t) => t.children).replace(/\n/g, "\\n");
}
function getMermaidTreeLabel(collection, context) {
  return getAsciiTree(collection, context).replace(/\b(AEn|En|AEx|Ex|AG|G|T):/g, "$1-").replace(/(^|\\n)( +)/g, (_, prefix, spaces) => `${prefix}${MERMAID_INDENT_SPACE.repeat(spaces.length)}`);
}
function escapeMermaidLabel(value) {
  return value.replace(/"/g, '\\"');
}
function escapeMermaidSequenceText(value) {
  return value.replace(/[\r\n]+/g, " ").replace(/"/g, "#quot;");
}
function escapeMermaidSequenceParticipantText(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/[\r\n]+/g, " ").replace(/"/g, "#quot;");
}
function escapePlantUmlSequenceText(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\r\n]+/g, " ");
}
function toSequenceAliasPart(value, fallback) {
  const alias = value.replace(/[^A-Za-z0-9]/g, "_").replace(/^_+|_+$/g, "");
  return alias.length > 0 ? alias : fallback;
}
function countMatchingNestedMachines(nested, machine) {
  const guardMachineIdentity = getSerializedMachineIdentity(machine);
  if (!guardMachineIdentity) {
    return 0;
  }
  let matches = 0;
  for (const nestedMachine of nested) {
    if (getSerializedMachineIdentity(nestedMachine.machine) === guardMachineIdentity) {
      matches += 1;
    }
  }
  return matches;
}
function getNestedOutcomeReactionLabel(nested, nestedMachine, stateImmediate, stateOn) {
  if (!stateImmediate || !stateOn) {
    return null;
  }
  if (!isValidString(nestedMachine.transition)) {
    return null;
  }
  const nestedMachineIdentity = getSerializedMachineIdentity(nestedMachine.machine);
  if (!nestedMachineIdentity) {
    return null;
  }
  for (const immediate of stateImmediate) {
    if (!stateOn[immediate.immediate] || !immediate.guards) {
      continue;
    }
    for (const guard of immediate.guards) {
      if (!guard.machine) {
        continue;
      }
      if (countMatchingNestedMachines(nested, guard.machine) !== 1) {
        continue;
      }
      if (getSerializedMachineIdentity(guard.machine) === nestedMachineIdentity) {
        return `outcome captured by ${immediate.immediate}`;
      }
    }
  }
  return null;
}
function collectSequenceDiagramData(serializedMachine) {
  const participants = [];
  const relations = [];
  let nestedCount = 0;
  function visit(machine, alias, label) {
    participants.push({ alias, label, machine });
    let stateIndex = 0;
    for (const stateName in machine.states) {
      const currentStateIndex = stateIndex;
      stateIndex += 1;
      const state = machine.states[stateName];
      if (!state.nested) {
        continue;
      }
      for (let i = 0; i < state.nested.length; i++) {
        const nestedMachine = state.nested[i];
        nestedCount += 1;
        const nestedAlias = `${alias}_S${currentStateIndex}_${toSequenceAliasPart(stateName, `state${currentStateIndex}`)}_N${i}`;
        const nestedLabel = nestedMachine.machine.title || `Nested machine ${nestedCount}`;
        if (nestedMachine.transition) {
          relations.push({
            from: alias,
            to: nestedAlias,
            label: `nested ${nestedMachine.transition}`
          });
        }
        const returnLabel = getNestedOutcomeReactionLabel(state.nested, nestedMachine, state.immediate, state.on);
        if (returnLabel) {
          relations.push({
            from: nestedAlias,
            to: alias,
            label: returnLabel,
            isReturn: true
          });
        }
        visit(nestedMachine.machine, nestedAlias, nestedLabel);
      }
    }
    let parallelIndex = 0;
    for (const parallelKey in machine.parallel) {
      const parallelMachine = machine.parallel[parallelKey];
      const parallelAlias = `${alias}_PAR${parallelIndex}`;
      const parallelLabel = parallelMachine.title || `Parallel machine ${parallelKey || parallelIndex + 1}`;
      relations.push({
        from: alias,
        to: parallelAlias,
        label: `parallel ${parallelMachine.title || parallelKey || parallelIndex + 1}`
      });
      visit(parallelMachine, parallelAlias, parallelLabel);
      parallelIndex += 1;
    }
  }
  visit(serializedMachine, "P0", serializedMachine.title || "Machine");
  return { participants, relations };
}
function getSequenceTransitionLabel(event, from, transition, level) {
  let label = `${event}: ${from} -> ${transition.target}`;
  if (level === VISUALIZATION_LEVEL.HIGH) {
    if (transition.guards && transition.guards.length > 0) {
      const guardNames = transition.guards.map((guard) => guard.guard).join(", ");
      if (guardNames.length > 0) {
        label += ` [guard: ${guardNames}]`;
      }
    }
    if (transition.exit && transition.exit.length > 0) {
      const exitNames = transition.exit.map((exitPulse) => exitPulse.pulse).join(", ");
      if (exitNames.length > 0) {
        label += ` [exit: ${exitNames}]`;
      }
    }
  }
  return label;
}
async function createImageFromPlantUmlCode(plantUmlCode, type, options = {}) {
  const plantUmlJarPath = import_path.default.resolve(__dirname, "../../vendor/plantuml.jar");
  const extension = type === "png" ? "png" : "svg";
  const fileName = (options.fileName || `plantuml-code-${Date.now()}`).replace(`.${extension}`, "");
  const outDirPath = import_path.default.resolve(options.outDir || import_os.default.tmpdir());
  let plantUmlCodeFilePath = import_path.default.resolve(import_os.default.tmpdir(), `${fileName}.txt`);
  const plantUmlImageFile = import_path.default.resolve(outDirPath, fileName.indexOf(".") !== -1 ? fileName : `${fileName}.${extension}`);
  import_fs.default.writeFileSync(plantUmlCodeFilePath, plantUmlCode, "utf8");
  if (import_fs.default.existsSync(plantUmlImageFile)) {
    import_fs.default.unlinkSync(plantUmlImageFile);
  }
  const plantUmlCommand = `java -jar ${plantUmlJarPath} -t${extension} ${plantUmlCodeFilePath} -o ${outDirPath}`;
  let timeoutTime = 1e4;
  let now = Date.now();
  await (0, import_child_process.exec)(plantUmlCommand);
  while (!import_fs.default.existsSync(plantUmlImageFile) || import_fs.default.statSync(plantUmlImageFile).size === 0) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (Date.now() - now > timeoutTime) {
      throw new Error("Timeout waiting for plantuml to create the image");
    }
  }
  if (!import_fs.default.existsSync(plantUmlImageFile)) {
    throw new Error(`PlantUML did not create the png file: ${plantUmlImageFile}`);
  }
  import_fs.default.unlinkSync(plantUmlCodeFilePath);
  return plantUmlImageFile;
}
function getInnerMermaidCode(serializedMachine, options, parentName = "", childLevel = 0) {
  let mermaidCode = "";
  let { level } = options;
  const isChild = childLevel > 0;
  const cammelCasedTitle = `${parentName}${toCammelCase2(serializedMachine.title || "")}`;
  const space = Array.from({ length: childLevel }).map(() => "  ").join("");
  if (!isChild) {
    mermaidCode += `${getMermaidClassDefinitions().join("\n")}

`;
  }
  const stateNames = {};
  const stateTypes = {};
  for (const stateName in serializedMachine.states) {
    stateNames[stateName] = isChild ? `${cammelCasedTitle}${toCammelCase2(stateName)}` : stateName;
    stateTypes[stateName] = resolveStateStyleRole(serializedMachine.states[stateName].type);
  }
  for (const stateName in serializedMachine.states) {
    const state = serializedMachine.states[stateName];
    const stateId2 = stateNames[stateName];
    mermaidCode += `${space}state "${escapeMermaidLabel(stateName)}" as ${stateId2}
`;
  }
  if (!isChild) {
    for (const stateName in serializedMachine.states) {
      const stateId2 = stateNames[stateName];
      const stateType = stateTypes[stateName];
      mermaidCode += `${space}class ${stateId2} ${getMermaidStateClassName(stateType)}
`;
    }
  }
  if (Object.keys(serializedMachine.states).length > 0) {
    mermaidCode += "\n";
  }
  let nestedMachines = "";
  for (const stateName in serializedMachine.states) {
    const state = serializedMachine.states[stateName];
    const stateId2 = stateNames[stateName];
    if (state.nested) {
      nestedMachines += `${space}state ${stateId2} {
`;
      for (let nestedMachine of state.nested) {
        nestedMachines += getInnerMermaidCode(nestedMachine.machine, options, toCammelCase2(stateId2), childLevel + 1);
        nestedMachines += `${space}  --
`;
      }
      nestedMachines = nestedMachines.replace(/\s+--\n$/, "\n") + `${space}}
`;
    }
  }
  if (nestedMachines.trim().length > 0) {
    mermaidCode += `${nestedMachines}
`;
  }
  if (Object.keys(serializedMachine.parallel).length > 0) {
    const parallelStateId = `${cammelCasedTitle}ParallelStates`;
    mermaidCode += `${space}state "Parallel states" as ${parallelStateId}
`;
    mermaidCode += `${space}state ${parallelStateId} {
`;
    for (const parallel in serializedMachine.parallel) {
      mermaidCode += getInnerMermaidCode(serializedMachine.parallel[parallel], options, cammelCasedTitle, childLevel + 1);
      mermaidCode += `${space}  --
`;
    }
    mermaidCode = mermaidCode.replace(/\s+--\n$/, "\n") + `${space}}

`;
  }
  if (level === "high") {
    for (const stateName in serializedMachine.states) {
      const state = serializedMachine.states[stateName];
      const stateId2 = stateNames[stateName];
      const noteLines = [];
      if (state.description) {
        if (state.nested) {
          noteLines.push(state.description);
        } else {
          mermaidCode += `${space}${stateId2}: ${state.description}
`;
        }
      }
      const run = [];
      if (state.nested) {
        for (let nestedMachine of state.nested) {
          if (nestedMachine.transition) {
            run.push({
              ...nestedMachine,
              transition: `${titleToId(nestedMachine.machine.title || "")}.${nestedMachine.transition}`
            });
          }
        }
      }
      run.push(...state.run || []);
      if (state.immediate && state.immediate.length > 0) {
        for (let immediate of state.immediate) {
          if (isNestedTransition(immediate.immediate) || isParallelTransition(immediate.immediate)) {
            run.push(immediate);
          }
        }
      }
      if (run.length > 0) {
        let asciiTree = getMermaidTreeLabel(run, "entry");
        if (asciiTree.length > 0) {
          if (state.nested) {
            noteLines.push(...asciiTree.split("\\n"));
          } else {
            asciiTree = asciiTree.replace(/\\n/g, "<br>");
            mermaidCode += `${space}${stateId2}: ${asciiTree}
`;
          }
        }
      }
      if (noteLines.length > 0) {
        mermaidCode += `${space}note right of ${stateId2}
`;
        for (const line of noteLines) {
          mermaidCode += `${space}  ${line}
`;
        }
        mermaidCode += `${space}end note
`;
      }
    }
    mermaidCode += "\n";
  }
  if (serializedMachine.initial) {
    mermaidCode += `${space}[*] --> ${stateNames[serializedMachine.initial] || serializedMachine.initial}
`;
  }
  for (const stateName in serializedMachine.states) {
    const state = serializedMachine.states[stateName];
    const fromState = stateNames[stateName];
    if (state.on) {
      for (const event in state.on) {
        const transition = state.on[event];
        const toState = stateNames[transition.target] || transition.target;
        let label = event;
        if (level === "high") {
          if (transition.guards && transition.guards.length > 0) {
            let guardsTree = getMermaidTreeLabel(transition.guards, "guard");
            if (guardsTree.length > 0) {
              guardsTree = guardsTree.replace(/\\n/g, "<br>");
              label += `<br>${guardsTree}`;
            }
          }
          if (transition.exit && transition.exit.length > 0) {
            const exitNames = transition.exit.map((exitPulse) => exitPulse.pulse).join(", ");
            if (exitNames.length > 0) {
              label += `<br>[exit: ${exitNames}]`;
            }
          }
        }
        mermaidCode += `${space}${fromState} --> ${toState}: ${label}
`;
      }
    }
  }
  return mermaidCode;
}
function getMermaidCode(serializedMachine, optionsOrLevel = MERMAID_THEME.DEFAULT) {
  let opts = typeof optionsOrLevel === "string" ? { level: optionsOrLevel } : optionsOrLevel;
  let { theme } = opts;
  let mermaidCode = "";
  if (serializedMachine.title) {
    mermaidCode += `---
title: ${serializedMachine.title}
---

`;
  }
  mermaidCode += `stateDiagram-v2
`;
  mermaidCode += `direction ${MERMAID_DIRECTION}

`;
  mermaidCode += getInnerMermaidCode(serializedMachine, opts);
  if (theme && theme !== MERMAID_THEME.DEFAULT) {
    mermaidCode += `
%% Theme: ${theme}
`;
  }
  return mermaidCode;
}
function getMermaidSequenceCode(serializedMachine, optionsOrLevel = VISUALIZATION_LEVEL.LOW) {
  let opts = typeof optionsOrLevel === "string" ? { level: optionsOrLevel } : optionsOrLevel;
  const data = collectSequenceDiagramData(serializedMachine);
  let mermaidCode = "sequenceDiagram\n";
  for (const participant of data.participants) {
    mermaidCode += `participant ${participant.alias} as ${escapeMermaidSequenceParticipantText(participant.label)}
`;
  }
  for (const relation of data.relations) {
    const arrow = relation.isReturn ? "-->>" : "->>";
    mermaidCode += `${relation.from}${arrow}${relation.to}: ${escapeMermaidSequenceText(relation.label)}
`;
  }
  for (const participant of data.participants) {
    for (const stateName in participant.machine.states) {
      const state = participant.machine.states[stateName];
      if (!state.on) {
        continue;
      }
      for (const event in state.on) {
        const transition = state.on[event];
        const label = getSequenceTransitionLabel(event, stateName, transition, opts.level);
        mermaidCode += `${participant.alias}->>${participant.alias}: ${escapeMermaidSequenceText(label)}
`;
      }
    }
  }
  return mermaidCode;
}
function getPlantUmlSequenceCode(serializedMachine, optionsOrLevel = VISUALIZATION_LEVEL.LOW) {
  let opts = typeof optionsOrLevel === "string" ? { level: optionsOrLevel } : optionsOrLevel;
  const data = collectSequenceDiagramData(serializedMachine);
  let plantUmlCode = "@startuml\n";
  for (const participant of data.participants) {
    plantUmlCode += `participant "${escapePlantUmlSequenceText(participant.label)}" as ${participant.alias}
`;
  }
  for (const relation of data.relations) {
    const arrow = relation.isReturn ? "-->" : "->";
    plantUmlCode += `${relation.from} ${arrow} ${relation.to}: ${escapePlantUmlSequenceText(relation.label)}
`;
  }
  for (const participant of data.participants) {
    for (const stateName in participant.machine.states) {
      const state = participant.machine.states[stateName];
      if (!state.on) {
        continue;
      }
      for (const event in state.on) {
        const transition = state.on[event];
        const label = getSequenceTransitionLabel(event, stateName, transition, opts.level);
        plantUmlCode += `${participant.alias} -> ${participant.alias}: ${escapePlantUmlSequenceText(label)}
`;
      }
    }
  }
  plantUmlCode += "@enduml\n";
  return plantUmlCode;
}
function getAdditionalModel(serializedMachine) {
  return collectAdditionalDiagramModel(serializedMachine);
}
function plantUmlRectangleSkinparam(extra = "") {
  return `skinparam rectangle {
  RoundCorner 12
  Shadowing false${extra}
}
`;
}
function renderMermaidNodes(model, includeType = false) {
  let code = "";
  for (const state of model.states) {
    const label = includeType ? `${escapeDiagramLabel(state.name)}\\n${escapeDiagramLabel(state.type)}` : escapeDiagramLabel(state.label);
    const className = includeType ? `:::${state.type}` : "";
    code += `  ${state.alias}["${label}"]${className}
`;
  }
  return code;
}
function renderPlantUmlNodes(model, includeType = false) {
  let code = "";
  for (const state of model.states) {
    const label = includeType ? `${escapeDiagramLabel(state.name)}\\n${escapeDiagramLabel(state.type)}` : escapeDiagramLabel(state.label);
    const stereotype = includeType && state.type !== "default" ? ` <<${state.type}>>` : "";
    code += `rectangle "${label}" as ${state.alias}${stereotype}
`;
  }
  return code;
}
function modelAlias(model, id) {
  const alias = model.aliases[id];
  if (!alias) {
    throw new Error(`Missing diagram alias for id: ${id}`);
  }
  return alias;
}
function getMermaidPulseMapCode(serializedMachine) {
  const model = getAdditionalModel(serializedMachine);
  let code = "flowchart TD\n";
  code += renderMermaidNodes(model);
  for (const edge of model.pulseEdges) {
    code += `  ${modelAlias(model, edge.from)} -->|"${escapeDiagramLabel(edge.label)}"| ${modelAlias(model, edge.to)}
`;
  }
  code += "  classDef pulse fill:#eef6ff,stroke:#2f6fed,color:#0b1b3a\n";
  return code;
}
function getPlantUmlPulseMapCode(serializedMachine) {
  const model = getAdditionalModel(serializedMachine);
  let code = `@startuml
${plantUmlRectangleSkinparam()}
`;
  code += renderPlantUmlNodes(model);
  for (const edge of model.pulseEdges) {
    code += `${modelAlias(model, edge.from)} --> ${modelAlias(model, edge.to)} : ${escapeDiagramLabel(edge.label)}
`;
  }
  code += "@enduml\n";
  return code;
}
function getMermaidEventMapCode(serializedMachine) {
  const model = getAdditionalModel(serializedMachine);
  let code = "flowchart LR\n";
  code += renderMermaidNodes(model);
  for (const event of model.events) {
    code += `  ${event.alias}{{"event: ${escapeDiagramLabel(event.name)}"}}
`;
  }
  for (const edge of model.eventEdges) {
    code += `  ${modelAlias(model, edge.from)} --> ${modelAlias(model, edge.eventId)}
`;
    code += `  ${modelAlias(model, edge.eventId)} -->|"${escapeDiagramLabel(edge.label)}"| ${modelAlias(model, edge.to)}
`;
  }
  return code;
}
function getPlantUmlEventMapCode(serializedMachine) {
  const model = getAdditionalModel(serializedMachine);
  let code = `@startuml
${plantUmlRectangleSkinparam()}
`;
  for (const event of model.events) {
    code += `rectangle "event: ${escapeDiagramLabel(event.name)}" as ${event.alias}
`;
  }
  code += renderPlantUmlNodes(model);
  for (const edge of model.eventEdges) {
    code += `${modelAlias(model, edge.from)} --> ${modelAlias(model, edge.eventId)}
`;
    code += `${modelAlias(model, edge.eventId)} --> ${modelAlias(model, edge.to)} : ${escapeDiagramLabel(edge.label)}
`;
  }
  code += "@enduml\n";
  return code;
}
function getMermaidOutcomeMapCode(serializedMachine) {
  const model = getAdditionalModel(serializedMachine);
  let code = "flowchart TD\n";
  code += renderMermaidNodes(model, true);
  for (const edge of model.outcomeEdges) {
    code += `  ${modelAlias(model, edge.from)} -->|"${escapeDiagramLabel(edge.label)}"| ${modelAlias(model, edge.to)}
`;
  }
  code += "  classDef primary fill:#e8f1ff,stroke:#3164d4\n";
  code += "  classDef warning fill:#fff8db,stroke:#b78b00\n";
  code += "  classDef success fill:#e8f7ed,stroke:#20834d\n";
  code += "  classDef danger fill:#ffecef,stroke:#cf2e46\n";
  code += "  classDef default fill:#f7f7f7,stroke:#777\n";
  return code;
}
function getPlantUmlOutcomeMapCode(serializedMachine) {
  const model = getAdditionalModel(serializedMachine);
  let code = `@startuml
${plantUmlRectangleSkinparam()}`;
  code += "skinparam rectangle<<primary>> BackgroundColor #E8F1FF\n";
  code += "skinparam rectangle<<warning>> BackgroundColor #FFF8DB\n";
  code += "skinparam rectangle<<success>> BackgroundColor #E8F7ED\n";
  code += "skinparam rectangle<<danger>> BackgroundColor #FFECEF\n\n";
  code += renderPlantUmlNodes(model, true);
  for (const edge of model.outcomeEdges) {
    code += `${modelAlias(model, edge.from)} --> ${modelAlias(model, edge.to)} : ${escapeDiagramLabel(edge.label)}
`;
  }
  code += "@enduml\n";
  return code;
}
function getMermaidImmediateMapCode(serializedMachine) {
  const model = getAdditionalModel(serializedMachine);
  let code = "flowchart TD\n";
  code += renderMermaidNodes(model);
  for (const edge of model.immediateEdges) {
    code += `  ${modelAlias(model, edge.from)} -. "${escapeDiagramLabel(edge.label)}" .-> ${modelAlias(model, edge.to)}
`;
  }
  return code;
}
function getPlantUmlImmediateMapCode(serializedMachine) {
  const model = getAdditionalModel(serializedMachine);
  let code = `@startuml
${plantUmlRectangleSkinparam()}
`;
  code += renderPlantUmlNodes(model);
  for (const edge of model.immediateEdges) {
    code += `${modelAlias(model, edge.from)} ..> ${modelAlias(model, edge.to)} : ${escapeDiagramLabel(edge.label)}
`;
  }
  code += "@enduml\n";
  return code;
}
function getGuardDecisionActivitySteps(model) {
  return model.guardDecisions;
}
function getMermaidGuardDecisionMapCode(serializedMachine) {
  const model = getAdditionalModel(serializedMachine);
  const decisions = getGuardDecisionActivitySteps(model);
  let code = "flowchart TD\n";
  code += '  guard_start(["start"])\n';
  code += '  guard_stop(["stop"])\n';
  for (let i = 0; i < decisions.length; i++) {
    const decision = decisions[i];
    const sourceAlias = `guard_${i}_source`;
    const triggerAlias = `guard_${i}_trigger`;
    const decisionAlias = `guard_${i}_decision`;
    const nextAlias = i + 1 < decisions.length ? `guard_${i + 1}_source` : "guard_stop";
    code += `  ${sourceAlias}["state: ${escapeDiagramLabel(decision.sourceLabel)}"]
`;
    code += `  ${triggerAlias}["${escapeDiagramLabel(decision.triggerLabel)}"]
`;
    code += `  ${decisionAlias}{"guard: ${escapeDiagramLabel(decision.guardName)}?"}
`;
    if (decision.successTargetId) {
      code += `  guard_${i}_success["${escapeDiagramLabel(decision.successTargetLabel || "target")}"]
`;
    }
    if (decision.failureTargetId) {
      code += `  guard_${i}_failure["${escapeDiagramLabel(decision.failureTargetLabel || "failure target")}"]
`;
    }
    if (i === 0) {
      code += `  guard_start --> ${sourceAlias}
`;
    }
    code += `  ${sourceAlias} --> ${triggerAlias}
`;
    code += `  ${triggerAlias} --> ${decisionAlias}
`;
    if (decision.successTargetId) {
      code += `  ${decisionAlias} -->|"target"| guard_${i}_success
`;
      code += `  guard_${i}_success --> guard_${i}_join(( ))
`;
    }
    if (decision.failureTargetId) {
      code += `  ${decisionAlias} -->|"failure target"| guard_${i}_failure
`;
      code += `  guard_${i}_failure --> guard_${i}_join
`;
    }
    if (!decision.successTargetId && !decision.failureTargetId) {
      code += `  ${decisionAlias} --> guard_${i}_join(( ))
`;
    }
    code += `  guard_${i}_join --> ${nextAlias}
`;
  }
  if (decisions.length === 0) {
    code += "  guard_start --> guard_stop\n";
  }
  return code;
}
function getPlantUmlGuardDecisionMapCode(serializedMachine) {
  const model = getAdditionalModel(serializedMachine);
  const decisions = getGuardDecisionActivitySteps(model);
  let code = "@startuml\nskinparam activity {\n  RoundCorner 12\n  Shadowing false\n}\n\nstart\n";
  for (const decision of decisions) {
    code += `:state: ${escapeDiagramLabel(decision.sourceLabel)};
`;
    code += `:${escapeDiagramLabel(decision.triggerLabel)};
`;
    code += `if (guard: ${escapeDiagramLabel(decision.guardName)}?) then (target)
`;
    if (decision.successTargetLabel) {
      code += `  :${escapeDiagramLabel(decision.successTargetLabel)};
`;
    }
    if (decision.failureTargetLabel) {
      code += `else (failure target)
  :${escapeDiagramLabel(decision.failureTargetLabel)};
`;
    }
    code += "endif\n";
  }
  code += "stop\n@enduml\n";
  return code;
}
function getMermaidCompositionMapCode(serializedMachine) {
  const model = getAdditionalModel(serializedMachine);
  let code = "flowchart TD\n";
  for (const machine of model.machines) {
    const label = `${escapeDiagramLabel(machine.label)}${machine.initial ? `\\ninitial: ${escapeDiagramLabel(machine.initial)}` : ""}`;
    code += `  ${machine.alias}[["${label}"]]
`;
  }
  for (const state of model.states) {
    code += `  ${state.alias}["state: ${escapeDiagramLabel(state.label)}"]
`;
  }
  for (const edge of model.compositionEdges) {
    code += `  ${modelAlias(model, edge.from)} -->|"${escapeDiagramLabel(edge.label)}"| ${modelAlias(model, edge.to)}
`;
  }
  return code;
}
function getPlantUmlCompositionMapCode(serializedMachine) {
  const model = getAdditionalModel(serializedMachine);
  let code = `@startuml
${plantUmlRectangleSkinparam()}
`;
  for (const machine of model.machines) {
    const label = `${escapeDiagramLabel(machine.label)}${machine.initial ? `\\ninitial: ${escapeDiagramLabel(machine.initial)}` : ""}`;
    code += `rectangle "${label}" as ${machine.alias}
`;
  }
  for (const state of model.states) {
    code += `rectangle "state: ${escapeDiagramLabel(state.label)}" as ${state.alias}
`;
  }
  for (const edge of model.compositionEdges) {
    code += `${modelAlias(model, edge.from)} --> ${modelAlias(model, edge.to)} : ${escapeDiagramLabel(edge.label)}
`;
  }
  code += "@enduml\n";
  return code;
}
function formatPoint(value) {
  return value.toFixed(2);
}
function formatMermaidPoint(value) {
  return value === 1 ? "1" : formatPoint(value);
}
function pointQuadrant(point) {
  if (point.x >= 0.5 && point.y >= 0.5)
    return "Q1";
  if (point.x < 0.5 && point.y >= 0.5)
    return "Q2";
  if (point.x < 0.5 && point.y < 0.5)
    return "Q3";
  return "Q4";
}
function maxComplexityLoads(points) {
  let transitionLoad = 0;
  let actionLoad = 0;
  for (const point of points) {
    if (point.transitionLoad > transitionLoad) {
      transitionLoad = point.transitionLoad;
    }
    if (point.actionLoad > actionLoad) {
      actionLoad = point.actionLoad;
    }
  }
  return { transitionLoad, actionLoad };
}
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function quadrantBounds(quadrant) {
  const lowMin = 0.06;
  const lowMax = 0.44;
  const highMin = 0.56;
  const highMax = 0.94;
  if (quadrant === "Q1")
    return { minX: highMin, maxX: highMax, minY: highMin, maxY: highMax };
  if (quadrant === "Q2")
    return { minX: lowMin, maxX: lowMax, minY: highMin, maxY: highMax };
  if (quadrant === "Q3")
    return { minX: lowMin, maxX: lowMax, minY: lowMin, maxY: lowMax };
  return { minX: highMin, maxX: highMax, minY: lowMin, maxY: lowMax };
}
function shortenPointLabel(label) {
  const escaped = escapeDiagramLabel(label);
  return escaped.length > 22 ? `${escaped.slice(0, 21)}\u2026` : escaped;
}
function pointImportance(point) {
  return point.transitionLoad + point.actionLoad;
}
function sortedComplexityPoints(points) {
  return points.slice().sort((a, b) => {
    const importance = pointImportance(b) - pointImportance(a);
    return importance !== 0 ? importance : a.label.localeCompare(b.label);
  });
}
function sortedComplexityLayoutPoints(points) {
  return points.slice().sort((a, b) => {
    const importance = pointImportance(b.point) - pointImportance(a.point);
    return importance !== 0 ? importance : a.point.label.localeCompare(b.point.label);
  });
}
function localComplexityPosition(point) {
  return {
    x: point.quadrant === "Q1" || point.quadrant === "Q4" ? (point.x - 0.5) / 0.5 : point.x / 0.5,
    y: point.quadrant === "Q1" || point.quadrant === "Q2" ? (point.y - 0.5) / 0.5 : point.y / 0.5
  };
}
function globalComplexityPosition(quadrant, localX, localY) {
  return {
    x: quadrant === "Q1" || quadrant === "Q4" ? 0.5 + localX * 0.5 : localX * 0.5,
    y: quadrant === "Q1" || quadrant === "Q2" ? 0.5 + localY * 0.5 : localY * 0.5
  };
}
function quantizeComplexityPoint(point, quadrantHeight, quadrantWidth) {
  const local = localComplexityPosition(point);
  const column = Math.min(quadrantWidth - 2, Math.max(1, Math.round(local.x * (quadrantWidth - 2))));
  const rowFromBottom = Math.min(quadrantHeight - 1, Math.max(0, Math.round(local.y * (quadrantHeight - 1))));
  const display = globalComplexityPosition(point.quadrant, column / (quadrantWidth - 2), rowFromBottom / (quadrantHeight - 1));
  return { ...point, x: display.x, y: display.y };
}
function packComplexityRows(points, quadrantHeight, quadrantWidth) {
  const byQuadrant = { Q1: [], Q2: [], Q3: [], Q4: [] };
  for (const point of points) {
    byQuadrant[point.quadrant].push(point);
  }
  const byStateId = {};
  for (const quadrant of ["Q1", "Q2", "Q3", "Q4"]) {
    const minBulletRow = 1;
    const usedRows = Array.from({ length: quadrantHeight }).map(() => false);
    const candidates = byQuadrant[quadrant].map((point) => {
      const local = localComplexityPosition(point);
      const preferredRowFromBottom = Math.min(quadrantHeight - 1, Math.max(0, Math.round(local.y * (quadrantHeight - 1))));
      return {
        point,
        preferredRow: Math.min(quadrantHeight - 2, Math.max(minBulletRow, quadrantHeight - 1 - preferredRowFromBottom))
      };
    }).sort((a, b) => {
      if (a.preferredRow !== b.preferredRow)
        return a.preferredRow - b.preferredRow;
      const importance = pointImportance(b.point.point) - pointImportance(a.point.point);
      return importance !== 0 ? importance : a.point.point.label.localeCompare(b.point.point.label);
    });
    for (const candidate of candidates) {
      const point = candidate.point;
      const local = localComplexityPosition(point);
      const row = nearestFreeRowPair(candidate.preferredRow, usedRows, quadrantHeight, minBulletRow);
      const column = Math.min(quadrantWidth - 2, Math.max(1, Math.round(local.x * (quadrantWidth - 2))));
      if (row === void 0) {
        byStateId[point.point.stateId] = quantizeComplexityPoint(point, quadrantHeight, quadrantWidth);
        continue;
      }
      usedRows[row] = true;
      usedRows[row + 1] = true;
      const localY = (quadrantHeight - 1 - row) / (quadrantHeight - 1);
      const display = globalComplexityPosition(quadrant, column / (quadrantWidth - 2), localY);
      byStateId[point.point.stateId] = { ...point, x: display.x, y: display.y };
    }
  }
  return points.map((point) => byStateId[point.point.stateId]);
}
function layoutComplexityPoints(points) {
  const groups = {};
  for (const point of points) {
    const key = `${pointQuadrant(point)}:${formatPoint(point.x)},${formatPoint(point.y)}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(point);
  }
  const byStateId = {};
  for (const key in groups) {
    const collisionGroup = sortedComplexityPoints(groups[key]);
    for (let index = 0; index < collisionGroup.length; index++) {
      const point = collisionGroup[index];
      const quadrant = pointQuadrant(point);
      const bounds = quadrantBounds(quadrant);
      let x = clamp(point.x, bounds.minX, bounds.maxX);
      let y = clamp(point.y, bounds.minY, bounds.maxY);
      if (collisionGroup.length > 1) {
        const step = (index + 1) / (collisionGroup.length + 1);
        x = bounds.minX + (bounds.maxX - bounds.minX) * step;
        y = bounds.minY + (bounds.maxY - bounds.minY) * step;
      }
      byStateId[point.stateId] = { point, x, y, quadrant };
    }
  }
  const layout = points.map((point) => byStateId[point.stateId]);
  const byQuadrant = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  for (const point of layout) {
    byQuadrant[point.quadrant] += 1;
  }
  const quadrantHeight = Math.max(5, Math.max(byQuadrant.Q1, byQuadrant.Q2, byQuadrant.Q3, byQuadrant.Q4) * 2 + 2);
  return packComplexityRows(layout, quadrantHeight, 34);
}
function nearestFreeRowPair(preferred, usedRows, rowLimit, minBulletRow = 0) {
  const maxBulletRow = rowLimit - 2;
  const clampedPreferred = Math.min(maxBulletRow, Math.max(minBulletRow, preferred));
  for (let distance = 0; distance < rowLimit; distance++) {
    const before = clampedPreferred - distance;
    if (before >= minBulletRow && before < rowLimit - 1 && !usedRows[before] && !usedRows[before + 1]) {
      return before;
    }
    const after = clampedPreferred + distance;
    if (after < rowLimit - 1 && !usedRows[after] && !usedRows[after + 1]) {
      return after;
    }
  }
  return void 0;
}
function renderQuadrantBox(title, alias, points, height) {
  const width = 34;
  const sortedPoints = sortedComplexityLayoutPoints(points);
  const rows = [];
  for (let row = 0; row < height; row++) {
    rows.push(Array.from({ length: width }).map(() => " "));
  }
  for (const point of sortedPoints) {
    const { x: localX, y: localY } = localComplexityPosition(point);
    let column = Math.min(width - 2, Math.max(1, Math.round(localX * (width - 2))));
    let rowFromBottom = Math.min(height - 1, Math.max(0, Math.round(localY * (height - 1))));
    const row = height - 1 - rowFromBottom;
    if (row < 0 || row >= height - 1) {
      continue;
    }
    const label = shortenPointLabel(point.point.label);
    const labelColumn = Math.min(width - label.length - 1, Math.max(1, column - Math.floor(label.length / 2)));
    rows[row][column] = "\u25CF";
    for (let i = 0; i < label.length && labelColumn + i < width; i++) {
      rows[row + 1][labelColumn + i] = label[i];
    }
  }
  let box = `${title}\\n\\nActions \u2191\\n`;
  box += "\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\\n";
  for (const row of rows) {
    box += `\u2502${row.join("")}\u2502\\n`;
  }
  box += "\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\\nTransitions \u2192";
  return `rectangle "${box}" as ${alias}
`;
}
function getMermaidComplexityMapCode(serializedMachine) {
  const model = getAdditionalModel(serializedMachine);
  const maxLoads = maxComplexityLoads(model.complexityPoints);
  const points = layoutComplexityPoints(model.complexityPoints);
  let code = "quadrantChart\n";
  code += `  title State complexity map (max transitions: ${maxLoads.transitionLoad}, max actions: ${maxLoads.actionLoad})
`;
  code += "  x-axis Few transitions --> Many transitions\n";
  code += "  y-axis Few actions --> Many actions\n";
  code += "  quadrant-1 Many actions / many transitions\n";
  code += "  quadrant-2 Many actions / few transitions\n";
  code += "  quadrant-3 Few actions / few transitions\n";
  code += "  quadrant-4 Few actions / many transitions\n";
  for (const point of points) {
    code += `  ${escapeDiagramLabel(point.point.label)}: [${formatMermaidPoint(point.x)}, ${formatMermaidPoint(point.y)}]
`;
  }
  return code;
}
function getPlantUmlComplexityMapCode(serializedMachine) {
  const model = getAdditionalModel(serializedMachine);
  const maxLoads = maxComplexityLoads(model.complexityPoints);
  const groups = { Q1: [], Q2: [], Q3: [], Q4: [] };
  for (const point of layoutComplexityPoints(model.complexityPoints)) {
    groups[point.quadrant].push(point);
  }
  const tallestQuadrant = Math.max(groups.Q1.length, groups.Q2.length, groups.Q3.length, groups.Q4.length);
  const quadrantHeight = Math.max(5, tallestQuadrant * 2 + 2);
  let code = `@startuml
${plantUmlRectangleSkinparam("\n  FontName Monospaced")}
`;
  code += `title State complexity map\\nMax transition load: ${maxLoads.transitionLoad}\\nMax action load: ${maxLoads.actionLoad}
`;
  code += renderQuadrantBox("MANY ACTIONS / FEW TRANSITIONS", "Q2", groups.Q2, quadrantHeight);
  code += renderQuadrantBox("MANY ACTIONS / MANY TRANSITIONS", "Q1", groups.Q1, quadrantHeight);
  code += renderQuadrantBox("FEW ACTIONS / FEW TRANSITIONS", "Q3", groups.Q3, quadrantHeight);
  code += renderQuadrantBox("FEW ACTIONS / MANY TRANSITIONS", "Q4", groups.Q4, quadrantHeight);
  code += "Q2 -[hidden]right- Q1\n";
  code += "Q3 -[hidden]right- Q4\n";
  code += "Q2 -[hidden]down- Q3\n";
  code += "Q1 -[hidden]down- Q4\n";
  code += "@enduml\n";
  return code;
}
function getPlantUmlCodeFromMachine(machine, optionsOrLevel = VISUALIZATION_LEVEL.LOW) {
  return getPlantUmlCode(serialize(machine), optionsOrLevel);
}
async function createPngFromPlantUmlCode(plantUmlCode, options = {}) {
  return createImageFromPlantUmlCode(plantUmlCode, "png", options);
}
async function createSvgFromPlantUmlCode(plantUmlCode, options = {}) {
  return createImageFromPlantUmlCode(plantUmlCode, "svg", options);
}
function createPngFromMachine(machine, optionsOrLevel = VISUALIZATION_LEVEL.LOW) {
  let options = typeof optionsOrLevel === "string" ? { level: optionsOrLevel } : optionsOrLevel;
  return createPngFromPlantUmlCode(getPlantUmlCodeFromMachine(machine, optionsOrLevel), options);
}
async function createSvgFromSerializedMachine(serialized, optionsOrLevel = VISUALIZATION_LEVEL.LOW) {
  let options = typeof optionsOrLevel === "string" ? { level: optionsOrLevel } : optionsOrLevel;
  const plantUmlCode = getPlantUmlCode(serialized, options);
  return createSvgFromPlantUmlCode(plantUmlCode, options);
}
async function createPngFromSerializedMachine(serialized, optionsOrLevel = VISUALIZATION_LEVEL.LOW) {
  let options = typeof optionsOrLevel === "string" ? { level: optionsOrLevel } : optionsOrLevel;
  const plantUmlCode = getPlantUmlCode(serialized, options);
  return createPngFromPlantUmlCode(plantUmlCode, options);
}
function createSvgFromMachine(machine, optionsOrLevel = VISUALIZATION_LEVEL.LOW) {
  let options = typeof optionsOrLevel === "string" ? { level: optionsOrLevel } : optionsOrLevel;
  return createSvgFromPlantUmlCode(getPlantUmlCodeFromMachine(machine, optionsOrLevel), options);
}
function stringifyTree(tn, nameFn, childrenFn) {
  function prefixChild(strs, last) {
    return strs.map((s, i) => {
      const prefix = i === 0 ? last ? "\u2514" : "\u251C" : last ? " " : "\u2502";
      return prefix + s;
    });
  }
  function nodeToStrings(tn2) {
    const origChildren = childrenFn(tn2) || [];
    const children = [...origChildren];
    if (children.length === 0) {
      return [" " + nameFn(tn2)];
    }
    let name = nameFn(tn2);
    let arr = [];
    if (name && name !== "") {
      arr.push("\u252C " + name);
    }
    let prefixedChildren = children.map((c, i) => {
      const strs = nodeToStrings(c);
      return prefixChild(strs, i === children.length - 1);
    }).flat();
    return arr.concat(prefixedChildren);
  }
  return nodeToStrings(tn).join("\n");
}

// lib/documentate/index.ts
var plantUmlAdditionalRenderers = {
  sequence: (serialized, options) => getPlantUmlSequenceCode(serialized, options),
  pulses: (serialized) => getPlantUmlPulseMapCode(serialized),
  events: (serialized) => getPlantUmlEventMapCode(serialized),
  outcomes: (serialized) => getPlantUmlOutcomeMapCode(serialized),
  immediate: (serialized) => getPlantUmlImmediateMapCode(serialized),
  guards: (serialized) => getPlantUmlGuardDecisionMapCode(serialized),
  composition: (serialized) => getPlantUmlCompositionMapCode(serialized),
  complexity: (serialized) => getPlantUmlComplexityMapCode(serialized)
};
var mermaidAdditionalRenderers = {
  sequence: (serialized, options) => getMermaidSequenceCode(serialized, options),
  pulses: (serialized) => getMermaidPulseMapCode(serialized),
  events: (serialized) => getMermaidEventMapCode(serialized),
  outcomes: (serialized) => getMermaidOutcomeMapCode(serialized),
  immediate: (serialized) => getMermaidImmediateMapCode(serialized),
  guards: (serialized) => getMermaidGuardDecisionMapCode(serialized),
  composition: (serialized) => getMermaidCompositionMapCode(serialized),
  complexity: (serialized) => getMermaidComplexityMapCode(serialized)
};
function isSerializedMachine(input) {
  return input && typeof input === "object" && "states" in input;
}
function isString(input) {
  return typeof input === "string";
}
function isScxml(input) {
  return input.trim().startsWith("<scxml") || input.trim().startsWith("<?xml");
}
function isPlantUml(input) {
  return input.trim().startsWith("@startuml") || input.trim().startsWith("@enduml");
}
function getAdditionalImageDiagram(format) {
  const match = /^(svg|png)-(sequence|pulses|events|outcomes|immediate|guards|composition|complexity)$/.exec(format);
  return match ? match[2] : void 0;
}
function getAdditionalDiagram(format, prefix) {
  const match = new RegExp(`^${prefix}-(sequence|pulses|events|outcomes|immediate|guards|composition|complexity)$`).exec(format);
  return match ? match[1] : void 0;
}
async function documentate(input, options) {
  let serialized;
  let machine;
  let plantUmlInput;
  if (isMachine(input)) {
    machine = input;
    serialized = serialize(machine);
  } else if (isSerializedMachine(input)) {
    serialized = input;
  } else if (isString(input)) {
    const str = input;
    if (isScxml(str)) {
      try {
        serialized = fromSCXML(str);
      } catch (error) {
        throw new Error("Failed to parse SCXML input: " + error.message);
      }
    } else if (isPlantUml(str)) {
      plantUmlInput = str;
    } else {
      throw new Error("Invalid input string: expected valid SCXML or PlantUML format");
    }
  } else {
    throw new Error("Invalid input: expected Machine, SerializedMachine, SCXML string, or PlantUML string");
  }
  const result = {};
  const level = options.level || "high";
  const format = options.format;
  const skinparam = options.skinparam;
  if (plantUmlInput) {
    if (format === "all" || format === "svg") {
      result.svg = await createSvgFromPlantUmlCode(plantUmlInput, { level: options.level });
    }
    if (format === "all" || format === "png") {
      result.png = await createPngFromPlantUmlCode(plantUmlInput);
    }
    if (format === "all" || format === "plantuml") {
      result.plantuml = plantUmlInput;
    }
    return result;
  }
  if (!serialized) {
    throw new Error("Cannot generate output: no valid input provided");
  }
  if (format === "all" || format === "ts") {
    result.ts = generateFromSerializedMachine(serialized, "ts" /* TS */);
  }
  if (format === "all" || format === "mjs") {
    result.mjs = generateFromSerializedMachine(serialized, "esm" /* ESM */);
  }
  if (format === "all" || format === "cjs") {
    result.cjs = generateFromSerializedMachine(serialized, "cjs" /* CJS */);
  }
  if (format === "all" || format === "json") {
    result.json = JSON.stringify(serialized, null, 2);
  }
  if (format === "all" || format === "serialized") {
    result.serialized = serialized;
  }
  if (format === "all" || format === "scxml") {
    result.scxml = toSCXML(serialized);
  }
  if (format === "all" || format === "plantuml") {
    result.plantuml = getPlantUmlCode(serialized, { level, skinparam });
  }
  const plantUmlAdditionalDiagram = getAdditionalDiagram(format, "plantuml");
  if (plantUmlAdditionalDiagram) {
    result.plantuml = plantUmlAdditionalRenderers[plantUmlAdditionalDiagram](serialized, { level, skinparam });
  }
  const additionalImageDiagram = getAdditionalImageDiagram(format);
  if (additionalImageDiagram) {
    const plantUmlCode = plantUmlAdditionalRenderers[additionalImageDiagram](serialized, { level, skinparam });
    const imageOptions = { level, skinparam, outDir: options.output, fileName: options.fileName };
    if (format.indexOf("svg-") === 0) {
      result.svg = await createSvgFromPlantUmlCode(plantUmlCode, imageOptions);
    } else {
      result.png = await createPngFromPlantUmlCode(plantUmlCode, imageOptions);
    }
  }
  if (format === "all" || format === "mermaid") {
    result.mermaid = getMermaidCode(serialized, { level, skinparam });
  }
  const mermaidAdditionalDiagram = getAdditionalDiagram(format, "mermaid");
  if (mermaidAdditionalDiagram) {
    result.mermaid = mermaidAdditionalRenderers[mermaidAdditionalDiagram](serialized, { level, skinparam });
  }
  if ((format === "all" || format === "svg") && serialized) {
    if (machine) {
      result.svg = await createSvgFromMachine(machine, { level, skinparam });
    } else {
      result.svg = await createSvgFromSerializedMachine(serialized, { level, skinparam });
    }
  }
  if ((format === "all" || format === "png") && serialized) {
    if (machine) {
      result.png = await createPngFromMachine(machine, { level });
    } else {
      result.png = await createPngFromSerializedMachine(serialized, { level });
    }
  }
  return result;
}

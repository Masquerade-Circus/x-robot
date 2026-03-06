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
function isExit(exit) {
  return isValidObject(exit) && "exit" in exit;
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
function isHistoryDirective(history) {
  return isValidObject(history) && "history" in history && typeof history.history === "number" && history.history >= 0;
}
function isInitDirective(init) {
  if (!isValidObject(init))
    return false;
  const hasInitial = "initial" in init;
  const hasContext = "context" in init;
  const hasFreeze = "freeze" in init;
  const hasHistory = "history" in init;
  return hasInitial || hasContext || hasFreeze || hasHistory;
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
function domToXml(node, indent = "") {
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
    if (el.childNodes.length > 0) {
      xml += ">\n";
      for (const child of el.childNodes) {
        xml += domToXml(child, indent + "  ") + "\n";
      }
      xml += indent + "</" + tagName + ">";
    } else {
      xml += "/>";
    }
    return xml;
  }
  return "";
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
export {
  Document,
  Element,
  Node,
  Text,
  canMakeTransition,
  deepCloneUnfreeze,
  deepFreeze,
  document,
  domToScxml,
  domToXml,
  hasState,
  hasTransition,
  isContextDirective,
  isDescriptionDirective,
  isEntry,
  isExit,
  isGuard,
  isHistoryDirective,
  isImmediate,
  isInitDirective,
  isInitialDirective,
  isMachine,
  isNestedGuard,
  isNestedImmediateDirective,
  isNestedMachineDirective,
  isNestedMachineWithTransitionDirective,
  isNestedTransition,
  isParallelDirective,
  isParallelImmediateDirective,
  isParallelTransition,
  isPlainObject,
  isShouldFreezeDirective,
  isStateDirective,
  isStatesDirective,
  isTransition,
  isValidObject,
  isValidString,
  parseScxml,
  parseXml,
  titleToId
};

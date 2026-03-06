import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
function serializeGuard(guard) {
  let serialized = {
    guard: guard.guard.name
  };
  if (isValidString(guard.failure)) {
    serialized.failure = guard.failure;
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
    if (isEntry(item)) {
      return serializePulse(item);
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
  if (transition.exit) {
    const exitArray = Array.isArray(transition.exit) ? transition.exit : [transition.exit];
    serialized.exit = exitArray.map((pulse) => serializePulse(pulse));
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
  return deepCloneUnfreeze(context);
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

// lib/documentate/visualize.ts
import { exec } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
var VISUALIZATION_LEVEL = {
  LOW: "low",
  HIGH: "high"
};
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
    states += `<<${state.type}>>
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
      let asciiTree = getAsciiTree(run);
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
            let asciiTree = getAsciiTree(state.on[transitionName].guards || []);
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
  BackgroundColor<<danger>> Implementation
  BorderColor<<danger>> indianred
  BackgroundColor<<info>> Application
  BorderColor<<info>> skyblue
  BackgroundColor<<warning>> Strategy
  BorderColor<<warning>> tan
  BackgroundColor<<success>> Technology
  BorderColor<<success>> mediumseagreen
  BackgroundColor<<primary>> Motivation
  BorderColor<<primary>> lightsteelblue
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
function getTree(collection) {
  if (collection.length === 0) {
    return null;
  }
  let tree = {
    name: "",
    children: []
  };
  let name = (type) => (value) => `${type}:${value}`;
  let guard = name("G");
  let pulse = (isAsync) => name(isAsync ? "AP" : "P");
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
      obj.name = guard(item.guard);
    }
    if ("pulse" in item) {
      obj.name = pulse(item.isAsync)(item.pulse);
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
        let guards = getTree(item.guards);
        if (guards) {
          obj.children.push(...guards.children);
        }
      }
    }
    tree.children.push(obj);
  }
  return tree;
}
function getAsciiTree(collection) {
  let tree = getTree(collection);
  if (!tree) {
    return "";
  }
  return stringifyTree(tree, (t) => t.name, (t) => t.children).replace(/\n/g, "\\n");
}
async function createImageFromPlantUmlCode(plantUmlCode, type, options = {}) {
  const plantUmlJarPath = path.resolve(__dirname, "../../vendor/plantuml.jar");
  const extension = type === "png" ? "png" : "svg";
  const fileName = (options.fileName || `plantuml-code-${Date.now()}`).replace(`.${extension}`, "");
  const outDirPath = path.resolve(options.outDir || os.tmpdir());
  let plantUmlCodeFilePath = path.resolve(os.tmpdir(), `${fileName}.txt`);
  const plantUmlImageFile = path.resolve(outDirPath, fileName.indexOf(".") !== -1 ? fileName : `${fileName}.${extension}`);
  fs.writeFileSync(plantUmlCodeFilePath, plantUmlCode, "utf8");
  if (fs.existsSync(plantUmlImageFile)) {
    fs.unlinkSync(plantUmlImageFile);
  }
  const plantUmlCommand = `java -jar ${plantUmlJarPath} -t${extension} ${plantUmlCodeFilePath} -o ${outDirPath}`;
  let timeoutTime = 1e4;
  let now = Date.now();
  await exec(plantUmlCommand);
  while (!fs.existsSync(plantUmlImageFile) || fs.statSync(plantUmlImageFile).size === 0) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (Date.now() - now > timeoutTime) {
      throw new Error("Timeout waiting for plantuml to create the image");
    }
  }
  if (!fs.existsSync(plantUmlImageFile)) {
    throw new Error(`PlantUML did not create the png file: ${plantUmlImageFile}`);
  }
  fs.unlinkSync(plantUmlCodeFilePath);
  return plantUmlImageFile;
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
export {
  documentate
};

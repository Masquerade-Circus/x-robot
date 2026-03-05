import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// lib/utils.ts
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

// node_modules/fast-xml-parser/src/util.js
var nameStartChar = ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
var nameChar = nameStartChar + "\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
var nameRegexp = "[" + nameStartChar + "][" + nameChar + "]*";
var regexName = new RegExp("^" + nameRegexp + "$");
function getAllMatches(string, regex) {
  const matches = [];
  let match = regex.exec(string);
  while (match) {
    const allmatches = [];
    allmatches.startIndex = regex.lastIndex - match[0].length;
    const len = match.length;
    for (let index = 0; index < len; index++) {
      allmatches.push(match[index]);
    }
    matches.push(allmatches);
    match = regex.exec(string);
  }
  return matches;
}
var isName = function(string) {
  const match = regexName.exec(string);
  return !(match === null || typeof match === "undefined");
};
function isExist(v) {
  return typeof v !== "undefined";
}

// node_modules/fast-xml-parser/src/validator.js
var defaultOptions = {
  allowBooleanAttributes: false,
  unpairedTags: []
};
function validate(xmlData, options) {
  options = Object.assign({}, defaultOptions, options);
  const tags = [];
  let tagFound = false;
  let reachedRoot = false;
  if (xmlData[0] === "\uFEFF") {
    xmlData = xmlData.substr(1);
  }
  for (let i = 0; i < xmlData.length; i++) {
    if (xmlData[i] === "<" && xmlData[i + 1] === "?") {
      i += 2;
      i = readPI(xmlData, i);
      if (i.err)
        return i;
    } else if (xmlData[i] === "<") {
      let tagStartPos = i;
      i++;
      if (xmlData[i] === "!") {
        i = readCommentAndCDATA(xmlData, i);
        continue;
      } else {
        let closingTag = false;
        if (xmlData[i] === "/") {
          closingTag = true;
          i++;
        }
        let tagName = "";
        for (; i < xmlData.length && xmlData[i] !== ">" && xmlData[i] !== " " && xmlData[i] !== "	" && xmlData[i] !== "\n" && xmlData[i] !== "\r"; i++) {
          tagName += xmlData[i];
        }
        tagName = tagName.trim();
        if (tagName[tagName.length - 1] === "/") {
          tagName = tagName.substring(0, tagName.length - 1);
          i--;
        }
        if (!validateTagName(tagName)) {
          let msg;
          if (tagName.trim().length === 0) {
            msg = "Invalid space after '<'.";
          } else {
            msg = "Tag '" + tagName + "' is an invalid name.";
          }
          return getErrorObject("InvalidTag", msg, getLineNumberForPosition(xmlData, i));
        }
        const result = readAttributeStr(xmlData, i);
        if (result === false) {
          return getErrorObject("InvalidAttr", "Attributes for '" + tagName + "' have open quote.", getLineNumberForPosition(xmlData, i));
        }
        let attrStr = result.value;
        i = result.index;
        if (attrStr[attrStr.length - 1] === "/") {
          const attrStrStart = i - attrStr.length;
          attrStr = attrStr.substring(0, attrStr.length - 1);
          const isValid = validateAttributeString(attrStr, options);
          if (isValid === true) {
            tagFound = true;
          } else {
            return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, attrStrStart + isValid.err.line));
          }
        } else if (closingTag) {
          if (!result.tagClosed) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' doesn't have proper closing.", getLineNumberForPosition(xmlData, i));
          } else if (attrStr.trim().length > 0) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' can't have attributes or invalid starting.", getLineNumberForPosition(xmlData, tagStartPos));
          } else if (tags.length === 0) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' has not been opened.", getLineNumberForPosition(xmlData, tagStartPos));
          } else {
            const otg = tags.pop();
            if (tagName !== otg.tagName) {
              let openPos = getLineNumberForPosition(xmlData, otg.tagStartPos);
              return getErrorObject("InvalidTag", "Expected closing tag '" + otg.tagName + "' (opened in line " + openPos.line + ", col " + openPos.col + ") instead of closing tag '" + tagName + "'.", getLineNumberForPosition(xmlData, tagStartPos));
            }
            if (tags.length == 0) {
              reachedRoot = true;
            }
          }
        } else {
          const isValid = validateAttributeString(attrStr, options);
          if (isValid !== true) {
            return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, i - attrStr.length + isValid.err.line));
          }
          if (reachedRoot === true) {
            return getErrorObject("InvalidXml", "Multiple possible root nodes found.", getLineNumberForPosition(xmlData, i));
          } else if (options.unpairedTags.indexOf(tagName) !== -1) {
          } else {
            tags.push({ tagName, tagStartPos });
          }
          tagFound = true;
        }
        for (i++; i < xmlData.length; i++) {
          if (xmlData[i] === "<") {
            if (xmlData[i + 1] === "!") {
              i++;
              i = readCommentAndCDATA(xmlData, i);
              continue;
            } else if (xmlData[i + 1] === "?") {
              i = readPI(xmlData, ++i);
              if (i.err)
                return i;
            } else {
              break;
            }
          } else if (xmlData[i] === "&") {
            const afterAmp = validateAmpersand(xmlData, i);
            if (afterAmp == -1)
              return getErrorObject("InvalidChar", "char '&' is not expected.", getLineNumberForPosition(xmlData, i));
            i = afterAmp;
          } else {
            if (reachedRoot === true && !isWhiteSpace(xmlData[i])) {
              return getErrorObject("InvalidXml", "Extra text at the end", getLineNumberForPosition(xmlData, i));
            }
          }
        }
        if (xmlData[i] === "<") {
          i--;
        }
      }
    } else {
      if (isWhiteSpace(xmlData[i])) {
        continue;
      }
      return getErrorObject("InvalidChar", "char '" + xmlData[i] + "' is not expected.", getLineNumberForPosition(xmlData, i));
    }
  }
  if (!tagFound) {
    return getErrorObject("InvalidXml", "Start tag expected.", 1);
  } else if (tags.length == 1) {
    return getErrorObject("InvalidTag", "Unclosed tag '" + tags[0].tagName + "'.", getLineNumberForPosition(xmlData, tags[0].tagStartPos));
  } else if (tags.length > 0) {
    return getErrorObject("InvalidXml", "Invalid '" + JSON.stringify(tags.map((t) => t.tagName), null, 4).replace(/\r?\n/g, "") + "' found.", { line: 1, col: 1 });
  }
  return true;
}
function isWhiteSpace(char) {
  return char === " " || char === "	" || char === "\n" || char === "\r";
}
function readPI(xmlData, i) {
  const start = i;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] == "?" || xmlData[i] == " ") {
      const tagname = xmlData.substr(start, i - start);
      if (i > 5 && tagname === "xml") {
        return getErrorObject("InvalidXml", "XML declaration allowed only at the start of the document.", getLineNumberForPosition(xmlData, i));
      } else if (xmlData[i] == "?" && xmlData[i + 1] == ">") {
        i++;
        break;
      } else {
        continue;
      }
    }
  }
  return i;
}
function readCommentAndCDATA(xmlData, i) {
  if (xmlData.length > i + 5 && xmlData[i + 1] === "-" && xmlData[i + 2] === "-") {
    for (i += 3; i < xmlData.length; i++) {
      if (xmlData[i] === "-" && xmlData[i + 1] === "-" && xmlData[i + 2] === ">") {
        i += 2;
        break;
      }
    }
  } else if (xmlData.length > i + 8 && xmlData[i + 1] === "D" && xmlData[i + 2] === "O" && xmlData[i + 3] === "C" && xmlData[i + 4] === "T" && xmlData[i + 5] === "Y" && xmlData[i + 6] === "P" && xmlData[i + 7] === "E") {
    let angleBracketsCount = 1;
    for (i += 8; i < xmlData.length; i++) {
      if (xmlData[i] === "<") {
        angleBracketsCount++;
      } else if (xmlData[i] === ">") {
        angleBracketsCount--;
        if (angleBracketsCount === 0) {
          break;
        }
      }
    }
  } else if (xmlData.length > i + 9 && xmlData[i + 1] === "[" && xmlData[i + 2] === "C" && xmlData[i + 3] === "D" && xmlData[i + 4] === "A" && xmlData[i + 5] === "T" && xmlData[i + 6] === "A" && xmlData[i + 7] === "[") {
    for (i += 8; i < xmlData.length; i++) {
      if (xmlData[i] === "]" && xmlData[i + 1] === "]" && xmlData[i + 2] === ">") {
        i += 2;
        break;
      }
    }
  }
  return i;
}
var doubleQuote = '"';
var singleQuote = "'";
function readAttributeStr(xmlData, i) {
  let attrStr = "";
  let startChar = "";
  let tagClosed = false;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === doubleQuote || xmlData[i] === singleQuote) {
      if (startChar === "") {
        startChar = xmlData[i];
      } else if (startChar !== xmlData[i]) {
      } else {
        startChar = "";
      }
    } else if (xmlData[i] === ">") {
      if (startChar === "") {
        tagClosed = true;
        break;
      }
    }
    attrStr += xmlData[i];
  }
  if (startChar !== "") {
    return false;
  }
  return {
    value: attrStr,
    index: i,
    tagClosed
  };
}
var validAttrStrRegxp = new RegExp(`(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['"])(([\\s\\S])*?)\\5)?`, "g");
function validateAttributeString(attrStr, options) {
  const matches = getAllMatches(attrStr, validAttrStrRegxp);
  const attrNames = {};
  for (let i = 0; i < matches.length; i++) {
    if (matches[i][1].length === 0) {
      return getErrorObject("InvalidAttr", "Attribute '" + matches[i][2] + "' has no space in starting.", getPositionFromMatch(matches[i]));
    } else if (matches[i][3] !== void 0 && matches[i][4] === void 0) {
      return getErrorObject("InvalidAttr", "Attribute '" + matches[i][2] + "' is without value.", getPositionFromMatch(matches[i]));
    } else if (matches[i][3] === void 0 && !options.allowBooleanAttributes) {
      return getErrorObject("InvalidAttr", "boolean attribute '" + matches[i][2] + "' is not allowed.", getPositionFromMatch(matches[i]));
    }
    const attrName = matches[i][2];
    if (!validateAttrName(attrName)) {
      return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is an invalid name.", getPositionFromMatch(matches[i]));
    }
    if (!Object.prototype.hasOwnProperty.call(attrNames, attrName)) {
      attrNames[attrName] = 1;
    } else {
      return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is repeated.", getPositionFromMatch(matches[i]));
    }
  }
  return true;
}
function validateNumberAmpersand(xmlData, i) {
  let re = /\d/;
  if (xmlData[i] === "x") {
    i++;
    re = /[\da-fA-F]/;
  }
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === ";")
      return i;
    if (!xmlData[i].match(re))
      break;
  }
  return -1;
}
function validateAmpersand(xmlData, i) {
  i++;
  if (xmlData[i] === ";")
    return -1;
  if (xmlData[i] === "#") {
    i++;
    return validateNumberAmpersand(xmlData, i);
  }
  let count = 0;
  for (; i < xmlData.length; i++, count++) {
    if (xmlData[i].match(/\w/) && count < 20)
      continue;
    if (xmlData[i] === ";")
      break;
    return -1;
  }
  return i;
}
function getErrorObject(code, message, lineNumber) {
  return {
    err: {
      code,
      msg: message,
      line: lineNumber.line || lineNumber,
      col: lineNumber.col
    }
  };
}
function validateAttrName(attrName) {
  return isName(attrName);
}
function validateTagName(tagname) {
  return isName(tagname);
}
function getLineNumberForPosition(xmlData, index) {
  const lines = xmlData.substring(0, index).split(/\r?\n/);
  return {
    line: lines.length,
    col: lines[lines.length - 1].length + 1
  };
}
function getPositionFromMatch(match) {
  return match.startIndex + match[1].length;
}

// node_modules/fast-xml-parser/src/xmlparser/OptionsBuilder.js
var defaultOptions2 = {
  preserveOrder: false,
  attributeNamePrefix: "@_",
  attributesGroupName: false,
  textNodeName: "#text",
  ignoreAttributes: true,
  removeNSPrefix: false,
  allowBooleanAttributes: false,
  parseTagValue: true,
  parseAttributeValue: false,
  trimValues: true,
  cdataPropName: false,
  numberParseOptions: {
    hex: true,
    leadingZeros: true,
    eNotation: true
  },
  tagValueProcessor: function(tagName, val) {
    return val;
  },
  attributeValueProcessor: function(attrName, val) {
    return val;
  },
  stopNodes: [],
  alwaysCreateTextNode: false,
  isArray: () => false,
  commentPropName: false,
  unpairedTags: [],
  processEntities: true,
  htmlEntities: false,
  ignoreDeclaration: false,
  ignorePiTags: false,
  transformTagName: false,
  transformAttributeName: false,
  updateTag: function(tagName, jPath, attrs) {
    return tagName;
  },
  captureMetaData: false,
  maxNestedTags: 100,
  strictReservedNames: true
};
function normalizeProcessEntities(value) {
  if (typeof value === "boolean") {
    return {
      enabled: value,
      maxEntitySize: 1e4,
      maxExpansionDepth: 10,
      maxTotalExpansions: 1e3,
      maxExpandedLength: 1e5,
      maxEntityCount: 100,
      allowedTags: null,
      tagFilter: null
    };
  }
  if (typeof value === "object" && value !== null) {
    return {
      enabled: value.enabled !== false,
      maxEntitySize: value.maxEntitySize ?? 1e4,
      maxExpansionDepth: value.maxExpansionDepth ?? 10,
      maxTotalExpansions: value.maxTotalExpansions ?? 1e3,
      maxExpandedLength: value.maxExpandedLength ?? 1e5,
      maxEntityCount: value.maxEntityCount ?? 100,
      allowedTags: value.allowedTags ?? null,
      tagFilter: value.tagFilter ?? null
    };
  }
  return normalizeProcessEntities(true);
}
var buildOptions = function(options) {
  const built = Object.assign({}, defaultOptions2, options);
  built.processEntities = normalizeProcessEntities(built.processEntities);
  return built;
};

// node_modules/fast-xml-parser/src/xmlparser/xmlNode.js
var METADATA_SYMBOL;
if (typeof Symbol !== "function") {
  METADATA_SYMBOL = "@@xmlMetadata";
} else {
  METADATA_SYMBOL = Symbol("XML Node Metadata");
}
var XmlNode = class {
  constructor(tagname) {
    this.tagname = tagname;
    this.child = [];
    this[":@"] = /* @__PURE__ */ Object.create(null);
  }
  add(key, val) {
    if (key === "__proto__")
      key = "#__proto__";
    this.child.push({ [key]: val });
  }
  addChild(node, startIndex) {
    if (node.tagname === "__proto__")
      node.tagname = "#__proto__";
    if (node[":@"] && Object.keys(node[":@"]).length > 0) {
      this.child.push({ [node.tagname]: node.child, [":@"]: node[":@"] });
    } else {
      this.child.push({ [node.tagname]: node.child });
    }
    if (startIndex !== void 0) {
      this.child[this.child.length - 1][METADATA_SYMBOL] = { startIndex };
    }
  }
  static getMetaDataSymbol() {
    return METADATA_SYMBOL;
  }
};

// node_modules/fast-xml-parser/src/xmlparser/DocTypeReader.js
var DocTypeReader = class {
  constructor(options) {
    this.suppressValidationErr = !options;
    this.options = options;
  }
  readDocType(xmlData, i) {
    const entities = /* @__PURE__ */ Object.create(null);
    let entityCount = 0;
    if (xmlData[i + 3] === "O" && xmlData[i + 4] === "C" && xmlData[i + 5] === "T" && xmlData[i + 6] === "Y" && xmlData[i + 7] === "P" && xmlData[i + 8] === "E") {
      i = i + 9;
      let angleBracketsCount = 1;
      let hasBody = false, comment = false;
      let exp = "";
      for (; i < xmlData.length; i++) {
        if (xmlData[i] === "<" && !comment) {
          if (hasBody && hasSeq(xmlData, "!ENTITY", i)) {
            i += 7;
            let entityName, val;
            [entityName, val, i] = this.readEntityExp(xmlData, i + 1, this.suppressValidationErr);
            if (val.indexOf("&") === -1) {
              if (this.options.enabled !== false && this.options.maxEntityCount && entityCount >= this.options.maxEntityCount) {
                throw new Error(`Entity count (${entityCount + 1}) exceeds maximum allowed (${this.options.maxEntityCount})`);
              }
              const escaped = entityName.replace(/[.\-+*:]/g, "\\.");
              entities[entityName] = {
                regx: RegExp(`&${escaped};`, "g"),
                val
              };
              entityCount++;
            }
          } else if (hasBody && hasSeq(xmlData, "!ELEMENT", i)) {
            i += 8;
            const { index } = this.readElementExp(xmlData, i + 1);
            i = index;
          } else if (hasBody && hasSeq(xmlData, "!ATTLIST", i)) {
            i += 8;
          } else if (hasBody && hasSeq(xmlData, "!NOTATION", i)) {
            i += 9;
            const { index } = this.readNotationExp(xmlData, i + 1, this.suppressValidationErr);
            i = index;
          } else if (hasSeq(xmlData, "!--", i))
            comment = true;
          else
            throw new Error(`Invalid DOCTYPE`);
          angleBracketsCount++;
          exp = "";
        } else if (xmlData[i] === ">") {
          if (comment) {
            if (xmlData[i - 1] === "-" && xmlData[i - 2] === "-") {
              comment = false;
              angleBracketsCount--;
            }
          } else {
            angleBracketsCount--;
          }
          if (angleBracketsCount === 0) {
            break;
          }
        } else if (xmlData[i] === "[") {
          hasBody = true;
        } else {
          exp += xmlData[i];
        }
      }
      if (angleBracketsCount !== 0) {
        throw new Error(`Unclosed DOCTYPE`);
      }
    } else {
      throw new Error(`Invalid Tag instead of DOCTYPE`);
    }
    return { entities, i };
  }
  readEntityExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    let entityName = "";
    while (i < xmlData.length && !/\s/.test(xmlData[i]) && xmlData[i] !== '"' && xmlData[i] !== "'") {
      entityName += xmlData[i];
      i++;
    }
    validateEntityName(entityName);
    i = skipWhitespace(xmlData, i);
    if (!this.suppressValidationErr) {
      if (xmlData.substring(i, i + 6).toUpperCase() === "SYSTEM") {
        throw new Error("External entities are not supported");
      } else if (xmlData[i] === "%") {
        throw new Error("Parameter entities are not supported");
      }
    }
    let entityValue = "";
    [i, entityValue] = this.readIdentifierVal(xmlData, i, "entity");
    if (this.options.enabled !== false && this.options.maxEntitySize && entityValue.length > this.options.maxEntitySize) {
      throw new Error(`Entity "${entityName}" size (${entityValue.length}) exceeds maximum allowed size (${this.options.maxEntitySize})`);
    }
    i--;
    return [entityName, entityValue, i];
  }
  readNotationExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    let notationName = "";
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      notationName += xmlData[i];
      i++;
    }
    !this.suppressValidationErr && validateEntityName(notationName);
    i = skipWhitespace(xmlData, i);
    const identifierType = xmlData.substring(i, i + 6).toUpperCase();
    if (!this.suppressValidationErr && identifierType !== "SYSTEM" && identifierType !== "PUBLIC") {
      throw new Error(`Expected SYSTEM or PUBLIC, found "${identifierType}"`);
    }
    i += identifierType.length;
    i = skipWhitespace(xmlData, i);
    let publicIdentifier = null;
    let systemIdentifier = null;
    if (identifierType === "PUBLIC") {
      [i, publicIdentifier] = this.readIdentifierVal(xmlData, i, "publicIdentifier");
      i = skipWhitespace(xmlData, i);
      if (xmlData[i] === '"' || xmlData[i] === "'") {
        [i, systemIdentifier] = this.readIdentifierVal(xmlData, i, "systemIdentifier");
      }
    } else if (identifierType === "SYSTEM") {
      [i, systemIdentifier] = this.readIdentifierVal(xmlData, i, "systemIdentifier");
      if (!this.suppressValidationErr && !systemIdentifier) {
        throw new Error("Missing mandatory system identifier for SYSTEM notation");
      }
    }
    return { notationName, publicIdentifier, systemIdentifier, index: --i };
  }
  readIdentifierVal(xmlData, i, type) {
    let identifierVal = "";
    const startChar = xmlData[i];
    if (startChar !== '"' && startChar !== "'") {
      throw new Error(`Expected quoted string, found "${startChar}"`);
    }
    i++;
    while (i < xmlData.length && xmlData[i] !== startChar) {
      identifierVal += xmlData[i];
      i++;
    }
    if (xmlData[i] !== startChar) {
      throw new Error(`Unterminated ${type} value`);
    }
    i++;
    return [i, identifierVal];
  }
  readElementExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    let elementName = "";
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      elementName += xmlData[i];
      i++;
    }
    if (!this.suppressValidationErr && !isName(elementName)) {
      throw new Error(`Invalid element name: "${elementName}"`);
    }
    i = skipWhitespace(xmlData, i);
    let contentModel = "";
    if (xmlData[i] === "E" && hasSeq(xmlData, "MPTY", i))
      i += 4;
    else if (xmlData[i] === "A" && hasSeq(xmlData, "NY", i))
      i += 2;
    else if (xmlData[i] === "(") {
      i++;
      while (i < xmlData.length && xmlData[i] !== ")") {
        contentModel += xmlData[i];
        i++;
      }
      if (xmlData[i] !== ")") {
        throw new Error("Unterminated content model");
      }
    } else if (!this.suppressValidationErr) {
      throw new Error(`Invalid Element Expression, found "${xmlData[i]}"`);
    }
    return {
      elementName,
      contentModel: contentModel.trim(),
      index: i
    };
  }
  readAttlistExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    let elementName = "";
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      elementName += xmlData[i];
      i++;
    }
    validateEntityName(elementName);
    i = skipWhitespace(xmlData, i);
    let attributeName = "";
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      attributeName += xmlData[i];
      i++;
    }
    if (!validateEntityName(attributeName)) {
      throw new Error(`Invalid attribute name: "${attributeName}"`);
    }
    i = skipWhitespace(xmlData, i);
    let attributeType = "";
    if (xmlData.substring(i, i + 8).toUpperCase() === "NOTATION") {
      attributeType = "NOTATION";
      i += 8;
      i = skipWhitespace(xmlData, i);
      if (xmlData[i] !== "(") {
        throw new Error(`Expected '(', found "${xmlData[i]}"`);
      }
      i++;
      let allowedNotations = [];
      while (i < xmlData.length && xmlData[i] !== ")") {
        let notation = "";
        while (i < xmlData.length && xmlData[i] !== "|" && xmlData[i] !== ")") {
          notation += xmlData[i];
          i++;
        }
        notation = notation.trim();
        if (!validateEntityName(notation)) {
          throw new Error(`Invalid notation name: "${notation}"`);
        }
        allowedNotations.push(notation);
        if (xmlData[i] === "|") {
          i++;
          i = skipWhitespace(xmlData, i);
        }
      }
      if (xmlData[i] !== ")") {
        throw new Error("Unterminated list of notations");
      }
      i++;
      attributeType += " (" + allowedNotations.join("|") + ")";
    } else {
      while (i < xmlData.length && !/\s/.test(xmlData[i])) {
        attributeType += xmlData[i];
        i++;
      }
      const validTypes = ["CDATA", "ID", "IDREF", "IDREFS", "ENTITY", "ENTITIES", "NMTOKEN", "NMTOKENS"];
      if (!this.suppressValidationErr && !validTypes.includes(attributeType.toUpperCase())) {
        throw new Error(`Invalid attribute type: "${attributeType}"`);
      }
    }
    i = skipWhitespace(xmlData, i);
    let defaultValue = "";
    if (xmlData.substring(i, i + 8).toUpperCase() === "#REQUIRED") {
      defaultValue = "#REQUIRED";
      i += 8;
    } else if (xmlData.substring(i, i + 7).toUpperCase() === "#IMPLIED") {
      defaultValue = "#IMPLIED";
      i += 7;
    } else {
      [i, defaultValue] = this.readIdentifierVal(xmlData, i, "ATTLIST");
    }
    return {
      elementName,
      attributeName,
      attributeType,
      defaultValue,
      index: i
    };
  }
};
var skipWhitespace = (data, index) => {
  while (index < data.length && /\s/.test(data[index])) {
    index++;
  }
  return index;
};
function hasSeq(data, seq, i) {
  for (let j = 0; j < seq.length; j++) {
    if (seq[j] !== data[i + j + 1])
      return false;
  }
  return true;
}
function validateEntityName(name) {
  if (isName(name))
    return name;
  else
    throw new Error(`Invalid entity name ${name}`);
}

// node_modules/strnum/strnum.js
var hexRegex = /^[-+]?0x[a-fA-F0-9]+$/;
var numRegex = /^([\-\+])?(0*)([0-9]*(\.[0-9]*)?)$/;
var consider = {
  hex: true,
  leadingZeros: true,
  decimalPoint: ".",
  eNotation: true,
  infinity: "original"
};
function toNumber(str, options = {}) {
  options = Object.assign({}, consider, options);
  if (!str || typeof str !== "string")
    return str;
  let trimmedStr = str.trim();
  if (options.skipLike !== void 0 && options.skipLike.test(trimmedStr))
    return str;
  else if (str === "0")
    return 0;
  else if (options.hex && hexRegex.test(trimmedStr)) {
    return parse_int(trimmedStr, 16);
  } else if (!isFinite(trimmedStr)) {
    return handleInfinity(str, Number(trimmedStr), options);
  } else if (trimmedStr.includes("e") || trimmedStr.includes("E")) {
    return resolveEnotation(str, trimmedStr, options);
  } else {
    const match = numRegex.exec(trimmedStr);
    if (match) {
      const sign = match[1] || "";
      const leadingZeros = match[2];
      let numTrimmedByZeros = trimZeros(match[3]);
      const decimalAdjacentToLeadingZeros = sign ? str[leadingZeros.length + 1] === "." : str[leadingZeros.length] === ".";
      if (!options.leadingZeros && (leadingZeros.length > 1 || leadingZeros.length === 1 && !decimalAdjacentToLeadingZeros)) {
        return str;
      } else {
        const num = Number(trimmedStr);
        const parsedStr = String(num);
        if (num === 0)
          return num;
        if (parsedStr.search(/[eE]/) !== -1) {
          if (options.eNotation)
            return num;
          else
            return str;
        } else if (trimmedStr.indexOf(".") !== -1) {
          if (parsedStr === "0")
            return num;
          else if (parsedStr === numTrimmedByZeros)
            return num;
          else if (parsedStr === `${sign}${numTrimmedByZeros}`)
            return num;
          else
            return str;
        }
        let n = leadingZeros ? numTrimmedByZeros : trimmedStr;
        if (leadingZeros) {
          return n === parsedStr || sign + n === parsedStr ? num : str;
        } else {
          return n === parsedStr || n === sign + parsedStr ? num : str;
        }
      }
    } else {
      return str;
    }
  }
}
var eNotationRegx = /^([-+])?(0*)(\d*(\.\d*)?[eE][-\+]?\d+)$/;
function resolveEnotation(str, trimmedStr, options) {
  if (!options.eNotation)
    return str;
  const notation = trimmedStr.match(eNotationRegx);
  if (notation) {
    let sign = notation[1] || "";
    const eChar = notation[3].indexOf("e") === -1 ? "E" : "e";
    const leadingZeros = notation[2];
    const eAdjacentToLeadingZeros = sign ? str[leadingZeros.length + 1] === eChar : str[leadingZeros.length] === eChar;
    if (leadingZeros.length > 1 && eAdjacentToLeadingZeros)
      return str;
    else if (leadingZeros.length === 1 && (notation[3].startsWith(`.${eChar}`) || notation[3][0] === eChar)) {
      return Number(trimmedStr);
    } else if (options.leadingZeros && !eAdjacentToLeadingZeros) {
      trimmedStr = (notation[1] || "") + notation[3];
      return Number(trimmedStr);
    } else
      return str;
  } else {
    return str;
  }
}
function trimZeros(numStr) {
  if (numStr && numStr.indexOf(".") !== -1) {
    numStr = numStr.replace(/0+$/, "");
    if (numStr === ".")
      numStr = "0";
    else if (numStr[0] === ".")
      numStr = "0" + numStr;
    else if (numStr[numStr.length - 1] === ".")
      numStr = numStr.substring(0, numStr.length - 1);
    return numStr;
  }
  return numStr;
}
function parse_int(numStr, base) {
  if (parseInt)
    return parseInt(numStr, base);
  else if (Number.parseInt)
    return Number.parseInt(numStr, base);
  else if (window && window.parseInt)
    return window.parseInt(numStr, base);
  else
    throw new Error("parseInt, Number.parseInt, window.parseInt are not supported");
}
function handleInfinity(str, num, options) {
  const isPositive = num === Infinity;
  switch (options.infinity.toLowerCase()) {
    case "null":
      return null;
    case "infinity":
      return num;
    case "string":
      return isPositive ? "Infinity" : "-Infinity";
    case "original":
    default:
      return str;
  }
}

// node_modules/fast-xml-parser/src/ignoreAttributes.js
function getIgnoreAttributesFn(ignoreAttributes) {
  if (typeof ignoreAttributes === "function") {
    return ignoreAttributes;
  }
  if (Array.isArray(ignoreAttributes)) {
    return (attrName) => {
      for (const pattern of ignoreAttributes) {
        if (typeof pattern === "string" && attrName === pattern) {
          return true;
        }
        if (pattern instanceof RegExp && pattern.test(attrName)) {
          return true;
        }
      }
    };
  }
  return () => false;
}

// node_modules/fast-xml-parser/src/xmlparser/OrderedObjParser.js
var OrderedObjParser = class {
  constructor(options) {
    this.options = options;
    this.currentNode = null;
    this.tagsNodeStack = [];
    this.docTypeEntities = {};
    this.lastEntities = {
      "apos": { regex: /&(apos|#39|#x27);/g, val: "'" },
      "gt": { regex: /&(gt|#62|#x3E);/g, val: ">" },
      "lt": { regex: /&(lt|#60|#x3C);/g, val: "<" },
      "quot": { regex: /&(quot|#34|#x22);/g, val: '"' }
    };
    this.ampEntity = { regex: /&(amp|#38|#x26);/g, val: "&" };
    this.htmlEntities = {
      "space": { regex: /&(nbsp|#160);/g, val: " " },
      "cent": { regex: /&(cent|#162);/g, val: "\xA2" },
      "pound": { regex: /&(pound|#163);/g, val: "\xA3" },
      "yen": { regex: /&(yen|#165);/g, val: "\xA5" },
      "euro": { regex: /&(euro|#8364);/g, val: "\u20AC" },
      "copyright": { regex: /&(copy|#169);/g, val: "\xA9" },
      "reg": { regex: /&(reg|#174);/g, val: "\xAE" },
      "inr": { regex: /&(inr|#8377);/g, val: "\u20B9" },
      "num_dec": { regex: /&#([0-9]{1,7});/g, val: (_, str) => fromCodePoint(str, 10, "&#") },
      "num_hex": { regex: /&#x([0-9a-fA-F]{1,6});/g, val: (_, str) => fromCodePoint(str, 16, "&#x") }
    };
    this.addExternalEntities = addExternalEntities;
    this.parseXml = parseXml;
    this.parseTextData = parseTextData;
    this.resolveNameSpace = resolveNameSpace;
    this.buildAttributesMap = buildAttributesMap;
    this.isItStopNode = isItStopNode;
    this.replaceEntitiesValue = replaceEntitiesValue;
    this.readStopNodeData = readStopNodeData;
    this.saveTextToParentTag = saveTextToParentTag;
    this.addChild = addChild;
    this.ignoreAttributesFn = getIgnoreAttributesFn(this.options.ignoreAttributes);
    this.entityExpansionCount = 0;
    this.currentExpandedLength = 0;
    if (this.options.stopNodes && this.options.stopNodes.length > 0) {
      this.stopNodesExact = /* @__PURE__ */ new Set();
      this.stopNodesWildcard = /* @__PURE__ */ new Set();
      for (let i = 0; i < this.options.stopNodes.length; i++) {
        const stopNodeExp = this.options.stopNodes[i];
        if (typeof stopNodeExp !== "string")
          continue;
        if (stopNodeExp.startsWith("*.")) {
          this.stopNodesWildcard.add(stopNodeExp.substring(2));
        } else {
          this.stopNodesExact.add(stopNodeExp);
        }
      }
    }
  }
};
function addExternalEntities(externalEntities) {
  const entKeys = Object.keys(externalEntities);
  for (let i = 0; i < entKeys.length; i++) {
    const ent = entKeys[i];
    const escaped = ent.replace(/[.\-+*:]/g, "\\.");
    this.lastEntities[ent] = {
      regex: new RegExp("&" + escaped + ";", "g"),
      val: externalEntities[ent]
    };
  }
}
function parseTextData(val, tagName, jPath, dontTrim, hasAttributes, isLeafNode, escapeEntities) {
  if (val !== void 0) {
    if (this.options.trimValues && !dontTrim) {
      val = val.trim();
    }
    if (val.length > 0) {
      if (!escapeEntities)
        val = this.replaceEntitiesValue(val, tagName, jPath);
      const newval = this.options.tagValueProcessor(tagName, val, jPath, hasAttributes, isLeafNode);
      if (newval === null || newval === void 0) {
        return val;
      } else if (typeof newval !== typeof val || newval !== val) {
        return newval;
      } else if (this.options.trimValues) {
        return parseValue(val, this.options.parseTagValue, this.options.numberParseOptions);
      } else {
        const trimmedVal = val.trim();
        if (trimmedVal === val) {
          return parseValue(val, this.options.parseTagValue, this.options.numberParseOptions);
        } else {
          return val;
        }
      }
    }
  }
}
function resolveNameSpace(tagname) {
  if (this.options.removeNSPrefix) {
    const tags = tagname.split(":");
    const prefix = tagname.charAt(0) === "/" ? "/" : "";
    if (tags[0] === "xmlns") {
      return "";
    }
    if (tags.length === 2) {
      tagname = prefix + tags[1];
    }
  }
  return tagname;
}
var attrsRegx = new RegExp(`([^\\s=]+)\\s*(=\\s*(['"])([\\s\\S]*?)\\3)?`, "gm");
function buildAttributesMap(attrStr, jPath, tagName) {
  if (this.options.ignoreAttributes !== true && typeof attrStr === "string") {
    const matches = getAllMatches(attrStr, attrsRegx);
    const len = matches.length;
    const attrs = {};
    for (let i = 0; i < len; i++) {
      const attrName = this.resolveNameSpace(matches[i][1]);
      if (this.ignoreAttributesFn(attrName, jPath)) {
        continue;
      }
      let oldVal = matches[i][4];
      let aName = this.options.attributeNamePrefix + attrName;
      if (attrName.length) {
        if (this.options.transformAttributeName) {
          aName = this.options.transformAttributeName(aName);
        }
        if (aName === "__proto__")
          aName = "#__proto__";
        if (oldVal !== void 0) {
          if (this.options.trimValues) {
            oldVal = oldVal.trim();
          }
          oldVal = this.replaceEntitiesValue(oldVal, tagName, jPath);
          const newVal = this.options.attributeValueProcessor(attrName, oldVal, jPath);
          if (newVal === null || newVal === void 0) {
            attrs[aName] = oldVal;
          } else if (typeof newVal !== typeof oldVal || newVal !== oldVal) {
            attrs[aName] = newVal;
          } else {
            attrs[aName] = parseValue(oldVal, this.options.parseAttributeValue, this.options.numberParseOptions);
          }
        } else if (this.options.allowBooleanAttributes) {
          attrs[aName] = true;
        }
      }
    }
    if (!Object.keys(attrs).length) {
      return;
    }
    if (this.options.attributesGroupName) {
      const attrCollection = {};
      attrCollection[this.options.attributesGroupName] = attrs;
      return attrCollection;
    }
    return attrs;
  }
}
var parseXml = function(xmlData) {
  xmlData = xmlData.replace(/\r\n?/g, "\n");
  const xmlObj = new XmlNode("!xml");
  let currentNode = xmlObj;
  let textData = "";
  let jPath = "";
  this.entityExpansionCount = 0;
  this.currentExpandedLength = 0;
  const docTypeReader = new DocTypeReader(this.options.processEntities);
  for (let i = 0; i < xmlData.length; i++) {
    const ch = xmlData[i];
    if (ch === "<") {
      if (xmlData[i + 1] === "/") {
        const closeIndex = findClosingIndex(xmlData, ">", i, "Closing Tag is not closed.");
        let tagName = xmlData.substring(i + 2, closeIndex).trim();
        if (this.options.removeNSPrefix) {
          const colonIndex = tagName.indexOf(":");
          if (colonIndex !== -1) {
            tagName = tagName.substr(colonIndex + 1);
          }
        }
        if (this.options.transformTagName) {
          tagName = this.options.transformTagName(tagName);
        }
        if (currentNode) {
          textData = this.saveTextToParentTag(textData, currentNode, jPath);
        }
        const lastTagName = jPath.substring(jPath.lastIndexOf(".") + 1);
        if (tagName && this.options.unpairedTags.indexOf(tagName) !== -1) {
          throw new Error(`Unpaired tag can not be used as closing tag: </${tagName}>`);
        }
        let propIndex = 0;
        if (lastTagName && this.options.unpairedTags.indexOf(lastTagName) !== -1) {
          propIndex = jPath.lastIndexOf(".", jPath.lastIndexOf(".") - 1);
          this.tagsNodeStack.pop();
        } else {
          propIndex = jPath.lastIndexOf(".");
        }
        jPath = jPath.substring(0, propIndex);
        currentNode = this.tagsNodeStack.pop();
        textData = "";
        i = closeIndex;
      } else if (xmlData[i + 1] === "?") {
        let tagData = readTagExp(xmlData, i, false, "?>");
        if (!tagData)
          throw new Error("Pi Tag is not closed.");
        textData = this.saveTextToParentTag(textData, currentNode, jPath);
        if (this.options.ignoreDeclaration && tagData.tagName === "?xml" || this.options.ignorePiTags) {
        } else {
          const childNode = new XmlNode(tagData.tagName);
          childNode.add(this.options.textNodeName, "");
          if (tagData.tagName !== tagData.tagExp && tagData.attrExpPresent) {
            childNode[":@"] = this.buildAttributesMap(tagData.tagExp, jPath, tagData.tagName);
          }
          this.addChild(currentNode, childNode, jPath, i);
        }
        i = tagData.closeIndex + 1;
      } else if (xmlData.substr(i + 1, 3) === "!--") {
        const endIndex = findClosingIndex(xmlData, "-->", i + 4, "Comment is not closed.");
        if (this.options.commentPropName) {
          const comment = xmlData.substring(i + 4, endIndex - 2);
          textData = this.saveTextToParentTag(textData, currentNode, jPath);
          currentNode.add(this.options.commentPropName, [{ [this.options.textNodeName]: comment }]);
        }
        i = endIndex;
      } else if (xmlData.substr(i + 1, 2) === "!D") {
        const result = docTypeReader.readDocType(xmlData, i);
        this.docTypeEntities = result.entities;
        i = result.i;
      } else if (xmlData.substr(i + 1, 2) === "![") {
        const closeIndex = findClosingIndex(xmlData, "]]>", i, "CDATA is not closed.") - 2;
        const tagExp = xmlData.substring(i + 9, closeIndex);
        textData = this.saveTextToParentTag(textData, currentNode, jPath);
        let val = this.parseTextData(tagExp, currentNode.tagname, jPath, true, false, true, true);
        if (val == void 0)
          val = "";
        if (this.options.cdataPropName) {
          currentNode.add(this.options.cdataPropName, [{ [this.options.textNodeName]: tagExp }]);
        } else {
          currentNode.add(this.options.textNodeName, val);
        }
        i = closeIndex + 2;
      } else {
        let result = readTagExp(xmlData, i, this.options.removeNSPrefix);
        let tagName = result.tagName;
        const rawTagName = result.rawTagName;
        let tagExp = result.tagExp;
        let attrExpPresent = result.attrExpPresent;
        let closeIndex = result.closeIndex;
        if (this.options.transformTagName) {
          const newTagName = this.options.transformTagName(tagName);
          if (tagExp === tagName) {
            tagExp = newTagName;
          }
          tagName = newTagName;
        }
        if (this.options.strictReservedNames && (tagName === this.options.commentPropName || tagName === this.options.cdataPropName)) {
          throw new Error(`Invalid tag name: ${tagName}`);
        }
        if (currentNode && textData) {
          if (currentNode.tagname !== "!xml") {
            textData = this.saveTextToParentTag(textData, currentNode, jPath, false);
          }
        }
        const lastTag = currentNode;
        if (lastTag && this.options.unpairedTags.indexOf(lastTag.tagname) !== -1) {
          currentNode = this.tagsNodeStack.pop();
          jPath = jPath.substring(0, jPath.lastIndexOf("."));
        }
        if (tagName !== xmlObj.tagname) {
          jPath += jPath ? "." + tagName : tagName;
        }
        const startIndex = i;
        if (this.isItStopNode(this.stopNodesExact, this.stopNodesWildcard, jPath, tagName)) {
          let tagContent = "";
          if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
            if (tagName[tagName.length - 1] === "/") {
              tagName = tagName.substr(0, tagName.length - 1);
              jPath = jPath.substr(0, jPath.length - 1);
              tagExp = tagName;
            } else {
              tagExp = tagExp.substr(0, tagExp.length - 1);
            }
            i = result.closeIndex;
          } else if (this.options.unpairedTags.indexOf(tagName) !== -1) {
            i = result.closeIndex;
          } else {
            const result2 = this.readStopNodeData(xmlData, rawTagName, closeIndex + 1);
            if (!result2)
              throw new Error(`Unexpected end of ${rawTagName}`);
            i = result2.i;
            tagContent = result2.tagContent;
          }
          const childNode = new XmlNode(tagName);
          if (tagName !== tagExp && attrExpPresent) {
            childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
          }
          if (tagContent) {
            tagContent = this.parseTextData(tagContent, tagName, jPath, true, attrExpPresent, true, true);
          }
          jPath = jPath.substr(0, jPath.lastIndexOf("."));
          childNode.add(this.options.textNodeName, tagContent);
          this.addChild(currentNode, childNode, jPath, startIndex);
        } else {
          if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
            if (tagName[tagName.length - 1] === "/") {
              tagName = tagName.substr(0, tagName.length - 1);
              jPath = jPath.substr(0, jPath.length - 1);
              tagExp = tagName;
            } else {
              tagExp = tagExp.substr(0, tagExp.length - 1);
            }
            if (this.options.transformTagName) {
              const newTagName = this.options.transformTagName(tagName);
              if (tagExp === tagName) {
                tagExp = newTagName;
              }
              tagName = newTagName;
            }
            const childNode = new XmlNode(tagName);
            if (tagName !== tagExp && attrExpPresent) {
              childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
            }
            this.addChild(currentNode, childNode, jPath, startIndex);
            jPath = jPath.substr(0, jPath.lastIndexOf("."));
          } else if (this.options.unpairedTags.indexOf(tagName) !== -1) {
            const childNode = new XmlNode(tagName);
            if (tagName !== tagExp && attrExpPresent) {
              childNode[":@"] = this.buildAttributesMap(tagExp, jPath);
            }
            this.addChild(currentNode, childNode, jPath, startIndex);
            jPath = jPath.substr(0, jPath.lastIndexOf("."));
            i = result.closeIndex;
            continue;
          } else {
            const childNode = new XmlNode(tagName);
            if (this.tagsNodeStack.length > this.options.maxNestedTags) {
              throw new Error("Maximum nested tags exceeded");
            }
            this.tagsNodeStack.push(currentNode);
            if (tagName !== tagExp && attrExpPresent) {
              childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
            }
            this.addChild(currentNode, childNode, jPath, startIndex);
            currentNode = childNode;
          }
          textData = "";
          i = closeIndex;
        }
      }
    } else {
      textData += xmlData[i];
    }
  }
  return xmlObj.child;
};
function addChild(currentNode, childNode, jPath, startIndex) {
  if (!this.options.captureMetaData)
    startIndex = void 0;
  const result = this.options.updateTag(childNode.tagname, jPath, childNode[":@"]);
  if (result === false) {
  } else if (typeof result === "string") {
    childNode.tagname = result;
    currentNode.addChild(childNode, startIndex);
  } else {
    currentNode.addChild(childNode, startIndex);
  }
}
var replaceEntitiesValue = function(val, tagName, jPath) {
  if (val.indexOf("&") === -1) {
    return val;
  }
  const entityConfig = this.options.processEntities;
  if (!entityConfig.enabled) {
    return val;
  }
  if (entityConfig.allowedTags) {
    if (!entityConfig.allowedTags.includes(tagName)) {
      return val;
    }
  }
  if (entityConfig.tagFilter) {
    if (!entityConfig.tagFilter(tagName, jPath)) {
      return val;
    }
  }
  for (let entityName in this.docTypeEntities) {
    const entity = this.docTypeEntities[entityName];
    const matches = val.match(entity.regx);
    if (matches) {
      this.entityExpansionCount += matches.length;
      if (entityConfig.maxTotalExpansions && this.entityExpansionCount > entityConfig.maxTotalExpansions) {
        throw new Error(`Entity expansion limit exceeded: ${this.entityExpansionCount} > ${entityConfig.maxTotalExpansions}`);
      }
      const lengthBefore = val.length;
      val = val.replace(entity.regx, entity.val);
      if (entityConfig.maxExpandedLength) {
        this.currentExpandedLength += val.length - lengthBefore;
        if (this.currentExpandedLength > entityConfig.maxExpandedLength) {
          throw new Error(`Total expanded content size exceeded: ${this.currentExpandedLength} > ${entityConfig.maxExpandedLength}`);
        }
      }
    }
  }
  if (val.indexOf("&") === -1)
    return val;
  for (let entityName in this.lastEntities) {
    const entity = this.lastEntities[entityName];
    val = val.replace(entity.regex, entity.val);
  }
  if (val.indexOf("&") === -1)
    return val;
  if (this.options.htmlEntities) {
    for (let entityName in this.htmlEntities) {
      const entity = this.htmlEntities[entityName];
      val = val.replace(entity.regex, entity.val);
    }
  }
  val = val.replace(this.ampEntity.regex, this.ampEntity.val);
  return val;
};
function saveTextToParentTag(textData, parentNode, jPath, isLeafNode) {
  if (textData) {
    if (isLeafNode === void 0)
      isLeafNode = parentNode.child.length === 0;
    textData = this.parseTextData(textData, parentNode.tagname, jPath, false, parentNode[":@"] ? Object.keys(parentNode[":@"]).length !== 0 : false, isLeafNode);
    if (textData !== void 0 && textData !== "")
      parentNode.add(this.options.textNodeName, textData);
    textData = "";
  }
  return textData;
}
function isItStopNode(stopNodesExact, stopNodesWildcard, jPath, currentTagName) {
  if (stopNodesWildcard && stopNodesWildcard.has(currentTagName))
    return true;
  if (stopNodesExact && stopNodesExact.has(jPath))
    return true;
  return false;
}
function tagExpWithClosingIndex(xmlData, i, closingChar = ">") {
  let attrBoundary;
  let tagExp = "";
  for (let index = i; index < xmlData.length; index++) {
    let ch = xmlData[index];
    if (attrBoundary) {
      if (ch === attrBoundary)
        attrBoundary = "";
    } else if (ch === '"' || ch === "'") {
      attrBoundary = ch;
    } else if (ch === closingChar[0]) {
      if (closingChar[1]) {
        if (xmlData[index + 1] === closingChar[1]) {
          return {
            data: tagExp,
            index
          };
        }
      } else {
        return {
          data: tagExp,
          index
        };
      }
    } else if (ch === "	") {
      ch = " ";
    }
    tagExp += ch;
  }
}
function findClosingIndex(xmlData, str, i, errMsg) {
  const closingIndex = xmlData.indexOf(str, i);
  if (closingIndex === -1) {
    throw new Error(errMsg);
  } else {
    return closingIndex + str.length - 1;
  }
}
function readTagExp(xmlData, i, removeNSPrefix, closingChar = ">") {
  const result = tagExpWithClosingIndex(xmlData, i + 1, closingChar);
  if (!result)
    return;
  let tagExp = result.data;
  const closeIndex = result.index;
  const separatorIndex = tagExp.search(/\s/);
  let tagName = tagExp;
  let attrExpPresent = true;
  if (separatorIndex !== -1) {
    tagName = tagExp.substring(0, separatorIndex);
    tagExp = tagExp.substring(separatorIndex + 1).trimStart();
  }
  const rawTagName = tagName;
  if (removeNSPrefix) {
    const colonIndex = tagName.indexOf(":");
    if (colonIndex !== -1) {
      tagName = tagName.substr(colonIndex + 1);
      attrExpPresent = tagName !== result.data.substr(colonIndex + 1);
    }
  }
  return {
    tagName,
    tagExp,
    closeIndex,
    attrExpPresent,
    rawTagName
  };
}
function readStopNodeData(xmlData, tagName, i) {
  const startIndex = i;
  let openTagCount = 1;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === "<") {
      if (xmlData[i + 1] === "/") {
        const closeIndex = findClosingIndex(xmlData, ">", i, `${tagName} is not closed`);
        let closeTagName = xmlData.substring(i + 2, closeIndex).trim();
        if (closeTagName === tagName) {
          openTagCount--;
          if (openTagCount === 0) {
            return {
              tagContent: xmlData.substring(startIndex, i),
              i: closeIndex
            };
          }
        }
        i = closeIndex;
      } else if (xmlData[i + 1] === "?") {
        const closeIndex = findClosingIndex(xmlData, "?>", i + 1, "StopNode is not closed.");
        i = closeIndex;
      } else if (xmlData.substr(i + 1, 3) === "!--") {
        const closeIndex = findClosingIndex(xmlData, "-->", i + 3, "StopNode is not closed.");
        i = closeIndex;
      } else if (xmlData.substr(i + 1, 2) === "![") {
        const closeIndex = findClosingIndex(xmlData, "]]>", i, "StopNode is not closed.") - 2;
        i = closeIndex;
      } else {
        const tagData = readTagExp(xmlData, i, ">");
        if (tagData) {
          const openTagName = tagData && tagData.tagName;
          if (openTagName === tagName && tagData.tagExp[tagData.tagExp.length - 1] !== "/") {
            openTagCount++;
          }
          i = tagData.closeIndex;
        }
      }
    }
  }
}
function parseValue(val, shouldParse, options) {
  if (shouldParse && typeof val === "string") {
    const newval = val.trim();
    if (newval === "true")
      return true;
    else if (newval === "false")
      return false;
    else
      return toNumber(val, options);
  } else {
    if (isExist(val)) {
      return val;
    } else {
      return "";
    }
  }
}
function fromCodePoint(str, base, prefix) {
  const codePoint = Number.parseInt(str, base);
  if (codePoint >= 0 && codePoint <= 1114111) {
    return String.fromCodePoint(codePoint);
  } else {
    return prefix + str + ";";
  }
}

// node_modules/fast-xml-parser/src/xmlparser/node2json.js
var METADATA_SYMBOL2 = XmlNode.getMetaDataSymbol();
function prettify(node, options) {
  return compress(node, options);
}
function compress(arr, options, jPath) {
  let text;
  const compressedObj = {};
  for (let i = 0; i < arr.length; i++) {
    const tagObj = arr[i];
    const property = propName(tagObj);
    let newJpath = "";
    if (jPath === void 0)
      newJpath = property;
    else
      newJpath = jPath + "." + property;
    if (property === options.textNodeName) {
      if (text === void 0)
        text = tagObj[property];
      else
        text += "" + tagObj[property];
    } else if (property === void 0) {
      continue;
    } else if (tagObj[property]) {
      let val = compress(tagObj[property], options, newJpath);
      const isLeaf = isLeafTag(val, options);
      if (tagObj[":@"]) {
        assignAttributes(val, tagObj[":@"], newJpath, options);
      } else if (Object.keys(val).length === 1 && val[options.textNodeName] !== void 0 && !options.alwaysCreateTextNode) {
        val = val[options.textNodeName];
      } else if (Object.keys(val).length === 0) {
        if (options.alwaysCreateTextNode)
          val[options.textNodeName] = "";
        else
          val = "";
      }
      if (tagObj[METADATA_SYMBOL2] !== void 0 && typeof val === "object" && val !== null) {
        val[METADATA_SYMBOL2] = tagObj[METADATA_SYMBOL2];
      }
      if (compressedObj[property] !== void 0 && Object.prototype.hasOwnProperty.call(compressedObj, property)) {
        if (!Array.isArray(compressedObj[property])) {
          compressedObj[property] = [compressedObj[property]];
        }
        compressedObj[property].push(val);
      } else {
        if (options.isArray(property, newJpath, isLeaf)) {
          compressedObj[property] = [val];
        } else {
          compressedObj[property] = val;
        }
      }
    }
  }
  if (typeof text === "string") {
    if (text.length > 0)
      compressedObj[options.textNodeName] = text;
  } else if (text !== void 0)
    compressedObj[options.textNodeName] = text;
  return compressedObj;
}
function propName(obj) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key !== ":@")
      return key;
  }
}
function assignAttributes(obj, attrMap, jpath, options) {
  if (attrMap) {
    const keys = Object.keys(attrMap);
    const len = keys.length;
    for (let i = 0; i < len; i++) {
      const atrrName = keys[i];
      if (options.isArray(atrrName, jpath + "." + atrrName, true, true)) {
        obj[atrrName] = [attrMap[atrrName]];
      } else {
        obj[atrrName] = attrMap[atrrName];
      }
    }
  }
}
function isLeafTag(obj, options) {
  const { textNodeName } = options;
  const propCount = Object.keys(obj).length;
  if (propCount === 0) {
    return true;
  }
  if (propCount === 1 && (obj[textNodeName] || typeof obj[textNodeName] === "boolean" || obj[textNodeName] === 0)) {
    return true;
  }
  return false;
}

// node_modules/fast-xml-parser/src/xmlparser/XMLParser.js
var XMLParser = class {
  constructor(options) {
    this.externalEntities = {};
    this.options = buildOptions(options);
  }
  parse(xmlData, validationOption) {
    if (typeof xmlData !== "string" && xmlData.toString) {
      xmlData = xmlData.toString();
    } else if (typeof xmlData !== "string") {
      throw new Error("XML data is accepted in String or Bytes[] form.");
    }
    if (validationOption) {
      if (validationOption === true)
        validationOption = {};
      const result = validate(xmlData, validationOption);
      if (result !== true) {
        throw Error(`${result.err.msg}:${result.err.line}:${result.err.col}`);
      }
    }
    const orderedObjParser = new OrderedObjParser(this.options);
    orderedObjParser.addExternalEntities(this.externalEntities);
    const orderedResult = orderedObjParser.parseXml(xmlData);
    if (this.options.preserveOrder || orderedResult === void 0)
      return orderedResult;
    else
      return prettify(orderedResult, this.options);
  }
  addEntity(key, value) {
    if (value.indexOf("&") !== -1) {
      throw new Error("Entity value can't have '&'");
    } else if (key.indexOf("&") !== -1 || key.indexOf(";") !== -1) {
      throw new Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");
    } else if (value === "&") {
      throw new Error("An entity with value '&' is not permitted");
    } else {
      this.externalEntities[key] = value;
    }
  }
  static getMetaDataSymbol() {
    return XmlNode.getMetaDataSymbol();
  }
};

// lib/documentate/scxml.ts
function toSCXML(machine) {
  let xml = "";
  const initial = machine.initial || Object.keys(machine.states)[0] || "";
  const name = machine.title || "Machine";
  xml += `<?xml version="1.0" encoding="UTF-8"?>
`;
  xml += `<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0" initial="${initial}" name="${name}">
`;
  for (const [parallelName, parallelMachine] of Object.entries(machine.parallel)) {
    xml += `  <parallel id="${parallelMachine.title || parallelName}">
`;
    xml += generateStates(parallelMachine.states, "    ");
    xml += `  </parallel>
`;
  }
  xml += generateStates(machine.states, "  ");
  xml += "</scxml>";
  return xml;
}
function generateStates(states, indent) {
  let xml = "";
  for (const [stateName, state] of Object.entries(states)) {
    xml += generateState(stateName, state, indent);
  }
  return xml;
}
function generateState(stateName, state, indent) {
  let xml = "";
  const isFinal = !state.on || Object.keys(state.on).length === 0;
  if (isFinal && !state.nested) {
    xml += `${indent}<final id="${stateName}"/>
`;
  } else {
    xml += `${indent}<state id="${stateName}">
`;
    if (state.description) {
      xml += `${indent}  <datamodel>
`;
      xml += `${indent}    <data id="description">${state.description}</data>
`;
      xml += `${indent}  </datamodel>
`;
    }
    if (state.run && state.run.length > 0) {
      xml += `${indent}  <onentry>
`;
      for (const pulse of state.run) {
        xml += `${indent}    <script>${pulse.pulse}()<\/script>
`;
      }
      xml += `${indent}  </onentry>
`;
    }
    if (state.nested && state.nested.length > 0) {
      for (const nested of state.nested) {
        xml += generateNestedMachine(nested, indent + "  ");
      }
    }
    if (state.on) {
      for (const [event, transition] of Object.entries(state.on)) {
        xml += generateTransition(event, transition, indent + "  ");
      }
    }
    if (state.immediate) {
      for (const immediate of state.immediate) {
        xml += generateImmediateTransition(immediate, indent + "  ");
      }
    }
    xml += `${indent}</state>
`;
  }
  return xml;
}
function generateTransition(event, transition, indent) {
  let xml = `${indent}<transition event="${event}"`;
  if (transition.target) {
    xml += ` target="${transition.target}"`;
  }
  if (transition.guards && transition.guards.length > 0) {
    const conditions = transition.guards.map((g) => g.guard).join(" && ");
    xml += ` cond="${conditions}"`;
  }
  if (transition.exit && transition.exit.length > 0) {
    xml += ">\n";
    xml += `${indent}  <onexit>
`;
    for (const pulse of transition.exit) {
      xml += `${indent}    <script>${pulse.pulse}()<\/script>
`;
    }
    xml += `${indent}  </onexit>
`;
    xml += `${indent}</transition>
`;
  } else {
    xml += "/>\n";
  }
  return xml;
}
function generateImmediateTransition(immediate, indent) {
  let xml = `${indent}<transition type="internal"`;
  if (immediate.immediate) {
    xml += ` target="${immediate.immediate}"`;
  }
  if (immediate.guards && immediate.guards.length > 0) {
    const conditions = immediate.guards.map((g) => g.guard).join(" && ");
    xml += ` cond="${conditions}"`;
  }
  xml += "/>\n";
  return xml;
}
function generateNestedMachine(nested, indent) {
  let xml = "";
  const machineTitle = nested.machine.title || "nested";
  const initial = nested.machine.initial || Object.keys(nested.machine.states)[0] || "";
  xml += `${indent}<state id="${machineTitle}">
`;
  xml += `${indent}  <initial id="${initial}">
`;
  xml += `${indent}    <transition target="${initial}"/>
`;
  xml += `${indent}  </initial>
`;
  xml += generateStates(nested.machine.states, indent + "  ");
  for (const [parallelName, parallelMachine] of Object.entries(nested.machine.parallel)) {
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
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    preserveOrder: false,
    parseAttributeValue: false,
    parseTagValue: false
  });
  const result = parser.parse(scxmlString);
  const root = result.scxml || result;
  if (!root || !root["@_xmlns"] && !root["@_version"] && !root["@_initial"] && !root["@_name"]) {
    throw new Error("Invalid SCXML document: root element must be <scxml>");
  }
  const machine = {
    title: root["@_name"] || void 0,
    initial: root["@_initial"] || "",
    states: {},
    parallel: {},
    context: {}
  };
  const rootKeys = Object.keys(root).filter((k) => !k.startsWith("@_"));
  const childStates = root.state;
  const childParallel = root.parallel;
  if (childStates) {
    const statesArray = Array.isArray(childStates) ? childStates : [childStates];
    for (const stateEl of statesArray) {
      if (stateEl && stateEl["@_id"]) {
        const state = parseStateElementFromObject(stateEl);
        if (state.name) {
          machine.states[state.name] = state;
        }
      }
    }
  }
  if (childParallel) {
    const parallelArray = Array.isArray(childParallel) ? childParallel : [childParallel];
    for (const parallelEl of parallelArray) {
      if (parallelEl && parallelEl["@_id"]) {
        machine.parallel[parallelEl["@_id"]] = parseParallelElementFromObject(parallelEl);
      }
    }
  }
  return machine;
}
function parseStateElementFromObject(stateEl) {
  const state = {
    name: stateEl["@_id"] || ""
  };
  if (stateEl.datamodel && stateEl.datamodel.data) {
    const data = Array.isArray(stateEl.datamodel.data) ? stateEl.datamodel.data[0] : stateEl.datamodel.data;
    state.description = data["#text"] || data;
  }
  if (stateEl.onentry && stateEl.onentry.script) {
    state.run = parseScriptElements(stateEl.onentry.script);
  }
  const transitions = stateEl.transition;
  if (transitions) {
    state.on = {};
    const transArray = Array.isArray(transitions) ? transitions : [transitions];
    for (const trans of transArray) {
      if (!trans)
        continue;
      const event = trans["@_event"];
      const target = trans["@_target"];
      const cond = trans["@_cond"];
      const type = trans["@_type"];
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
      const transitionObj = {
        target: target || ""
      };
      if (cond) {
        transitionObj.guards = [{ guard: cond }];
      }
      if (trans.onexit && trans.onexit.script) {
        transitionObj.exit = parseScriptElements(trans.onexit.script);
      }
      state.on[event] = transitionObj;
    }
  }
  const nestedStates = stateEl.state;
  if (nestedStates) {
    const nestedArray = Array.isArray(nestedStates) ? nestedStates : [nestedStates];
    const validNested = nestedArray.filter((n) => n && n["@_id"]);
    if (validNested.length > 0) {
      state.nested = [];
      for (const nestedEl of validNested) {
        const nestedMachine = parseNestedMachineFromObject(nestedEl);
        state.nested.push(nestedMachine);
      }
    }
  }
  return state;
}
function parseScriptElements(scripts) {
  const pulses = [];
  if (!scripts)
    return pulses;
  const scriptArray = Array.isArray(scripts) ? scripts : [scripts];
  for (const script of scriptArray) {
    if (!script)
      continue;
    const content = script["#text"] || script;
    if (content && typeof content === "string") {
      const fnMatch = content.match(/^([\w.]+)\(/);
      if (fnMatch) {
        pulses.push({ pulse: fnMatch[1] });
      }
    }
  }
  return pulses;
}
function parseParallelElementFromObject(element) {
  const machine = {
    states: {},
    parallel: {},
    context: {},
    initial: ""
  };
  if (element.initial) {
    const initialEl = Array.isArray(element.initial) ? element.initial[0] : element.initial;
    if (initialEl && initialEl.transition) {
      const trans = Array.isArray(initialEl.transition) ? initialEl.transition[0] : initialEl.transition;
      if (trans) {
        machine.initial = trans["@_target"] || "";
      }
    }
  }
  if (element.state) {
    const statesArray = Array.isArray(element.state) ? element.state : [element.state];
    for (const stateEl of statesArray) {
      if (stateEl && stateEl["@_id"]) {
        const state = parseStateElementFromObject(stateEl);
        if (state.name) {
          machine.states[state.name] = state;
        }
      }
    }
  }
  return machine;
}
function parseNestedMachineFromObject(element) {
  const machine = {
    states: {},
    parallel: {},
    context: {},
    initial: ""
  };
  if (element.initial) {
    const initialEl = Array.isArray(element.initial) ? element.initial[0] : element.initial;
    if (initialEl && initialEl.transition) {
      const trans = Array.isArray(initialEl.transition) ? initialEl.transition[0] : initialEl.transition;
      if (trans) {
        machine.initial = trans["@_target"] || "";
      }
    }
  }
  if (element.state) {
    const statesArray = Array.isArray(element.state) ? element.state : [element.state];
    for (const stateEl of statesArray) {
      if (stateEl && stateEl["@_id"]) {
        const state = parseStateElementFromObject(stateEl);
        if (state.name) {
          machine.states[state.name] = state;
        }
      }
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

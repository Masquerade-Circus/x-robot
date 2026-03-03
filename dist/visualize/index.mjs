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

// lib/visualize/index.ts
import { exec } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
var VISUALIZATION_LEVEL = {
  LOW: "low",
  HIGH: "high"
};
var toCammelCase = (str) => str.replace(/(^\w)/g, ($1) => $1.toUpperCase()).replace(/\s(.)/g, ($1) => $1.toUpperCase()).replace(/\W/g, "");
function getInnerPlantUmlCode(serializedMachine, options, parentName = "", childLevel = 0) {
  let plantUmlCode = "";
  let { level } = options;
  const isChild = childLevel > 0;
  const cammelCasedTitle = toCammelCase(`${parentName}${toCammelCase(serializedMachine.title || "")}`);
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
    const cammelCased = toCammelCase(stateName);
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
        let innerPlantUmlCode = getInnerPlantUmlCode(nested.machine, options, toCammelCase(stateNames[stateName]), childLevel + 1);
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
  const outDirPath = path.resolve(process.cwd(), options.outDir || "./");
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
export {
  VISUALIZATION_LEVEL,
  createPngFromMachine,
  createPngFromPlantUmlCode,
  createSvgFromMachine,
  createSvgFromPlantUmlCode,
  getPlantUmlCode,
  getPlantUmlCodeFromMachine
};

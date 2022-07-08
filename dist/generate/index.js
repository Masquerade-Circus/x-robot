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

// lib/generate/index.ts
var generate_exports = {};
__export(generate_exports, {
  Format: () => Format,
  generateFromSerializedMachine: () => generateFromSerializedMachine
});
module.exports = __toCommonJS(generate_exports);

// lib/utils.ts
function isValidString(str) {
  return str !== null && typeof str === "string" && str.trim().length > 0;
}
function isValidObject(obj) {
  return obj !== null && typeof obj === "object";
}

// lib/generate/index.ts
var Format = /* @__PURE__ */ ((Format2) => {
  Format2["ESM"] = "esm";
  Format2["CJS"] = "cjs";
  return Format2;
})(Format || {});
function getGuards(transition, guards = [], declaredGuards = [], producers = [], declaredProducers = []) {
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
      if (item.failure && typeof item.failure === "object" && item.failure.producer) {
        if (!producers.includes(item.failure.producer) && !declaredProducers.includes(item.failure.producer)) {
          producers.push(item.failure.producer);
          declaredProducers.push(item.failure.producer);
        }
        code += `, producer(${item.failure.producer})`;
      }
      code += `)`;
    }
  }
  return code;
}
function getCodeParts(serializedMachine, declaredActions = [], declaredProducers = [], declaredGuards = []) {
  let actions = [];
  let producers = [];
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
        if ("action" in runItem) {
          if (!actions.includes(runItem.action) && !declaredActions.includes(runItem.action)) {
            actions.push(runItem.action);
            declaredActions.push(runItem.action);
          }
          stateCode += `      action(${runItem.action}`;
          if (runItem.success) {
            if (typeof runItem.success === "object" && "producer" in runItem.success) {
              if (!producers.includes(runItem.success.producer) && !declaredProducers.includes(runItem.success.producer)) {
                producers.push(runItem.success.producer);
                declaredProducers.push(runItem.success.producer);
              }
              stateCode += `, producer(${runItem.success.producer}`;
              if (runItem.success.transition) {
                stateCode += `, "${runItem.success.transition}"`;
                implicitStateTransitions.push(runItem.success.transition);
              }
              stateCode += `)`;
            }
            if (typeof runItem.success === "string") {
              stateCode += `, "${runItem.success}"`;
              implicitStateTransitions.push(runItem.success);
            }
          }
          if (runItem.failure) {
            if (!runItem.success) {
              stateCode += ", null";
            }
            if (typeof runItem.failure === "object" && "producer" in runItem.failure) {
              if (!producers.includes(runItem.failure.producer) && !declaredProducers.includes(runItem.failure.producer)) {
                producers.push(runItem.failure.producer);
                declaredProducers.push(runItem.failure.producer);
              }
              stateCode += `, producer(${runItem.failure.producer}`;
              if (runItem.failure.transition) {
                stateCode += `, "${runItem.failure.transition}"`;
                implicitStateTransitions.push(runItem.failure.transition);
              }
              stateCode += `)`;
            }
            if (typeof runItem.failure === "string") {
              stateCode += `, "${runItem.failure}"`;
              implicitStateTransitions.push(runItem.failure);
            }
          }
          stateCode += `),
`;
        }
        if ("producer" in runItem) {
          if (!producers.includes(runItem.producer) && !declaredProducers.includes(runItem.producer)) {
            producers.push(runItem.producer);
            declaredProducers.push(runItem.producer);
          }
          stateCode += `      producer(${runItem.producer}),
`;
        }
      }
    }
    if (state.immediate) {
      for (let immediate of state.immediate) {
        stateCode += `      immediate("${immediate.immediate}"`;
        stateCode += getGuards({ target: immediate.immediate, guards: immediate.guards }, guards, declaredGuards, producers, declaredProducers);
        stateCode += `),
`;
      }
    }
    for (let transitionName in state.on) {
      let transition = state.on[transitionName];
      if (!implicitStateTransitions.includes(transition.target) || transition.guards) {
        if (!state.immediate || !state.immediate.find((immediate) => immediate.immediate === transition.target)) {
          stateCode += `      transition("${transitionName}", "${transition.target}"`;
          stateCode += getGuards(transition, guards, declaredGuards, producers, declaredProducers);
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
  return { actions, producers, guards, states };
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
        if (!imports.includes("transition") || !imports.includes("guards") || !imports.includes("producer")) {
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
              }
              if (!imports.includes("producer")) {
                for (let guard of transition.guards) {
                  if (isValidObject(guard.failure) && guard.failure.producer) {
                    addImport("producer", imports);
                    break;
                  }
                }
              }
            }
          }
        }
      }
      if (state.run && state.run.length > 0) {
        for (let runItem of state.run) {
          if ("action" in runItem) {
            addImport("action", imports);
            if (isValidString(runItem.success) || isValidString(runItem.failure)) {
              addImport("transition", imports);
            }
            if (isValidObject(runItem.success)) {
              addImport("producer", imports);
              if (isValidString(runItem.success.transition)) {
                addImport("transition", imports);
              }
            }
            if (isValidObject(runItem.failure)) {
              addImport("producer", imports);
              if (isValidString(runItem.failure.transition)) {
                addImport("transition", imports);
              }
            }
          }
          if ("producer" in runItem) {
            addImport("producer", imports);
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
function getMachineCode(serializedMachine, format, machines = /* @__PURE__ */ new Map(), declaredActions = [], declaredProducers = [], declaredGuards = []) {
  let code = "";
  for (let stateName in serializedMachine.states) {
    let state = serializedMachine.states[stateName];
    if (state.nested && state.nested.length > 0) {
      for (let nestedMachine of state.nested) {
        let { machineName: machineName2 } = getMachineName(nestedMachine.machine);
        if (!machines.has(machineName2)) {
          code += getMachineCode(nestedMachine.machine, format, machines, declaredActions, declaredProducers, declaredGuards);
        }
      }
    }
  }
  for (let parallelMachineId in serializedMachine.parallel) {
    let parallelMachine = serializedMachine.parallel[parallelMachineId];
    let { machineName: machineName2 } = getMachineName(parallelMachine);
    if (!machines.has(machineName2)) {
      code += getMachineCode(parallelMachine, format, machines, declaredActions, declaredProducers, declaredGuards);
    }
  }
  let { machineName, camelizedTitle } = getMachineName(serializedMachine);
  let { actions, producers, guards, states } = getCodeParts(serializedMachine, declaredActions, declaredProducers, declaredGuards);
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
  if (producers.length > 0) {
    let producerCode = `// Producers
`;
    for (let producer of producers) {
      producerCode += `const ${producer} = (context, payload) => {
  // TODO: Implement producer
  return {...context};
};
`;
    }
    code += `${producerCode}
`;
  }
  if (actions.length > 0) {
    let actionCode = `// Actions
`;
    for (let action of actions) {
      actionCode += `const ${action} = async (context, payload) => {
  // TODO: Implement action
};
`;
    }
    code += `${actionCode}
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
  } else {
    code += `
export default { ${Array.from(machines.keys()).join(", ")} };
`;
  }
  return code;
}

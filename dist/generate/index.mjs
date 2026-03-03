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
  Format2["TS"] = "ts";
  return Format2;
})(Format || {});
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
export {
  Format,
  generateFromSerializedMachine
};

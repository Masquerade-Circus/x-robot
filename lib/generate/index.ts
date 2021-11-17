import { SerializedImmediate, SerializedMachine, SerializedTransition } from '../serialize';
import { isValidObject, isValidString } from '../utils';

export enum Format {
  ESM = 'esm',
  CJS = 'cjs'
}

function getGuards(
  transition: SerializedTransition | SerializedImmediate,
  guards: string[] = [],
  declaredGuards: string[] = [],
  producers: string[] = [],
  declaredProducers: string[] = []
): string {
  let code = '';
  if (transition.guards) {
    // Add the guards to the list
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

      // Guards can have producers
      if (item.failure && typeof item.failure === 'object' && item.failure.producer) {
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

function getCodeParts(
  serializedMachine: SerializedMachine,
  declaredActions: string[] = [],
  declaredProducers: string[] = [],
  declaredGuards: string[] = []
): {
  actions: string[];
  producers: string[];
  guards: string[];
  states: Record<string, string>;
} {
  let actions: string[] = [];
  let producers: string[] = [];
  let guards: string[] = [];

  let states: { [key: string]: string } = {};

  for (let stateName in serializedMachine.states) {
    let state = serializedMachine.states[stateName];
    let stateCode = '';
    let implicitStateTransitions = [];

    // Check if we need to add the state type
    let stateTypeName = state.type === 'default' ? 'state' : `${state.type}State`;

    stateCode += `${stateTypeName}(\n      "${stateName}",\n`;

    // Check if we need to add the description
    if (isValidString(state.description)) {
      stateCode += `      description("${state.description}"),\n`;
    }

    // Check if we need to add nested machines
    if (state.nested && state.nested.length > 0) {
      for (let nestedMachine of state.nested) {
        let { machineName } = getMachineName(nestedMachine.machine);
        stateCode += `      nested(${machineName}`;
        // Nested machine can have a initial transition
        if (nestedMachine.transition) {
          stateCode += `, "${nestedMachine.transition}"`;
        }
        stateCode += '),\n';
      }
    }

    // Check if we need to add producers and actions
    if (state.run && state.run.length > 0) {
      // For each item in the run array, check if we need to add the producer or action
      for (let runItem of state.run) {
        if ('action' in runItem) {
          if (!actions.includes(runItem.action) && !declaredActions.includes(runItem.action)) {
            actions.push(runItem.action);
            declaredActions.push(runItem.action);
          }

          stateCode += `      action(${runItem.action}`;

          // Actions can have producers as well, so we need to check if we need to add them
          if (runItem.success) {
            // Success is a producer
            if (typeof runItem.success === 'object' && 'producer' in runItem.success) {
              if (!producers.includes(runItem.success.producer) && !declaredProducers.includes(runItem.success.producer)) {
                producers.push(runItem.success.producer);
                declaredProducers.push(runItem.success.producer);
              }

              stateCode += `, producer(${runItem.success.producer}`;

              // Success producer has transition
              if (runItem.success.transition) {
                stateCode += `, "${runItem.success.transition}"`;
                implicitStateTransitions.push(runItem.success.transition);
              }

              stateCode += `)`;
            }

            // Success is a transition
            if (typeof runItem.success === 'string') {
              stateCode += `, "${runItem.success}"`;
              implicitStateTransitions.push(runItem.success);
            }
          }

          if (runItem.failure) {
            if (!runItem.success) {
              stateCode += ', null';
            }

            // Failure is a producer
            if (typeof runItem.failure === 'object' && 'producer' in runItem.failure) {
              if (!producers.includes(runItem.failure.producer) && !declaredProducers.includes(runItem.failure.producer)) {
                producers.push(runItem.failure.producer);
                declaredProducers.push(runItem.failure.producer);
              }

              stateCode += `, producer(${runItem.failure.producer}`;

              // Failure producer has transition
              if (runItem.failure.transition) {
                stateCode += `, "${runItem.failure.transition}"`;
                implicitStateTransitions.push(runItem.failure.transition);
              }

              stateCode += `)`;
            }

            // Failure is a transition
            if (typeof runItem.failure === 'string') {
              stateCode += `, "${runItem.failure}"`;
              implicitStateTransitions.push(runItem.failure);
            }
          }

          stateCode += `),\n`;
        }

        if ('producer' in runItem) {
          if (!producers.includes(runItem.producer) && !declaredProducers.includes(runItem.producer)) {
            producers.push(runItem.producer);
            declaredProducers.push(runItem.producer);
          }

          stateCode += `      producer(${runItem.producer}),\n`;
        }
      }
    }

    // Add the immediate transitions
    if (state.immediate) {
      for (let immediate of state.immediate) {
        stateCode += `      immediate("${immediate.immediate}"`;
        stateCode += getGuards({ target: immediate.immediate, guards: immediate.guards }, guards, declaredGuards, producers, declaredProducers);
        stateCode += `),\n`;
      }
    }

    // Add the state transitions to the code
    for (let transitionName in state.on) {
      let transition = state.on[transitionName];

      if (!implicitStateTransitions.includes(transition.target) || transition.guards) {
        if (!state.immediate || !state.immediate.find((immediate) => immediate.immediate === transition.target)) {
          stateCode += `      transition("${transitionName}", "${transition.target}"`;
          stateCode += getGuards(transition, guards, declaredGuards, producers, declaredProducers);
          stateCode += `),\n`;
        }
      }
    }

    stateCode = stateCode.replace(/,\n$/, `\n`);
    stateCode += `    )`;

    states[stateName] = stateCode.replace(/\(\n\s+\)$/, '()');
  }

  return { actions, producers, guards, states };
}

function addImport(importName: string, imports: string[] = ['machine']) {
  if (!imports.includes(importName)) {
    imports.push(importName);
  }
}

function getImports(serializedMachine: SerializedMachine, imports: string[] = ['machine']) {
  if (Object.keys(serializedMachine.states).length > 0) {
    addImport('states', imports);
  }

  if (serializedMachine.initial) {
    addImport('initial', imports);
  }

  if (serializedMachine.context) {
    addImport('context', imports);
  }

  if (isValidObject(serializedMachine.states) && Object.keys(serializedMachine.states).length > 0) {
    addImport('states', imports);

    for (let stateName in serializedMachine.states) {
      let state = serializedMachine.states[stateName];

      // Check if we have nested machines
      if (state.nested && state.nested.length > 0) {
        addImport('nested', imports);

        for (let nestedMachine of state.nested) {
          getImports(nestedMachine.machine, imports);
        }
      }

      // Check if we need to import the state type
      let stateImport = state.type !== 'default' ? `${state.type}State` : 'state';
      addImport(stateImport, imports);

      // Check if we need to import the description
      if (isValidString(state.description)) {
        addImport('description', imports);
      }

      // Check if we need to import the immediate
      if (state.immediate) {
        addImport('immediate', imports);
      }

      if (isValidObject(state.on)) {
        // Transitions can have guards and guards can have producers
        if (!imports.includes('transition') || !imports.includes('guards') || !imports.includes('producer')) {
          for (let transitionName in state.on) {
            // Check if we need to import the transition
            if (!imports.includes('transition') && (!isValidString(state.immediate) || state.immediate !== transitionName)) {
              addImport('transition', imports);
            }

            // Check if we need to import the guards
            let transition = state.on[transitionName];
            if (transition.guards) {
              for (let item of transition.guards) {
                if (item.machine) {
                  addImport('nestedGuard', imports);
                } else {
                  addImport('guard', imports);
                }
              }

              // Guards can have producers
              if (!imports.includes('producer')) {
                for (let guard of transition.guards) {
                  if (isValidObject(guard.failure) && guard.failure.producer) {
                    addImport('producer', imports);
                    break;
                  }
                }
              }
            }
          }
        }
      }

      // Run items can be actions or producers
      // Actions can have transitions and producers, and producers can have transitions
      if (state.run && state.run.length > 0) {
        for (let runItem of state.run) {
          // Check if we need to import the action
          if ('action' in runItem) {
            addImport('action', imports);

            if (isValidString(runItem.success) || isValidString(runItem.failure)) {
              addImport('transition', imports);
            }

            if (isValidObject(runItem.success)) {
              addImport('producer', imports);
              if (isValidString(runItem.success.transition)) {
                addImport('transition', imports);
              }
            }

            if (isValidObject(runItem.failure)) {
              addImport('producer', imports);
              if (isValidString(runItem.failure.transition)) {
                addImport('transition', imports);
              }
            }
          }

          // Check if we need to import the producer
          if ('producer' in runItem) {
            addImport('producer', imports);
          }
        }
      }
    }
  }

  if (serializedMachine.parallel && Object.keys(serializedMachine.parallel).length > 0) {
    addImport('parallel', imports);
  }

  return imports;
}

const toCammelCase = (str: string) =>
  str
    .replace(/(^\w)/g, ($1) => $1.toUpperCase())
    .replace(/\s(.)/g, ($1) => $1.toUpperCase())
    .replace(/\W/g, '');

function getMachineName(serializedMachine: SerializedMachine) {
  let randomString = Math.random().toString(36).substring(2, 15);
  let camelizedTitle = toCammelCase(serializedMachine.title || randomString);
  let machineName = `${camelizedTitle}Machine`;

  return { machineName, camelizedTitle };
}

function getMachineCode(
  serializedMachine: SerializedMachine,
  format: Format,
  machines: Map<string, string> = new Map(),
  declaredActions: string[] = [],
  declaredProducers: string[] = [],
  declaredGuards: string[] = []
): string {
  let code = '';

  // For each nested machine, add the code first
  for (let stateName in serializedMachine.states) {
    let state = serializedMachine.states[stateName];
    if (state.nested && state.nested.length > 0) {
      for (let nestedMachine of state.nested) {
        let { machineName } = getMachineName(nestedMachine.machine);
        // We only want to add the machine if it hasn't been added yet
        if (!machines.has(machineName)) {
          code += getMachineCode(nestedMachine.machine, format, machines, declaredActions, declaredProducers, declaredGuards);
        }
      }
    }
  }

  // For each parallel machine, add the code first
  for (let parallelMachineId in serializedMachine.parallel) {
    let parallelMachine = serializedMachine.parallel[parallelMachineId];
    let { machineName } = getMachineName(parallelMachine);
    // We only want to add the machine if it hasn't been added yet
    if (!machines.has(machineName)) {
      code += getMachineCode(parallelMachine, format, machines, declaredActions, declaredProducers, declaredGuards);
    }
  }

  let { machineName, camelizedTitle } = getMachineName(serializedMachine);
  let { actions, producers, guards, states } = getCodeParts(serializedMachine, declaredActions, declaredProducers, declaredGuards);

  code += `\n/******************** ${machineName} Start ********************/\n\n`;

  // Context code
  code += `const get${camelizedTitle}Context = () => (${JSON.stringify(serializedMachine.context, null, 2)});\n\n`;

  // Guards
  if (guards.length > 0) {
    let guardCode = `// Guards\n`;
    for (let guard of guards) {
      guardCode += `const ${guard} = (context, payload) => {\n  // TODO: Implement guard\n  return true;\n};\n`;
    }
    code += `${guardCode}\n`;
  }

  // Producers
  if (producers.length > 0) {
    let producerCode = `// Producers\n`;
    for (let producer of producers) {
      producerCode += `const ${producer} = (context, payload) => {\n  // TODO: Implement producer\n  return {...context};\n};\n`;
    }
    code += `${producerCode}\n`;
  }

  // Actions
  if (actions.length > 0) {
    let actionCode = `// Actions\n`;
    for (let action of actions) {
      actionCode += `const ${action} = async (context, payload) => {\n  // TODO: Implement action\n};\n`;
    }
    code += `${actionCode}\n`;
  }

  // Add export declaration for esm
  if (format === Format.ESM) {
    code += `export `;
  }

  // Machine declaration and initial state
  code += `const ${machineName} = machine(
  "${serializedMachine.title ? serializedMachine.title : ''}",`;
  if (Object.keys(states).length > 0) {
    code += `
  states(\n`;
    // States
    for (let stateName in states) {
      code += `    ${states[stateName]},\n`;
    }
    code = code.replace(/,\n$/, `\n`);
    code += `  ),\n`;
  }

  // Parallel machines
  if (Object.keys(serializedMachine.parallel).length > 0) {
    code += `  parallel(\n`;
    for (let parallelMachineId in serializedMachine.parallel) {
      let parallelMachine = serializedMachine.parallel[parallelMachineId];
      let { machineName } = getMachineName(parallelMachine);
      code += `    ${machineName},\n`;
    }
    code = code.replace(/,\n$/, `\n`);
    code += `  ),\n`;
  }

  // Initial context
  code += `  context(get${camelizedTitle}Context),\n`;

  // Initial state
  code += `  initial("${serializedMachine.initial}")\n);\n\n`;

  // Add machine to map
  machines.set(machineName, code);

  code += `/******************** ${machineName} End ********************/\n`;

  return code;
}

export function generateFromSerializedMachine(serializedMachine: SerializedMachine, format: Format): string {
  let code = '';

  let imports = getImports(serializedMachine);

  // Import statements
  let importCode = '';
  let importItems = imports.join(', ');
  if (format === Format.CJS) {
    importCode += `const { ${importItems} } = require("x-robot");\n`;
  } else {
    importCode += `import { ${importItems} } from "x-robot";\n`;
  }

  code += importCode;

  let machines = new Map();

  let machineCode = getMachineCode(serializedMachine, format, machines);

  code += machineCode;

  if (format === Format.CJS) {
    code += `\nmodule.exports = { ${Array.from(machines.keys()).join(', ')} };\n`;
  } else {
    code += `\nexport default { ${Array.from(machines.keys()).join(', ')} };\n`;
  }

  return code;
}

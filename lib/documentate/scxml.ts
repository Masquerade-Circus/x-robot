/**
 * @module x-robot/documentate/scxml
 * @description SCXML import/export functionality
 * */
import { XMLParser } from "fast-xml-parser";
import {
  SerializedGuard,
  SerializedMachine,
  SerializedNestedMachine,
  SerializedPulse,
  SerializedState,
  SerializedStates,
} from "./types";

export function toSCXML(machine: SerializedMachine): string {
  let xml = "";

  // XML declaration and root element
  const initial = machine.initial || Object.keys(machine.states)[0] || "";
  const name = machine.title || "Machine";

  xml += `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0" initial="${initial}" name="${name}">\n`;

  // Generate parallel states first
  for (const [parallelName, parallelMachine] of Object.entries(machine.parallel)) {
    xml += `  <parallel id="${parallelMachine.title || parallelName}">\n`;
    xml += generateStates(parallelMachine.states, "    ");
    xml += `  </parallel>\n`;
  }

  // Generate regular states
  xml += generateStates(machine.states, "  ");

  // Close root element
  xml += "</scxml>";

  return xml;
}

function generateStates(states: SerializedStates, indent: string): string {
  let xml = "";

  for (const [stateName, state] of Object.entries(states)) {
    xml += generateState(stateName, state, indent);
  }

  return xml;
}

function generateState(stateName: string, state: SerializedState, indent: string): string {
  let xml = "";

  // Check if this is a final state (no transitions)
  const isFinal = !state.on || Object.keys(state.on).length === 0;

  if (isFinal && !state.nested) {
    xml += `${indent}<final id="${stateName}"/>\n`;
  } else {
    xml += `${indent}<state id="${stateName}">\n`;

    // Description (datamodel)
    if (state.description) {
      xml += `${indent}  <datamodel>\n`;
      xml += `${indent}    <data id="description">${state.description}</data>\n`;
      xml += `${indent}  </datamodel>\n`;
    }

    // Entry actions (onentry)
    if (state.run && state.run.length > 0) {
      xml += `${indent}  <onentry>\n`;
      for (const pulse of state.run) {
        xml += `${indent}    <script>${pulse.pulse}()</script>\n`;
      }
      xml += `${indent}  </onentry>\n`;
    }

    // Nested states
    if (state.nested && state.nested.length > 0) {
      for (const nested of state.nested) {
        xml += generateNestedMachine(nested, indent + "  ");
      }
    }

    // Transitions
    if (state.on) {
      for (const [event, transition] of Object.entries(state.on)) {
        xml += generateTransition(event, transition, indent + "  ");
      }
    }

    // Immediate transitions
    if (state.immediate) {
      for (const immediate of state.immediate) {
        xml += generateImmediateTransition(immediate, indent + "  ");
      }
    }

    xml += `${indent}</state>\n`;
  }

  return xml;
}

function generateTransition(
  event: string,
  transition: { target?: string; guards?: SerializedGuard[]; exit?: SerializedPulse[] },
  indent: string
): string {
  let xml = `${indent}<transition event="${event}"`;

  if (transition.target) {
    xml += ` target="${transition.target}"`;
  }

  if (transition.guards && transition.guards.length > 0) {
    const conditions = transition.guards.map((g) => g.guard).join(" && ");
    xml += ` cond="${conditions}"`;
  }

  // Exit actions
  if (transition.exit && transition.exit.length > 0) {
    xml += ">\n";
    xml += `${indent}  <onexit>\n`;
    for (const pulse of transition.exit) {
      xml += `${indent}    <script>${pulse.pulse}()</script>\n`;
    }
    xml += `${indent}  </onexit>\n`;
    xml += `${indent}</transition>\n`;
  } else {
    xml += "/>\n";
  }
  return xml;
}

function generateImmediateTransition(
  immediate: { immediate?: string; guards?: SerializedGuard[] },
  indent: string
): string {
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

function generateNestedMachine(nested: SerializedNestedMachine, indent: string): string {
  let xml = "";

  const machineTitle = nested.machine.title || "nested";
  const initial = nested.machine.initial || Object.keys(nested.machine.states)[0] || "";

  xml += `${indent}<state id="${machineTitle}">\n`;
  xml += `${indent}  <initial id="${initial}">\n`;
  xml += `${indent}    <transition target="${initial}"/>\n`;
  xml += `${indent}  </initial>\n`;

  // Generate states from the nested machine
  xml += generateStates(nested.machine.states, indent + "  ");

  // Handle nested machine's parallel states
  for (const [parallelName, parallelMachine] of Object.entries(nested.machine.parallel)) {
    xml += `${indent}  <parallel id="${parallelMachine.title || parallelName}">\n`;
    xml += generateStates(parallelMachine.states, indent + "    ");
    xml += `${indent}  </parallel>\n`;
  }

  xml += `${indent}</state>\n`;

  return xml;
}

export function fromSCXML(scxmlString: string): SerializedMachine {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    preserveOrder: false,
    parseAttributeValue: false,
    parseTagValue: false
  });
  
  const result = parser.parse(scxmlString);
  
  // Extraer el elemento raíz (puede ser con namespace o sin él)
  const root = result.scxml || result;
  
  if (!root || (!root['@_xmlns'] && !root['@_version'] && !root['@_initial'] && !root['@_name'])) {
    throw new Error("Invalid SCXML document: root element must be <scxml>");
  }
  
  const machine: SerializedMachine = {
    title: root['@_name'] || undefined,
    initial: root['@_initial'] || "",
    states: {},
    parallel: {},
    context: {},
  };
  
  // Procesar hijos del root (states y parallel)
  // Puede venir como array, objeto, o undefined
  const rootKeys = Object.keys(root).filter(k => !k.startsWith('@_'));
  const childStates = root.state;
  const childParallel = root.parallel;
  
  // Procesar states regulares
  if (childStates) {
    const statesArray = Array.isArray(childStates) ? childStates : [childStates];
    for (const stateEl of statesArray) {
      if (stateEl && stateEl['@_id']) {
        const state = parseStateElementFromObject(stateEl);
        if (state.name) {
          machine.states[state.name] = state;
        }
      }
    }
  }
  
  // Procesar parallel states
  if (childParallel) {
    const parallelArray = Array.isArray(childParallel) ? childParallel : [childParallel];
    for (const parallelEl of parallelArray) {
      if (parallelEl && parallelEl['@_id']) {
        machine.parallel[parallelEl['@_id']] = parseParallelElementFromObject(parallelEl);
      }
    }
  }
  
  return machine;
}

function parseStateElementFromObject(stateEl: any): SerializedState {
  const state: SerializedState = {
    name: stateEl['@_id'] || "",
  };
  
  // Parse datamodel (description)
  if (stateEl.datamodel && stateEl.datamodel.data) {
    const data = Array.isArray(stateEl.datamodel.data) 
      ? stateEl.datamodel.data[0] 
      : stateEl.datamodel.data;
    state.description = data['#text'] || data;
  }
  
  // Parse onentry
  if (stateEl.onentry && stateEl.onentry.script) {
    state.run = parseScriptElements(stateEl.onentry.script);
  }
  
  // Parse transitions
  const transitions = stateEl.transition;
  if (transitions) {
    state.on = {};
    const transArray = Array.isArray(transitions) ? transitions : [transitions];
    
    for (const trans of transArray) {
      if (!trans) continue;
      
      const event = trans['@_event'];
      const target = trans['@_target'];
      const cond = trans['@_cond'];
      const type = trans['@_type'];
      
      // Immediate transitions (type="internal") - can have no event
      if (type === "internal" && target) {
        if (!state.immediate) state.immediate = [];
        state.immediate.push({
          immediate: target,
          guards: cond ? [{ guard: cond }] : undefined,
        });
        continue;
      }
      
      if (!event) continue;
      
      
      const transitionObj: any = {
        target: target || "",
      };
      
      if (cond) {
        transitionObj.guards = [{ guard: cond }];
      }
      
      // Parse onexit inside transition
      if (trans.onexit && trans.onexit.script) {
        transitionObj.exit = parseScriptElements(trans.onexit.script);
      }
      
      state.on[event] = transitionObj;
    }
  }
  
  // Parse nested states (child state elements)
  const nestedStates = stateEl.state;
  if (nestedStates) {
    const nestedArray = Array.isArray(nestedStates) ? nestedStates : [nestedStates];
    const validNested = nestedArray.filter((n: any) => n && n['@_id']);
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

function parseScriptElements(scripts: any): SerializedPulse[] {
  const pulses: SerializedPulse[] = [];
  if (!scripts) return pulses;
  
  const scriptArray = Array.isArray(scripts) ? scripts : [scripts];
  
  for (const script of scriptArray) {
    if (!script) continue;
    const content = script['#text'] || script;
    if (content && typeof content === 'string') {
      const fnMatch = content.match(/^([\w.]+)\(/);
      if (fnMatch) {
        pulses.push({ pulse: fnMatch[1] });
      }
    }
  }
  
  return pulses;
}

function parseParallelElementFromObject(element: any): SerializedMachine {
  const machine: SerializedMachine = {
    states: {},
    parallel: {},
    context: {},
    initial: "",
  };
  
  // Get initial from <initial> child
  if (element.initial) {
    const initialEl = Array.isArray(element.initial) 
      ? element.initial[0] 
      : element.initial;
    if (initialEl && initialEl.transition) {
      const trans = Array.isArray(initialEl.transition) 
        ? initialEl.transition[0] 
        : initialEl.transition;
      if (trans) {
        machine.initial = trans['@_target'] || "";
      }
    }
  }
  
  // Parse child states
  if (element.state) {
    const statesArray = Array.isArray(element.state) ? element.state : [element.state];
    for (const stateEl of statesArray) {
      if (stateEl && stateEl['@_id']) {
        const state = parseStateElementFromObject(stateEl);
        if (state.name) {
          machine.states[state.name] = state;
        }
      }
    }
  }
  
  return machine;
}

function parseNestedMachineFromObject(element: any): SerializedNestedMachine {
  const machine: SerializedMachine = {
    states: {},
    parallel: {},
    context: {},
    initial: "",
  };
  
  // Get initial
  if (element.initial) {
    const initialEl = Array.isArray(element.initial) 
      ? element.initial[0] 
      : element.initial;
    if (initialEl && initialEl.transition) {
      const trans = Array.isArray(initialEl.transition) 
        ? initialEl.transition[0] 
        : initialEl.transition;
      if (trans) {
        machine.initial = trans['@_target'] || "";
      }
    }
  }
  
  // Parse states
  if (element.state) {
    const statesArray = Array.isArray(element.state) ? element.state : [element.state];
    for (const stateEl of statesArray) {
      if (stateEl && stateEl['@_id']) {
        const state = parseStateElementFromObject(stateEl);
        if (state.name) {
          machine.states[state.name] = state;
        }
      }
    }
  }
  
  return {
    machine,
    transition: machine.initial,
  };
}

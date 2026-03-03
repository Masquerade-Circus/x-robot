/**
 * @module x-robot/scxml
 * @description SCXML import/export functionality
 * */
import { DOMParser } from "@xmldom/xmldom";
import {
  SerializedGuard,
  SerializedMachine,
  SerializedNestedMachine,
  SerializedPulse,
  SerializedState,
  SerializedStates,
} from "../serialize";

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
  const parser = new DOMParser();
  const doc = parser.parseFromString(scxmlString, "text/xml");

  const root = doc.documentElement;

  if (root.tagName !== "scxml") {
    throw new Error("Invalid SCXML document: root element must be <scxml>");
  }

  const machine: SerializedMachine = {
    title: root.getAttribute("name") || undefined,
    initial: root.getAttribute("initial") || "",
    states: {},
    parallel: {},
    context: {},
  };

  const children = Array.from(root.childNodes);

  for (const child of children) {
    if (child.nodeType !== 1) continue;

    const element = child as Element;
    const tagName = element.tagName;

    if (tagName === "state") {
      const state = parseStateElement(element);
      if (state.name) {
        machine.states[state.name] = state;
      }
    } else if (tagName === "parallel") {
      const parallelMachine = parseParallelElement(element);
      const id = element.getAttribute("id");
      if (id) {
        machine.parallel[id] = parallelMachine;
      }
    }
  }

  return machine;
}

function parseStateElement(element: Element): SerializedState {
  const state: SerializedState = {
    name: element.getAttribute("id") || "",
  };

  // Parse <datamodel> for description
  const datamodel = element.getElementsByTagName("datamodel")[0];
  if (datamodel) {
    const data = datamodel.getElementsByTagName("data")[0];
    if (data) {
      state.description = data.textContent || undefined;
    }
  }

  // Parse <onentry>
  const onentry = element.getElementsByTagName("onentry")[0];
  if (onentry) {
    state.run = parsePulseElements(onentry);
  }

  // Parse transitions
  const transitions = element.getElementsByTagName("transition");
  if (transitions.length > 0) {
    state.on = {};

    for (const trans of Array.from(transitions)) {
      const event = trans.getAttribute("event");
      const target = trans.getAttribute("target");
      const cond = trans.getAttribute("cond");
      const type = trans.getAttribute("type");

      // Handle immediate transitions (type="internal")
      if (type === "internal" && target) {
        if (!state.immediate) state.immediate = [];
        state.immediate.push({
          immediate: target,
          guards: cond ? [{ guard: cond }] : undefined,
        });
        continue;
      }

      if (event) {
        const transitionObj: any = {
          target: target || "",
        };

        if (cond) {
          transitionObj.guards = [{ guard: cond }];
        }

        // Parse <onexit> inside transition
        const onexit = trans.getElementsByTagName("onexit")[0];
        if (onexit) {
          transitionObj.exit = parsePulseElements(onexit);
        }

        state.on[event] = transitionObj;
      }
    }
  }

  // Parse nested states (direct child <state> elements)
  const elementChildNodes = Array.from(element.childNodes);
  const directChildStates = elementChildNodes.filter(
    (c): c is Element => c.nodeType === 1 && (c as Element).tagName === "state"
  );

  if (directChildStates.length > 0) {
    state.nested = [];

    for (const nestedEl of directChildStates) {
      const nestedMachine = parseNestedMachine(nestedEl);
      state.nested.push(nestedMachine);
    }
  }

  return state;
}

function parsePulseElements(parentElement: Element): SerializedPulse[] {
  const pulses: SerializedPulse[] = [];
  const childNodes = Array.from(parentElement.childNodes);

  for (const child of childNodes) {
    if (child.nodeType !== 1) continue;
    const element = child as Element;
    if (element.tagName === "script") {
      const content = element.textContent || "";
      const fnMatch = content.match(/^([\w.]+)\(/);
      if (fnMatch) {
        pulses.push({ pulse: fnMatch[1] });
      }
    }
  }

  return pulses;
}

function parseParallelElement(element: Element): SerializedMachine {
  const machine: SerializedMachine = {
    states: {},
    parallel: {},
    context: {},
    initial: "",
  };

  // Get initial from <initial> child
  const initialEl = element.getElementsByTagName("initial")[0];
  if (initialEl) {
    const initialTrans = initialEl.getElementsByTagName("transition")[0];
    if (initialTrans) {
      machine.initial = initialTrans.getAttribute("target") || "";
    }
  }

  // Parse child states (direct children only)
  const elementChildNodes = Array.from(element.childNodes);
  const directChildStates = elementChildNodes.filter(
    (c): c is Element => c.nodeType === 1 && (c as Element).tagName === "state"
  );

  for (const stateEl of directChildStates) {
    const state = parseStateElement(stateEl);
    if (state.name) {
      machine.states[state.name] = state;
    }
  }

  return machine;
}

function parseNestedMachine(element: Element): SerializedNestedMachine {
  const machine: SerializedMachine = {
    states: {},
    parallel: {},
    context: {},
    initial: "",
  };

  // Get initial
  const initialEl = element.getElementsByTagName("initial")[0];
  if (initialEl) {
    const initialTrans = initialEl.getElementsByTagName("transition")[0];
    if (initialTrans) {
      machine.initial = initialTrans.getAttribute("target") || "";
    }
  }

  // Parse states (direct children only)
  const elementChildNodes = Array.from(element.childNodes);
  const directChildStates = elementChildNodes.filter(
    (c): c is Element => c.nodeType === 1 && (c as Element).tagName === "state"
  );

  for (const stateEl of directChildStates) {
    const state = parseStateElement(stateEl);
    if (state.name) {
      machine.states[state.name] = state;
    }
  }

  return {
    machine,
    transition: machine.initial,
  };
}

/**
 * @module x-robot/documentate/scxml
 * @description SCXML import/export functionality
 * */
import { parseScxml, domToScxml, Element, Text, Document } from "../utils/tree-adapter";
import {
  SerializedGuard,
  SerializedMachine,
  SerializedNestedMachine,
  SerializedPulse,
  SerializedState,
  SerializedStates,
} from "./types";

export function toSCXML(machine: SerializedMachine): string {
  const doc = new Document();

  // Root scxml element
  const initial = machine.initial || Object.keys(machine.states)[0] || "";
  const name = machine.title || "Machine";

  const scxml = doc.createElement("scxml");
  scxml.setAttribute("xmlns", "http://www.w3.org/2005/07/scxml");
  scxml.setAttribute("version", "1.0");
  scxml.setAttribute("initial", initial);
  scxml.setAttribute("name", name);

  // Generate parallel states first
  for (const [parallelName, parallelMachine] of Object.entries(machine.parallel)) {
    const parallel = doc.createElement("parallel");
    parallel.setAttribute("id", parallelMachine.title || parallelName);
    generateStatesElement(parallelMachine.states, parallel, doc);
    scxml.appendChild(parallel);
  }

  // Generate regular states
  generateStatesElement(machine.states, scxml, doc);

  // Build XML string
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += domToScxml(scxml);

  return xml;
}

function generateStatesElement(states: SerializedStates, parent: Element, doc: Document): void {
  for (const [stateName, state] of Object.entries(states)) {
    const stateEl = generateStateElement(stateName, state, doc);
    parent.appendChild(stateEl);
  }
}

function generateStateElement(stateName: string, state: SerializedState, doc: Document): Element {
  const isFinal = !state.on || Object.keys(state.on).length === 0;

  let stateEl: Element;
  if (isFinal && !state.nested) {
    stateEl = doc.createElement("final");
    stateEl.setAttribute("id", stateName);
    return stateEl;
  }

  stateEl = doc.createElement("state");
  stateEl.setAttribute("id", stateName);

  // Description (datamodel)
  if (state.description) {
    const datamodel = doc.createElement("datamodel");
    const data = doc.createElement("data");
    data.setAttribute("id", "description");
    data.appendChild(doc.createTextNode(state.description));
    datamodel.appendChild(data);
    stateEl.appendChild(datamodel);
  }

  // Entry pulses (onentry)
  if (state.run && state.run.length > 0) {
    const onentry = doc.createElement("onentry");
    for (const pulse of state.run) {
      const script = doc.createElement("script");
      script.appendChild(doc.createTextNode(pulse.pulse + "()"));
      onentry.appendChild(script);
    }
    stateEl.appendChild(onentry);
  }

  // Nested states
  if (state.nested && state.nested.length > 0) {
    for (const nested of state.nested) {
      const nestedEl = generateNestedMachineElement(nested, doc);
      stateEl.appendChild(nestedEl);
    }
  }

  // Transitions
  if (state.on) {
    for (const [event, transition] of Object.entries(state.on)) {
      const transEl = generateTransitionElement(event, transition, doc);
      stateEl.appendChild(transEl);
    }
  }

  // Immediate transitions
  if (state.immediate) {
    for (const immediate of state.immediate) {
      const transEl = generateImmediateTransitionElement(immediate, doc);
      stateEl.appendChild(transEl);
    }
  }

  return stateEl;
}

function generateTransitionElement(
  event: string,
  transition: { target?: string; guards?: SerializedGuard[]; exit?: SerializedPulse[] },
  doc: Document
): Element {
  const transEl = doc.createElement("transition");
  transEl.setAttribute("event", event);

  if (transition.target) {
    transEl.setAttribute("target", transition.target);
  }

  if (transition.guards && transition.guards.length > 0) {
    const conditions = transition.guards.map((g) => g.guard).join(" && ");
    transEl.setAttribute("cond", conditions);
  }

  // Exit pulses
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

function generateImmediateTransitionElement(
  immediate: { immediate?: string; guards?: SerializedGuard[] },
  doc: Document
): Element {
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

function generateNestedMachineElement(nested: SerializedNestedMachine, doc: Document): Element {
  const machineTitle = nested.machine.title || "nested";
  const initial = nested.machine.initial || Object.keys(nested.machine.states)[0] || "";

  const stateEl = doc.createElement("state");
  stateEl.setAttribute("id", machineTitle);

  // Initial element
  const initialEl = doc.createElement("initial");
  initialEl.setAttribute("id", initial);
  const initialTrans = doc.createElement("transition");
  initialTrans.setAttribute("target", initial);
  initialEl.appendChild(initialTrans);
  stateEl.appendChild(initialEl);

  // Generate states from the nested machine
  generateStatesElement(nested.machine.states, stateEl, doc);

  // Handle nested machine's parallel states
  for (const [parallelName, parallelMachine] of Object.entries(nested.machine.parallel)) {
    const parallel = doc.createElement("parallel");
    parallel.setAttribute("id", parallelMachine.title || parallelName);
    generateStatesElement(parallelMachine.states, parallel, doc);
    stateEl.appendChild(parallel);
  }

  return stateEl;
}

export function fromSCXML(scxmlString: string): SerializedMachine {
  // Parse using tree-adapter instead of fast-xml-parser
  const root = parseScxml(scxmlString);

  // Validate root element is scxml
  if (root.nodeName.toLowerCase() !== "scxml") {
    throw new Error("Invalid SCXML document: root element must be <scxml>");
  }

  const machine: SerializedMachine = {
    title: root.getAttribute("name") || undefined,
    initial: root.getAttribute("initial") || "",
    states: {},
    parallel: {},
    context: {},
  };

  // Process child elements (states and parallel)
  for (const child of root.childNodes) {
    if (child.nodeType !== 1) continue;

    const el = child as Element;
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

function parseStateElement(el: Element): SerializedState {
  const state: SerializedState = {
    name: el.getAttribute("id") || "",
  };

  // Parse datamodel (description)
  const datamodel = el.childNodes.find(c => c.nodeType === 1 && (c as Element).nodeName.toLowerCase() === "datamodel") as Element | undefined;
  if (datamodel) {
    const data = datamodel.childNodes.find(c => c.nodeType === 1 && (c as Element).nodeName.toLowerCase() === "data") as Element | undefined;
    if (data) {
      const textNode = data.childNodes.find(c => c.nodeType === 3) as Text | undefined;
      if (textNode) {
        state.description = textNode.textContent || textNode.nodeValue;
      }
    }
  }

  // Parse onentry
  const onentry = el.childNodes.find(c => c.nodeType === 1 && (c as Element).nodeName.toLowerCase() === "onentry") as Element | undefined;
  if (onentry) {
    state.run = parseScriptElements(onentry);
  }

  // Parse transitions
  const transitions = el.childNodes.filter(c => c.nodeType === 1 && (c as Element).nodeName.toLowerCase() === "transition") as Element[];
  if (transitions.length > 0) {
    state.on = {};

    for (const transEl of transitions) {
      const event = transEl.getAttribute("event");
      const target = transEl.getAttribute("target");
      const cond = transEl.getAttribute("cond");
      const type = transEl.getAttribute("type");

      // Immediate transitions (type="internal")
      if (type === "internal" && target) {
        if (!state.immediate) state.immediate = [];
        state.immediate.push({
          immediate: target,
          guards: cond ? [{ guard: cond }] : undefined,
        });
        continue;
      }

      if (!event) continue;

      const transitionObj: any = { target: target || "" };

      if (cond) {
        transitionObj.guards = [{ guard: cond }];
      }

      // Parse onexit inside transition
      const onexit = transEl.childNodes.find(c => c.nodeType === 1 && (c as Element).nodeName.toLowerCase() === "onexit") as Element | undefined;
      if (onexit) {
        transitionObj.exit = parseScriptElements(onexit);
      }

      state.on[event] = transitionObj;
    }
  }

  // Parse nested states
  const nestedStates = el.childNodes.filter(c => c.nodeType === 1 && (c as Element).nodeName.toLowerCase() === "state") as Element[];
  if (nestedStates.length > 0) {
    state.nested = [];
    for (const nestedEl of nestedStates) {
      const nestedMachine = parseNestedMachineFromElement(nestedEl);
      state.nested.push(nestedMachine);
    }
  }

  return state;
}

function parseScriptElements(parentEl: Element): SerializedPulse[] {
  const pulses: SerializedPulse[] = [];

  const scripts = parentEl.childNodes.filter(c => c.nodeType === 1 && (c as Element).nodeName.toLowerCase() === "script") as Element[];

  for (const script of scripts) {
    const textNode = script.childNodes.find(c => c.nodeType === 3) as Text | undefined;
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

function parseParallelElement(el: Element): SerializedMachine {
  const machine: SerializedMachine = {
    states: {},
    parallel: {},
    context: {},
    initial: "",
  };

  // Get initial from <initial> child
  const initialEl = el.childNodes.find(c => c.nodeType === 1 && (c as Element).nodeName.toLowerCase() === "initial") as Element | undefined;
  if (initialEl) {
    const transEl = initialEl.childNodes.find(c => c.nodeType === 1 && (c as Element).nodeName.toLowerCase() === "transition") as Element | undefined;
    if (transEl) {
      machine.initial = transEl.getAttribute("target") || "";
    }
  }

  // Parse child states
  const stateElements = el.childNodes.filter(c => c.nodeType === 1 && (c as Element).nodeName.toLowerCase() === "state") as Element[];
  for (const stateEl of stateElements) {
    const state = parseStateElement(stateEl);
    if (state.name) {
      machine.states[state.name] = state;
    }
  }

  return machine;
}

function parseNestedMachineFromElement(el: Element): SerializedNestedMachine {
  const machine: SerializedMachine = {
    states: {},
    parallel: {},
    context: {},
    initial: "",
  };

  // Get initial
  const initialEl = el.childNodes.find(c => c.nodeType === 1 && (c as Element).nodeName.toLowerCase() === "initial") as Element | undefined;
  if (initialEl) {
    const transEl = initialEl.childNodes.find(c => c.nodeType === 1 && (c as Element).nodeName.toLowerCase() === "transition") as Element | undefined;
    if (transEl) {
      machine.initial = transEl.getAttribute("target") || "";
    }
  }

  // Parse states
  const stateElements = el.childNodes.filter(c => c.nodeType === 1 && (c as Element).nodeName.toLowerCase() === "state") as Element[];
  for (const stateEl of stateElements) {
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

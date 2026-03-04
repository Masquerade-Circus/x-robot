/**
 * @module x-robot/documentate/serialize
 * @description Serializes a machine to a JSON object
 * */

import {
  Machine,
  PulseDirective,
  NestedMachineDirective,
  GuardDirective,
  NestedGuardDirective,
  RunCollection,
  GuardsDirective,
  TransitionDirective,
  ImmediateDirective,
  TransitionsDirective,
} from "../machine/interfaces";
import { deepCloneUnfreeze, isEntry, isValidString } from "../utils";
import {
  SerializedPulse,
  SerializedGuard,
  SerializedCollection,
  SerializedTransition,
  SerializedTransitions,
  SerializedImmediate,
  SerializedState,
  SerializedStates,
  SerializedMachine,
  SerializedNestedMachine,
} from "./types";

/**
 *
 * @param pulse The pulse to serialize
 * @returns SerializedPulse
 */
function serializePulse(pulse: PulseDirective): SerializedPulse {
  // Handle case where pulse is an empty function (from exitPulse string conversion)
  const pulseFn = pulse.pulse as Function;
  const serialized: SerializedPulse = {
    pulse: pulseFn.name || "anonymous",
    isAsync: pulseFn.constructor.name === "AsyncFunction",
  };

  if (isValidString(pulse.success)) {
    serialized.success = pulse.success;
  }

  if (isValidString(pulse.failure)) {
    serialized.failure = pulse.failure;
  }

  return serialized;
}

/**
 *
 * @param guard The guard to serialize
 * @returns SerializedGuard
 */
function serializeGuard(guard: GuardDirective | NestedGuardDirective): SerializedGuard {
  let serialized: SerializedGuard = {
    guard: guard.guard.name,
  };

  if (isValidString(guard.failure)) {
    serialized.failure = guard.failure;
  }

  if ("machine" in guard) {
    serialized.machine = serialize(guard.machine);
  }

  return serialized;
}

/**
 *
 * @param run The run collection to serialize
 * @returns SerializedCollection or null if empty
 */
function serializeRunArguments(run: RunCollection): SerializedCollection | null {
  if (!Array.isArray(run) || run.length === 0) {
    return null;
  }

  return run.map((item) => {
    if (isEntry(item)) {
      return serializePulse(item);
    }
  }) as SerializedCollection;
}

/**
 *
 * @param guards The guards to serialize
 * @returns SerializedGuard[] or null if empty
 */
function serializeGuards(guards: GuardsDirective): SerializedGuard[] | null {
  if (!guards || guards.length === 0) {
    return null;
  }

  return guards.map((guard) => serializeGuard(guard));
}

/**
 *
 * @param transition The transition to serialize
 * @returns SerializedTransition
 */
function serializeTransition(transition: TransitionDirective): SerializedTransition {
  let serialized: SerializedTransition = {
    target: transition.target,
  };

  let guards = serializeGuards(transition.guards);

  if (guards) {
    serialized.guards = guards;
  }

  if (transition.exit) {
    const exitArray = Array.isArray(transition.exit)
      ? transition.exit
      : [transition.exit];
    serialized.exit = exitArray.map(pulse => serializePulse(pulse));
  }

  return serialized;
}

/**
 *
 * @param immediate The immediate transition to serialize
 * @returns SerializedImmediate
 */
function serializeImmediate(immediate: ImmediateDirective): SerializedImmediate {
  let serialized: SerializedImmediate = {
    immediate: immediate.immediate,
  };

  let guards = serializeGuards(immediate.guards);

  if (guards) {
    serialized.guards = guards;
  }

  return serialized;
}

/**
 *
 * @param events The events to serialize
 * @returns SerializedTransitions or null if empty
 */
function serializeTransitions(events: TransitionsDirective): SerializedTransitions | null {
  if (!events || Object.keys(events).length === 0) {
    return null;
  }

  let serialized: SerializedTransitions = {};
  for (let event in events) {
    serialized[event] = serializeTransition(events[event]);
  }

  return serialized;
}

/**
 *
 * @param context The context to serialize
 * @returns Object
 */
function serializeContext(context: any) {
  return deepCloneUnfreeze(context);
}

/**
 *
 * @param nested The nested machines to serialize
 * @returns SerializedNestedMachine[] or null if empty
 */
function serializeNested(nested: NestedMachineDirective[]): SerializedNestedMachine[] | null {
  if (!nested || nested.length === 0) {
    return null;
  }

  return nested.map(({ machine, transition }) => {
    let serializedNestedMachine: SerializedNestedMachine = {
      machine: serialize(machine),
    };

    if (transition) {
      serializedNestedMachine.transition = transition;
    }

    return serializedNestedMachine;
  });
}

/**
 *
 * @param machine The machine to serialize
 * @returns SerializedMachine
 * @category Serialization
 */
export function serialize(machine: Machine): SerializedMachine {
  let serialized: SerializedMachine = {
    states: {},
    parallel: {},
    context: serializeContext(machine.context),
    initial: machine.initial,
  };

  if (machine.title) {
    serialized.title = machine.title;
  }

  for (let state in machine.states) {
    serialized.states[state] = {} as SerializedState;

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
      let serializedImmediate: SerializedImmediate[] = [];
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

// Re-export types
export type {
  SerializedMachine,
  SerializedState,
  SerializedStates,
  SerializedTransition,
  SerializedTransitions,
  SerializedPulse,
  SerializedCollection,
  SerializedGuard,
  SerializedImmediate,
  SerializedNestedMachine,
} from "./types";

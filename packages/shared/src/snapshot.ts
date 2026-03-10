import { snapshot as runtimeSnapshot } from "../../../lib/machine/invoke";
import type { Machine } from "../../../lib/machine/interfaces";

import type { AdapterFatalState, AdapterSnapshot } from "./types";

function getFatalState(machine: Machine): AdapterFatalState | undefined {
  if (!(machine.fatal instanceof Error)) {
    return undefined;
  }

  return {
    name: machine.fatal.name,
    message: machine.fatal.message
  };
}

export function readMachineState(machine: Machine): AdapterSnapshot {
  return {
    ...runtimeSnapshot(machine),
    id: machine.id,
    title: machine.title,
    isAsync: machine.isAsync,
    fatal: getFatalState(machine)
  };
}

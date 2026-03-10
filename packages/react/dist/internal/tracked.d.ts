import { type Machine } from "x-robot";
import type { MachineUpdateListener, TrackedMachineAdapter } from "./types";
export declare function createTrackedMachineAdapter(machine: Machine, onUpdate?: MachineUpdateListener): TrackedMachineAdapter;

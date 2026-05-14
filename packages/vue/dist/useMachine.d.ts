import { type TrackedMachineAdapter } from "./internal";
import type { UseMachineOptions, UseMachineResult } from "./types";
export declare function useMachine(machine: TrackedMachineAdapter["machine"], options?: UseMachineOptions): UseMachineResult;

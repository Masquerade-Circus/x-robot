import type { AdapterSnapshot, TrackedMachineAdapter } from "./internal";
import type { MachineSnapshot } from "x-robot";

export interface UseMachineDevtoolsOptions {
  name?: string;
}

export interface UseMachineOptions {
  autostart?: boolean;
  devtools?: boolean | UseMachineDevtoolsOptions;
  startSnapshot?: MachineSnapshot;
}

export interface UseMachineResult {
  machine: TrackedMachineAdapter["machine"];
  current: AdapterSnapshot["current"];
  context: AdapterSnapshot["context"];
  fatal?: TrackedMachineAdapter["machine"]["fatal"];
  isAsync: AdapterSnapshot["isAsync"];
  start(snapshotOrPayload?: unknown): Promise<void> | void;
  invoke(transition: string, payload?: unknown): Promise<void> | void;
  invokeAfter(
    timeInMilliseconds: number,
    transition: string,
    payload?: unknown
  ): () => void;
  snapshot(): AdapterSnapshot;
  cleanup(): void;
}

export type UseMachineAdapter = TrackedMachineAdapter;

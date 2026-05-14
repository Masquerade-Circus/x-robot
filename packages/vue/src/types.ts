import type { Machine, MachineSnapshot } from "x-robot";
import type { Ref, ShallowRef } from "vue";

export interface UseMachineDevtoolsOptions {
  name?: string;
}

export interface UseMachineOptions {
  autostart?: boolean;
  devtools?: boolean | UseMachineDevtoolsOptions;
  startSnapshot?: MachineSnapshot;
}

export interface UseMachineFatalState {
  name: string;
  message: string;
}

export interface UseMachineSnapshot extends MachineSnapshot {
  id: string;
  title: string | null;
  isAsync: boolean;
  fatal?: UseMachineFatalState;
}

export interface UseMachineAdapter {
  machine: Machine;
  start(snapshotOrPayload?: MachineSnapshot | unknown): Promise<void> | void;
  invoke(transition: string, payload?: unknown): Promise<void> | void;
  invokeAfter(
    timeInMilliseconds: number,
    transition: string,
    payload?: unknown
  ): () => void;
  snapshot(): UseMachineSnapshot;
  disconnect(): void;
  cleanup(): void;
}

export interface UseMachineResult {
  machine: Machine;
  current: Ref<UseMachineSnapshot["current"]>;
  context: ShallowRef<UseMachineSnapshot["context"]>;
  fatal: ShallowRef<UseMachineSnapshot["fatal"]>;
  isAsync: Ref<UseMachineSnapshot["isAsync"]>;
  start(snapshotOrPayload?: unknown): Promise<void> | void;
  invoke(transition: string, payload?: unknown): Promise<void> | void;
  invokeAfter(
    timeInMilliseconds: number,
    transition: string,
    payload?: unknown
  ): () => void;
  snapshot(): UseMachineSnapshot;
  cleanup(): void;
}

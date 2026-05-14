import type { Machine, MachineSnapshot } from "x-robot";
export interface AdapterFatalState {
    name: string;
    message: string;
}
export interface AdapterSnapshot extends MachineSnapshot {
    id: string;
    title: string | null;
    isAsync: boolean;
    fatal?: AdapterFatalState;
}
export interface TrackedMachineAction {
    kind: "start" | "invoke" | "invokeAfter";
    type: string;
    payload?: unknown;
    timeInMilliseconds?: number;
}
export declare type MachineUpdateListener = (snapshot: AdapterSnapshot, action: TrackedMachineAction) => void;
export interface AdapterCleanup {
    disconnect(): void;
    cleanup(): void;
}
export interface TrackedMachineAdapter extends AdapterCleanup {
    machine: Machine;
    start(snapshotOrPayload?: MachineSnapshot | unknown): Promise<void> | void;
    invoke(transition: string, payload?: unknown): Promise<void> | void;
    invokeAfter(timeInMilliseconds: number, transition: string, payload?: unknown): () => void;
    snapshot(): AdapterSnapshot;
}

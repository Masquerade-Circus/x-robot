import { Machine } from "./interfaces";
export declare function invoke(machine: Machine, transition: string, payload?: any): Promise<void> | void;
export declare function start(machine: Machine, snapshotOrPayload?: MachineSnapshot | any): Promise<void> | void;
export declare function invokeAfter(machine: Machine, timeInMilliseconds: number, event: string, payload?: any): () => void;
export interface MachineSnapshot {
    current: string;
    context: any;
    history: string[];
    parallel?: Record<string, MachineSnapshot>;
    nested?: Record<string, Record<string, MachineSnapshot>>;
}
export declare function snapshot(machine: Machine): MachineSnapshot;
//# sourceMappingURL=invoke.d.ts.map
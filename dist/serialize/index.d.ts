import { Machine } from "../machine/interfaces";
export interface SerializedPulse {
    pulse: string;
    success?: string;
    failure?: string;
    isAsync?: boolean;
}
export interface SerializedGuard {
    guard: string;
    failure?: string;
    machine?: SerializedMachine;
}
export interface SerializedCollection extends Array<SerializedPulse> {
}
export interface SerializedTransition {
    target: string;
    guards?: SerializedGuard[];
    exitPulse?: SerializedPulse[];
}
export interface SerializedTransitions {
    [key: string]: SerializedTransition;
}
export interface SerializedImmediate {
    immediate: string;
    guards?: SerializedGuard[];
}
export interface SerializedState {
    name: string;
    nested?: SerializedNestedMachine[];
    on?: SerializedTransitions;
    run?: SerializedCollection;
    immediate?: SerializedImmediate[];
    type?: string;
    description?: string;
}
export interface SerializedStates {
    [key: string]: SerializedState;
}
export interface SerializedMachine {
    title?: string;
    states: SerializedStates;
    parallel: Record<string, SerializedMachine>;
    context: any;
    initial: any;
}
export interface SerializedNestedMachine {
    machine: SerializedMachine;
    transition?: string;
}
export declare function serialize(machine: Machine): SerializedMachine;
//# sourceMappingURL=index.d.ts.map
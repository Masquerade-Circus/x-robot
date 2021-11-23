import { Machine } from "../machine/interfaces";
export interface SerializedProducer {
    producer: string;
    transition?: string;
}
export interface SerializedAction {
    action: string;
    success?: string | SerializedProducer;
    failure?: string | SerializedProducer;
}
export interface SerializedGuard {
    guard: string;
    failure?: string | SerializedProducer;
    machine?: SerializedMachine;
}
interface SerializedCollection extends Array<SerializedAction | SerializedProducer> {
}
export interface SerializedTransition {
    target: string;
    guards?: SerializedGuard[];
}
interface SerializedTransitions {
    [key: string]: SerializedTransition;
}
export interface SerializedImmediate {
    immediate: string;
    guards?: SerializedGuard[];
}
interface SerializedState {
    name: string;
    nested?: SerializedNestedMachine[];
    on?: SerializedTransitions;
    run?: SerializedCollection;
    immediate?: SerializedImmediate[];
    type?: string;
    description?: string;
}
interface SerializedStates {
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
export {};

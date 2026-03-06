import { Machine } from "../machine/interfaces";
export declare type OutputFormat = 'ts' | 'mjs' | 'cjs' | 'json' | 'scxml' | 'plantuml' | 'mermaid' | 'svg' | 'png' | 'serialized' | 'all';
export interface DocumentateOptions {
    format: OutputFormat;
    level?: 'low' | 'high';
    output?: string;
    fileName?: string;
    skinparam?: string;
    mermaidTheme?: 'default' | 'neutral' | 'dark';
}
export interface DocumentateResult {
    ts?: string;
    mjs?: string;
    cjs?: string;
    json?: string;
    scxml?: string;
    plantuml?: string;
    mermaid?: string;
    svg?: string;
    png?: string;
    serialized?: SerializedMachine;
    files?: string[];
}
export declare type DocumentateInput = Machine | SerializedMachine | string;
export interface SerializedMachine {
    title?: string;
    states: SerializedStates;
    parallel: Record<string, SerializedMachine>;
    context: any;
    initial: any;
}
export interface SerializedStates {
    [key: string]: SerializedState;
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
export interface SerializedTransitions {
    [key: string]: SerializedTransition;
}
export interface SerializedTransition {
    target: string;
    guards?: SerializedGuard[];
    exit?: SerializedPulse[];
}
export interface SerializedPulse {
    pulse: string;
    success?: string;
    failure?: string;
    isAsync?: boolean;
}
export interface SerializedCollection extends Array<SerializedPulse> {
}
export interface SerializedGuard {
    guard: string;
    failure?: string;
    machine?: SerializedMachine;
}
export interface SerializedImmediate {
    immediate: string;
    guards?: SerializedGuard[];
}
export interface SerializedNestedMachine {
    machine: SerializedMachine;
    transition?: string;
}
//# sourceMappingURL=types.d.ts.map
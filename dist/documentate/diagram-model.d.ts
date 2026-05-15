import type { SerializedMachine } from "./types";
export interface DiagramMachine {
    id: string;
    alias: string;
    path: string;
    label: string;
    initial?: string;
    stateCount: number;
}
export interface DiagramEvent {
    id: string;
    alias: string;
    name: string;
}
export interface DiagramState {
    id: string;
    alias: string;
    label: string;
    name: string;
    machinePath: string;
    type: string;
}
export interface DiagramEdge {
    from: string;
    to: string;
    label: string;
    kind: string;
}
export interface EventEdge {
    event: string;
    eventId: string;
    from: string;
    to: string;
    label: string;
}
export interface GuardDecision {
    id: string;
    sourceStateId: string;
    sourceLabel: string;
    triggerLabel: string;
    guardName: string;
    successTargetId?: string;
    successTargetLabel?: string;
    failureTargetId?: string;
    failureTargetLabel?: string;
    kind: "transition" | "immediate";
}
export interface ComplexityPoint {
    stateId: string;
    label: string;
    transitionLoad: number;
    actionLoad: number;
    x: number;
    y: number;
}
export interface AdditionalDiagramModel {
    machines: DiagramMachine[];
    states: DiagramState[];
    pulseEdges: DiagramEdge[];
    events: DiagramEvent[];
    eventEdges: EventEdge[];
    outcomeEdges: DiagramEdge[];
    immediateEdges: DiagramEdge[];
    guardDecisions: GuardDecision[];
    compositionEdges: DiagramEdge[];
    complexityPoints: ComplexityPoint[];
    aliases: Record<string, string>;
}
export declare function toDiagramAlias(id: string): string;
export declare function escapeDiagramLabel(value: string): string;
export declare function collectAdditionalDiagramModel(serializedMachine: SerializedMachine): AdditionalDiagramModel;
//# sourceMappingURL=diagram-model.d.ts.map
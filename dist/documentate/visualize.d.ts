import { SerializedGuard, SerializedImmediate, SerializedMachine, SerializedNestedMachine, SerializedPulse } from "./types";
import { Machine } from "../machine/interfaces";
export interface SerializedCollectionWithGuards extends Array<SerializedGuard | SerializedPulse | SerializedNestedMachine | SerializedImmediate> {
}
export declare const VISUALIZATION_LEVEL: {
    LOW: string;
    HIGH: string;
};
export declare const MERMAID_THEME: {
    DEFAULT: string;
    NEUTRAL: string;
    DARK: string;
};
export interface mermaidOptions {
    level?: string;
    theme?: string;
    skinparam?: string;
}
export interface options {
    level?: string;
    skinparam?: string;
}
export interface imageFromPlantUmlCodeOptions {
    outDir?: string;
    fileName?: string;
}
export interface imageFromMachineOptions extends options, imageFromPlantUmlCodeOptions {
}
export declare function getPlantUmlCode(serializedMachine: SerializedMachine, optionsOrLevel?: string | options): string;
export declare function getMermaidCode(serializedMachine: SerializedMachine, optionsOrLevel?: string | mermaidOptions): string;
export declare function getMermaidSequenceCode(serializedMachine: SerializedMachine, optionsOrLevel?: string | mermaidOptions): string;
export declare function getPlantUmlSequenceCode(serializedMachine: SerializedMachine, optionsOrLevel?: string | options): string;
export declare function getMermaidPulseMapCode(serializedMachine: SerializedMachine): string;
export declare function getPlantUmlPulseMapCode(serializedMachine: SerializedMachine): string;
export declare function getMermaidEventMapCode(serializedMachine: SerializedMachine): string;
export declare function getPlantUmlEventMapCode(serializedMachine: SerializedMachine): string;
export declare function getMermaidOutcomeMapCode(serializedMachine: SerializedMachine): string;
export declare function getPlantUmlOutcomeMapCode(serializedMachine: SerializedMachine): string;
export declare function getMermaidImmediateMapCode(serializedMachine: SerializedMachine): string;
export declare function getPlantUmlImmediateMapCode(serializedMachine: SerializedMachine): string;
export declare function getMermaidGuardDecisionMapCode(serializedMachine: SerializedMachine): string;
export declare function getPlantUmlGuardDecisionMapCode(serializedMachine: SerializedMachine): string;
export declare function getMermaidCompositionMapCode(serializedMachine: SerializedMachine): string;
export declare function getPlantUmlCompositionMapCode(serializedMachine: SerializedMachine): string;
export declare function getMermaidComplexityMapCode(serializedMachine: SerializedMachine): string;
export declare function getPlantUmlComplexityMapCode(serializedMachine: SerializedMachine): string;
export declare function getMermaidCodeFromMachine(machine: Machine, optionsOrLevel?: string | mermaidOptions): string;
export declare function getPlantUmlCodeFromMachine(machine: Machine, optionsOrLevel?: string | options): string;
export declare function createPngFromPlantUmlCode(plantUmlCode: string, options?: imageFromMachineOptions): Promise<string>;
export declare function createSvgFromPlantUmlCode(plantUmlCode: string, options?: imageFromMachineOptions): Promise<string>;
export declare function createPngFromMachine(machine: Machine, optionsOrLevel?: string | imageFromMachineOptions): Promise<string>;
export declare function createSvgFromSerializedMachine(serialized: SerializedMachine, optionsOrLevel?: string | imageFromMachineOptions): Promise<string>;
export declare function createPngFromSerializedMachine(serialized: SerializedMachine, optionsOrLevel?: string | imageFromMachineOptions): Promise<string>;
export declare function createSvgFromMachine(machine: Machine, optionsOrLevel?: string | imageFromMachineOptions): Promise<string>;
//# sourceMappingURL=visualize.d.ts.map
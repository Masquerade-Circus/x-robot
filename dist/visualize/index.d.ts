import { SerializedAction, SerializedGuard, SerializedImmediate, SerializedMachine, SerializedNestedMachine, SerializedProducer } from "../serialize";
import { Machine } from "../machine/interfaces";
export interface SerializedCollectionWithGuards extends Array<SerializedGuard | SerializedAction | SerializedProducer | SerializedNestedMachine | SerializedImmediate> {
}
export declare const VISUALIZATION_LEVEL: {
    LOW: string;
    HIGH: string;
};
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
export declare function getPlantUmlCodeFromMachine(machine: Machine, optionsOrLevel?: string | options): string;
export declare function createPngFromPlantUmlCode(plantUmlCode: string, options?: imageFromMachineOptions): Promise<string>;
export declare function createSvgFromPlantUmlCode(plantUmlCode: string, options?: imageFromMachineOptions): Promise<string>;
export declare function createPngFromMachine(machine: Machine, optionsOrLevel?: string | imageFromMachineOptions): Promise<string>;
export declare function createSvgFromMachine(machine: Machine, optionsOrLevel?: string | imageFromMachineOptions): Promise<string>;
//# sourceMappingURL=index.d.ts.map
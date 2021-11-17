import { SerializedAction, SerializedGuard, SerializedImmediate, SerializedMachine, SerializedNestedMachine, SerializedProducer } from '../serialize';
import { Machine } from '../machine/interfaces';
interface SerializedCollectionWithGuards extends Array<SerializedGuard | SerializedAction | SerializedProducer | SerializedNestedMachine | SerializedImmediate> {
}
export declare const VISUALIZATION_LEVEL: {
    LOW: string;
    HIGH: string;
};
interface options {
    level?: string;
    skinparam?: string;
}
interface imageFromPlantUmlCodeOptions {
    outDir?: string;
    fileName?: string;
}
interface imageFromMachineOptions extends options, imageFromPlantUmlCodeOptions {
}
export declare function getPlantUmlCode(serializedMachine: SerializedMachine, optionsOrLevel?: string | options): string;
export declare function getAsciiTree(collection: SerializedCollectionWithGuards): string;
export declare function createPngFromPlantUmlCode(plantUmlCode: string, options?: imageFromMachineOptions): Promise<string>;
export declare function createSvgFromPlantUmlCode(plantUmlCode: string, options?: imageFromMachineOptions): Promise<string>;
export declare function createPlantUmlStringFromMachine(machine: Machine, optionsOrLevel?: string | options): string;
export declare function createPngFromMachine(machine: Machine, optionsOrLevel?: string | imageFromMachineOptions): Promise<string>;
export declare function createSvgFromMachine(machine: Machine, optionsOrLevel?: string | imageFromMachineOptions): Promise<string>;
export declare function stringifyTree<T>(tn: T, nameFn: (t: T) => string, childrenFn: (t: T) => T[] | null): string;
export {};

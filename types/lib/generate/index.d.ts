import { SerializedMachine } from "../serialize";
export declare enum Format {
    ESM = "esm",
    CJS = "cjs"
}
export declare function generateFromSerializedMachine(serializedMachine: SerializedMachine, format: Format): string;

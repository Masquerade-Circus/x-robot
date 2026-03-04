import { SerializedMachine } from "./types";
export declare enum Format {
    ESM = "esm",
    CJS = "cjs",
    TS = "ts"
}
export declare function generateFromSerializedMachine(serializedMachine: SerializedMachine, format: Format): string;
//# sourceMappingURL=generate.d.ts.map
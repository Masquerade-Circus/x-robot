import { SerializedMachine } from "../serialize";
export declare enum Format {
    ESM = "esm",
    CJS = "cjs",
    TS = "ts"
}
export declare function generateFromSerializedMachine(serializedMachine: SerializedMachine, format: Format): string;
//# sourceMappingURL=index.d.ts.map
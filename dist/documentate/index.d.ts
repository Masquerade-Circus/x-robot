import { Machine } from "../machine/interfaces";
import { serialize } from "../serialize";
import { getPlantUmlCode, getPlantUmlCodeFromMachine, createSvgFromMachine, createPngFromMachine, VISUALIZATION_LEVEL } from "../visualize";
export interface DocumentateOptions {
    output: string;
    format: 'svg' | 'png' | 'json' | 'all';
    level?: 'low' | 'high';
    fileName?: string;
}
export interface DocumentationResult {
    json?: string;
    svg?: string;
    png?: string;
    files: string[];
}
export declare function documentate(machine: Machine, options: DocumentateOptions): Promise<DocumentationResult>;
export declare function generatePlantUml(machine: Machine, level?: 'low' | 'high'): string;
export declare function generateJson(machine: Machine): string;
export { serialize, getPlantUmlCode, getPlantUmlCodeFromMachine, createSvgFromMachine, createPngFromMachine, VISUALIZATION_LEVEL };
//# sourceMappingURL=index.d.ts.map
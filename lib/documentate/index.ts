/**
 * @module x-robot/documentate
 * @description Generate documentation for X-Robot machines
 */
import { Machine } from "../machine/interfaces";
import { serialize } from "../serialize";
import { getPlantUmlCode, getPlantUmlCodeFromMachine, createSvgFromMachine, createPngFromMachine, VISUALIZATION_LEVEL } from "../visualize";
import fs from "fs";
import path from "path";

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

/**
 * Generate documentation for a machine
 * @param machine The machine to document
 * @param options Documentation options
 * @returns Documentation result
 */
export async function documentate(
  machine: Machine,
  options: DocumentateOptions
): Promise<DocumentationResult> {
  const {
    output,
    format,
    level = 'high',
    fileName
  } = options;

  const result: DocumentationResult = {
    files: []
  };

  const baseName = fileName || machine.title || 'machine';
  const outputDir = path.resolve(output);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  if (format === 'json' || format === 'all') {
    const serialized = serialize(machine);
    const jsonPath = path.join(outputDir, `${baseName}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(serialized, null, 2));
    result.json = jsonPath;
    result.files.push(jsonPath);
  }

  if (format === 'svg' || format === 'all') {
    try {
      const svgPath = await createSvgFromMachine(machine, {
        level,
        fileName: `${baseName}`,
        outDir: outputDir
      });
      result.svg = svgPath;
      result.files.push(svgPath);
    } catch (error) {
      console.error('Failed to generate SVG:', error);
    }
  }

  if (format === 'png' || format === 'all') {
    try {
      const pngPath = await createPngFromMachine(machine, {
        level,
        fileName: `${baseName}`,
        outDir: outputDir
      });
      result.png = pngPath;
      result.files.push(pngPath);
    } catch (error) {
      console.error('Failed to generate PNG:', error);
    }
  }

  return result;
}

/**
 * Generate PlantUML code for a machine
 * @param machine The machine to generate code for
 * @param level Visualization level
 * @returns PlantUML code
 */
export function generatePlantUml(
  machine: Machine,
  level: 'low' | 'high' = 'high'
): string {
  return getPlantUmlCodeFromMachine(machine, level);
}

/**
 * Generate JSON representation of a machine
 * @param machine The machine to serialize
 * @returns JSON string
 */
export function generateJson(machine: Machine): string {
  return JSON.stringify(serialize(machine), null, 2);
}

export {
  serialize,
  getPlantUmlCode,
  getPlantUmlCodeFromMachine,
  createSvgFromMachine,
  createPngFromMachine,
  VISUALIZATION_LEVEL
};

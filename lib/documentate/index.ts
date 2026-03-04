/**
 * @module x-robot/documentate
 * @description Generate documentation and convert between formats for X-Robot machines
 */

import { Machine } from "../machine/interfaces";
import { isMachine } from "../utils";
import { serialize } from "./serialize";
import { generateFromSerializedMachine, Format } from "./generate";
import { toSCXML, fromSCXML } from "./scxml";
import { getPlantUmlCode, createSvgFromMachine, createPngFromMachine, createSvgFromPlantUmlCode, createPngFromPlantUmlCode, createSvgFromSerializedMachine, createPngFromSerializedMachine } from "./visualize";
import type { DocumentateInput, DocumentateOptions, DocumentateResult } from "./types";
import type { SerializedMachine } from "./types";

function isSerializedMachine(input: any): input is SerializedMachine {
  return input && typeof input === 'object' && 'states' in input;
}

function isString(input: any): input is string {
  return typeof input === 'string';
}

function isScxml(input: string): boolean {
  return input.trim().startsWith('<scxml') || input.trim().startsWith('<?xml');
}

function isPlantUml(input: string): boolean {
  return input.trim().startsWith('@startuml') || input.trim().startsWith('@enduml');
}

/**
 * Generate documentation and convert between formats for X-Robot machines.
 * 
 * This function accepts various input types and generates different output formats,
 * enabling full interoperability between Machine, SerializedMachine, SCXML, and PlantUML.
 * 
 * @param input - A Machine, SerializedMachine, SCXML string, or PlantUML string
 * @param options - Options specifying the output format
 * @returns Promise with the generated documentation/converted output
 * 
 * @example
 * // Generate all formats from a machine
 * const result = await documentate(myMachine, { format: 'all' });
 * 
 * @example
 * // Generate TypeScript code from SCXML
 * const result = await documentate(scxmlString, { format: 'ts' });
 * 
 * @example
 * // Generate SVG from PlantUML code
 * const result = await documentate(plantUmlCode, { format: 'svg' });
 * 
 * @example
 * // Generate serialized machine from any input
 * const result = await documentate(scxmlString, { format: 'serialized' });
 * 
 * @example
 * // Generate diagram with custom options
 * const result = await documentate(myMachine, { format: 'svg', level: 'high', skinparam: 'skinparam backgroundColor white' });
 */
export async function documentate(
  input: DocumentateInput,
  options: DocumentateOptions
): Promise<DocumentateResult> {
  let serialized: SerializedMachine | undefined;
  let machine: Machine | undefined;
  let plantUmlInput: string | undefined;

  // Detect and parse input
  if (isMachine(input)) {
    machine = input as Machine;
    serialized = serialize(machine);
  } else if (isSerializedMachine(input)) {
    serialized = input as SerializedMachine;
  } else if (isString(input)) {
    const str = input as string;
    if (isScxml(str)) {
      try {
        serialized = fromSCXML(str);
      } catch (error) {
        throw new Error("Failed to parse SCXML input: " + (error as Error).message);
      }
    } else if (isPlantUml(str)) {
      plantUmlInput = str;
    } else {
      throw new Error("Invalid input string: expected valid SCXML or PlantUML format");
    }
  } else {
    throw new Error("Invalid input: expected Machine, SerializedMachine, SCXML string, or PlantUML string");
  }

  const result: DocumentateResult = {};
  const level = options.level || 'high';
  const format = options.format;
  const skinparam = options.skinparam;

  // Handle PlantUML input - can only generate SVG or PNG
  if (plantUmlInput) {
    if (format === 'all' || format === 'svg') {
      result.svg = await createSvgFromPlantUmlCode(plantUmlInput, { level: options.level });
    }
    if (format === 'all' || format === 'png') {
      result.png = await createPngFromPlantUmlCode(plantUmlInput);
    }
    if (format === 'all' || format === 'plantuml') {
      result.plantuml = plantUmlInput;
    }
    return result;
  }

  // Generate outputs based on format from machine/serialized
  if (!serialized) {
    throw new Error("Cannot generate output: no valid input provided");
  }

  if (format === 'all' || format === 'ts') {
    result.ts = generateFromSerializedMachine(serialized, Format.TS);
  }

  if (format === 'all' || format === 'mjs') {
    result.mjs = generateFromSerializedMachine(serialized, Format.ESM);
  }

  if (format === 'all' || format === 'cjs') {
    result.cjs = generateFromSerializedMachine(serialized, Format.CJS);
  }

  if (format === 'all' || format === 'json') {
    result.json = JSON.stringify(serialized, null, 2);
  }

  if (format === 'all' || format === 'serialized') {
    result.serialized = serialized;
  }

  if (format === 'all' || format === 'scxml') {
    result.scxml = toSCXML(serialized);
  }

  if (format === 'all' || format === 'plantuml') {
    result.plantuml = getPlantUmlCode(serialized, { level, skinparam });
  }

  if ((format === 'all' || format === 'svg') && serialized) {
    if (machine) {
      result.svg = await createSvgFromMachine(machine, { level, skinparam });
    } else {
      result.svg = await createSvgFromSerializedMachine(serialized, { level, skinparam });
    }
  }

  if ((format === 'all' || format === 'png') && serialized) {
    if (machine) {
      result.png = await createPngFromMachine(machine, { level });
    } else {
      result.png = await createPngFromSerializedMachine(serialized, { level });
    }
  }

  return result;
}

// Export types
export type { DocumentateInput, DocumentateOptions, DocumentateResult, OutputFormat } from "./types";
export type { SerializedMachine, SerializedState, SerializedStates } from "./types";

/**
 * @module x-robot/documentate
 * @description Types for the documentate module
 */

import { Machine } from "../machine/interfaces";

/**
 * Output format options for documentate function
 */
export type OutputFormat = 
  | 'ts' 
  | 'mjs' 
  | 'cjs' 
  | 'json' 
  | 'scxml' 
  | 'plantuml' 
  | 'mermaid'
  | 'svg' 
  | 'png' 
  | 'serialized'
  | 'all';

/**
 * Options for the documentate function
 */
export interface DocumentateOptions {
  /** Output format (required) */
  format: OutputFormat;
  /** Detail level for diagrams */
  level?: 'low' | 'high';
  /** Output file path */
  output?: string;
  /** Output file name */
  fileName?: string;
  /** PlantUML skinparam customization */
  skinparam?: string;
  /** Mermaid diagram theme */
  mermaidTheme?: 'default' | 'neutral' | 'dark';
}

/**
 * Result returned by the documentate function
 */
export interface DocumentateResult {
  /** Generated TypeScript code */
  ts?: string;
  /** Generated JavaScript ESM code */
  mjs?: string;
  /** Generated JavaScript CommonJS code */
  cjs?: string;
  /** JSON representation of the machine */
  json?: string;
  /** SCXML document */
  scxml?: string;
  /** PlantUML code */
  plantuml?: string;
  /** Mermaid code */
  mermaid?: string;
  /** SVG image path */
  svg?: string;
  /** PNG image path */
  png?: string;
  /** SerializedMachine object */
  serialized?: SerializedMachine;
  /** Generated file paths */
  files?: string[];
}

/**
 * Input types accepted by the documentate function
 */
export type DocumentateInput = 
  | Machine 
  | SerializedMachine 
  | string;

/**
 * Serialized representation of a machine
 */
export interface SerializedMachine {
  title?: string;
  states: SerializedStates;
  parallel: Record<string, SerializedMachine>;
  context: any;
  initial: any;
}

/**
 * Collection of serialized states
 */
export interface SerializedStates {
  [key: string]: SerializedState;
}

/**
 * Serialized state definition
 */
export interface SerializedState {
  name: string;
  nested?: SerializedNestedMachine[];
  on?: SerializedTransitions;
  run?: SerializedCollection;
  immediate?: SerializedImmediate[];
  type?: string;
  description?: string;
}

/**
 * Serialized transitions map
 */
export interface SerializedTransitions {
  [key: string]: SerializedTransition;
}

/**
 * Serialized transition definition
 */
export interface SerializedTransition {
  target: string;
  guards?: SerializedGuard[];
  exit?: SerializedPulse[];
}

/**
 * Serialized pulse (entry/exit pulse)
 */
export interface SerializedPulse {
  pulse: string;
  success?: string;
  failure?: string;
  isAsync?: boolean;
}

/**
 * Collection of serialized pulses
 */
export interface SerializedCollection extends Array<SerializedPulse> {}

/**
 * Serialized guard definition
 */
export interface SerializedGuard {
  guard: string;
  failure?: string;
  machine?: SerializedMachine;
}

/**
 * Serialized immediate transition definition
 */
export interface SerializedImmediate {
  immediate: string;
  guards?: SerializedGuard[];
}

/**
 * Serialized nested machine definition
 */
export interface SerializedNestedMachine {
  machine: SerializedMachine;
  transition?: string;
}

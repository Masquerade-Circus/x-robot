/**
 * @module x-robot/documentate/visualize
 * @description Generate a visual representation of a machine in plant uml format or get a png/svg image of the diagram.
 * */
import {
  SerializedGuard,
  SerializedImmediate,
  SerializedMachine,
  SerializedNestedMachine,
  SerializedPulse,
  SerializedTransition,
} from "./types";
import { getSerializedMachineIdentity, serialize } from "./serialize";
import {
  isImmediate,
  isNestedMachineDirective,
  isNestedTransition,
  isParallelTransition,
  isValidObject,
  isValidString,
  titleToId
} from "../utils";
import {
  getMermaidClassDefinitions,
  getMermaidStateClassName,
  getPlantUmlStateSkinparamLines,
  getPlantUmlStateStereotype,
  resolveStateStyleRole
} from "./state-styles";
import {
  AdditionalDiagramModel,
  ComplexityPoint,
  GuardDecision,
  collectAdditionalDiagramModel,
  escapeDiagramLabel
} from "./diagram-model";

import { Machine } from "../machine/interfaces";
import { exec } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

export interface SerializedCollectionWithGuards
  extends Array<
    | SerializedGuard
    | SerializedPulse
    | SerializedNestedMachine
    | SerializedImmediate
  > {}

export const VISUALIZATION_LEVEL = {
  LOW: "low",
  HIGH: "high"
};

export const MERMAID_THEME = {
  DEFAULT: 'default',
  NEUTRAL: 'neutral',
  DARK: 'dark'
};

const MERMAID_INDENT_SPACE = "\u2007";
const MERMAID_DIRECTION = "TB";

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

export interface imageFromMachineOptions
  extends options,
    imageFromPlantUmlCodeOptions {}

const toCammelCase = (str: string) =>
  str
    .replace(/(^\w)/g, ($1) => $1.toUpperCase())
    .replace(/\s(.)/g, ($1) => $1.toUpperCase())
    .replace(/\W/g, "");

function getInnerPlantUmlCode(
  serializedMachine: SerializedMachine,
  options: options,
  parentName = "",
  childLevel = 0
): string {
  let plantUmlCode = "";
  let { level } = options;
  const isChild = childLevel > 0;
  const cammelCasedTitle = toCammelCase(
    `${parentName}${toCammelCase(serializedMachine.title || "")}`
  );
  const space = Array.from({ length: childLevel })
    .map(() => "  ")
    .join("");

  // Add the title if it exists
  // If is an inner machine, add the title as a side note
  if (serializedMachine.title) {
    if (isChild) {
      plantUmlCode += `${space}note "${serializedMachine.title}" as N${cammelCasedTitle}\n\n`;
    } else {
      plantUmlCode += `${space}title ${serializedMachine.title}\n\n`;
    }
  }

  const stateNames: Record<string, string> = {};
  for (const stateName in serializedMachine.states) {
    const cammelCased = toCammelCase(stateName);
    stateNames[stateName] = isChild
      ? `${cammelCasedTitle}${cammelCased}`
      : stateName;
  }

  // Add the states
  let states = "";
  for (const stateName in serializedMachine.states) {
    const state = serializedMachine.states[stateName];
    if (isChild) {
      states += `${space}state "${stateName}" as ${stateNames[stateName]}`;
    } else {
      states += `${space}state ${stateName}`;
    }
    states += `<<${getPlantUmlStateStereotype(state.type)}>>\n`;
  }

  if (states.trim().length > 0) {
    plantUmlCode += `${space}${states.trim()}\n`;
  }

  // Add nested machines if they exist
  let nestedMachines = "";
  for (const stateName in serializedMachine.states) {
    const state = serializedMachine.states[stateName];

    if (state.nested) {
      nestedMachines += `\n${space}state ${stateNames[stateName]} {\n`;
      for (let nested of state.nested) {
        let innerPlantUmlCode = getInnerPlantUmlCode(
          nested.machine,
          options,
          toCammelCase(stateNames[stateName]),
          childLevel + 1
        );
        nestedMachines += innerPlantUmlCode + `\n${space}  ||\n\n`;
      }
      nestedMachines =
        nestedMachines.replace(/\n\s+\|\|\n\n$/, "\n") + `${space}}\n`;
    }
  }

  if (nestedMachines.trim().length > 0) {
    plantUmlCode += `\n${space}${nestedMachines.trim()}\n`;
  }

  // Add the parallel states if they exist
  let parallelStates = "";
  if (Object.keys(serializedMachine.parallel).length > 0) {
    parallelStates += `\n${space}state "Parallel states" as ${cammelCasedTitle}ParallelStates {\n`;
    for (const parallel in serializedMachine.parallel) {
      const parallelState = serializedMachine.parallel[parallel];
      parallelStates += getInnerPlantUmlCode(
        parallelState,
        options,
        cammelCasedTitle,
        childLevel + 1
      );
      parallelStates += `\n${space}  --\n\n`;
    }
    parallelStates =
      parallelStates.replace(/\n\s+--\n\n$/, "\n") + `${space}}\n`;
  }

  if (parallelStates.trim().length > 0) {
    plantUmlCode += `\n${space}${parallelStates.trim()}\n`;
  }

  // If visualization level is high, add the state descriptions
  if (level === VISUALIZATION_LEVEL.HIGH) {
    let stateDescriptionsPlantUmlCode = "";

    for (const stateName in serializedMachine.states) {
      const state = serializedMachine.states[stateName];
      if (state.description) {
        stateDescriptionsPlantUmlCode += `${space}${stateNames[stateName]}: ${state.description}\n`;
      }
    }

    if (stateDescriptionsPlantUmlCode.trim().length > 0) {
      plantUmlCode += `\n${space}${stateDescriptionsPlantUmlCode.trim()}\n`;
    }
  }

  // If visualization level is high, add the entry pulses and transitions
  let highData = "";
  if (level === VISUALIZATION_LEVEL.HIGH) {
    // Add the entry pulses and transitions
    for (const stateName in serializedMachine.states) {
      const state = serializedMachine.states[stateName];
      const run = [];

      // Add the nested transitions first if they exist
      if (state.nested) {
        for (let nested of state.nested) {
          if (nested.transition) {
            let nestedCammelCasedTitle = titleToId(nested.machine.title || "");
            let nestedTransition = `${nestedCammelCasedTitle}.${nested.transition}`;
            run.push({ ...nested, transition: nestedTransition });
          }
        }
      }

      run.push(...(state.run || []));

      // Add the immediate transitions if they exist and are not normal transitions
      if (state.immediate && state.immediate.length > 0) {
        for (let immediate of state.immediate) {
          if (
            isNestedTransition(immediate.immediate) ||
            isParallelTransition(immediate.immediate)
          ) {
            run.push(immediate);
          }
        }
      }

      let asciiTree = getAsciiTree(run, 'entry');
      if (asciiTree.length) {
        highData += `${space}${stateNames[stateName]}: ${asciiTree}\n`;
      }
    }
    highData += `\n`;
  }

  if (highData.trim().length > 0) {
    plantUmlCode += `\n${space}${highData.trim()}\n`;
  }

  // Add transitions
  let transitions = "";
  if (isValidString(serializedMachine.initial)) {
    // Add the initial transition
    transitions += `\n${space}[*] --> ${
      stateNames[serializedMachine.initial]
    }\n`;
  }

  for (const stateName in serializedMachine.states) {
    const state = serializedMachine.states[stateName];
    if (state.on) {
      for (const transitionName in state.on) {
        const stateTargetName = stateNames[state.on[transitionName].target];
        const stateTarget =
          serializedMachine.states[state.on[transitionName].target];
        let arrow = "";
        switch (stateTarget.type) {
          case "danger":
            arrow = "#indianred";
            break;
          case "info":
            arrow = "#skyblue";
            break;
          case "warning":
            arrow = "#tan";
            break;
          case "success":
            arrow = "#mediumseagreen";
            break;
          case "primary":
            arrow = "#lightsteelblue";
            break;
          default:
            arrow = "#slategray";
            break;
        }

        let isImmediate =
          state.immediate &&
          state.immediate.find(
            (immediate) => immediate.immediate === transitionName
          );

        if (isImmediate) {
          arrow += ",dashed";
        }

        transitions += `${space}${stateNames[stateName]} -[${arrow}]-> ${stateTargetName}: ${transitionName}`;

        // If visualization level is high, add the guards
        if (level === VISUALIZATION_LEVEL.HIGH) {
          if (state.on[transitionName].guards) {
            let asciiTree = getAsciiTree(state.on[transitionName].guards || [], 'guard');
            if (asciiTree.length) {
              transitions += `\\n${asciiTree}`;
            }
          }

          // Add exit info
          const exitData = state.on[transitionName].exit;
          if (exitData && exitData.length > 0) {
            const exitNames = exitData.map(ep => ep.pulse).join(", ");
            transitions += `\\n[exit: ${exitNames}]`;
          }
        }

        transitions += `\n`;
      }
    }
  }

  if (transitions.trim().length > 0) {
    plantUmlCode += `\n${space}${transitions.trim()}\n`;
  }

  return plantUmlCode;
}

/**
 * This function will get a serialized machine and will return plantuml code representation of it.
 * @param serializedMachine The serialized machine to be visualized.
 * @param options The options to be used for the visualization.
 * @returns The plantuml code for the visualization.
 * @category Visualization
 **/
export function getPlantUmlCode(
  serializedMachine: SerializedMachine,
  optionsOrLevel: string | options = VISUALIZATION_LEVEL.LOW
): string {
  let opts: options =
    typeof optionsOrLevel === "string"
      ? { level: optionsOrLevel }
      : optionsOrLevel;
  let { skinparam } = opts;
  const plantUmlStateSkinparamLines = getPlantUmlStateSkinparamLines()
    .map((line) => `  ${line}`)
    .join("\n");

  let plantUmlCode = `\n@startuml\n\n`;

  plantUmlCode += getInnerPlantUmlCode(serializedMachine, opts);

  plantUmlCode += `
hide empty description
skinparam backgroundColor white
skinparam shadowing false
skinparam note {
  BackgroundColor white
  BorderColor slategray
  FontName monospaced
}
skinparam ArrowFontName monospaced
skinparam state {
  FontName monospaced
  AttributeFontName monospaced
  BackgroundColor white
  BorderColor slategray
  ArrowColor slategray
  ArrowThickness 2
  MessageAlignment left
${plantUmlStateSkinparamLines}
}`;

  if (isValidString(skinparam)) {
    plantUmlCode += `
${skinparam}`;
  }

  plantUmlCode += `
@enduml
`;
  return plantUmlCode;
}

function getTree(
  collection: SerializedCollectionWithGuards,
  context: 'entry' | 'exit' | 'guard' | 'transition' = 'entry'
): { name: string; children: any[] } | null {
  if (collection.length === 0) {
    return null;
  }

  let tree = {
    name: "",
    children: [] as any
  };

  let name = (type: string) => (value: string) => `${type}:${value}`;
  let guard = (isAsync?: boolean) => name(isAsync ? "AG" : "G");
  let pulse = (isEntry: boolean, isAsync?: boolean) => {
    const prefix = isEntry ? (isAsync ? "AEn" : "En") : (isAsync ? "AEx" : "Ex");
    return name(prefix);
  };
  let transition = name("T");

  for (let i = 0, l = collection.length; i < l; i++) {
    const item = collection[i];
    if (!item) {
      continue;
    }
    let obj = {
      children: [] as any
    } as any;

    if ("guard" in item) {
      obj.name = guard(item.isAsync)(item.guard);
    }
    if ("pulse" in item) {
      const isEntry = context === 'entry';
      obj.name = pulse(isEntry, item.isAsync)(item.pulse);
    }
    if ("immediate" in item) {
      obj.name = transition(item.immediate);
    }

    if ("success" in item) {
      let child = {
        name: `success`,
        children: [] as any
      } as any;

      if (typeof item.success === "string") {
        child.children.push({ name: transition(item.success) });
      }
      obj.children.push(child);
    }

    if ("failure" in item) {
      let child = {
        name: `failure`,
        children: [] as any
      } as any;

      if (typeof item.failure === "string") {
        child.children.push({ name: transition(item.failure) });
      }
      obj.children.push(child);
    }

    if (isNestedMachineDirective(item) && isValidString(item.transition)) {
      obj.name = transition(item.transition);
    }

    if ("guards" in item) {
      if (Array.isArray(item.guards) && item.guards.length > 0) {
        let guards = getTree(item.guards, 'guard');
        if (guards) {
          obj.children.push(...guards.children);
        }
      }
    }

    tree.children.push(obj);
  }

  return tree;
}

/***
This function will get a collection of guards and pulses and will return a ascii art tree representation of them.

Example:
let collection = [
{
  guard: "titleIsValid",
  failure: {
    pulse: "updateError"
  }
},
{
  pulse: "saveTitle",
  success: "preview",
  failure: {
    pulse: "updateError",
    transition: "error"
  }
}
]
let result = "G:'titleIsValid'\n│ └failure\n│   └M:'updateError'\n└P:'saveTitle'\n  ├success\n  │ └T:'preview'\n  └failure\n    ├M:'updateError'\n    └T:'error"

***/
function getAsciiTree(collection: SerializedCollectionWithGuards, context?: 'entry' | 'exit' | 'guard' | 'transition'): string {
  let tree = getTree(collection, context || 'entry');
  if (!tree) {
    return "";
  }

  return stringifyTree(
    tree,
    (t) => t.name,
    (t) => t.children
  ).replace(/\n/g, "\\n");
}

function getMermaidTreeLabel(
  collection: SerializedCollectionWithGuards,
  context?: 'entry' | 'exit' | 'guard' | 'transition'
): string {
  return getAsciiTree(collection, context).replace(
    /\b(AEn|En|AEx|Ex|AG|G|T):/g,
    "$1-"
  ).replace(
    /(^|\\n)( +)/g,
    (_, prefix: string, spaces: string) => `${prefix}${MERMAID_INDENT_SPACE.repeat(spaces.length)}`
  );
}

function escapeMermaidLabel(value: string): string {
  return value.replace(/"/g, '\\"');
}

interface SequenceParticipant {
  alias: string;
  label: string;
  machine: SerializedMachine;
}

interface SequenceRelation {
  from: string;
  to: string;
  label: string;
  isReturn?: boolean;
}

interface SequenceDiagramData {
  participants: SequenceParticipant[];
  relations: SequenceRelation[];
}

function escapeMermaidSequenceText(value: string): string {
  return value.replace(/[\r\n]+/g, " ").replace(/"/g, "#quot;");
}

function escapeMermaidSequenceParticipantText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/[\r\n]+/g, " ")
    .replace(/"/g, "#quot;");
}

function escapePlantUmlSequenceText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/[\r\n]+/g, " ");
}

function toSequenceAliasPart(value: string, fallback: string): string {
  const alias = value.replace(/[^A-Za-z0-9]/g, "_").replace(/^_+|_+$/g, "");
  return alias.length > 0 ? alias : fallback;
}

function countMatchingNestedMachines(nested: SerializedNestedMachine[], machine: SerializedMachine): number {
  const guardMachineIdentity = getSerializedMachineIdentity(machine);
  if (!guardMachineIdentity) {
    return 0;
  }

  let matches = 0;

  for (const nestedMachine of nested) {
    if (getSerializedMachineIdentity(nestedMachine.machine) === guardMachineIdentity) {
      matches += 1;
    }
  }

  return matches;
}

function getNestedOutcomeReactionLabel(
  nested: SerializedNestedMachine[],
  nestedMachine: SerializedNestedMachine,
  stateImmediate: SerializedImmediate[] | undefined,
  stateOn: Record<string, SerializedTransition> | undefined
): string | null {
  if (!stateImmediate || !stateOn) {
    return null;
  }

  if (!isValidString(nestedMachine.transition)) {
    return null;
  }

  const nestedMachineIdentity = getSerializedMachineIdentity(nestedMachine.machine);
  if (!nestedMachineIdentity) {
    return null;
  }

  for (const immediate of stateImmediate) {
    if (!stateOn[immediate.immediate] || !immediate.guards) {
      continue;
    }

    for (const guard of immediate.guards) {
      if (!guard.machine) {
        continue;
      }

      if (countMatchingNestedMachines(nested, guard.machine) !== 1) {
        continue;
      }

      if (getSerializedMachineIdentity(guard.machine) === nestedMachineIdentity) {
        return `outcome captured by ${immediate.immediate}`;
      }
    }
  }

  return null;
}

function collectSequenceDiagramData(serializedMachine: SerializedMachine): SequenceDiagramData {
  const participants: SequenceParticipant[] = [];
  const relations: SequenceRelation[] = [];
  let nestedCount = 0;

  function visit(machine: SerializedMachine, alias: string, label: string): void {
    participants.push({ alias, label, machine });

    let stateIndex = 0;
    for (const stateName in machine.states) {
      const currentStateIndex = stateIndex;
      stateIndex += 1;
      const state = machine.states[stateName];
      if (!state.nested) {
        continue;
      }

      for (let i = 0; i < state.nested.length; i++) {
        const nestedMachine = state.nested[i];
        nestedCount += 1;
        const nestedAlias = `${alias}_S${currentStateIndex}_${toSequenceAliasPart(stateName, `state${currentStateIndex}`)}_N${i}`;
        const nestedLabel = nestedMachine.machine.title || `Nested machine ${nestedCount}`;
        if (nestedMachine.transition) {
          relations.push({
            from: alias,
            to: nestedAlias,
            label: `nested ${nestedMachine.transition}`
          });
        }
        const returnLabel = getNestedOutcomeReactionLabel(
          state.nested,
          nestedMachine,
          state.immediate,
          state.on
        );
        if (returnLabel) {
          relations.push({
            from: nestedAlias,
            to: alias,
            label: returnLabel,
            isReturn: true
          });
        }
        visit(nestedMachine.machine, nestedAlias, nestedLabel);
      }
    }

    let parallelIndex = 0;
    for (const parallelKey in machine.parallel) {
      const parallelMachine = machine.parallel[parallelKey];
      const parallelAlias = `${alias}_PAR${parallelIndex}`;
      const parallelLabel = parallelMachine.title || `Parallel machine ${parallelKey || parallelIndex + 1}`;
      relations.push({
        from: alias,
        to: parallelAlias,
        label: `parallel ${parallelMachine.title || parallelKey || parallelIndex + 1}`
      });
      visit(parallelMachine, parallelAlias, parallelLabel);
      parallelIndex += 1;
    }
  }

  visit(serializedMachine, "P0", serializedMachine.title || "Machine");

  return { participants, relations };
}

function getSequenceTransitionLabel(
  event: string,
  from: string,
  transition: SerializedTransition,
  level?: string
): string {
  let label = `${event}: ${from} -> ${transition.target}`;

  if (level === VISUALIZATION_LEVEL.HIGH) {
    if (transition.guards && transition.guards.length > 0) {
      const guardNames = transition.guards.map((guard) => guard.guard).join(", ");
      if (guardNames.length > 0) {
        label += ` [guard: ${guardNames}]`;
      }
    }

    if (transition.exit && transition.exit.length > 0) {
      const exitNames = transition.exit.map((exitPulse) => exitPulse.pulse).join(", ");
      if (exitNames.length > 0) {
        label += ` [exit: ${exitNames}]`;
      }
    }
  }

  return label;
}

/* 
This function will get a plant uml code, create a plant uml diagram, 
save it to a png file and return the path to the file. 
We will use the plantuml jar file to create the png file.
*/
async function createImageFromPlantUmlCode(
  plantUmlCode: string,
  type: string,
  options: imageFromMachineOptions = {}
): Promise<string> {
  const plantUmlJarPath = path.resolve(__dirname, "../../vendor/plantuml.jar");
  const extension = type === "png" ? "png" : "svg";
  const fileName = (options.fileName || `plantuml-code-${Date.now()}`).replace(
    `.${extension}`,
    ""
  );
  const outDirPath = path.resolve(options.outDir || os.tmpdir());

  // Save the plantUmlCode to a file
  let plantUmlCodeFilePath = path.resolve(os.tmpdir(), `${fileName}.txt`);
  const plantUmlImageFile = path.resolve(
    outDirPath,
    fileName.indexOf(".") !== -1 ? fileName : `${fileName}.${extension}`
  );

  // Create a temp file with the plantUmlCode
  fs.writeFileSync(plantUmlCodeFilePath, plantUmlCode, "utf8");

  // If the plantUmlImageFile already exists, delete it
  if (fs.existsSync(plantUmlImageFile)) {
    fs.unlinkSync(plantUmlImageFile);
  }

  // Use the plant uml jar file to create the png file
  const plantUmlCommand = `java -jar ${plantUmlJarPath} -t${extension} ${plantUmlCodeFilePath} -o ${outDirPath}`;

  // Execute the plant uml command and wait for it to finish
  let timeoutTime = 10000; // 10 seconds
  let now = Date.now();

  await exec(plantUmlCommand);

  // Await the png file to be created
  while (
    !fs.existsSync(plantUmlImageFile) ||
    fs.statSync(plantUmlImageFile).size === 0
  ) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (Date.now() - now > timeoutTime) {
      throw new Error("Timeout waiting for plantuml to create the image");
    }
  }

  // Check if the png file exists
  if (!fs.existsSync(plantUmlImageFile)) {
    throw new Error(
      `PlantUML did not create the png file: ${plantUmlImageFile}`
    );
  }

  // Delete the plantUmlCodeFilePath
  fs.unlinkSync(plantUmlCodeFilePath);

  return plantUmlImageFile;
}

/**
 * This function will get a machine and will return a plant uml code representation of it.
 * @param machine The machine to get the plant uml code from
 * @param optionsOrLevel The level of the machine to get the plant uml code from or options for the image
 * @returns The plant uml code
 * @category Visualization
 */
// MERMAID EXPORT

function getInnerMermaidCode(
  serializedMachine: SerializedMachine,
  options: mermaidOptions,
  parentName = "",
  childLevel = 0
): string {
  let mermaidCode = "";
  let { level } = options;
  const isChild = childLevel > 0;
  const cammelCasedTitle = `${parentName}${toCammelCase(
    serializedMachine.title || ""
  )}`;
  const space = Array.from({ length: childLevel })
    .map(() => "  ")
    .join("");

  // Title is now handled in getMermaidCode

  if (!isChild) {
    mermaidCode += `${getMermaidClassDefinitions().join("\n")}\n\n`;
  }

  const stateNames: Record<string, string> = {};
  const stateTypes: Record<string, string> = {};
  for (const stateName in serializedMachine.states) {
    stateNames[stateName] = isChild
      ? `${cammelCasedTitle}${toCammelCase(stateName)}`
      : stateName;
    stateTypes[stateName] = resolveStateStyleRole(
      serializedMachine.states[stateName].type
    );
  }

  for (const stateName in serializedMachine.states) {
    const state = serializedMachine.states[stateName];
    const stateId = stateNames[stateName];
    mermaidCode += `${space}state "${escapeMermaidLabel(stateName)}" as ${stateId}\n`;
  }

  if (!isChild) {
    for (const stateName in serializedMachine.states) {
      const stateId = stateNames[stateName];
      const stateType = stateTypes[stateName];
      mermaidCode += `${space}class ${stateId} ${getMermaidStateClassName(stateType)}\n`;
    }
  }

  if (Object.keys(serializedMachine.states).length > 0) {
    mermaidCode += '\n';
  }

  let nestedMachines = "";
  for (const stateName in serializedMachine.states) {
    const state = serializedMachine.states[stateName];
    const stateId = stateNames[stateName];

    if (state.nested) {
      nestedMachines += `${space}state ${stateId} {\n`;
      for (let nestedMachine of state.nested) {
        nestedMachines += getInnerMermaidCode(
          nestedMachine.machine,
          options,
          toCammelCase(stateId),
          childLevel + 1
        );
        nestedMachines += `${space}  --\n`;
      }
      nestedMachines = nestedMachines.replace(/\s+--\n$/, "\n") + `${space}}\n`;
    }
  }

  if (nestedMachines.trim().length > 0) {
    mermaidCode += `${nestedMachines}\n`;
  }

  if (Object.keys(serializedMachine.parallel).length > 0) {
    const parallelStateId = `${cammelCasedTitle}ParallelStates`;
    mermaidCode += `${space}state "Parallel states" as ${parallelStateId}\n`;
    mermaidCode += `${space}state ${parallelStateId} {\n`;
    for (const parallel in serializedMachine.parallel) {
      mermaidCode += getInnerMermaidCode(
        serializedMachine.parallel[parallel],
        options,
        cammelCasedTitle,
        childLevel + 1
      );
      mermaidCode += `${space}  --\n`;
    }
    mermaidCode = mermaidCode.replace(/\s+--\n$/, "\n") + `${space}}\n\n`;
  }

  if (level === 'high') {
    for (const stateName in serializedMachine.states) {
      const state = serializedMachine.states[stateName];
      const stateId = stateNames[stateName];
      const noteLines = [];
      if (state.description) {
        if (state.nested) {
          noteLines.push(state.description);
        } else {
          mermaidCode += `${space}${stateId}: ${state.description}\n`;
        }
      }
      const run = [];
      if (state.nested) {
        for (let nestedMachine of state.nested) {
          if (nestedMachine.transition) {
            run.push({
              ...nestedMachine,
              transition: `${titleToId(nestedMachine.machine.title || "")}.${nestedMachine.transition}`
            });
          }
        }
      }
      run.push(...(state.run || []));
      if (state.immediate && state.immediate.length > 0) {
        for (let immediate of state.immediate) {
          if (
            isNestedTransition(immediate.immediate) ||
            isParallelTransition(immediate.immediate)
          ) {
            run.push(immediate);
          }
        }
      }

      if (run.length > 0) {
        let asciiTree = getMermaidTreeLabel(run, 'entry');
        if (asciiTree.length > 0) {
          if (state.nested) {
            noteLines.push(...asciiTree.split('\\n'));
          } else {
            asciiTree = asciiTree.replace(/\\n/g, '<br>');
            mermaidCode += `${space}${stateId}: ${asciiTree}\n`;
          }
        }
      }

      if (noteLines.length > 0) {
        mermaidCode += `${space}note right of ${stateId}\n`;
        for (const line of noteLines) {
          mermaidCode += `${space}  ${line}\n`;
        }
        mermaidCode += `${space}end note\n`;
      }
    }
    mermaidCode += '\n';
  }

  if (serializedMachine.initial) {
    mermaidCode += `${space}[*] --> ${stateNames[serializedMachine.initial] || serializedMachine.initial}\n`;
  }

  for (const stateName in serializedMachine.states) {
    const state = serializedMachine.states[stateName];
    const fromState = stateNames[stateName];

    if (state.on) {
      for (const event in state.on) {
        const transition = state.on[event];
        const toState = stateNames[transition.target] || transition.target;
        
        let label = event;
        
        if (level === 'high') {
          if (transition.guards && transition.guards.length > 0) {
            let guardsTree = getMermaidTreeLabel(transition.guards, 'guard');
            if (guardsTree.length > 0) {
              guardsTree = guardsTree.replace(/\\n/g, '<br>');
              label += `<br>${guardsTree}`;
            }
          }

          if (transition.exit && transition.exit.length > 0) {
            const exitNames = transition.exit.map((exitPulse) => exitPulse.pulse).join(", ");
            if (exitNames.length > 0) {
              label += `<br>[exit: ${exitNames}]`;
            }
          }
        }
        
        mermaidCode += `${space}${fromState} --> ${toState}: ${label}\n`;
      }
    }
  }

  return mermaidCode;
}

export function getMermaidCode(
  serializedMachine: SerializedMachine,
  optionsOrLevel: string | mermaidOptions = MERMAID_THEME.DEFAULT
): string {
  let opts: mermaidOptions =
    typeof optionsOrLevel === "string"
      ? { level: optionsOrLevel }
      : optionsOrLevel;
  let { theme } = opts;

  let mermaidCode = "";
  if (serializedMachine.title) {
    mermaidCode += `---\ntitle: ${serializedMachine.title}\n---\n\n`;
  }
  mermaidCode += `stateDiagram-v2\n`;
  mermaidCode += `direction ${MERMAID_DIRECTION}\n\n`;
  mermaidCode += getInnerMermaidCode(serializedMachine, opts);

  if (theme && theme !== MERMAID_THEME.DEFAULT) {
    mermaidCode += `\n%% Theme: ${theme}\n`;
  }

  return mermaidCode;
}

export function getMermaidSequenceCode(
  serializedMachine: SerializedMachine,
  optionsOrLevel: string | mermaidOptions = VISUALIZATION_LEVEL.LOW
): string {
  let opts: mermaidOptions =
    typeof optionsOrLevel === "string"
      ? { level: optionsOrLevel }
      : optionsOrLevel;

  const data = collectSequenceDiagramData(serializedMachine);
  let mermaidCode = "sequenceDiagram\n";

  for (const participant of data.participants) {
    mermaidCode += `participant ${participant.alias} as ${escapeMermaidSequenceParticipantText(participant.label)}\n`;
  }

  for (const relation of data.relations) {
    const arrow = relation.isReturn ? "-->>" : "->>";
    mermaidCode += `${relation.from}${arrow}${relation.to}: ${escapeMermaidSequenceText(relation.label)}\n`;
  }

  for (const participant of data.participants) {
    for (const stateName in participant.machine.states) {
      const state = participant.machine.states[stateName];
      if (!state.on) {
        continue;
      }

      for (const event in state.on) {
        const transition = state.on[event];
        const label = getSequenceTransitionLabel(event, stateName, transition, opts.level);
        mermaidCode += `${participant.alias}->>${participant.alias}: ${escapeMermaidSequenceText(label)}\n`;
      }
    }
  }

  return mermaidCode;
}

export function getPlantUmlSequenceCode(
  serializedMachine: SerializedMachine,
  optionsOrLevel: string | options = VISUALIZATION_LEVEL.LOW
): string {
  let opts: options =
    typeof optionsOrLevel === "string"
      ? { level: optionsOrLevel }
      : optionsOrLevel;

  const data = collectSequenceDiagramData(serializedMachine);
  let plantUmlCode = "@startuml\n";

  for (const participant of data.participants) {
    plantUmlCode += `participant "${escapePlantUmlSequenceText(participant.label)}" as ${participant.alias}\n`;
  }

  for (const relation of data.relations) {
    const arrow = relation.isReturn ? "-->" : "->";
    plantUmlCode += `${relation.from} ${arrow} ${relation.to}: ${escapePlantUmlSequenceText(relation.label)}\n`;
  }

  for (const participant of data.participants) {
    for (const stateName in participant.machine.states) {
      const state = participant.machine.states[stateName];
      if (!state.on) {
        continue;
      }

      for (const event in state.on) {
        const transition = state.on[event];
        const label = getSequenceTransitionLabel(event, stateName, transition, opts.level);
        plantUmlCode += `${participant.alias} -> ${participant.alias}: ${escapePlantUmlSequenceText(label)}\n`;
      }
    }
  }

  plantUmlCode += "@enduml\n";
  return plantUmlCode;
}

function getAdditionalModel(serializedMachine: SerializedMachine): AdditionalDiagramModel {
  return collectAdditionalDiagramModel(serializedMachine);
}

function plantUmlRectangleSkinparam(extra = ""): string {
  return `skinparam rectangle {\n  RoundCorner 12\n  Shadowing false${extra}\n}\n`;
}

function renderMermaidNodes(model: AdditionalDiagramModel, includeType = false): string {
  let code = "";
  for (const state of model.states) {
    const label = includeType ? `${escapeDiagramLabel(state.name)}\\n${escapeDiagramLabel(state.type)}` : escapeDiagramLabel(state.label);
    const className = includeType ? `:::${state.type}` : "";
    code += `  ${state.alias}["${label}"]${className}\n`;
  }
  return code;
}

function renderPlantUmlNodes(model: AdditionalDiagramModel, includeType = false): string {
  let code = "";
  for (const state of model.states) {
    const label = includeType ? `${escapeDiagramLabel(state.name)}\\n${escapeDiagramLabel(state.type)}` : escapeDiagramLabel(state.label);
    const stereotype = includeType && state.type !== "default" ? ` <<${state.type}>>` : "";
    code += `rectangle "${label}" as ${state.alias}${stereotype}\n`;
  }
  return code;
}

function modelAlias(model: AdditionalDiagramModel, id: string): string {
  const alias = model.aliases[id];
  if (!alias) {
    throw new Error(`Missing diagram alias for id: ${id}`);
  }
  return alias;
}

export function getMermaidPulseMapCode(serializedMachine: SerializedMachine): string {
  const model = getAdditionalModel(serializedMachine);
  let code = "flowchart TD\n";
  code += renderMermaidNodes(model);
  for (const edge of model.pulseEdges) {
    code += `  ${modelAlias(model, edge.from)} -->|"${escapeDiagramLabel(edge.label)}"| ${modelAlias(model, edge.to)}\n`;
  }
  code += "  classDef pulse fill:#eef6ff,stroke:#2f6fed,color:#0b1b3a\n";
  return code;
}

export function getPlantUmlPulseMapCode(serializedMachine: SerializedMachine): string {
  const model = getAdditionalModel(serializedMachine);
  let code = `@startuml\n${plantUmlRectangleSkinparam()}\n`;
  code += renderPlantUmlNodes(model);
  for (const edge of model.pulseEdges) {
    code += `${modelAlias(model, edge.from)} --> ${modelAlias(model, edge.to)} : ${escapeDiagramLabel(edge.label)}\n`;
  }
  code += "@enduml\n";
  return code;
}

export function getMermaidEventMapCode(serializedMachine: SerializedMachine): string {
  const model = getAdditionalModel(serializedMachine);
  let code = "flowchart LR\n";
  code += renderMermaidNodes(model);
  for (const event of model.events) {
    code += `  ${event.alias}{{"event: ${escapeDiagramLabel(event.name)}"}}\n`;
  }
  for (const edge of model.eventEdges) {
    code += `  ${modelAlias(model, edge.from)} --> ${modelAlias(model, edge.eventId)}\n`;
    code += `  ${modelAlias(model, edge.eventId)} -->|"${escapeDiagramLabel(edge.label)}"| ${modelAlias(model, edge.to)}\n`;
  }
  return code;
}

export function getPlantUmlEventMapCode(serializedMachine: SerializedMachine): string {
  const model = getAdditionalModel(serializedMachine);
  let code = `@startuml\n${plantUmlRectangleSkinparam()}\n`;
  for (const event of model.events) {
    code += `rectangle "event: ${escapeDiagramLabel(event.name)}" as ${event.alias}\n`;
  }
  code += renderPlantUmlNodes(model);
  for (const edge of model.eventEdges) {
    code += `${modelAlias(model, edge.from)} --> ${modelAlias(model, edge.eventId)}\n`;
    code += `${modelAlias(model, edge.eventId)} --> ${modelAlias(model, edge.to)} : ${escapeDiagramLabel(edge.label)}\n`;
  }
  code += "@enduml\n";
  return code;
}

export function getMermaidOutcomeMapCode(serializedMachine: SerializedMachine): string {
  const model = getAdditionalModel(serializedMachine);
  let code = "flowchart TD\n";
  code += renderMermaidNodes(model, true);
  for (const edge of model.outcomeEdges) {
    code += `  ${modelAlias(model, edge.from)} -->|"${escapeDiagramLabel(edge.label)}"| ${modelAlias(model, edge.to)}\n`;
  }
  code += "  classDef primary fill:#e8f1ff,stroke:#3164d4\n";
  code += "  classDef warning fill:#fff8db,stroke:#b78b00\n";
  code += "  classDef success fill:#e8f7ed,stroke:#20834d\n";
  code += "  classDef danger fill:#ffecef,stroke:#cf2e46\n";
  code += "  classDef default fill:#f7f7f7,stroke:#777\n";
  return code;
}

export function getPlantUmlOutcomeMapCode(serializedMachine: SerializedMachine): string {
  const model = getAdditionalModel(serializedMachine);
  let code = `@startuml\n${plantUmlRectangleSkinparam()}`;
  code += "skinparam rectangle<<primary>> BackgroundColor #E8F1FF\n";
  code += "skinparam rectangle<<warning>> BackgroundColor #FFF8DB\n";
  code += "skinparam rectangle<<success>> BackgroundColor #E8F7ED\n";
  code += "skinparam rectangle<<danger>> BackgroundColor #FFECEF\n\n";
  code += renderPlantUmlNodes(model, true);
  for (const edge of model.outcomeEdges) {
    code += `${modelAlias(model, edge.from)} --> ${modelAlias(model, edge.to)} : ${escapeDiagramLabel(edge.label)}\n`;
  }
  code += "@enduml\n";
  return code;
}

export function getMermaidImmediateMapCode(serializedMachine: SerializedMachine): string {
  const model = getAdditionalModel(serializedMachine);
  let code = "flowchart TD\n";
  code += renderMermaidNodes(model);
  for (const edge of model.immediateEdges) {
    code += `  ${modelAlias(model, edge.from)} -. "${escapeDiagramLabel(edge.label)}" .-> ${modelAlias(model, edge.to)}\n`;
  }
  return code;
}

export function getPlantUmlImmediateMapCode(serializedMachine: SerializedMachine): string {
  const model = getAdditionalModel(serializedMachine);
  let code = `@startuml\n${plantUmlRectangleSkinparam()}\n`;
  code += renderPlantUmlNodes(model);
  for (const edge of model.immediateEdges) {
    code += `${modelAlias(model, edge.from)} ..> ${modelAlias(model, edge.to)} : ${escapeDiagramLabel(edge.label)}\n`;
  }
  code += "@enduml\n";
  return code;
}

function getGuardDecisionActivitySteps(model: AdditionalDiagramModel): GuardDecision[] {
  return model.guardDecisions;
}

export function getMermaidGuardDecisionMapCode(serializedMachine: SerializedMachine): string {
  const model = getAdditionalModel(serializedMachine);
  const decisions = getGuardDecisionActivitySteps(model);
  let code = "flowchart TD\n";
  code += '  guard_start(["start"])\n';
  code += '  guard_stop(["stop"])\n';

  for (let i = 0; i < decisions.length; i++) {
    const decision = decisions[i];
    const sourceAlias = `guard_${i}_source`;
    const triggerAlias = `guard_${i}_trigger`;
    const decisionAlias = `guard_${i}_decision`;
    const nextAlias = i + 1 < decisions.length ? `guard_${i + 1}_source` : "guard_stop";

    code += `  ${sourceAlias}["state: ${escapeDiagramLabel(decision.sourceLabel)}"]\n`;
    code += `  ${triggerAlias}["${escapeDiagramLabel(decision.triggerLabel)}"]\n`;
    code += `  ${decisionAlias}{"guard: ${escapeDiagramLabel(decision.guardName)}?"}\n`;

    if (decision.successTargetId) {
      code += `  guard_${i}_success["${escapeDiagramLabel(decision.successTargetLabel || "target")}"]\n`;
    }
    if (decision.failureTargetId) {
      code += `  guard_${i}_failure["${escapeDiagramLabel(decision.failureTargetLabel || "failure target")}"]\n`;
    }

    if (i === 0) {
      code += `  guard_start --> ${sourceAlias}\n`;
    }
    code += `  ${sourceAlias} --> ${triggerAlias}\n`;
    code += `  ${triggerAlias} --> ${decisionAlias}\n`;
    if (decision.successTargetId) {
      code += `  ${decisionAlias} -->|"target"| guard_${i}_success\n`;
      code += `  guard_${i}_success --> guard_${i}_join(( ))\n`;
    }
    if (decision.failureTargetId) {
      code += `  ${decisionAlias} -->|"failure target"| guard_${i}_failure\n`;
      code += `  guard_${i}_failure --> guard_${i}_join\n`;
    }
    if (!decision.successTargetId && !decision.failureTargetId) {
      code += `  ${decisionAlias} --> guard_${i}_join(( ))\n`;
    }
    code += `  guard_${i}_join --> ${nextAlias}\n`;
  }

  if (decisions.length === 0) {
    code += "  guard_start --> guard_stop\n";
  }

  return code;
}

export function getPlantUmlGuardDecisionMapCode(serializedMachine: SerializedMachine): string {
  const model = getAdditionalModel(serializedMachine);
  const decisions = getGuardDecisionActivitySteps(model);
  let code = "@startuml\nskinparam activity {\n  RoundCorner 12\n  Shadowing false\n}\n\nstart\n";
  for (const decision of decisions) {
    code += `:state: ${escapeDiagramLabel(decision.sourceLabel)};\n`;
    code += `:${escapeDiagramLabel(decision.triggerLabel)};\n`;
    code += `if (guard: ${escapeDiagramLabel(decision.guardName)}?) then (target)\n`;
    if (decision.successTargetLabel) {
      code += `  :${escapeDiagramLabel(decision.successTargetLabel)};\n`;
    }
    if (decision.failureTargetLabel) {
      code += `else (failure target)\n  :${escapeDiagramLabel(decision.failureTargetLabel)};\n`;
    }
    code += "endif\n";
  }
  code += "stop\n@enduml\n";
  return code;
}

export function getMermaidCompositionMapCode(serializedMachine: SerializedMachine): string {
  const model = getAdditionalModel(serializedMachine);
  let code = "flowchart TD\n";
  for (const machine of model.machines) {
    const label = `${escapeDiagramLabel(machine.label)}${machine.initial ? `\\ninitial: ${escapeDiagramLabel(machine.initial)}` : ""}`;
    code += `  ${machine.alias}[["${label}"]]\n`;
  }
  for (const state of model.states) {
    code += `  ${state.alias}["state: ${escapeDiagramLabel(state.label)}"]\n`;
  }
  for (const edge of model.compositionEdges) {
    code += `  ${modelAlias(model, edge.from)} -->|"${escapeDiagramLabel(edge.label)}"| ${modelAlias(model, edge.to)}\n`;
  }
  return code;
}

export function getPlantUmlCompositionMapCode(serializedMachine: SerializedMachine): string {
  const model = getAdditionalModel(serializedMachine);
  let code = `@startuml\n${plantUmlRectangleSkinparam()}\n`;
  for (const machine of model.machines) {
    const label = `${escapeDiagramLabel(machine.label)}${machine.initial ? `\\ninitial: ${escapeDiagramLabel(machine.initial)}` : ""}`;
    code += `rectangle "${label}" as ${machine.alias}\n`;
  }
  for (const state of model.states) {
    code += `rectangle "state: ${escapeDiagramLabel(state.label)}" as ${state.alias}\n`;
  }
  for (const edge of model.compositionEdges) {
    code += `${modelAlias(model, edge.from)} --> ${modelAlias(model, edge.to)} : ${escapeDiagramLabel(edge.label)}\n`;
  }
  code += "@enduml\n";
  return code;
}

function formatPoint(value: number): string {
  return value.toFixed(2);
}

function formatMermaidPoint(value: number): string {
  return value === 1 ? "1" : formatPoint(value);
}

function pointQuadrant(point: ComplexityPoint): "Q1" | "Q2" | "Q3" | "Q4" {
  if (point.x >= 0.5 && point.y >= 0.5) return "Q1";
  if (point.x < 0.5 && point.y >= 0.5) return "Q2";
  if (point.x < 0.5 && point.y < 0.5) return "Q3";
  return "Q4";
}

interface ComplexityLayoutPoint {
  point: ComplexityPoint;
  x: number;
  y: number;
  quadrant: "Q1" | "Q2" | "Q3" | "Q4";
}

function maxComplexityLoads(points: ComplexityPoint[]): { transitionLoad: number; actionLoad: number } {
  let transitionLoad = 0;
  let actionLoad = 0;
  for (const point of points) {
    if (point.transitionLoad > transitionLoad) {
      transitionLoad = point.transitionLoad;
    }
    if (point.actionLoad > actionLoad) {
      actionLoad = point.actionLoad;
    }
  }
  return { transitionLoad, actionLoad };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function quadrantBounds(quadrant: "Q1" | "Q2" | "Q3" | "Q4"): { minX: number; maxX: number; minY: number; maxY: number } {
  const lowMin = 0.06;
  const lowMax = 0.44;
  const highMin = 0.56;
  const highMax = 0.94;

  if (quadrant === "Q1") return { minX: highMin, maxX: highMax, minY: highMin, maxY: highMax };
  if (quadrant === "Q2") return { minX: lowMin, maxX: lowMax, minY: highMin, maxY: highMax };
  if (quadrant === "Q3") return { minX: lowMin, maxX: lowMax, minY: lowMin, maxY: lowMax };
  return { minX: highMin, maxX: highMax, minY: lowMin, maxY: lowMax };
}

function shortenPointLabel(label: string): string {
  const escaped = escapeDiagramLabel(label);
  return escaped.length > 22 ? `${escaped.slice(0, 21)}…` : escaped;
}

function pointImportance(point: ComplexityPoint): number {
  return point.transitionLoad + point.actionLoad;
}

function sortedComplexityPoints(points: ComplexityPoint[]): ComplexityPoint[] {
  return points.slice().sort((a, b) => {
    const importance = pointImportance(b) - pointImportance(a);
    return importance !== 0 ? importance : a.label.localeCompare(b.label);
  });
}

function sortedComplexityLayoutPoints(points: ComplexityLayoutPoint[]): ComplexityLayoutPoint[] {
  return points.slice().sort((a, b) => {
    const importance = pointImportance(b.point) - pointImportance(a.point);
    return importance !== 0 ? importance : a.point.label.localeCompare(b.point.label);
  });
}

function localComplexityPosition(point: ComplexityLayoutPoint): { x: number; y: number } {
  return {
    x: point.quadrant === "Q1" || point.quadrant === "Q4" ? (point.x - 0.5) / 0.5 : point.x / 0.5,
    y: point.quadrant === "Q1" || point.quadrant === "Q2" ? (point.y - 0.5) / 0.5 : point.y / 0.5
  };
}

function globalComplexityPosition(quadrant: "Q1" | "Q2" | "Q3" | "Q4", localX: number, localY: number): { x: number; y: number } {
  return {
    x: quadrant === "Q1" || quadrant === "Q4" ? 0.5 + localX * 0.5 : localX * 0.5,
    y: quadrant === "Q1" || quadrant === "Q2" ? 0.5 + localY * 0.5 : localY * 0.5
  };
}

function quantizeComplexityPoint(point: ComplexityLayoutPoint, quadrantHeight: number, quadrantWidth: number): ComplexityLayoutPoint {
  const local = localComplexityPosition(point);
  const column = Math.min(quadrantWidth - 2, Math.max(1, Math.round(local.x * (quadrantWidth - 2))));
  const rowFromBottom = Math.min(quadrantHeight - 1, Math.max(0, Math.round(local.y * (quadrantHeight - 1))));
  const display = globalComplexityPosition(point.quadrant, column / (quadrantWidth - 2), rowFromBottom / (quadrantHeight - 1));

  return { ...point, x: display.x, y: display.y };
}

function packComplexityRows(points: ComplexityLayoutPoint[], quadrantHeight: number, quadrantWidth: number): ComplexityLayoutPoint[] {
  const byQuadrant: Record<string, ComplexityLayoutPoint[]> = { Q1: [], Q2: [], Q3: [], Q4: [] };
  for (const point of points) {
    byQuadrant[point.quadrant].push(point);
  }

  const byStateId: Record<string, ComplexityLayoutPoint> = {};
  for (const quadrant of ["Q1", "Q2", "Q3", "Q4"] as const) {
    const minBulletRow = 1;
    const usedRows = Array.from({ length: quadrantHeight }).map(() => false);
    const candidates = byQuadrant[quadrant].map((point) => {
      const local = localComplexityPosition(point);
      const preferredRowFromBottom = Math.min(quadrantHeight - 1, Math.max(0, Math.round(local.y * (quadrantHeight - 1))));
      return {
        point,
        preferredRow: Math.min(quadrantHeight - 2, Math.max(minBulletRow, quadrantHeight - 1 - preferredRowFromBottom))
      };
    }).sort((a, b) => {
      if (a.preferredRow !== b.preferredRow) return a.preferredRow - b.preferredRow;
      const importance = pointImportance(b.point.point) - pointImportance(a.point.point);
      return importance !== 0 ? importance : a.point.point.label.localeCompare(b.point.point.label);
    });
    for (const candidate of candidates) {
      const point = candidate.point;
      const local = localComplexityPosition(point);
      const row = nearestFreeRowPair(candidate.preferredRow, usedRows, quadrantHeight, minBulletRow);
      const column = Math.min(quadrantWidth - 2, Math.max(1, Math.round(local.x * (quadrantWidth - 2))));

      if (row === undefined) {
        byStateId[point.point.stateId] = quantizeComplexityPoint(point, quadrantHeight, quadrantWidth);
        continue;
      }

      usedRows[row] = true;
      usedRows[row + 1] = true;
      const localY = (quadrantHeight - 1 - row) / (quadrantHeight - 1);
      const display = globalComplexityPosition(quadrant, column / (quadrantWidth - 2), localY);
      byStateId[point.point.stateId] = { ...point, x: display.x, y: display.y };
    }
  }

  return points.map((point) => byStateId[point.point.stateId]);
}

function layoutComplexityPoints(points: ComplexityPoint[]): ComplexityLayoutPoint[] {
  const groups: Record<string, ComplexityPoint[]> = {};
  for (const point of points) {
    const key = `${pointQuadrant(point)}:${formatPoint(point.x)},${formatPoint(point.y)}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(point);
  }

  const byStateId: Record<string, ComplexityLayoutPoint> = {};
  for (const key in groups) {
    const collisionGroup = sortedComplexityPoints(groups[key]);
    for (let index = 0; index < collisionGroup.length; index++) {
      const point = collisionGroup[index];
      const quadrant = pointQuadrant(point);
      const bounds = quadrantBounds(quadrant);
      let x = clamp(point.x, bounds.minX, bounds.maxX);
      let y = clamp(point.y, bounds.minY, bounds.maxY);

      if (collisionGroup.length > 1) {
        const step = (index + 1) / (collisionGroup.length + 1);
        x = bounds.minX + ((bounds.maxX - bounds.minX) * step);
        y = bounds.minY + ((bounds.maxY - bounds.minY) * step);
      }

      byStateId[point.stateId] = { point, x, y, quadrant };
    }
  }

  const layout = points.map((point) => byStateId[point.stateId]);
  const byQuadrant = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  for (const point of layout) {
    byQuadrant[point.quadrant] += 1;
  }
  const quadrantHeight = Math.max(5, Math.max(byQuadrant.Q1, byQuadrant.Q2, byQuadrant.Q3, byQuadrant.Q4) * 2 + 2);
  return packComplexityRows(layout, quadrantHeight, 34);
}

function nearestFreeRowPair(preferred: number, usedRows: boolean[], rowLimit: number, minBulletRow = 0): number | undefined {
  const maxBulletRow = rowLimit - 2;
  const clampedPreferred = Math.min(maxBulletRow, Math.max(minBulletRow, preferred));
  for (let distance = 0; distance < rowLimit; distance++) {
    const before = clampedPreferred - distance;
    if (before >= minBulletRow && before < rowLimit - 1 && !usedRows[before] && !usedRows[before + 1]) {
      return before;
    }
    const after = clampedPreferred + distance;
    if (after < rowLimit - 1 && !usedRows[after] && !usedRows[after + 1]) {
      return after;
    }
  }
  return undefined;
}

function renderQuadrantBox(title: string, alias: string, points: ComplexityLayoutPoint[], height: number): string {
  const width = 34;
  const sortedPoints = sortedComplexityLayoutPoints(points);
  const rows: string[][] = [];
  for (let row = 0; row < height; row++) {
    rows.push(Array.from({ length: width }).map(() => " "));
  }

  for (const point of sortedPoints) {
    const { x: localX, y: localY } = localComplexityPosition(point);
    let column = Math.min(width - 2, Math.max(1, Math.round(localX * (width - 2))));
    let rowFromBottom = Math.min(height - 1, Math.max(0, Math.round(localY * (height - 1))));
    const row = height - 1 - rowFromBottom;
    if (row < 0 || row >= height - 1) {
      continue;
    }
    const label = shortenPointLabel(point.point.label);
    const labelColumn = Math.min(width - label.length - 1, Math.max(1, column - Math.floor(label.length / 2)));
    rows[row][column] = "●";
    for (let i = 0; i < label.length && labelColumn + i < width; i++) {
      rows[row + 1][labelColumn + i] = label[i];
    }
  }

  let box = `${title}\\n\\nActions ↑\\n`;
  box += "┌──────────────────────────────────┐\\n";
  for (const row of rows) {
    box += `│${row.join("")}│\\n`;
  }
  box += "└──────────────────────────────────┘\\nTransitions →";
  return `rectangle "${box}" as ${alias}\n`;
}

export function getMermaidComplexityMapCode(serializedMachine: SerializedMachine): string {
  const model = getAdditionalModel(serializedMachine);
  const maxLoads = maxComplexityLoads(model.complexityPoints);
  const points = layoutComplexityPoints(model.complexityPoints);
  let code = "quadrantChart\n";
  code += `  title State complexity map (max transitions: ${maxLoads.transitionLoad}, max actions: ${maxLoads.actionLoad})\n`;
  code += "  x-axis Few transitions --> Many transitions\n";
  code += "  y-axis Few actions --> Many actions\n";
  code += "  quadrant-1 Many actions / many transitions\n";
  code += "  quadrant-2 Many actions / few transitions\n";
  code += "  quadrant-3 Few actions / few transitions\n";
  code += "  quadrant-4 Few actions / many transitions\n";
  for (const point of points) {
    code += `  ${escapeDiagramLabel(point.point.label)}: [${formatMermaidPoint(point.x)}, ${formatMermaidPoint(point.y)}]\n`;
  }
  return code;
}

export function getPlantUmlComplexityMapCode(serializedMachine: SerializedMachine): string {
  const model = getAdditionalModel(serializedMachine);
  const maxLoads = maxComplexityLoads(model.complexityPoints);
  const groups: Record<string, ComplexityLayoutPoint[]> = { Q1: [], Q2: [], Q3: [], Q4: [] };
  for (const point of layoutComplexityPoints(model.complexityPoints)) {
    groups[point.quadrant].push(point);
  }
  const tallestQuadrant = Math.max(groups.Q1.length, groups.Q2.length, groups.Q3.length, groups.Q4.length);
  const quadrantHeight = Math.max(5, tallestQuadrant * 2 + 2);
  let code = `@startuml\n${plantUmlRectangleSkinparam("\n  FontName Monospaced")}\n`;
  code += `title State complexity map\\nMax transition load: ${maxLoads.transitionLoad}\\nMax action load: ${maxLoads.actionLoad}\n`;
  code += renderQuadrantBox("MANY ACTIONS / FEW TRANSITIONS", "Q2", groups.Q2, quadrantHeight);
  code += renderQuadrantBox("MANY ACTIONS / MANY TRANSITIONS", "Q1", groups.Q1, quadrantHeight);
  code += renderQuadrantBox("FEW ACTIONS / FEW TRANSITIONS", "Q3", groups.Q3, quadrantHeight);
  code += renderQuadrantBox("FEW ACTIONS / MANY TRANSITIONS", "Q4", groups.Q4, quadrantHeight);
  code += "Q2 -[hidden]right- Q1\n";
  code += "Q3 -[hidden]right- Q4\n";
  code += "Q2 -[hidden]down- Q3\n";
  code += "Q1 -[hidden]down- Q4\n";
  code += "@enduml\n";
  return code;
}

export function getMermaidCodeFromMachine(
  machine: Machine,
  optionsOrLevel: string | mermaidOptions = MERMAID_THEME.DEFAULT
): string {
  return getMermaidCode(serialize(machine), optionsOrLevel);
}

export function getPlantUmlCodeFromMachine(
  machine: Machine,
  optionsOrLevel: string | options = VISUALIZATION_LEVEL.LOW
): string {
  return getPlantUmlCode(serialize(machine), optionsOrLevel);
}

/**
 * Create a png file from a plant uml code
 * @param plantUmlCode The plant uml code
 * @param options Options for the image
 * @returns The path to the png file
 * @category Visualization
 **/
export async function createPngFromPlantUmlCode(
  plantUmlCode: string,
  options: imageFromMachineOptions = {}
): Promise<string> {
  return createImageFromPlantUmlCode(plantUmlCode, "png", options);
}

/**
 * Create a svg file from a plant uml code
 * @param plantUmlCode The plant uml code
 * @param options Options for the image
 * @returns The path to the svg file
 * @category Visualization
 */
export async function createSvgFromPlantUmlCode(
  plantUmlCode: string,
  options: imageFromMachineOptions = {}
): Promise<string> {
  return createImageFromPlantUmlCode(plantUmlCode, "svg", options);
}

/**
 * Create a png file from a machine
 * @param machine The machine to get the plant uml code from
 * @param optionsOrLevel The level of the machine to get the plant uml code from or options for the image
 * @returns The path to the png file
 * @category Visualization
 */
export function createPngFromMachine(
  machine: Machine,
  optionsOrLevel: string | imageFromMachineOptions = VISUALIZATION_LEVEL.LOW
): Promise<string> {
  let options: imageFromMachineOptions =
    typeof optionsOrLevel === "string"
      ? { level: optionsOrLevel }
      : optionsOrLevel;
  return createPngFromPlantUmlCode(
    getPlantUmlCodeFromMachine(machine, optionsOrLevel),
    options
  );
}

/**
 * Create a svg file from a SerializedMachine
 * @param serialized The serialized machine to get the plant uml code from
 * @param optionsOrLevel The level of the machine to get the plant uml code from or options for the image
 * @returns The path to the svg file
 * @category Visualization
 */
export async function createSvgFromSerializedMachine(
  serialized: SerializedMachine,
  optionsOrLevel: string | imageFromMachineOptions = VISUALIZATION_LEVEL.LOW
): Promise<string> {
  let options: imageFromMachineOptions =
    typeof optionsOrLevel === "string"
      ? { level: optionsOrLevel }
      : optionsOrLevel;
  const plantUmlCode = getPlantUmlCode(serialized, options);
  return createSvgFromPlantUmlCode(plantUmlCode, options);
}

/**
 * Create a png file from a SerializedMachine
 * @param serialized The serialized machine to get the plant uml code from
 * @param optionsOrLevel The level of the machine to get the plant uml code from or options for the image
 * @returns The path to the png file
 * @category Visualization
 */
export async function createPngFromSerializedMachine(
  serialized: SerializedMachine,
  optionsOrLevel: string | imageFromMachineOptions = VISUALIZATION_LEVEL.LOW
): Promise<string> {
  let options: imageFromMachineOptions =
    typeof optionsOrLevel === "string"
      ? { level: optionsOrLevel }
      : optionsOrLevel;
  const plantUmlCode = getPlantUmlCode(serialized, options);
  return createPngFromPlantUmlCode(plantUmlCode, options);
}

/**
 * Create a svg file from a machine
 * @param machine The machine to get the plant uml code from
 * @param optionsOrLevel The level of the machine to get the plant uml code from or options for the image
 * @returns The path to the svg file
 * @category Visualization
 */
export function createSvgFromMachine(
  machine: Machine,
  optionsOrLevel: string | imageFromMachineOptions = VISUALIZATION_LEVEL.LOW
): Promise<string> {
  let options: imageFromMachineOptions =
    typeof optionsOrLevel === "string"
      ? { level: optionsOrLevel }
      : optionsOrLevel;
  return createSvgFromPlantUmlCode(
    getPlantUmlCodeFromMachine(machine, optionsOrLevel),
    options
  );
}

// Taken from https://github.com/jessitron/stringify-tree/blob/master/index.ts
// And modified to work with the type of the tree that we need
/**
 * Turn a tree structure into an ASCII string.
 * This is generic: I don't care what your tree node type is, as long as you can get me
 * its name and its children.
 *
 * @param tn top-level tree node
 * @param nameFn how to calculate the name of a tree node
 * @param childrenFn how to get the children of a tree node
 */
function stringifyTree<T>(
  tn: T,
  nameFn: (t: T) => string,
  childrenFn: (t: T) => T[] | null
): string {
  function prefixChild(strs: string[], last: boolean): string[] {
    return strs.map((s, i) => {
      const prefix = i === 0 ? (last ? "└" : "├") : last ? " " : "│";
      return prefix + s;
    });
  }
  function nodeToStrings(tn: T): string[] {
    const origChildren = childrenFn(tn) || [];
    const children = [...origChildren]; // copy the array
    if (children.length === 0) {
      return [" " + nameFn(tn)];
    }

    let name = nameFn(tn);
    let arr = [];

    if (name && name !== "") {
      arr.push("┬ " + name);
    }

    let prefixedChildren = children
      .map((c, i) => {
        const strs = nodeToStrings(c);
        return prefixChild(strs, i === children.length - 1);
      })
      .flat();

    return arr.concat(prefixedChildren);
  }

  return nodeToStrings(tn).join("\n");
}

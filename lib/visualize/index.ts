import { SerializedAction, SerializedGuard, SerializedMachine, SerializedNestedMachine, SerializedProducer, serialize } from '../serialize';
import { isNestedMachineDirective, isValidObject, isValidString } from '../utils';

import { Machine } from '../machine/interfaces';
import { exec } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

interface SerializedCollectionWithGuards extends Array<SerializedGuard | SerializedAction | SerializedProducer | SerializedNestedMachine> {}

export const VISUALIZATION_LEVEL = {
  LOW: 'low',
  HIGH: 'high'
};

interface options {
  level?: string;
  skinparam?: string;
}

interface imageFromPlantUmlCodeOptions {
  outDir?: string;
  fileName?: string;
}

interface imageFromMachineOptions extends options, imageFromPlantUmlCodeOptions {}

const toCammelCase = (str: string) =>
  str
    .replace(/(^\w)/g, ($1) => $1.toUpperCase())
    .replace(/\s(.)/g, ($1) => $1.toUpperCase())
    .replace(/\W/g, '');

function getInnerPlantUmlCode(serializedMachine: SerializedMachine, options: options, parentName = '', childLevel = 0): string {
  let plantUmlCode = '';
  let { level } = options;
  const isChild = childLevel > 0;
  const cammelCasedTitle = toCammelCase(`${parentName}${toCammelCase(serializedMachine.title || '')}`);
  const space = Array.from({ length: childLevel })
    .map(() => '  ')
    .join('');

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
    stateNames[stateName] = isChild ? `${cammelCasedTitle}${cammelCased}` : stateName;
  }

  // Add the states
  let states = '';
  for (const stateName in serializedMachine.states) {
    const state = serializedMachine.states[stateName];
    if (isChild) {
      states += `${space}state "${stateName}" as ${stateNames[stateName]}`;
    } else {
      states += `${space}state ${stateName}`;
    }
    states += `<<${state.type}>>\n`;
  }

  if (states.trim().length > 0) {
    plantUmlCode += `${space}${states.trim()}\n`;
  }

  // Add nested machines if they exist
  let nestedMachines = '';
  for (const stateName in serializedMachine.states) {
    const state = serializedMachine.states[stateName];

    if (state.nested) {
      nestedMachines += `\n${space}state ${stateNames[stateName]} {\n`;
      for (let nested of state.nested) {
        let innerPlantUmlCode = getInnerPlantUmlCode(nested.machine, options, toCammelCase(stateNames[stateName]), childLevel + 1);
        nestedMachines += innerPlantUmlCode + `\n${space}  ||\n\n`;
      }
      nestedMachines = nestedMachines.replace(/\n\s+\|\|\n\n$/, '\n') + `${space}}\n`;
    }
  }

  if (nestedMachines.trim().length > 0) {
    plantUmlCode += `\n${space}${nestedMachines.trim()}\n`;
  }

  if (level === VISUALIZATION_LEVEL.HIGH) {
    // Add the state descriptions
    let stateDescriptionsPlantUmlCode = '';

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

  // If visualization level is high, add the actions, producers and transitions
  let highData = '';
  if (level === VISUALIZATION_LEVEL.HIGH) {
    // Add the actions, producers and transitions
    for (const stateName in serializedMachine.states) {
      const state = serializedMachine.states[stateName];
      const run = [];

      // Add the nested transitions first if they exist
      if (state.nested) {
        for (let nested of state.nested) {
          if (nested.transition) {
            let nestedCammelCasedTitle = toCammelCase(nested.machine.title || '');
            let nestedTransition = `${nestedCammelCasedTitle}.${nested.transition}`;
            run.push({ ...nested, transition: nestedTransition });
          }
        }
      }

      run.push(...(state.run || []));

      let asciiTree = getAsciiTree(run);
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
  let transitions = '';
  // Add the initial transition
  transitions += `\n${space}[*] --> ${stateNames[serializedMachine.initial]}\n`;

  for (const stateName in serializedMachine.states) {
    const state = serializedMachine.states[stateName];
    if (state.on) {
      for (const transitionName in state.on) {
        const stateTargetName = stateNames[state.on[transitionName].target];
        const stateTarget = serializedMachine.states[state.on[transitionName].target];
        let arrow = '';
        switch (stateTarget.type) {
          case 'danger':
            arrow = '#indianred';
            break;
          case 'info':
            arrow = '#skyblue';
            break;
          case 'warning':
            arrow = '#tan';
            break;
          case 'success':
            arrow = '#mediumseagreen';
            break;
          case 'primary':
            arrow = '#lightsteelblue';
            break;
          default:
            arrow = '#slategray';
            break;
        }

        let isImmediate = transitionName === state.immediate;

        if (isImmediate) {
          arrow += ',dashed';
        }

        transitions += `${space}${stateNames[stateName]} -[${arrow}]-> ${stateTargetName}: ${transitionName}`;

        // If visualization level is high, add the guards
        if (level === VISUALIZATION_LEVEL.HIGH) {
          if (state.on[transitionName].guards) {
            let asciiTree = getAsciiTree(state.on[transitionName].guards || []);
            if (asciiTree.length) {
              transitions += `\\n${asciiTree}`;
            }
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

/***
This function will get a serialized machine and will return a visualization of the machine in plantuml format.
***/
export function getPlantUmlCode(serializedMachine: SerializedMachine, optionsOrLevel: string | options = VISUALIZATION_LEVEL.LOW): string {
  let opts: options = typeof optionsOrLevel === 'string' ? { level: optionsOrLevel } : optionsOrLevel;
  let { skinparam } = opts;

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
  BackgroundColor<<danger>> Implementation
  BorderColor<<danger>> indianred
  BackgroundColor<<info>> Application
  BorderColor<<info>> skyblue
  BackgroundColor<<warning>> Strategy
  BorderColor<<warning>> tan
  BackgroundColor<<success>> Technology
  BorderColor<<success>> mediumseagreen
  BackgroundColor<<primary>> Motivation
  BorderColor<<primary>> lightsteelblue
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

/***
This function will get a collection of guards, producers and actions and will return a ascii art tree representation of them.

Example:
let collection = [
{
  guard: "titleIsValid",
  failure: {
    producer: "updateError"
  }
},
{
  action: "saveTitle",
  success: "preview",
  failure: {
    producer: "updateError",
    transition: "error"
  }
}
]
let result = "G:'titleIsValid'\n│ └failure\n│   └M:'updateError'\n└A:'saveTitle'\n  ├success\n  │ └T:'preview'\n  └failure\n    ├M:'updateError'\n    └T:'error"

***/
export function getAsciiTree(collection: SerializedCollectionWithGuards): string {
  if (collection.length === 0) {
    return '';
  }
  let tree = {
    name: '',
    children: [] as any
  };

  let name = (type: string) => (value: string) => `${type}:${value}`;
  let guard = name('G');
  let action = name('A');
  let producer = name('P');
  let transition = name('T');

  for (let i = 0, l = collection.length; i < l; i++) {
    const item = collection[i];
    let obj = {
      children: [] as any
    } as any;

    if ('guard' in item) {
      obj.name = guard(item.guard);
    }
    if ('action' in item) {
      obj.name = action(item.action);
    }
    if ('producer' in item) {
      obj.name = producer(item.producer);
    }

    if ('success' in item) {
      let child = {
        name: `success`,
        children: [] as any
      } as any;

      if (typeof item.success === 'string') {
        child.children.push({ name: transition(item.success) });
      } else if (typeof item.success === 'object') {
        child.children.push({ name: producer(item.success.producer) });
        if (item.success.transition) {
          child.children.push({ name: transition(item.success.transition) });
        }
      }
      obj.children.push(child);
    }

    if ('failure' in item) {
      let child = {
        name: `failure`,
        children: [] as any
      } as any;

      if (typeof item.failure === 'string') {
        child.children.push({ name: transition(item.failure) });
      } else if (typeof item.failure === 'object') {
        child.children.push({ name: producer(item.failure.producer) });
        if (item.failure.transition) {
          child.children.push({ name: transition(item.failure.transition) });
        }
      }
      obj.children.push(child);
    }

    if (isNestedMachineDirective(item) && isValidString(item.transition)) {
      obj.name = transition(item.transition);
    }

    tree.children.push(obj);
  }

  return stringifyTree(
    tree,
    (t) => t.name,
    (t) => t.children
  ).replace(/\n/g, '\\n');
}

/* 
This function will get a plant uml code, create a plant uml diagram, 
save it to a png file and return the path to the file. 
We will use the plantuml jar file to create the png file.
*/
async function getImageFromPlantUmlCode(plantUmlCode: string, type: string, options: imageFromMachineOptions = {}): Promise<string> {
  const plantUmlJarPath = path.resolve(__dirname, '../../vendor/plantuml.jar');
  const extension = type === 'png' ? 'png' : 'svg';
  const fileName = (options.fileName || `plantuml-code-${Date.now()}`).replace(`.${extension}`, '');
  const outDirPath = path.resolve(process.cwd(), options.outDir || './');

  // Save the plantUmlCode to a file
  let plantUmlCodeFilePath = path.resolve(os.tmpdir(), `${fileName}.txt`);
  const plantUmlImageFile = path.resolve(outDirPath, fileName.indexOf('.') !== -1 ? fileName : `${fileName}.${extension}`);

  // Create a temp file with the plantUmlCode
  fs.writeFileSync(plantUmlCodeFilePath, plantUmlCode, 'utf8');

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
  while (!fs.existsSync(plantUmlImageFile) || fs.statSync(plantUmlImageFile).size === 0) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (Date.now() - now > timeoutTime) {
      throw new Error('Timeout waiting for plantuml to create the image');
    }
  }

  // Check if the png file exists
  if (!fs.existsSync(plantUmlImageFile)) {
    throw new Error(`PlantUML did not create the png file: ${plantUmlImageFile}`);
  }

  // Delete the plantUmlCodeFilePath
  fs.unlinkSync(plantUmlCodeFilePath);

  return plantUmlImageFile;
}

// Create a png file from a plant uml code
export async function createPngFromPlantUmlCode(plantUmlCode: string, options: imageFromMachineOptions = {}): Promise<string> {
  return getImageFromPlantUmlCode(plantUmlCode, 'png', options);
}

// Create a svg file from a plant uml code
export async function createSvgFromPlantUmlCode(plantUmlCode: string, options: imageFromMachineOptions = {}): Promise<string> {
  return getImageFromPlantUmlCode(plantUmlCode, 'svg', options);
}

export function createPlantUmlStringFromMachine(machine: Machine, optionsOrLevel: string | options = VISUALIZATION_LEVEL.LOW): string {
  return getPlantUmlCode(serialize(machine), optionsOrLevel);
}

export function createPngFromMachine(machine: Machine, optionsOrLevel: string | imageFromMachineOptions = VISUALIZATION_LEVEL.LOW): Promise<string> {
  let options: imageFromMachineOptions = typeof optionsOrLevel === 'string' ? { level: optionsOrLevel } : optionsOrLevel;
  return createPngFromPlantUmlCode(createPlantUmlStringFromMachine(machine, optionsOrLevel), options);
}

export function createSvgFromMachine(machine: Machine, optionsOrLevel: string | imageFromMachineOptions = VISUALIZATION_LEVEL.LOW): Promise<string> {
  let options: imageFromMachineOptions = typeof optionsOrLevel === 'string' ? { level: optionsOrLevel } : optionsOrLevel;
  return createSvgFromPlantUmlCode(createPlantUmlStringFromMachine(machine, optionsOrLevel), options);
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
export function stringifyTree<T>(tn: T, nameFn: (t: T) => string, childrenFn: (t: T) => T[] | null): string {
  function prefixChild(strs: string[], last: boolean): string[] {
    return strs.map((s, i) => {
      const prefix = i === 0 ? (last ? '└' : '├') : last ? ' ' : '│';
      return prefix + s;
    });
  }
  function nodeToStrings(tn: T): string[] {
    const origChildren = childrenFn(tn) || [];
    const children = [...origChildren]; // copy the array
    if (children.length === 0) {
      return [' ' + nameFn(tn)];
    }

    let name = nameFn(tn);
    let arr = [];

    if (name && name !== '') {
      arr.push('┬ ' + name);
    }

    let prefixedChildren = children
      .map((c, i) => {
        const strs = nodeToStrings(c);
        return prefixChild(strs, i === children.length - 1);
      })
      .flat();

    return arr.concat(prefixedChildren);
  }

  return nodeToStrings(tn).join('\n');
}

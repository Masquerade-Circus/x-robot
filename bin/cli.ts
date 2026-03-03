#!/usr/bin/env node

/**
 * X-Robot CLI - Documentation generator for state machines
 */

import { documentate, generatePlantUml, generateJson } from '../lib/documentate';
import { machine, state, transition, init, initial } from '../lib';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  if (!command) {
    console.log(`
X-Robot CLI - Documentation Generator

Usage:
  x-robot documentate <file> [options]
  x-robot visualize <machine>
  x-robot json <machine>

Options:
  --output, -o     Output directory (default: ./docs)
  --format, -f     Format: json, svg, png, all (default: all)
  --level, -l     Visualization level: low, high (default: high)
  --help, -h      Show this help message

Examples:
  x-robot documentate my-machine.ts --output ./docs
  x-robot documentate my-machine.ts --format svg --level high
  x-robot visualize myMachine --output ./media
`);
    process.exit(0);
  }

  if (command === 'documentate') {
    await handleDocumentate(args.slice(1));
  } else if (command === 'visualize') {
    await handleVisualize(args.slice(1));
  } else if (command === 'json') {
    handleJson(args.slice(1));
  } else {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
  }
}

async function handleDocumentate(args: string[]) {
  const file = args[0];
  let output = './docs';
  let format: 'json' | 'svg' | 'png' | 'all' = 'all';
  let level: 'low' | 'high' = 'high';

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--output' || arg === '-o') {
      output = args[++i];
    } else if (arg === '--format' || arg === '-f') {
      format = args[++i] as any;
    } else if (arg === '--level' || arg === '-l') {
      level = args[++i] as any;
    }
  }

  if (!file) {
    console.error('Error: Please specify a machine file');
    process.exit(1);
  }

  console.log(`Generating documentation for ${file}...`);
  console.log(`Output: ${output}`);
  console.log(`Format: ${format}`);
  console.log(`Level: ${level}`);

  try {
    const filePath = path.resolve(file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    const machineMatch = fileContent.match(/machine\s*\(\s*['"]([^'"]+)['"]/);
    const machineName = machineMatch ? machineMatch[1] : 'unnamed';
    
    const myMachine = machine(
      machineName,
      init(initial('idle')),
      state('idle', transition('next', 'active')),
      state('active', transition('next', 'idle'))
    );

    const result = await documentate(myMachine, {
      output,
      format,
      level
    });

    console.log('\nGenerated files:');
    result.files.forEach(f => console.log(`  - ${f}`));
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

async function handleVisualize(args: string[]) {
  const machineName = args[0];
  let output = './media';
  let format: 'svg' | 'png' = 'svg';

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--output' || arg === '-o') {
      output = args[++i];
    } else if (arg === '--format' || arg === '-f') {
      format = args[++i] as any;
    }
  }

  console.log(`Generating visualization for ${machineName}...`);

  const myMachine = machine(
    machineName || 'Visualization',
    init(initial('idle')),
    state('idle', transition('next', 'active')),
    state('active', transition('next', 'idle'))
  );

  const result = await documentate(myMachine, {
    output,
    format,
    level: 'high'
  });

  console.log('\nGenerated files:');
  result.files.forEach(f => console.log(`  - ${f}`));
  console.log('\nDone!');
}

function handleJson(args: string[]) {
  const machineName = args[0];

  const myMachine = machine(
    machineName || 'Machine',
    init(initial('idle')),
    state('idle', transition('next', 'active')),
    state('active', transition('next', 'idle'))
  );

  const json = generateJson(myMachine);
  console.log(json);
}

main().catch(console.error);

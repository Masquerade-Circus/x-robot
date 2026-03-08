import { mkdtemp, readdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join, relative } from "path";
import { pathToFileURL } from "url";

const DEFAULT_DOCS_DIR = join(process.cwd(), "docs");
const EXCLUDE_DIRS = new Set(["api", "plans"]);
const ROOT_DIR = process.cwd();
const MERMAID_OPTIONS = { format: "mermaid", level: "high" } as const;
const MERMAID_START = "__X_ROBOT_MERMAID_START__";
const MERMAID_END = "__X_ROBOT_MERMAID_END__";

export function getDiagramModuleUrls(rootDir = ROOT_DIR): {
  xRobotUrl: string;
  documentateUrl: string;
} {
  return {
    xRobotUrl: pathToFileURL(join(rootDir, "lib/index.ts")).href,
    documentateUrl: pathToFileURL(join(rootDir, "lib/documentate/index.ts")).href,
  };
}

export interface FenceBlock {
  language: string;
  code: string;
  raw: string;
  startIndex: number;
  endIndex: number;
  blockIndex: number;
}

export interface MachineExample extends FenceBlock {
  exampleIndex: number;
  machineVariableNames: string[];
  targetVariableName: string;
}

export interface MarkdownUpdateResult {
  updated: boolean;
  reason: string;
  content: string;
}

export interface DiagramProcessOptions {
  force?: boolean;
}

export interface ExampleProcessResult {
  filePath: string;
  relPath: string;
  exampleIndex: number;
  targetVariableName: string;
  status: "updated" | "unchanged" | "skipped";
  reason: string;
}

export interface FileProcessResult {
  filePath: string;
  relPath: string;
  updated: boolean;
  results: ExampleProcessResult[];
}

function normalizeLanguage(language: string): string {
  return language.trim().toLowerCase();
}

export function extractFenceBlocks(markdown: string): FenceBlock[] {
  const blocks: FenceBlock[] = [];
  const regex = /```([^\n`]*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  let blockIndex = 0;

  while ((match = regex.exec(markdown)) !== null) {
    blocks.push({
      language: normalizeLanguage(match[1]),
      code: match[2],
      raw: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      blockIndex,
    });
    blockIndex += 1;
  }

  return blocks;
}

function isJavaScriptMachineBlock(block: FenceBlock): boolean {
  return block.language === "javascript" && block.code.includes("machine(");
}

export function extractMachineVariableNames(code: string): string[] {
  const names: string[] = [];
  const pattern = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*machine\s*\(/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(code)) !== null) {
    names.push(match[1]);
  }

  return names;
}

export function findDiagramTargetVariableName(code: string): string | null {
  const names = extractMachineVariableNames(code);
  return names.at(-1) ?? null;
}

export function trimCodeToTargetMachineDefinition(code: string, targetVariableName: string): string {
  const assignmentPattern = new RegExp(String.raw`(?:const|let|var)\s+${targetVariableName}\s*=\s*machine\s*\(`);
  const assignmentMatch = assignmentPattern.exec(code);

  if (!assignmentMatch || assignmentMatch.index === undefined) {
    return code;
  }

  const assignmentStart = assignmentMatch.index;
  const machineCallStart = code.indexOf("(", assignmentStart + assignmentMatch[0].length - 1);

  if (machineCallStart === -1) {
    return code;
  }

  const machineCallEnd = findMatchingParenEnd(code, machineCallStart);

  if (machineCallEnd === -1) {
    return code;
  }

  let endIndex = machineCallEnd + 1;

  while (endIndex < code.length && /\s/.test(code[endIndex])) {
    endIndex += 1;
  }

  if (code[endIndex] === ";") {
    endIndex += 1;

    while (endIndex < code.length && /\s/.test(code[endIndex])) {
      endIndex += 1;
    }
  }

  return code.slice(0, endIndex);
}

function findMatchingParenEnd(code: string, openParenIndex: number): number {
  let depth = 0;
  let index = openParenIndex;

  while (index < code.length) {
    const char = code[index];
    const nextChar = code[index + 1];

    if (char === "'" || char === '"') {
      index = skipQuotedString(code, index, char) + 1;
      continue;
    }

    if (char === "`") {
      index = skipTemplateLiteral(code, index) + 1;
      continue;
    }

    if (char === "/" && nextChar === "/") {
      index = skipLineComment(code, index) + 1;
      continue;
    }

    if (char === "/" && nextChar === "*") {
      index = skipBlockComment(code, index) + 1;
      continue;
    }

    if (char === "(") {
      depth += 1;
    } else if (char === ")") {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }

    index += 1;
  }

  return -1;
}

function skipQuotedString(code: string, startIndex: number, quote: "'" | '"'): number {
  let index = startIndex + 1;

  while (index < code.length) {
    if (code[index] === "\\") {
      index += 2;
      continue;
    }

    if (code[index] === quote) {
      return index;
    }

    index += 1;
  }

  return code.length;
}

function skipTemplateLiteral(code: string, startIndex: number): number {
  let index = startIndex + 1;

  while (index < code.length) {
    const char = code[index];
    const nextChar = code[index + 1];

    if (char === "\\") {
      index += 2;
      continue;
    }

    if (char === "`") {
      return index;
    }

    if (char === "$" && nextChar === "{") {
      index = skipTemplateExpression(code, index + 1) + 1;
      continue;
    }

    index += 1;
  }

  return code.length;
}

function skipTemplateExpression(code: string, braceStartIndex: number): number {
  let depth = 0;
  let index = braceStartIndex;

  while (index < code.length) {
    const char = code[index];
    const nextChar = code[index + 1];

    if (char === "'" || char === '"') {
      index = skipQuotedString(code, index, char);
      index += 1;
      continue;
    }

    if (char === "`") {
      index = skipTemplateLiteral(code, index);
      index += 1;
      continue;
    }

    if (char === "/" && nextChar === "/") {
      index = skipLineComment(code, index);
      index += 1;
      continue;
    }

    if (char === "/" && nextChar === "*") {
      index = skipBlockComment(code, index);
      index += 1;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }

    index += 1;
  }

  return code.length;
}

function skipLineComment(code: string, startIndex: number): number {
  let index = startIndex + 2;

  while (index < code.length && code[index] !== "\n") {
    index += 1;
  }

  return index;
}

function skipBlockComment(code: string, startIndex: number): number {
  let index = startIndex + 2;

  while (index < code.length - 1) {
    if (code[index] === "*" && code[index + 1] === "/") {
      return index + 1;
    }

    index += 1;
  }

  return code.length;
}

export function findMachineExamples(markdown: string): MachineExample[] {
  const blocks = extractFenceBlocks(markdown);
  let exampleIndex = 0;

  return blocks
    .filter(isJavaScriptMachineBlock)
    .map((block) => {
      const machineVariableNames = extractMachineVariableNames(block.code);
      const targetVariableName = machineVariableNames.at(-1);

      if (!targetVariableName) {
        return null;
      }

      const example: MachineExample = {
        ...block,
        exampleIndex,
        machineVariableNames,
        targetVariableName,
      };

      exampleIndex += 1;
      return example;
    })
    .filter((example): example is MachineExample => example !== null);
}

function generateMermaidBlock(mermaid: string): string {
  const normalized = mermaid.replace(/^\n+|\n+$/g, "");
  return `\`\`\`mermaid\n${normalized}\n\`\`\``;
}

function isWhitespaceOnly(value: string): boolean {
  return value.trim().length === 0;
}

function findAdjacentMermaidBlocks(markdown: string, example: MachineExample) {
  const blocks = extractFenceBlocks(markdown);
  const currentExample = blocks.find((block) => block.startIndex === example.startIndex && block.endIndex === example.endIndex);

  if (!currentExample) {
    return { before: null as FenceBlock | null, after: null as FenceBlock | null };
  }

  const beforeCandidate = blocks[currentExample.blockIndex - 1] ?? null;
  const afterCandidate = blocks[currentExample.blockIndex + 1] ?? null;

  const before = beforeCandidate && beforeCandidate.language === "mermaid" && isWhitespaceOnly(markdown.slice(beforeCandidate.endIndex, currentExample.startIndex))
    ? beforeCandidate
    : null;

  const after = afterCandidate && afterCandidate.language === "mermaid" && isWhitespaceOnly(markdown.slice(currentExample.endIndex, afterCandidate.startIndex))
    ? afterCandidate
    : null;

  return { before, after };
}

export function updateMarkdownWithGeneratedMermaid(
  markdown: string,
  input: { exampleIndex: number; mermaid: string; force?: boolean }
): MarkdownUpdateResult {
  const examples = findMachineExamples(markdown);
  const example = examples[input.exampleIndex];

  if (!example) {
    return {
      updated: false,
      reason: "example not found",
      content: markdown,
    };
  }

  const newMermaidBlock = generateMermaidBlock(input.mermaid);
  const { before, after } = findAdjacentMermaidBlocks(markdown, example);

  if (before) {
    const replacement = `${newMermaidBlock}\n`;
    const nextContent =
      markdown.slice(0, before.startIndex) +
      replacement +
      markdown.slice(example.startIndex);

    if (nextContent === markdown && !input.force) {
      return {
        updated: false,
        reason: "mermaid already up to date",
        content: markdown,
      };
    }

    return {
      updated: true,
      reason: "replaced mermaid before example",
      content: nextContent,
    };
  }

  if (after) {
    const replacement = `${newMermaidBlock}\n${example.raw}`;
    const nextContent =
      markdown.slice(0, example.startIndex) +
      replacement +
      markdown.slice(after.endIndex);

    return {
      updated: nextContent !== markdown,
      reason: "moved mermaid before example",
      content: nextContent,
    };
  }

  const nextContent =
    markdown.slice(0, example.startIndex) +
    `${newMermaidBlock}\n` +
    markdown.slice(example.startIndex);

  return {
    updated: nextContent !== markdown,
    reason: "inserted mermaid before example",
    content: nextContent,
  };
}

export function getExampleStatus(update: MarkdownUpdateResult): ExampleProcessResult["status"] {
  if (update.updated) {
    return "updated";
  }

  if (update.reason === "mermaid already up to date") {
    return "unchanged";
  }

  return "skipped";
}

function stripImports(code: string): string {
  return code
    .replace(/^\s*import\s+[\s\S]*?from\s+["'][^"']+["'];?\s*$/gm, "")
    .replace(/^\s*import\s+["'][^"']+["'];?\s*$/gm, "")
    .trim();
}

async function executeExampleAndGenerateMermaid(code: string, targetVariableName: string): Promise<string> {
  const tempDir = await mkdtemp(join(tmpdir(), "x-robot-docs-"));
  const tempFile = join(tempDir, "generate-mermaid.mjs");
  const { xRobotUrl, documentateUrl } = getDiagramModuleUrls();
  const wrappedCode = `import * as xRobot from ${JSON.stringify(xRobotUrl)};
import { documentate } from ${JSON.stringify(documentateUrl)};

const {
  context,
  dangerState,
  description,
  entry,
  exit,
  getState,
  guard,
  history,
  immediate,
  infoState,
  init,
  initial,
  invoke,
  machine,
  nested,
  parallel,
  primaryState,
  snapshot,
  start,
  shouldFreeze,
  state,
  successState,
  transition,
  validate,
  warningState,
} = xRobot;

${stripImports(trimCodeToTargetMachineDefinition(code, targetVariableName))}

const diagramTarget = ${targetVariableName};

if (!diagramTarget) {
  throw new Error("Missing diagram target: ${targetVariableName}");
}

const result = await documentate(diagramTarget, ${JSON.stringify(MERMAID_OPTIONS)});

if (!result.mermaid) {
  throw new Error("documentate() did not return mermaid output");
}

process.stdout.write(${JSON.stringify(MERMAID_START + "\n")});
process.stdout.write(result.mermaid);
process.stdout.write(${JSON.stringify("\n" + MERMAID_END + "\n")});
`;

  await writeFile(tempFile, wrappedCode, "utf-8");

  try {
    const child = (Bun as any).spawn({
      cmd: ["bun", tempFile],
      cwd: ROOT_DIR,
      stdout: "pipe",
      stderr: "pipe",
    });

    await child.exited;

    const stdout = await new Response(child.stdout).text();
    const stderr = await new Response(child.stderr).text();

    if (child.exitCode !== 0) {
      throw new Error(stderr.trim() || `bun exited with code ${child.exitCode}`);
    }

    const startIndex = stdout.indexOf(MERMAID_START);
    const endIndex = stdout.indexOf(MERMAID_END);

    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      throw new Error("Mermaid markers not found in example output");
    }

    return stdout
      .slice(startIndex + MERMAID_START.length, endIndex)
      .replace(/^\n+|\n+$/g, "");
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export async function getMarkdownFiles(dir = DEFAULT_DOCS_DIR): Promise<string[]> {
  const files: string[] = [];

  async function walk(directory: string) {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        if (!entry.name.startsWith(".") && !EXCLUDE_DIRS.has(entry.name)) {
          await walk(fullPath);
        }
        continue;
      }

      if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files.sort();
}

export async function processMarkdownFile(filePath: string, options: DiagramProcessOptions = {}): Promise<FileProcessResult> {
  const relPath = relative(ROOT_DIR, filePath);
  const originalContent = await readFile(filePath, "utf-8");
  const examples = findMachineExamples(originalContent);

  if (examples.length === 0) {
    return {
      filePath,
      relPath,
      updated: false,
      results: [
        {
          filePath,
          relPath,
          exampleIndex: -1,
          targetVariableName: "",
          status: "skipped",
          reason: "no javascript machine examples found",
        },
      ],
    };
  }

  let nextContent = originalContent;
  const results: ExampleProcessResult[] = [];

  for (const example of [...examples].sort((left, right) => right.exampleIndex - left.exampleIndex)) {
    try {
      const mermaid = await executeExampleAndGenerateMermaid(example.code, example.targetVariableName);
      const update = updateMarkdownWithGeneratedMermaid(nextContent, {
        exampleIndex: example.exampleIndex,
        mermaid,
        force: options.force,
      });

      nextContent = update.content;
      results.push({
        filePath,
        relPath,
        exampleIndex: example.exampleIndex,
        targetVariableName: example.targetVariableName,
        status: getExampleStatus(update),
        reason: update.reason,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        filePath,
        relPath,
        exampleIndex: example.exampleIndex,
        targetVariableName: example.targetVariableName,
        status: "skipped",
        reason: `execution failed: ${message}`,
      });
    }
  }

  const updated = results.some((result) => result.status === "updated");

  if (updated) {
    await writeFile(filePath, nextContent, "utf-8");
  }

  return {
    filePath,
    relPath,
    updated,
    results: results.sort((left, right) => left.exampleIndex - right.exampleIndex),
  };
}

export async function main(options: DiagramProcessOptions = {}): Promise<void> {
  console.log("Generating docs diagrams from self-contained javascript examples...\n");

  const markdownFiles = await getMarkdownFiles();
  console.log(`Found ${markdownFiles.length} markdown files\n`);

  let updatedFiles = 0;
  let skippedFiles = 0;
  let updatedExamples = 0;
  let unchangedExamples = 0;
  let skippedExamples = 0;

  for (const filePath of markdownFiles) {
    const result = await processMarkdownFile(filePath, options);

    if (result.updated) {
      updatedFiles += 1;
    } else {
      skippedFiles += 1;
    }

    for (const example of result.results) {
      if (example.status === "updated") {
        updatedExamples += 1;
      } else if (example.status === "unchanged") {
        unchangedExamples += 1;
      } else {
        skippedExamples += 1;
      }

      const label = example.exampleIndex >= 0
        ? `${result.relPath} [example ${example.exampleIndex + 1}: ${example.targetVariableName}]`
        : result.relPath;

      const statusLabel = example.status.toUpperCase();
      console.log(`${statusLabel} ${label} - ${example.reason}`);
    }
  }

  console.log("\n--- Summary ---");
  console.log(`Updated files: ${updatedFiles}`);
  console.log(`Skipped files: ${skippedFiles}`);
  console.log(`Updated examples: ${updatedExamples}`);
  console.log(`Unchanged examples: ${unchangedExamples}`);
  console.log(`Skipped examples: ${skippedExamples}`);
}

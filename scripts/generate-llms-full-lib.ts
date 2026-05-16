import { readdir, readFile, writeFile } from "fs/promises";
import { join, relative } from "path";

const ROOT_DIR = process.cwd();
const DOCS_DIR_NAME = "docs";
const API_DOCS_DIR_NAME = "api";
const EXCLUDE_DOCS_PATHS = new Set(["plans"]);
const FULL_OUTPUT_FILE_NAME = "llms-full.txt";
const GUIDE_OUTPUT_FILE_NAME = "llms-guide.txt";
const GUIDE_DOC_PATHS = [
  "docs/overview.md",
  "docs/guides/getting-started.md",
  "docs/guides/public-api.md",
  "docs/guides/framework-adapters.md",
  "docs/guides/validation.md",
  "docs/performance.md",
  "docs/comparison/xstate.md",
];
const GUIDE_DOC_PATHS_SET = new Set(GUIDE_DOC_PATHS);

export interface DocumentationFile {
  path: string;
  content: string;
}

function compareRelativePaths(rootDir: string, left: string, right: string): number {
  const leftRelPath = relative(rootDir, left);
  const rightRelPath = relative(rootDir, right);

  if (leftRelPath < rightRelPath) {
    return -1;
  }

  if (leftRelPath > rightRelPath) {
    return 1;
  }

  return 0;
}

function isApiDocumentationPath(rootDir: string, filePath: string): boolean {
  return relative(rootDir, filePath).startsWith(`docs/${API_DOCS_DIR_NAME}/`);
}

function getDocumentationSortRank(rootDir: string, filePath: string): number {
  const relPath = relative(rootDir, filePath);

  if (relPath === "docs/overview.md") return 0;
  if (relPath === "docs/guides/getting-started.md") return 1;
  if (relPath === "docs/why.md") return 2;
  if (relPath.startsWith("docs/concepts/")) return 3;
  if (relPath.startsWith("docs/guides/")) return 4;
  if (relPath.startsWith("docs/recipes/")) return 5;
  if (relPath === "docs/performance.md") return 6;
  if (relPath.startsWith("docs/comparison/")) return 7;
  if (relPath.startsWith(`docs/${API_DOCS_DIR_NAME}/`)) return 8;

  return 6;
}

function compareDocumentationPaths(rootDir: string, left: string, right: string): number {
  const leftRank = getDocumentationSortRank(rootDir, left);
  const rightRank = getDocumentationSortRank(rootDir, right);

  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }

  return compareRelativePaths(rootDir, left, right);
}

export async function getDocumentationMarkdownFiles(rootDir = ROOT_DIR): Promise<string[]> {
  const docsDir = join(rootDir, DOCS_DIR_NAME);
  const regularFiles: string[] = [];
  const apiFiles: string[] = [];

  function shouldExcludeDirectory(directoryPath: string): boolean {
    const relativePath = relative(docsDir, directoryPath);
    const [topLevelDir] = relativePath.split("/");

    return EXCLUDE_DOCS_PATHS.has(topLevelDir);
  }

  async function walk(directory: string) {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        if (!entry.name.startsWith(".") && !shouldExcludeDirectory(fullPath)) {
          await walk(fullPath);
        }
        continue;
      }

      if (entry.isFile() && entry.name.endsWith(".md")) {
        if (isApiDocumentationPath(rootDir, fullPath)) {
          apiFiles.push(fullPath);
        } else {
          regularFiles.push(fullPath);
        }
      }
    }
  }

  await walk(docsDir);

  return [
    ...regularFiles.sort((left, right) => compareDocumentationPaths(rootDir, left, right)),
    ...apiFiles.sort((left, right) => compareDocumentationPaths(rootDir, left, right)),
  ];
}

export async function getGuideDocumentationMarkdownFiles(rootDir = ROOT_DIR): Promise<string[]> {
  const files = await getDocumentationMarkdownFiles(rootDir);

  return files
    .filter((filePath) => GUIDE_DOC_PATHS_SET.has(relative(rootDir, filePath)))
    .sort((left, right) => GUIDE_DOC_PATHS.indexOf(relative(rootDir, left)) - GUIDE_DOC_PATHS.indexOf(relative(rootDir, right)));
}

function buildLlmsContent(rootDir: string, files: DocumentationFile[], title: string): string {
  const sections = files
    .slice()
    .sort((left, right) => compareDocumentationPaths(rootDir, left.path, right.path))
    .map((file) => {
      const relPath = relative(rootDir, file.path);
      const normalizedContent = file.content.endsWith("\n") ? file.content : `${file.content}\n`;

      return [
        `===== BEGIN DOC: ${relPath} =====`,
        "",
        normalizedContent.trimEnd(),
        "",
        `===== END DOC: ${relPath} =====`,
      ].join("\n");
    });

  return `# ${title}\n\n${sections.join("\n\n")}\n`;
}

export function buildLlmsFullContent(rootDir: string, files: DocumentationFile[]): string {
  return buildLlmsContent(rootDir, files, "X-Robot LLMs Full Documentation");
}

export function buildLlmsGuideContent(rootDir: string, files: DocumentationFile[]): string {
  return buildLlmsContent(rootDir, files, "X-Robot LLMs Guide Documentation");
}

async function generateLlmsFile(
  rootDir: string,
  outputFileName: string,
  getMarkdownFiles: (rootDir: string) => Promise<string[]>,
  buildContent: (rootDir: string, files: DocumentationFile[]) => string
): Promise<string> {
  const markdownFiles = await getMarkdownFiles(rootDir);
  const docs = await Promise.all(
    markdownFiles.map(async (filePath) => ({
      path: filePath,
      content: await readFile(filePath, "utf-8"),
    }))
  );
  const output = buildContent(rootDir, docs);
  const outputPath = join(rootDir, outputFileName);

  await writeFile(outputPath, output, "utf-8");

  return outputPath;
}

export async function generateLlmsFullFile(rootDir = ROOT_DIR): Promise<string> {
  return generateLlmsFile(rootDir, FULL_OUTPUT_FILE_NAME, getDocumentationMarkdownFiles, buildLlmsFullContent);
}

export async function generateLlmsGuideFile(rootDir = ROOT_DIR): Promise<string> {
  return generateLlmsFile(rootDir, GUIDE_OUTPUT_FILE_NAME, getGuideDocumentationMarkdownFiles, buildLlmsGuideContent);
}

export async function main(rootDir = ROOT_DIR): Promise<void> {
  const outputPath = await generateLlmsFullFile(rootDir);
  console.log(`Generated ${relative(rootDir, outputPath)}`);
}

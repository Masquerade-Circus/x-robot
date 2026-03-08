import { readdir, readFile, writeFile } from "fs/promises";
import { join, relative } from "path";

const ROOT_DIR = process.cwd();
const DOCS_DIR_NAME = "docs";
const EXCLUDE_DIRS = new Set(["plans"]);
const OUTPUT_FILE_NAME = "llms-full.txt";

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

export async function getDocumentationMarkdownFiles(rootDir = ROOT_DIR): Promise<string[]> {
  const docsDir = join(rootDir, DOCS_DIR_NAME);
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

  await walk(docsDir);

  return files.sort((left, right) => compareRelativePaths(rootDir, left, right));
}

export function buildLlmsFullContent(rootDir: string, files: DocumentationFile[]): string {
  const sections = files
    .slice()
    .sort((left, right) => compareRelativePaths(rootDir, left.path, right.path))
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

  return `# X-Robot LLMs Full Documentation\n\n${sections.join("\n\n")}\n`;
}

export async function generateLlmsFullFile(rootDir = ROOT_DIR): Promise<string> {
  const markdownFiles = await getDocumentationMarkdownFiles(rootDir);
  const docs = await Promise.all(
    markdownFiles.map(async (filePath) => ({
      path: filePath,
      content: await readFile(filePath, "utf-8"),
    }))
  );
  const output = buildLlmsFullContent(rootDir, docs);
  const outputPath = join(rootDir, OUTPUT_FILE_NAME);

  await writeFile(outputPath, output, "utf-8");

  return outputPath;
}

export async function main(rootDir = ROOT_DIR): Promise<void> {
  const outputPath = await generateLlmsFullFile(rootDir);
  console.log(`Generated ${relative(rootDir, outputPath)}`);
}

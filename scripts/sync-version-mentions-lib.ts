import { readdir, readFile, writeFile } from "fs/promises";
import { join, relative } from "path";

const ROOT_DIR = process.cwd();
const DOCS_DIR_NAME = "docs";
const ROOT_DOC_FILES = new Set(["README.md", "llms.txt", "llms-full.txt"]);

export interface PackageMetadata {
  name: string;
  version: string;
}

export interface UpdateVersionMentionsResult {
  updatedFiles: string[];
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function readPackageMetadata(rootDir = ROOT_DIR): Promise<PackageMetadata> {
  const packageJson = JSON.parse(await readFile(join(rootDir, "package.json"), "utf-8"));

  return {
    name: packageJson.name,
    version: packageJson.version,
  };
}

export function syncVersionMentions(content: string, packageMetadata: PackageMetadata): string {
  const packageNamePattern = escapeRegExp(packageMetadata.name);

  return content.replace(
    new RegExp(`${packageNamePattern} - v\\d+\\.\\d+\\.\\d+`, "g"),
    `${packageMetadata.name} - v${packageMetadata.version}`
  );
}

export async function getVersionMentionFiles(rootDir = ROOT_DIR): Promise<string[]> {
  const docsDir = join(rootDir, DOCS_DIR_NAME);
  const files: string[] = [];

  async function walk(directory: string) {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        if (!entry.name.startsWith(".")) {
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

  const rootEntries = await readdir(rootDir, { withFileTypes: true });

  for (const entry of rootEntries) {
    if (entry.isFile() && ROOT_DOC_FILES.has(entry.name)) {
      files.push(join(rootDir, entry.name));
    }
  }

  return files.sort((left, right) => compareRelativePaths(rootDir, left, right));
}

export async function updateVersionMentionsFiles(rootDir = ROOT_DIR): Promise<UpdateVersionMentionsResult> {
  const packageMetadata = await readPackageMetadata(rootDir);
  const files = await getVersionMentionFiles(rootDir);
  const updatedFiles: string[] = [];

  for (const filePath of files) {
    const content = await readFile(filePath, "utf-8");
    const updatedContent = syncVersionMentions(content, packageMetadata);

    if (updatedContent !== content) {
      await writeFile(filePath, updatedContent, "utf-8");
      updatedFiles.push(filePath);
    }
  }

  return { updatedFiles };
}

export async function main(rootDir = ROOT_DIR): Promise<void> {
  const result = await updateVersionMentionsFiles(rootDir);

  console.log(`Updated ${result.updatedFiles.length} files`);

  for (const filePath of result.updatedFiles) {
    console.log(relative(rootDir, filePath));
  }
}

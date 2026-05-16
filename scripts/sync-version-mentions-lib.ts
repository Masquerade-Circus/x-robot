import { readdir, readFile, writeFile } from "fs/promises";
import { join, relative } from "path";

const ROOT_DIR = process.cwd();
const DOCS_DIR_NAME = "docs";
const ROOT_DOC_FILES = new Set(["README.md", "llms.txt", "llms-full.txt"]);

export interface PackageMetadata {
  name: string;
  version: string;
}

export interface PerformanceMetrics {
  coreSize: string;
  totalModulesSize: string;
  documentateSize: string;
  validateSize: string;
  xstateInterpreterSize: string;
  xstateWebSize: string;
  xstateFullSize: string;
  bundleRange: string;
  performanceRange: string;
  locRange: string;
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

function extractFirstMatch(content: string, pattern: RegExp, label: string): string {
  const match = content.match(pattern);

  if (!match) {
    throw new Error(`Could not extract ${label} from docs/performance.md`);
  }

  return match[1];
}

export function readPerformanceMetricsFromContent(content: string): PerformanceMetrics {
  const coreSize = extractFirstMatch(content, /X-Robot Core \(minified\)\s+\| \*\*([\d.]+KB)\*\*/, "core size");
  const totalModulesSize = extractFirstMatch(content, /\| \*\*Total\*\*\s+\| \*\*([\d.]+KB)\*\* \|/, "modules total size");
  const documentateSize = extractFirstMatch(content, /\+ documentate .*?\| \+([\d.]+KB)\s+\|/, "documentate size");
  const validateSize = extractFirstMatch(content, /\+ validate .*?\| \+([\d.]+KB)\s+\|/, "validate size");
  const xstateInterpreterSize = extractFirstMatch(content, /XState interpreter\s+\| ([\d.]+KB)\s+\|/, "XState interpreter size");
  const xstateWebSize = extractFirstMatch(content, /XState web\s+\| ([\d.]+KB)\s+\|/, "XState web size");
  const xstateFullSize = extractFirstMatch(content, /XState full\s+\| ([\d.]+KB)\s+\|/, "XState full size");
  const bundleRange = extractFirstMatch(content, /\*\*([\d.]+-[\d.]+x smaller)\*\* bundle size/, "bundle range");
  const performanceRange = extractFirstMatch(content, /\*\*([\d.]+-[\d.]+x faster)\*\* performance/, "performance range");
  const locRange = extractFirstMatch(content, /\*\*([\d.]+-[\d.]+x less) code\*\*/, "LOC range");

  return {
    coreSize,
    totalModulesSize,
    documentateSize,
    validateSize,
    xstateInterpreterSize,
    xstateWebSize,
    xstateFullSize,
    bundleRange,
    performanceRange,
    locRange,
  };
}

export function syncPerformanceMentions(content: string, metrics: PerformanceMetrics): string {
  let updated = content;

  updated = updated.replace(/Core: [\d.]+KB minified/g, `Core: ${metrics.coreSize} minified`);
  updated = updated.replace(/With modules: [\d.]+KB \(`documentate`, `validate`\)/g, `With modules: ${metrics.totalModulesSize} (\`documentate\`, \`validate\`)`);
  updated = updated.replace(/Performance: [\d.]+-[\d.]+x faster than XState/g, `Performance: ${metrics.performanceRange} than XState`);
  updated = updated.replace(/[\d.]+-[\d.]+x faster/g, metrics.performanceRange);
  updated = updated.replace(/[\d.]+-[\d.]+x smaller/g, metrics.bundleRange);
  updated = updated.replace(/[\d.]+-[\d.]+x less code/g, `${metrics.locRange} code`);
  updated = updated.replace(/\| Bundle Size \| [\d.]+KB \|/g, `| Bundle Size | ${metrics.coreSize} |`);
  updated = updated.replace(/(^|[^~])[\d.]+KB core/g, `$1${metrics.coreSize} core`);
  updated = updated.replace(/[\d.]+KB with modules/g, `${metrics.totalModulesSize} with modules`);
  updated = updated.replace(
    /\| Bundle Size \/ Tooling Size \| [\d.]+KB \| [\d.]+KB \| [\d.]+KB \| [\d.]+KB \| [\d.]+KB \| [\d.]+KB \+ external web app \|/g,
    `| Bundle Size / Tooling Size | ${metrics.coreSize} | ${metrics.totalModulesSize} | ${metrics.xstateInterpreterSize} | ${metrics.xstateWebSize} | ${metrics.xstateFullSize} | ${metrics.xstateFullSize} + external web app |`
  );

  return updated;
}

function shouldSyncPerformanceMentions(rootDir: string, filePath: string): boolean {
  const relPath = relative(rootDir, filePath);

  if (relPath === "README.md") return true;
  if (relPath === `${DOCS_DIR_NAME}/api/README.md`) return true;
  if (!relPath.startsWith(`${DOCS_DIR_NAME}/`)) return false;
  if (relPath.startsWith(`${DOCS_DIR_NAME}/api/`)) return false;
  if (relPath.startsWith(`${DOCS_DIR_NAME}/plans/`)) return false;

  return relPath.endsWith(".md");
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
  const performanceReport = await readFile(join(rootDir, DOCS_DIR_NAME, "performance.md"), "utf-8");
  const performanceMetrics = readPerformanceMetricsFromContent(performanceReport);
  const files = await getVersionMentionFiles(rootDir);
  const updatedFiles: string[] = [];

  for (const filePath of files) {
    const content = await readFile(filePath, "utf-8");
    const versionSyncedContent = syncVersionMentions(content, packageMetadata);
    const updatedContent = shouldSyncPerformanceMentions(rootDir, filePath)
      ? syncPerformanceMentions(versionSyncedContent, performanceMetrics)
      : versionSyncedContent;

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

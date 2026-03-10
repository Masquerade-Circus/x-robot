import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");
const tsc = require("tsc-prog");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const packageRoot = __dirname;
const distDir = path.join(packageRoot, "dist");
const tempTypesDir = path.join(packageRoot, ".types");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyFile(sourcePath, targetPath) {
  ensureDir(path.dirname(targetPath));
  fs.copyFileSync(sourcePath, targetPath);
}

function copyDeclarationTree(sourceDir, targetDir) {
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      ensureDir(targetPath);
      copyDeclarationTree(sourcePath, targetPath);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".d.ts")) {
      copyFile(sourcePath, targetPath);
    }
  }
}

function copyTypes() {
  const sourceRoot = path.join(tempTypesDir, "packages", "react", "src");
  copyDeclarationTree(sourceRoot, distDir);
}

function buildTypes() {
  fs.rmSync(tempTypesDir, { recursive: true, force: true });

  tsc.build({
    basePath: repoRoot,
    configFilePath: "packages/react/tsconfig.build.json",
    files: ["src/index.ts"],
    pretty: true,
    copyOtherToOutDir: false,
    clean: [],
    skipLibCheck: true,
    compilerOptions: {
      declarationMap: false,
      noEmit: false,
      declaration: true,
      outDir: tempTypesDir,
      emitDeclarationOnly: true
    }
  });

  copyTypes();
  fs.rmSync(tempTypesDir, { recursive: true, force: true });
}

function buildRuntime(format, outfile) {
  esbuild.buildSync({
    entryPoints: [path.join(packageRoot, "src/index.ts")],
    bundle: true,
    platform: "node",
    format,
    outfile,
    external: ["react", "react-dom", "react/jsx-runtime", "x-robot", "x-robot/devtools"]
  });
}

fs.rmSync(distDir, { recursive: true, force: true });
ensureDir(distDir);

buildTypes();
buildRuntime("cjs", path.join(distDir, "index.js"));
buildRuntime("esm", path.join(distDir, "index.mjs"));

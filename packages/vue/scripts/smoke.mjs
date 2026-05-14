import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(packageRoot, "../..");
const smokeDir = path.join(packageRoot, "smoke");
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const nodeCmd = process.execPath;
const tscPath = path.resolve(packageRoot, "../../node_modules/typescript/bin/tsc");
const coreTypesPath = path.resolve(repoRoot, "dist/index.d.ts");
const packageTypesPath = path.resolve(packageRoot, "dist/index.d.ts");

if (!fs.existsSync(coreTypesPath)) {
  execFileSync(nodeCmd, [path.join(repoRoot, "build.js")], {
    cwd: repoRoot,
    stdio: "inherit"
  });
}

if (!fs.existsSync(packageTypesPath)) {
  execFileSync(nodeCmd, [path.join(packageRoot, "build.mjs")], {
    cwd: packageRoot,
    stdio: "inherit"
  });
}

fs.rmSync(path.join(smokeDir, "node_modules"), { recursive: true, force: true });
fs.rmSync(path.join(smokeDir, "package-lock.json"), { force: true });

try {
  execFileSync(npmCmd, ["install", "--no-package-lock"], {
    cwd: smokeDir,
    stdio: "inherit"
  });

  execFileSync(nodeCmd, [tscPath, "--noEmit", "-p", "tsconfig.json"], {
    cwd: smokeDir,
    stdio: "inherit"
  });
} finally {
  fs.rmSync(path.join(smokeDir, "node_modules"), { recursive: true, force: true });
  fs.rmSync(path.join(smokeDir, "package-lock.json"), { force: true });
}

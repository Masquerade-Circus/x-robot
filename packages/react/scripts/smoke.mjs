import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, "..");
const smokeDir = path.join(packageRoot, "smoke");
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const nodeCmd = process.execPath;
const tscPath = path.resolve(packageRoot, "../../node_modules/typescript/bin/tsc");

fs.rmSync(path.join(smokeDir, "node_modules"), { recursive: true, force: true });
fs.rmSync(path.join(smokeDir, "package-lock.json"), { force: true });

execFileSync(npmCmd, ["install"], {
  cwd: smokeDir,
  stdio: "inherit"
});

execFileSync(nodeCmd, [tscPath, "--noEmit", "-p", "tsconfig.json"], {
  cwd: smokeDir,
  stdio: "inherit"
});

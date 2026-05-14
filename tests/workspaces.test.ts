import assert from "node:assert/strict";
import { describe, it } from "mocha";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

function readJson(relativePath: string) {
  return JSON.parse(readFileSync(join(process.cwd(), relativePath), "utf8"));
}

describe("workspace layout", () => {
  it("keeps the expected package workspace wiring", () => {
    const rootPackage = readJson("package.json");
    const reactPackage = readJson("packages/react/package.json");
    const sharedPackage = readJson("packages/shared/package.json");
    const vuePackagePath = join(process.cwd(), "packages/vue/package.json");
    const reactTsconfig = readJson("packages/react/tsconfig.json");
    const sharedTsconfig = readJson("packages/shared/tsconfig.json");
    const reactPackagePath = join(process.cwd(), "packages/react/package.json");
    const sharedPackagePath = join(process.cwd(), "packages/shared/package.json");
    const reactTsconfigPath = join(process.cwd(), "packages/react/tsconfig.json");
    const sharedTsconfigPath = join(process.cwd(), "packages/shared/tsconfig.json");
    const basicExamplePath = join(process.cwd(), "packages/react/examples/basic.tsx");
    const fetchExamplePath = join(process.cwd(), "packages/react/examples/fetch.tsx");
    const basicExample = readFileSync(basicExamplePath, "utf8");
    const fetchExample = readFileSync(fetchExamplePath, "utf8");

    assert.ok(rootPackage.workspaces.includes("packages/*"));
    assert.ok(rootPackage.scripts["build:packages"]);
    assert.ok(rootPackage.scripts["test:packages"]);
    assert.ok(rootPackage.scripts["build:react"]);
    assert.ok(rootPackage.scripts["build:vue"]);
    assert.ok(rootPackage.scripts["build:shared"]);
    assert.ok(rootPackage.scripts["test:react"]);
    assert.ok(rootPackage.scripts["test:vue"]);
    assert.ok(rootPackage.scripts["test:vue:smoke"]);
    assert.ok(rootPackage.scripts["test:shared"]);
    assert.equal(existsSync(reactPackagePath), true);
    assert.equal(existsSync(sharedPackagePath), true);
    assert.equal(existsSync(vuePackagePath), true);
    assert.equal(existsSync(reactTsconfigPath), true);
    assert.equal(existsSync(sharedTsconfigPath), true);
    assert.equal(existsSync(basicExamplePath), true);
    assert.equal(existsSync(fetchExamplePath), true);
    assert.equal(reactPackage.name, "@x-robot/react");
    assert.equal(sharedPackage.name, "@x-robot/shared");
    assert.equal(readJson("packages/vue/package.json").name, "@x-robot/vue");
    assert.equal(reactPackage.main, "dist/index.js");
    assert.equal(sharedPackage.main, "dist/index.js");
    assert.ok(reactPackage.scripts.build);
    assert.ok(sharedPackage.scripts.build);
    assert.equal(reactTsconfig.compilerOptions.jsx, "react-jsx");
    assert.equal(reactTsconfig.compilerOptions.outDir, "dist");
    assert.equal(sharedTsconfig.compilerOptions.outDir, "dist");
    assert.match(basicExample, /from "x-robot";/);
    assert.match(basicExample, /from "@x-robot\/react";/);
    assert.match(fetchExample, /from "x-robot";/);
    assert.match(fetchExample, /from "@x-robot\/react";/);
    assert.match(fetchExample, /"success", "failure"/);
    assert.match(fetchExample, /current === "failure"/);
  });
});

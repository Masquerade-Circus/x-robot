import assert from "node:assert/strict";
import { describe, it } from "mocha";
import { readFileSync } from "fs";
import { join } from "path";

function readJson(relativePath: string) {
  return JSON.parse(readFileSync(join(process.cwd(), relativePath), "utf8"));
}

describe("@x-robot/react publishability", () => {
  it("uses a publishable manifest shape", () => {
    const reactPackage = readJson("packages/react/package.json");
    const dependencyScopes = [
      reactPackage.dependencies,
      reactPackage.peerDependencies,
      reactPackage.optionalDependencies
    ].filter(Boolean);

    assert.notEqual(reactPackage.private, true);
    assert.equal(reactPackage.types, "dist/index.d.ts");
    assert.equal(reactPackage.main, "dist/index.js");
    assert.equal(reactPackage.module, "dist/index.mjs");
    assert.equal(reactPackage.exports["."].types, "./dist/index.d.ts");
    assert.equal(reactPackage.exports["."].import, "./dist/index.mjs");
    assert.equal(reactPackage.exports["."].require, "./dist/index.js");
    assert.equal(reactPackage.dependencies, undefined);
    assert.equal(reactPackage.peerDependencies.react !== undefined, true);
    assert.equal(reactPackage.peerDependencies["react-dom"] !== undefined, true);
    assert.equal(reactPackage.peerDependencies["x-robot"] !== undefined, true);

    for (const scope of dependencyScopes) {
      assert.equal(scope["@x-robot/shared"], undefined);

      for (const value of Object.values(scope)) {
        assert.equal(typeof value === "string" && value.startsWith("file:"), false);
      }
    }
  });
});

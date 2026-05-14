import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, it } from "mocha";

function readJson(relativePath: string) {
  return JSON.parse(readFileSync(join(process.cwd(), relativePath), "utf8"));
}

describe("@x-robot/vue publishability", () => {
  it("uses a publishable manifest shape", () => {
    const vuePackage = readJson("packages/vue/package.json");
    const dependencyScopes = [
      vuePackage.dependencies,
      vuePackage.peerDependencies,
      vuePackage.optionalDependencies
    ].filter(Boolean);

    assert.notEqual(vuePackage.private, true);
    assert.equal(vuePackage.types, "dist/index.d.ts");
    assert.equal(vuePackage.main, "dist/index.js");
    assert.equal(vuePackage.module, "dist/index.mjs");
    assert.equal(vuePackage.exports["."].types, "./dist/index.d.ts");
    assert.equal(vuePackage.exports["."].import, "./dist/index.mjs");
    assert.equal(vuePackage.exports["."].require, "./dist/index.js");
    assert.equal(vuePackage.peerDependencies.vue !== undefined, true);
    assert.equal(vuePackage.peerDependencies["x-robot"] !== undefined, true);
    assert.equal(vuePackage.scripts["test:smoke"], "node scripts/smoke.mjs");

    for (const field of ["license", "repository", "homepage", "bugs", "keywords"]) {
      assert.notEqual(vuePackage[field], undefined);
    }

    for (const scope of dependencyScopes) {
      assert.equal(scope["@x-robot/shared"], undefined);

      for (const value of Object.values(scope)) {
        assert.equal(typeof value === "string" && value.startsWith("file:"), false);
      }
    }
  });
});

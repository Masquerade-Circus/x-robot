import expect from "expect";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { describe, it } from "mocha";

import {
  syncVersionMentions,
  updateVersionMentionsFiles,
} from "../scripts/sync-version-mentions-lib";

describe("sync-version-mentions", () => {
  it("updates package version mentions from package.json across generated docs", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "x-robot-sync-version-"));

    try {
      await mkdir(join(tempDir, "docs", "api"), { recursive: true });
      await mkdir(join(tempDir, "docs", "guides"), { recursive: true });

      await writeFile(join(tempDir, "package.json"), JSON.stringify({
        name: "x-robot",
        version: "2.3.4",
      }, null, 2), "utf-8");

      await writeFile(join(tempDir, "docs", "api", "README.md"), "x-robot - v1.0.0 / [Modules](modules.md)\n", "utf-8");
      await writeFile(join(tempDir, "docs", "guides", "overview.md"), "Current header: x-robot - v0.9.9\n", "utf-8");
      await writeFile(join(tempDir, "llms-full.txt"), "Copied docs: x-robot - v1.0.0\nExternal: xstate - v5.0.0\n", "utf-8");

      const result = await updateVersionMentionsFiles(tempDir);
      const apiReadme = await readFile(join(tempDir, "docs", "api", "README.md"), "utf-8");
      const guide = await readFile(join(tempDir, "docs", "guides", "overview.md"), "utf-8");
      const llmsFull = await readFile(join(tempDir, "llms-full.txt"), "utf-8");

      expect(result.updatedFiles).toEqual([
        join(tempDir, "docs", "api", "README.md"),
        join(tempDir, "docs", "guides", "overview.md"),
        join(tempDir, "llms-full.txt"),
      ]);
      expect(apiReadme).toContain("x-robot - v2.3.4");
      expect(guide).toContain("x-robot - v2.3.4");
      expect(llmsFull).toContain("x-robot - v2.3.4");
      expect(llmsFull).toContain("xstate - v5.0.0");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("only rewrites version mentions for the package name", () => {
    const content = "x-robot - v1.0.0\nxstate - v5.0.0\n";

    expect(syncVersionMentions(content, { name: "x-robot", version: "3.0.0" })).toBe(
      "x-robot - v3.0.0\nxstate - v5.0.0\n"
    );
  });

  it("runs docs generation from the after:bump release hook", async () => {
    const packageJson = JSON.parse(await readFile(join(process.cwd(), "package.json"), "utf-8"));

    expect(packageJson["release-it"].hooks["after:bump"]).toEqual(["bun run docs"]);
    expect(packageJson["release-it"].hooks["after:@release-it/conventional-changelog"]).toBe(undefined);
  });
});

import expect from "expect";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { join } from "path";
import { describe, it } from "mocha";

import {
  syncVersionMentions,
  updateVersionMentionsFiles,
} from "../scripts/sync-version-mentions-lib";

const PERFORMANCE_REPORT_FIXTURE = `# X-Robot Performance Report

## Bundle Size

| Library                 | Size     | vs X-Robot Core |
| ----------------------- | -------- | --------------- |
| X-Robot Core (minified) | **16.55KB** | 1x              |
| XState interpreter      | 30.09KB  | 1.8x            |
| XState web              | 46.64KB  | 2.8x            |
| XState full             | 58.80KB   | 3.6x            |

### With Modules (x-robot + documentate + validate)

| Module                                                   | Size      |
| -------------------------------------------------------- | --------- |
| X-Robot Core                                             | 16.55KB   |
| + documentate (code gen, diagrams, serialization, SCXML) | +49.71KB     |
| + validate (machine validation)                          | +13.67KB     |
| **Total**                                                | **79.93KB** |

## Performance

| Test                   | X-Robot | XState   | Advantage        |
| ---------------------- | ------- | -------- | ---------------- |
| 5k transitions         | 7.03ms  | 109.36ms | **15.6x faster** |
| Delayed transitions    | 55.99ms | 61.20ms  | **1.1x faster**  |

## Developer Experience (Lines of Code)

| Simple machine      | 9       | 11     | **1.2x less** |
| Guards machine      | 14      | 25     | **1.8x less** |

## Why X-Robot?

1. **1.8-3.6x smaller** bundle size (core only)
2. **1.1-15.6x faster** performance
3. **1.2-1.8x less code** to write
`;

describe("sync-version-mentions", () => {
  it("updates package version mentions from package.json across generated docs", async () => {
    const repoTmpDir = join(process.cwd(), "tmp");
    await mkdir(repoTmpDir, { recursive: true });
    const tempDir = await mkdtemp(join(repoTmpDir, "x-robot-sync-version-"));

    try {
      await mkdir(join(tempDir, "docs", "api"), { recursive: true });
      await mkdir(join(tempDir, "docs", "guides"), { recursive: true });

      await writeFile(join(tempDir, "package.json"), JSON.stringify({
        name: "x-robot",
        version: "2.3.4",
      }, null, 2), "utf-8");

      await writeFile(join(tempDir, "docs", "performance.md"), PERFORMANCE_REPORT_FIXTURE, "utf-8");
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

  it("syncs repeated performance claims from docs/performance.md", async () => {
    const repoTmpDir = join(process.cwd(), "tmp");
    await mkdir(repoTmpDir, { recursive: true });
    const tempDir = await mkdtemp(join(repoTmpDir, "x-robot-sync-performance-"));

    try {
      await mkdir(join(tempDir, "docs", "api"), { recursive: true });
      await mkdir(join(tempDir, "docs", "comparison"), { recursive: true });

      await writeFile(join(tempDir, "package.json"), JSON.stringify({
        name: "x-robot",
        version: "2.3.4",
      }, null, 2), "utf-8");

      await writeFile(join(tempDir, "docs", "performance.md"), PERFORMANCE_REPORT_FIXTURE, "utf-8");
      await writeFile(join(tempDir, "docs", "api", "README.md"), "X-Robot is 0.0-0.0x faster and 0.00KB core.\n", "utf-8");
      await writeFile(join(tempDir, "docs", "why.md"), [
        "* Core: 0.00KB minified",
        "* With modules: 0.00KB (`documentate`, `validate`)",
        "* Performance: 0.0-0.0x faster than XState",
        "",
      ].join("\n"), "utf-8");
      await writeFile(join(tempDir, "README.md"), "X-Robot is 0.0-0.0x faster and 0.00KB core.\n", "utf-8");
      await writeFile(join(tempDir, "docs", "comparison", "redux.md"), "| Bundle Size | 0.00KB | ~7KB core + middleware |\n", "utf-8");
      await writeFile(join(tempDir, "docs", "comparison", "xstate.md"), "| Bundle Size / Tooling Size | 0.00KB | 0.00KB | 0.00KB | 0.00KB | 0.00KB | 0.00KB + external web app |\n", "utf-8");

      const result = await updateVersionMentionsFiles(tempDir);

      const why = await readFile(join(tempDir, "docs", "why.md"), "utf-8");
      const apiReadme = await readFile(join(tempDir, "docs", "api", "README.md"), "utf-8");
      const readme = await readFile(join(tempDir, "README.md"), "utf-8");
      const redux = await readFile(join(tempDir, "docs", "comparison", "redux.md"), "utf-8");
      const xstate = await readFile(join(tempDir, "docs", "comparison", "xstate.md"), "utf-8");

      expect(result.updatedFiles).toEqual(expect.arrayContaining([
        join(tempDir, "README.md"),
        join(tempDir, "docs", "api", "README.md"),
        join(tempDir, "docs", "comparison", "xstate.md"),
        join(tempDir, "docs", "why.md"),
      ]));
      expect(why).toContain("Core: 16.55KB minified");
      expect(why).toContain("With modules: 79.93KB (`documentate`, `validate`)");
      expect(why).toContain("Performance: 1.1-15.6x faster than XState");
      expect(apiReadme).toContain("1.1-15.6x faster");
      expect(apiReadme).toContain("16.55KB core");
      expect(readme).toContain("1.1-15.6x faster");
      expect(readme).toContain("16.55KB core");
      expect(redux).toContain("| Bundle Size | 16.55KB | ~7KB core + middleware |");
      expect(xstate).toContain("| Bundle Size / Tooling Size | 16.55KB | 79.93KB | 30.09KB | 46.64KB | 58.80KB | 58.80KB + external web app |");
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

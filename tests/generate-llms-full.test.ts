import expect from "expect";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { join } from "path";
import { describe, it } from "mocha";

import {
  buildLlmsFullContent,
  generateLlmsFullFile,
  generateLlmsGuideFile,
  getDocumentationMarkdownFiles,
  getGuideDocumentationMarkdownFiles,
} from "../scripts/generate-llms-full-lib";

async function createTempRepo(prefix: string): Promise<string> {
  const tmpRoot = join(process.cwd(), "tmp");
  await mkdir(tmpRoot, { recursive: true });

  return mkdtemp(join(tmpRoot, prefix));
}

describe("generate-llms-full", () => {
  it("includes all markdown files under docs except docs/plans and places docs/api at the end", async () => {
    const tempDir = await createTempRepo("x-robot-llms-full-");

    try {
      await mkdir(join(tempDir, "docs", "guides"), { recursive: true });
      await mkdir(join(tempDir, "docs", "api", "modules"), { recursive: true });
      await mkdir(join(tempDir, "docs", "plans"), { recursive: true });

      await writeFile(join(tempDir, "docs", "guides", "intro.md"), "# Intro\n", "utf-8");
      await writeFile(join(tempDir, "docs", "api", "README.md"), "# API\n", "utf-8");
      await writeFile(join(tempDir, "docs", "api", "modules", "foo.md"), "# Foo\n", "utf-8");
      await writeFile(join(tempDir, "docs", "plans", "draft.md"), "# Draft\n", "utf-8");

      const files = await getDocumentationMarkdownFiles(tempDir);

      expect(files).toEqual([
        join(tempDir, "docs", "guides", "intro.md"),
        join(tempDir, "docs", "api", "README.md"),
        join(tempDir, "docs", "api", "modules", "foo.md"),
      ]);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders docs/api sections after the rest of the documentation", () => {
    const content = buildLlmsFullContent("/repo", [
      {
        path: "/repo/docs/api/README.md",
        content: "# API\n\nGenerated docs\n",
      },
      {
        path: "/repo/docs/guides/getting-started.md",
        content: "# Getting Started\n\nUse it\n",
      },
    ]);

    expect(content).toBe(`# X-Robot LLMs Full Documentation\n\n` +
      `===== BEGIN DOC: docs/guides/getting-started.md =====\n\n` +
      `# Getting Started\n\nUse it\n\n` +
      `===== END DOC: docs/guides/getting-started.md =====\n\n` +
      `===== BEGIN DOC: docs/api/README.md =====\n\n` +
      `# API\n\nGenerated docs\n\n` +
      `===== END DOC: docs/api/README.md =====\n`);
  });

  it("writes llms-full.txt at the repository root", async () => {
    const tempDir = await createTempRepo("x-robot-llms-full-");

    try {
      await mkdir(join(tempDir, "docs", "concepts"), { recursive: true });
      await mkdir(join(tempDir, "docs", "api"), { recursive: true });
      await mkdir(join(tempDir, "docs", "plans"), { recursive: true });

      await writeFile(join(tempDir, "docs", "concepts", "context.md"), "# Context\n\nFrozen\n", "utf-8");
      await writeFile(join(tempDir, "docs", "api", "README.md"), "# API\n\nReference\n", "utf-8");
      await writeFile(join(tempDir, "docs", "plans", "ignored.md"), "# Ignored\n", "utf-8");

      await generateLlmsFullFile(tempDir);

      const output = await readFile(join(tempDir, "llms-full.txt"), "utf-8");

      expect(output).toContain("===== BEGIN DOC: docs/concepts/context.md =====");
      expect(output).toContain("# Context\n\nFrozen");
      expect(output).not.toContain("docs/plans/ignored.md");

      const conceptsIndex = output.indexOf("===== BEGIN DOC: docs/concepts/context.md =====");
      const apiIndex = output.indexOf("===== BEGIN DOC: docs/api/README.md =====");

      expect(apiIndex).toBeGreaterThan(conceptsIndex);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders product overview and getting-started before comparison docs", async () => {
    const tempDir = await createTempRepo("x-robot-llms-full-");

    try {
      await mkdir(join(tempDir, "docs", "guides"), { recursive: true });
      await mkdir(join(tempDir, "docs", "comparison"), { recursive: true });
      await mkdir(join(tempDir, "docs", "api"), { recursive: true });

      await writeFile(join(tempDir, "docs", "comparison", "xstate.md"), "# XState\n", "utf-8");
      await writeFile(join(tempDir, "docs", "guides", "getting-started.md"), "# Getting Started\n", "utf-8");
      await writeFile(join(tempDir, "docs", "overview.md"), "# X-Robot Overview\n", "utf-8");
      await writeFile(join(tempDir, "docs", "api", "README.md"), "# API\n", "utf-8");

      const content = await generateLlmsFullFile(tempDir).then(() => readFile(join(tempDir, "llms-full.txt"), "utf-8"));

      const overviewIndex = content.indexOf("===== BEGIN DOC: docs/overview.md =====");
      const gettingStartedIndex = content.indexOf("===== BEGIN DOC: docs/guides/getting-started.md =====");
      const comparisonIndex = content.indexOf("===== BEGIN DOC: docs/comparison/xstate.md =====");
      const apiIndex = content.indexOf("===== BEGIN DOC: docs/api/README.md =====");

      expect(overviewIndex).toBeGreaterThanOrEqual(0);
      expect(gettingStartedIndex).toBeGreaterThan(overviewIndex);
      expect(comparisonIndex).toBeGreaterThan(gettingStartedIndex);
      expect(apiIndex).toBeGreaterThan(comparisonIndex);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("writes a curated llms-guide.txt without API, plans, or publishing internals", async () => {
    const tempDir = await createTempRepo("x-robot-llms-guide-");

    try {
      await mkdir(join(tempDir, "docs", "guides"), { recursive: true });
      await mkdir(join(tempDir, "docs", "comparison"), { recursive: true });
      await mkdir(join(tempDir, "docs", "api"), { recursive: true });
      await mkdir(join(tempDir, "docs", "plans"), { recursive: true });

      await writeFile(join(tempDir, "docs", "overview.md"), "# Overview\n", "utf-8");
      await writeFile(join(tempDir, "docs", "guides", "getting-started.md"), "# Getting Started\n", "utf-8");
      await writeFile(join(tempDir, "docs", "guides", "public-api.md"), "# Public API\n", "utf-8");
      await writeFile(join(tempDir, "docs", "guides", "framework-adapters.md"), "# Framework Adapters\n", "utf-8");
      await writeFile(join(tempDir, "docs", "guides", "validation.md"), "# Validation\n", "utf-8");
      await writeFile(join(tempDir, "docs", "performance.md"), "# Performance\n", "utf-8");
      await writeFile(join(tempDir, "docs", "comparison", "xstate.md"), "# XState\n", "utf-8");
      await writeFile(join(tempDir, "docs", "guides", "publishing-adapters.md"), "# Publishing Adapters\n", "utf-8");
      await writeFile(join(tempDir, "docs", "api", "README.md"), "# API\n", "utf-8");
      await writeFile(join(tempDir, "docs", "plans", "draft.md"), "# Draft\n", "utf-8");

      const files = await getGuideDocumentationMarkdownFiles(tempDir);

      expect(files).toEqual([
        join(tempDir, "docs", "overview.md"),
        join(tempDir, "docs", "guides", "getting-started.md"),
        join(tempDir, "docs", "guides", "public-api.md"),
        join(tempDir, "docs", "guides", "framework-adapters.md"),
        join(tempDir, "docs", "guides", "validation.md"),
        join(tempDir, "docs", "performance.md"),
        join(tempDir, "docs", "comparison", "xstate.md"),
      ]);

      await generateLlmsGuideFile(tempDir);

      const output = await readFile(join(tempDir, "llms-guide.txt"), "utf-8");

      expect(output).toContain("# X-Robot LLMs Guide Documentation");
      expect(output).toContain("===== BEGIN DOC: docs/overview.md =====");
      expect(output).toContain("===== BEGIN DOC: docs/guides/getting-started.md =====");
      expect(output).toContain("===== BEGIN DOC: docs/guides/public-api.md =====");
      expect(output).toContain("===== BEGIN DOC: docs/guides/framework-adapters.md =====");
      expect(output).toContain("===== BEGIN DOC: docs/guides/validation.md =====");
      expect(output).toContain("===== BEGIN DOC: docs/performance.md =====");
      expect(output).toContain("===== BEGIN DOC: docs/comparison/xstate.md =====");
      expect(output).not.toContain("docs/api/");
      expect(output).not.toContain("docs/plans/");
      expect(output).not.toContain("docs/guides/publishing-adapters.md");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});

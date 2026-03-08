import expect from "expect";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { describe, it } from "mocha";

import {
  buildLlmsFullContent,
  generateLlmsFullFile,
  getDocumentationMarkdownFiles,
} from "../scripts/generate-llms-full-lib";

describe("generate-llms-full", () => {
  it("includes all markdown files under docs except docs/plans", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "x-robot-llms-full-"));

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
        join(tempDir, "docs", "api", "README.md"),
        join(tempDir, "docs", "api", "modules", "foo.md"),
        join(tempDir, "docs", "guides", "intro.md"),
      ]);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders each document with its relative path and preserves markdown content", () => {
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
      `===== BEGIN DOC: docs/api/README.md =====\n\n` +
      `# API\n\nGenerated docs\n\n` +
      `===== END DOC: docs/api/README.md =====\n\n` +
      `===== BEGIN DOC: docs/guides/getting-started.md =====\n\n` +
      `# Getting Started\n\nUse it\n\n` +
      `===== END DOC: docs/guides/getting-started.md =====\n`);
  });

  it("writes llms-full.txt at the repository root", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "x-robot-llms-full-"));

    try {
      await mkdir(join(tempDir, "docs", "concepts"), { recursive: true });
      await mkdir(join(tempDir, "docs", "plans"), { recursive: true });

      await writeFile(join(tempDir, "docs", "concepts", "context.md"), "# Context\n\nFrozen\n", "utf-8");
      await writeFile(join(tempDir, "docs", "plans", "ignored.md"), "# Ignored\n", "utf-8");

      await generateLlmsFullFile(tempDir);

      const output = await readFile(join(tempDir, "llms-full.txt"), "utf-8");

      expect(output).toContain("===== BEGIN DOC: docs/concepts/context.md =====");
      expect(output).toContain("# Context\n\nFrozen");
      expect(output).not.toContain("docs/plans/ignored.md");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});

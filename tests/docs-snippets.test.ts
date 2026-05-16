import { expect } from "expect";
import { readdir, readFile } from "fs/promises";
import { join, relative } from "path";
import { describe, it } from "mocha";

const ROOT_DIR = process.cwd();
const DOCS_DIR = join(ROOT_DIR, "docs");
const FRAGMENT_MARKER = "<!-- x-robot:fragment -->";
const FRAGMENT_LOOKBEHIND = 3000;

async function getMarkdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    const relPath = relative(DOCS_DIR, fullPath);

    if (entry.isDirectory()) {
      if (
        !entry.name.startsWith(".") &&
        !relPath.startsWith("api") &&
        !relPath.startsWith("plans")
      ) {
        files.push(...(await getMarkdownFiles(fullPath)));
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      if (relPath !== join("comparison", "xstate.md")) {
        files.push(fullPath);
      }
    }
  }

  return files.sort();
}

function getJavaScriptFences(
  markdown: string
): Array<{ language: string; code: string; index: number }> {
  const fences: Array<{ language: string; code: string; index: number }> = [];
  const pattern = /```(javascript|js|typescript|ts)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(markdown)) !== null) {
    fences.push({ language: match[1], code: match[2], index });
    index += 1;
  }

  return fences;
}

function getHeadingSection(markdown: string, heading: string): string {
  const headingIndex = markdown.indexOf(heading);
  expect(headingIndex).toBeGreaterThanOrEqual(0);

  const headingLevel = heading.match(/^#+/)?.[0].length ?? 1;
  const nextHeadingPattern = new RegExp(`\\n#{1,${headingLevel}}\\s`, "g");
  nextHeadingPattern.lastIndex = headingIndex + heading.length;
  const nextHeading = nextHeadingPattern.exec(markdown);

  return markdown.slice(
    headingIndex,
    nextHeading ? nextHeading.index : markdown.length
  );
}

function getFirstJavaScriptFence(section: string): { language: string; code: string } {
  const match = /```(javascript|js|typescript|ts)\n([\s\S]*?)```/.exec(section);
  expect(match).not.toBeNull();

  return { language: match![1], code: match![2] };
}

describe("docs JavaScript/TypeScript snippets", () => {
  it("marks fragments explicitly and gives runnable examples their x-robot imports", async () => {
    const files = await getMarkdownFiles(DOCS_DIR);
    const failures: string[] = [];

    for (const file of files) {
      const markdown = await readFile(file, "utf-8");
      const fences = getJavaScriptFences(markdown);

      for (const fence of fences) {
        const relPath = relative(ROOT_DIR, file);
        const beforeFence = markdown.slice(
          0,
          markdown.indexOf(`\`\`\`${fence.language}\n${fence.code}`)
        );
        const isFragment = beforeFence
          .slice(-FRAGMENT_LOOKBEHIND)
          .includes(FRAGMENT_MARKER);
        const usesXRobotApi =
          /\b(machine|state|transition|invoke|context|entry|exit|guard|initial|init|immediate|snapshot|start|validate)\b/.test(
            fence.code
          );
        const importsXRobot =
          /from ["']x-robot["']/.test(fence.code) ||
          /from ["']x-robot\/validate["']/.test(fence.code);

        if (usesXRobotApi && !importsXRobot && !isFragment) {
          failures.push(
            `${relPath} fence #${fence.index} uses x-robot APIs without imports or ${FRAGMENT_MARKER}`
          );
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it("keeps the saving-and-restoring complete example import complete", async () => {
    const content = await readFile(
      join(DOCS_DIR, "guides", "saving-and-restoring.md"),
      "utf-8"
    );

    expect(content).toContain(
      'import { machine, state, transition, initial, init, context, invoke, snapshot, start, entry } from "x-robot";'
    );
  });

  it("keeps primary onboarding snippets copy-paste ready", async () => {
    const files = [
      "overview.md",
      "guides/getting-started.md",
      "guides/saving-and-restoring.md",
      "guides/async.md",
      "guides/validation.md"
    ];

    for (const relFile of files) {
      const fullPath = join(DOCS_DIR, relFile);
      const markdown = await readFile(fullPath, "utf-8");
      const fences = getJavaScriptFences(markdown);

      for (const fence of fences) {
        const beforeFence = markdown.slice(
          0,
          markdown.indexOf(`\`\`\`${fence.language}\n${fence.code}`)
        );
        const isFragment = beforeFence
          .slice(-FRAGMENT_LOOKBEHIND)
          .includes(FRAGMENT_MARKER);
        const usesMachine = /\bmachine\(/.test(fence.code);

        if (usesMachine && !isFragment) {
          expect(fence.code).toMatch(/from ["']x-robot["']/);
        }
      }
    }
  });

  it("keeps high and medium priority snippets as complete examples", async () => {
    const targets = [
      ["why.md", "## The Solution: State Machines"],
      ["guides/guards.md", "### Form Validation"],
      ["guides/guards.md", "### Role-Based Access"],
      ["guides/immediate-transitions.md", "## With Guards"],
      ["guides/immediate-transitions.md", "### Validation Redirect"],
      ["guides/parallel-states.md", "## Complete Example: Text Editor"],
      ["guides/async.md", "## Multiple Async Operations"],
      ["guides/async.md", "## Retrying Failed Operations"],
      ["guides/nested-machines.md", "## Initial State in Nested Machines"],
      ["recipes/api-fetch.md", "## With Caching"],
      ["recipes/api-fetch.md", "## With Pagination"],
      ["recipes/modal-dialog.md", "## With Animation Support"],
      ["recipes/modal-dialog.md", "### Alert Only"],
      ["recipes/modal-dialog.md", "### With Form"]
    ];

    for (const [relFile, heading] of targets) {
      const markdown = await readFile(join(DOCS_DIR, relFile), "utf-8");
      const section = getHeadingSection(markdown, heading);
      const fence = getFirstJavaScriptFence(section);
      const beforeFence = section.slice(
        0,
        section.indexOf(`\`\`\`${fence.language}\n${fence.code}`)
      );

      expect(fence.code).toMatch(/from ["']x-robot["']/);
      expect(
        beforeFence.trimEnd().endsWith(FRAGMENT_MARKER)
      ).toBe(false);
    }
  });
});

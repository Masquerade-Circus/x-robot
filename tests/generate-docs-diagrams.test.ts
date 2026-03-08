import expect from "expect";
import { mkdtemp, mkdir, rm, writeFile } from "fs/promises";
import { describe, it } from "mocha";
import { join } from "path";
import { tmpdir } from "os";

import {
  extractMachineVariableNames,
  findDiagramTargetVariableName,
  getDiagramModuleUrls,
  getMarkdownFiles,
  getExampleStatus,
  trimCodeToTargetMachineDefinition,
  updateMarkdownWithGeneratedMermaid,
} from "../scripts/generate-docs-diagrams-lib";

describe("generate-docs-diagrams", () => {
  it("uses the last defined machine variable as the diagram target", () => {
    const code = `const child = machine("Child", state("idle"));
const parent = machine("Parent", state("ready", nested(child)));`;

    expect(extractMachineVariableNames(code)).toEqual(["child", "parent"]);
    expect(findDiagramTargetVariableName(code)).toBe("parent");
  });

  it("inserts a mermaid block immediately before a javascript machine example", () => {
    const markdown = `# Example



\`\`\`javascript
const toggle = machine(
  "Toggle",
  state("off", transition("toggle", "on")),
  state("on", transition("toggle", "off"))
);
\`\`\`
`;

    const result = updateMarkdownWithGeneratedMermaid(markdown, {
      exampleIndex: 0,
      mermaid: "stateDiagram-v2\n[*] --> off",
    });

    expect(result.updated).toBe(true);
    expect(result.reason).toBe("inserted mermaid before example");
    expect(result.content).toContain("```mermaid\nstateDiagram-v2\n[*] --> off\n```\n```javascript");
  });

  it("moves an adjacent mermaid block from after the example to before it", () => {
    const markdown = `# Example

\`\`\`javascript
const toggle = machine(
  "Toggle",
  state("off", transition("toggle", "on")),
  state("on", transition("toggle", "off"))
);
\`\`\`

\`\`\`mermaid
old diagram
\`\`\`
`;

    const result = updateMarkdownWithGeneratedMermaid(markdown, {
      exampleIndex: 0,
      mermaid: "stateDiagram-v2\n[*] --> off",
    });

    expect(result.updated).toBe(true);
    expect(result.reason).toBe("moved mermaid before example");
    expect(result.content).toContain("```mermaid\nstateDiagram-v2\n[*] --> off\n```\n```javascript");
    expect(result.content).not.toContain("old diagram");
  });

  it("returns unchanged when the existing mermaid block is already synchronized", () => {
    const markdown = `# Example

\`\`\`mermaid
stateDiagram-v2
[*] --> off
\`\`\`
\`\`\`javascript
const toggle = machine(
  "Toggle",
  state("off", transition("toggle", "on")),
  state("on", transition("toggle", "off"))
);
\`\`\`
`;

    const result = updateMarkdownWithGeneratedMermaid(markdown, {
      exampleIndex: 0,
      mermaid: "stateDiagram-v2\n[*] --> off",
    });

    expect(result.updated).toBe(false);
    expect(result.reason).toBe("mermaid already up to date");
    expect(result.content).toBe(markdown);
  });

  it("forces replacing an already synchronized mermaid block when requested", () => {
    const markdown = `# Example

\`\`\`mermaid
stateDiagram-v2
[*] --> off
\`\`\`
\`\`\`javascript
const toggle = machine(
  "Toggle",
  state("off", transition("toggle", "on")),
  state("on", transition("toggle", "off"))
);
\`\`\`
`;

    const result = updateMarkdownWithGeneratedMermaid(markdown, {
      exampleIndex: 0,
      mermaid: "stateDiagram-v2\n[*] --> off",
      force: true,
    });

    expect(result.updated).toBe(true);
    expect(result.reason).toBe("replaced mermaid before example");
    expect(result.content).toBe(markdown);
  });

  it("classifies already-synced examples as unchanged instead of skipped", () => {
    expect(getExampleStatus({ updated: false, reason: "mermaid already up to date", content: "" })).toBe("unchanged");
    expect(getExampleStatus({ updated: true, reason: "inserted mermaid before example", content: "" })).toBe("updated");
    expect(getExampleStatus({ updated: true, reason: "replaced mermaid before example", content: "" })).toBe("updated");
  });

  it("trims trailing usage lines after the target machine definition", () => {
    const code = `const helper = machine("Helper", state("idle"));
const target = machine(
  "Target",
  state("idle", transition("start", "done")),
  state("done")
);

invoke(target, "start");
console.log(target.current);
`;

    expect(trimCodeToTargetMachineDefinition(code, "target")).toBe(`const helper = machine("Helper", state("idle"));
const target = machine(
  "Target",
  state("idle", transition("start", "done")),
  state("done")
);

`);
  });

  it("keeps nested syntax inside the machine definition before trimming", () => {
    const code = `const target = machine(
  "Target",
  state(
    "idle",
    description("handles ) in comments and strings"),
    entry(() => {
      const note = ")";
      const text = \`template with \${format(")")} and // text\`;
      // line comment with )
      /* block comment with ) */
      return note + text;
    }, "done", "error")
  ),
  state("done"),
  state("error")
);
invoke(target, "start");
`;

    expect(trimCodeToTargetMachineDefinition(code, "target")).toBe(`const target = machine(
  "Target",
  state(
    "idle",
    description("handles ) in comments and strings"),
    entry(() => {
      const note = ")";
      const text = \`template with \${format(")")} and // text\`;
      // line comment with )
      /* block comment with ) */
      return note + text;
    }, "done", "error")
  ),
  state("done"),
  state("error")
);
`);
  });

  it("resolves docs diagram imports from lib source instead of dist output", () => {
    const urls = getDiagramModuleUrls("/repo/root");

    expect(urls.xRobotUrl).toBe("file:///repo/root/lib/index.ts");
    expect(urls.documentateUrl).toBe("file:///repo/root/lib/documentate/index.ts");
  });

  it("ignores markdown files inside docs/api and docs/plans", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "x-robot-docs-test-"));

    try {
      await mkdir(join(tempDir, "docs", "guides"), { recursive: true });
      await mkdir(join(tempDir, "docs", "api", "modules"), { recursive: true });
      await mkdir(join(tempDir, "docs", "plans"), { recursive: true });

      await writeFile(join(tempDir, "docs", "guides", "example.md"), "# guide\n", "utf-8");
      await writeFile(join(tempDir, "docs", "api", "README.md"), "# api\n", "utf-8");
      await writeFile(join(tempDir, "docs", "api", "modules", "foo.md"), "# api module\n", "utf-8");
      await writeFile(join(tempDir, "docs", "plans", "test.md"), "# plan\n", "utf-8");

      const markdownFiles = await getMarkdownFiles(join(tempDir, "docs"));

      expect(markdownFiles).toEqual([join(tempDir, "docs", "guides", "example.md")]);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});

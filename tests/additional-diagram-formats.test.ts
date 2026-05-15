import { describe, it } from "mocha";
import expect from "expect";
import fs from "fs";
import path from "path";
import { documentate } from "../lib/documentate";
import { allFeaturesSerialized, callbackBodySentinel, payloadSentinel } from "./additional-diagram-fixture";

const formats = [
  ["mermaid-pulses", "mermaid", "flowchart TD", "entry: hydrateOrder ✓"],
  ["plantuml-pulses", "plantuml", "@startuml", "entry: hydrateOrder ✓"],
  ["mermaid-events", "mermaid", "flowchart LR", "event: submit"],
  ["plantuml-events", "plantuml", "@startuml", "event: submit"],
  ["mermaid-outcomes", "mermaid", "classDef primary", "guard failure: hasPaymentMethod"],
  ["plantuml-outcomes", "plantuml", "<<primary>>", "guard failure: hasPaymentMethod"],
  ["mermaid-immediate", "mermaid", ".->", "immediate"],
  ["plantuml-immediate", "plantuml", "..>", "immediate"],
  ["mermaid-guards", "mermaid", '{"guard: hasPaymentMethod?"}', "failure target"],
  ["plantuml-guards", "plantuml", "if (guard: hasPaymentMethod?)", "else (failure target)"],
  ["mermaid-composition", "mermaid", "flowchart TD", "nested outcome: captured"],
  ["plantuml-composition", "plantuml", "@startuml", "parallel: fulfillment"],
  ["mermaid-complexity", "mermaid", "quadrantChart", "root.processing: [0.83, 0.93]"],
  ["plantuml-complexity", "plantuml", "FontName Monospaced", "Q2 -[hidden]right- Q1"]
] as const;

const imageFormats = [
  "svg-sequence",
  "png-sequence",
  "svg-guards",
  "png-guards",
  "svg-complexity",
  "png-complexity"
] as const;

const tmpDir = path.resolve(__dirname, "../tmp/documentate-additional-images");

function cleanupImage(filePath?: string): void {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

describe("additional diagram formats", () => {
  for (const [format, resultField, syntax, expected] of formats) {
    it(`accepts ${format} and returns safe ${resultField} output`, async () => {
      const result = await documentate(allFeaturesSerialized, { format });
      const output = result[resultField];

      expect(output).toContain(syntax);
      expect(output).toContain(expected);
      expect(output).not.toContain(callbackBodySentinel);
      expect(output).not.toContain(payloadSentinel);
    });
  }

  it("does not include the additional diagrams in format all", async () => {
    const result = await documentate(allFeaturesSerialized, { format: "all" });

    expect(result.mermaid).toContain("stateDiagram-v2");
    expect(result.mermaid).not.toContain("quadrantChart");
    expect(result.plantuml).not.toContain("MANY ACTIONS / MANY TRANSITIONS");
  });

  for (const format of imageFormats) {
    it(`renders ${format} from the matching PlantUML diagram`, async () => {
      fs.mkdirSync(tmpDir, { recursive: true });
      const result = await documentate(allFeaturesSerialized, {
        format,
        output: tmpDir,
        fileName: `${format}-test`
      });
      const field = format.indexOf("svg-") === 0 ? "svg" : "png";
      const filePath = result[field];

      try {
        expect(filePath).toBeDefined();
        expect(fs.existsSync(filePath!)).toBe(true);
        if (field === "svg") {
          expect(fs.readFileSync(filePath!, "utf8")).toContain("<svg");
        } else {
          expect(fs.readFileSync(filePath!).subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
        }
      } finally {
        cleanupImage(filePath);
      }
    });
  }

  it("keeps svg and png as state diagram image formats and keeps all from expanding", async () => {
    fs.mkdirSync(tmpDir, { recursive: true });
    const svgResult = await documentate(allFeaturesSerialized, { format: "svg", output: tmpDir, fileName: "state-svg-test" });
    const pngResult = await documentate(allFeaturesSerialized, { format: "png", output: tmpDir, fileName: "state-png-test" });
    const allResult = await documentate(allFeaturesSerialized, { format: "all", output: tmpDir, fileName: "state-all-test" });

    try {
      expect(svgResult.svg).toBeDefined();
      expect(fs.readFileSync(svgResult.svg!, "utf8")).toContain("state");
      expect(pngResult.png).toBeDefined();
      expect(fs.existsSync(pngResult.png!)).toBe(true);
      expect(allResult.svg).toBeDefined();
      expect(allResult.png).toBeDefined();
      expect(Object.keys(allResult).sort()).toEqual(["cjs", "json", "mermaid", "mjs", "plantuml", "png", "scxml", "serialized", "svg", "ts"].sort());
    } finally {
      cleanupImage(svgResult.svg);
      cleanupImage(pngResult.png);
      cleanupImage(allResult.svg);
      cleanupImage(allResult.png);
    }
  });
});

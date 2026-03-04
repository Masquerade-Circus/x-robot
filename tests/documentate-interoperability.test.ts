import { documentate } from "../lib/documentate";
import type { SerializedMachine } from "../lib/documentate/types";
import { machine, init, initial, state, transition, guard } from "../lib";
import { describe, it } from "mocha";
import expect from "expect";
import fs from "fs";

describe("documentate interoperability", () => {
  const createTestMachine = () => {
    return machine(
      "TestMachine",
      init(initial("idle")),
      state("idle", transition("start", "running")),
      state("running", transition("stop", "idle"))
    );
  };

  const createSerializedMachine = (): SerializedMachine => ({
    states: {
      idle: {
        name: "idle",
        on: {
          start: { target: "running" }
        }
      },
      running: {
        name: "running",
        on: {
          stop: { target: "idle" }
        }
      }
    },
    parallel: {},
    context: {},
    title: "TestMachine",
    initial: "idle"
  });

  const scxmlString = `<?xml version="1.0" encoding="UTF-8"?>
<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0" initial="idle" name="TestMachine">
  <state id="idle">
    <transition event="start" target="running"/>
  </state>
  <state id="running">
    <transition event="stop" target="idle"/>
  </state>
</scxml>`;

  const plantumlString = `@startuml
title TestMachine
[*] --> idle
idle --> running : start
running --> idle : stop
@enduml`;

  describe("Machine input", () => {
    it("should generate all formats from Machine", async () => {
      const testMachine = createTestMachine();
      const result = await documentate(testMachine, { format: 'all' });

      expect(result.ts).toBeDefined();
      expect(result.mjs).toBeDefined();
      expect(result.cjs).toBeDefined();
      expect(result.json).toBeDefined();
      expect(result.scxml).toBeDefined();
      expect(result.plantuml).toBeDefined();
      expect(result.svg).toBeDefined();
      expect(result.png).toBeDefined();
    });

    it("should generate ts from Machine", async () => {
      const result = await documentate(createTestMachine(), { format: 'ts' });
      expect(result.ts).toContain("export interface");
    });

    it("should generate mjs from Machine", async () => {
      const result = await documentate(createTestMachine(), { format: 'mjs' });
      expect(result.mjs).toContain("export const");
    });

    it("should generate cjs from Machine", async () => {
      const result = await documentate(createTestMachine(), { format: 'cjs' });
      expect(result.cjs).toContain("module.exports");
    });

    it("should generate json from Machine", async () => {
      const result = await documentate(createTestMachine(), { format: 'json' });
      const parsed = JSON.parse(result.json!);
      expect(parsed.states).toBeDefined();
    });

    it("should generate scxml from Machine", async () => {
      const result = await documentate(createTestMachine(), { format: 'scxml' });
      expect(result.scxml).toContain("<scxml");
    });

    it("should generate plantuml from Machine", async () => {
      const result = await documentate(createTestMachine(), { format: 'plantuml' });
      expect(result.plantuml).toContain("@startuml");
    });

    it("should generate svg from Machine", async () => {
      const result = await documentate(createTestMachine(), { format: 'svg' });
      expect(result.svg).toBeDefined();
      expect(fs.existsSync(result.svg!)).toBeTruthy();
      fs.unlinkSync(result.svg!);
    });

    it("should generate png from Machine", async () => {
      const result = await documentate(createTestMachine(), { format: 'png' });
      expect(result.png).toBeDefined();
      expect(fs.existsSync(result.png!)).toBeTruthy();
      fs.unlinkSync(result.png!);
    });

    it("should generate serialized from Machine", async () => {
      const result = await documentate(createTestMachine(), { format: 'serialized' });
      expect(result.serialized).toBeDefined();
      expect(result.serialized!.states).toBeDefined();
    });
  });

  describe("SerializedMachine input", () => {
    it("should generate all possible formats from SerializedMachine", async () => {
      const serialized = createSerializedMachine();
      const result = await documentate(serialized, { format: 'all' });

      expect(result.ts).toBeDefined();
      expect(result.mjs).toBeDefined();
      expect(result.cjs).toBeDefined();
      expect(result.json).toBeDefined();
      expect(result.scxml).toBeDefined();
      expect(result.plantuml).toBeDefined();
      expect(result.svg).toBeDefined();
      expect(result.png).toBeDefined();
    });

    it("should generate ts from SerializedMachine", async () => {
      const result = await documentate(createSerializedMachine(), { format: 'ts' });
      expect(result.ts).toContain("export interface");
    });

    it("should generate mjs from SerializedMachine", async () => {
      const result = await documentate(createSerializedMachine(), { format: 'mjs' });
      expect(result.mjs).toContain("export const");
    });

    it("should generate cjs from SerializedMachine", async () => {
      const result = await documentate(createSerializedMachine(), { format: 'cjs' });
      expect(result.cjs).toContain("module.exports");
    });

    it("should generate json from SerializedMachine", async () => {
      const result = await documentate(createSerializedMachine(), { format: 'json' });
      const parsed = JSON.parse(result.json!);
      expect(parsed.states).toBeDefined();
    });

    it("should generate scxml from SerializedMachine", async () => {
      const result = await documentate(createSerializedMachine(), { format: 'scxml' });
      expect(result.scxml).toContain("<scxml");
    });

    it("should generate plantuml from SerializedMachine", async () => {
      const result = await documentate(createSerializedMachine(), { format: 'plantuml' });
      expect(result.plantuml).toContain("@startuml");
    });

    it("should generate serialized from SerializedMachine", async () => {
      const serialized = createSerializedMachine();
      const result = await documentate(serialized, { format: 'serialized' });
      expect(result.serialized).toBeDefined();
      expect(result.serialized!.title).toBe("TestMachine");
    });

    it("should generate svg from SerializedMachine", async () => {
      const result = await documentate(createSerializedMachine(), { format: 'svg' });
      expect(result.svg).toBeDefined();
      expect(fs.existsSync(result.svg!)).toBeTruthy();
      fs.unlinkSync(result.svg!);
    });

    it("should generate png from SerializedMachine", async () => {
      const result = await documentate(createSerializedMachine(), { format: 'png' });
      expect(result.png).toBeDefined();
      expect(fs.existsSync(result.png!)).toBeTruthy();
      fs.unlinkSync(result.png!);
    });
  });

  describe("SCXML input", () => {
    it("should generate all possible formats from SCXML", async () => {
      const result = await documentate(scxmlString, { format: 'all' });

      expect(result.ts).toBeDefined();
      expect(result.mjs).toBeDefined();
      expect(result.cjs).toBeDefined();
      expect(result.json).toBeDefined();
      expect(result.scxml).toBeDefined();
      expect(result.plantuml).toBeDefined();
      expect(result.svg).toBeDefined();
      expect(result.png).toBeDefined();
    });

    it("should generate ts from SCXML", async () => {
      const result = await documentate(scxmlString, { format: 'ts' });
      expect(result.ts).toContain("export interface");
    });

    it("should generate mjs from SCXML", async () => {
      const result = await documentate(scxmlString, { format: 'mjs' });
      expect(result.mjs).toContain("export const");
    });

    it("should generate cjs from SCXML", async () => {
      const result = await documentate(scxmlString, { format: 'cjs' });
      expect(result.cjs).toContain("module.exports");
    });

    it("should generate json from SCXML", async () => {
      const result = await documentate(scxmlString, { format: 'json' });
      const parsed = JSON.parse(result.json!);
      expect(parsed.states).toBeDefined();
    });

    it("should generate scxml from SCXML", async () => {
      const result = await documentate(scxmlString, { format: 'scxml' });
      expect(result.scxml).toContain("<scxml");
    });

    it("should generate plantuml from SCXML", async () => {
      const result = await documentate(scxmlString, { format: 'plantuml' });
      expect(result.plantuml).toContain("@startuml");
    });

    it("should generate serialized from SCXML", async () => {
      const result = await documentate(scxmlString, { format: 'serialized' });
      expect(result.serialized).toBeDefined();
      expect(result.serialized!.title).toBe("TestMachine");
    });

    it("should generate svg from SCXML", async () => {
      const result = await documentate(scxmlString, { format: 'svg' });
      expect(result.svg).toBeDefined();
      expect(fs.existsSync(result.svg!)).toBeTruthy();
      fs.unlinkSync(result.svg!);
    });

    it("should generate png from SCXML", async () => {
      const result = await documentate(scxmlString, { format: 'png' });
      expect(result.png).toBeDefined();
      expect(fs.existsSync(result.png!)).toBeTruthy();
      fs.unlinkSync(result.png!);
    });
  });

  describe("PlantUML input", () => {
    it("should generate svg and png from PlantUML", async () => {
      const result = await documentate(plantumlString, { format: 'all' });

      expect(result.svg).toBeDefined();
      expect(fs.existsSync(result.svg!)).toBeTruthy();
      fs.unlinkSync(result.svg!);
      
      expect(result.png).toBeDefined();
      expect(fs.existsSync(result.png!)).toBeTruthy();
      fs.unlinkSync(result.png!);
      
      expect(result.plantuml).toBeDefined();
    });

    it("should generate svg from PlantUML", async () => {
      const result = await documentate(plantumlString, { format: 'svg' });
      expect(result.svg).toBeDefined();
      expect(fs.existsSync(result.svg!)).toBeTruthy();
      fs.unlinkSync(result.svg!);
    });

    it("should generate png from PlantUML", async () => {
      const result = await documentate(plantumlString, { format: 'png' });
      expect(result.png).toBeDefined();
      expect(fs.existsSync(result.png!)).toBeTruthy();
      fs.unlinkSync(result.png!);
    });

    it("should preserve plantuml input", async () => {
      const result = await documentate(plantumlString, { format: 'plantuml' });
      expect(result.plantuml).toContain("@startuml");
    });
  });

  describe("roundtrip integrity", () => {
    it("should maintain data integrity: Machine -> SerializedMachine -> Machine", async () => {
      const originalMachine = createTestMachine();
      
      const serializedResult = await documentate(originalMachine, { format: 'serialized' });
      const serialized = serializedResult.serialized!;
      
      expect(serialized.title).toBe("TestMachine");
      expect(serialized.initial).toBe("idle");
      expect(serialized.states.idle).toBeDefined();
      expect(serialized.states.running).toBeDefined();
    });

    it("should maintain data integrity: Machine -> SCXML -> SerializedMachine", async () => {
      const originalMachine = createTestMachine();
      
      const scxmlResult = await documentate(originalMachine, { format: 'scxml' });
      const serializedResult = await documentate(scxmlResult.scxml!, { format: 'serialized' });
      const imported = serializedResult.serialized!;
      
      expect(imported.title).toBe("TestMachine");
      expect(imported.initial).toBe("idle");
      expect(Object.keys(imported.states)).toContain("idle");
      expect(Object.keys(imported.states)).toContain("running");
    });

    it("should maintain data integrity: Machine -> JSON -> SerializedMachine", async () => {
      const originalMachine = createTestMachine();
      
      const jsonResult = await documentate(originalMachine, { format: 'json' });
      const serializedResult = await documentate(originalMachine, { format: 'serialized' });
      
      const fromJson = JSON.parse(jsonResult.json!);
      const fromSerialized = serializedResult.serialized!;
      
      expect(fromJson.title).toBe(fromSerialized.title);
      expect(fromJson.initial).toBe(fromSerialized.initial);
    });

    it("should maintain data integrity: Machine -> PlantUML -> SVG", async () => {
      const originalMachine = createTestMachine();
      
      const plantumlResult = await documentate(originalMachine, { format: 'plantuml' });
      const svgResult = await documentate(plantumlResult.plantuml!, { format: 'svg' });
      
      expect(svgResult.svg).toBeDefined();
      expect(fs.existsSync(svgResult.svg!)).toBeTruthy();
      fs.unlinkSync(svgResult.svg!);
    });
  });

  describe("edge cases", () => {
    it("should handle Machine with guards", async () => {
      const machineWithGuards = machine(
        "GuardTest",
        init(initial("idle")),
        state("idle", transition("check", "active", guard(() => true, "error"))),
        state("active"),
        state("error")
      );

      const result = await documentate(machineWithGuards, { format: 'all' });
      
      expect(result.ts).toBeDefined();
      expect(result.mjs).toBeDefined();
      expect(result.json).toBeDefined();
      expect(result.scxml).toBeDefined();
      expect(result.plantuml).toBeDefined();
      expect(result.svg).toBeDefined();
    });

    it("should handle empty Machine", async () => {
      const emptyMachine = machine(
        "Empty",
        init(initial("idle")),
        state("idle")
      );

      const result = await documentate(emptyMachine, { format: 'all' });
      
      expect(result.ts).toBeDefined();
      expect(result.json).toBeDefined();
      expect(result.scxml).toBeDefined();
      expect(result.plantuml).toBeDefined();
    });

    it("should throw on invalid SCXML input", async () => {
      const invalidScxml = "not valid scxml";
      
      await expect(
        documentate(invalidScxml, { format: 'ts' })
      ).rejects.toThrow();
    });

    it("should throw on invalid PlantUML input", async () => {
      const invalidPlantuml = "not valid plantuml";
      
      await expect(
        documentate(invalidPlantuml, { format: 'svg' })
      ).rejects.toThrow();
    });
  });
});

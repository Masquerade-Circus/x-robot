import { describe, it } from "mocha";
import expect from "expect";
import { JSDOM } from "jsdom";
import { documentate } from "../lib/documentate";
import type { SerializedMachine } from "../lib/documentate";
import { collectAdditionalDiagramModel } from "../lib/documentate/diagram-model";
import { allFeaturesSerialized } from "./additional-diagram-fixture";

const aliasCollisionSerialized: SerializedMachine = {
  title: "AliasCollision",
  initial: "a-b",
  context: {},
  parallel: {},
  states: {
    "a-b": {
      name: "a-b",
      on: { "save-draft": { target: "a_b" } }
    },
    a_b: {
      name: "a_b",
      on: { save_draft: { target: "a-b" } }
    }
  }
};

const crowdedComplexitySerialized: SerializedMachine = {
  title: "CrowdedComplexity",
  initial: "alpha",
  context: {},
  parallel: {},
  states: {
    alpha: { name: "alpha", on: { next: { target: "beta" } } },
    beta: { name: "beta", on: { next: { target: "gamma" } } },
    gamma: { name: "gamma", on: { next: { target: "delta" } } },
    delta: { name: "delta", on: { next: { target: "epsilon" } } },
    epsilon: { name: "epsilon", on: { next: { target: "zeta" } } },
    zeta: { name: "zeta", on: { next: { target: "alpha" } } }
  }
};

const edgeAlignedComplexitySerialized: SerializedMachine = {
  title: "EdgeAlignedComplexity",
  initial: "left",
  context: {},
  parallel: {},
  states: {
    left: { name: "left" },
    center: {
      name: "center",
      on: {
        c1: { target: "center" },
        c2: { target: "center" },
        c3: { target: "center" }
      }
    },
    right: {
      name: "right",
      on: {
        r1: { target: "right" },
        r2: { target: "right" },
        r3: { target: "right" },
        r4: { target: "right" }
      }
    }
  }
};

const unsafeLabelSerialized: SerializedMachine = {
  title: 'Unsafe "Root" | {machine}',
  initial: 'idle "start"',
  context: {},
  parallel: {
    'ops|lane': {
      title: 'Ops (lane) {A}',
      initial: 'nested[one]',
      context: {},
      parallel: {},
      states: {
        'nested[one]': {
          name: 'nested[one]',
          on: { 'sync|now': { target: 'nested(done)' } }
        },
        'nested(done)': { name: 'nested(done)' }
      }
    }
  },
  states: {
    'idle "start"': {
      name: 'idle "start"',
      run: [{ pulse: 'load\\cache|warm\nagain', success: 'review[qa]', failure: 'failed{hard}' }],
      on: {
        'submit|order': {
          target: 'done(final)',
          guards: [{ guard: 'has "quote" | pipe (and) [brackets] {braces} \\ slash\nnewline', failure: 'failed{hard}' }],
          exit: [{ pulse: 'cleanup|temp', failure: 'failed{hard}' }]
        }
      }
    },
    'review[qa]': {
      name: 'review[qa]',
      immediate: [{ immediate: 'done(final)', guards: [{ guard: 'qa|passed (fast)', failure: 'failed{hard}' }] }]
    },
    'done(final)': { name: 'done(final)', type: 'success' },
    'failed{hard}': { name: 'failed{hard}', type: 'danger' }
  }
};

const distinctUnsafeLabelsSerialized: SerializedMachine = {
  title: 'Distinct "Root"',
  initial: 'a\\b',
  context: {},
  parallel: {},
  states: {
    'a\\b': { name: 'a\\b', on: { next: { target: 'a/b' } } },
    'a/b': { name: 'a/b', on: { next: { target: 'a|b' } } },
    'a|b': { name: 'a|b', on: { next: { target: 'quote "x"' } } },
    'quote "x"': { name: 'quote "x"', on: { next: { target: 'bracket[x]' } } },
    'bracket[x]': { name: 'bracket[x]', on: { next: { target: 'brace{x}' } } },
    'brace{x}': { name: 'brace{x}', on: { next: { target: 'paren(x)' } } },
    'paren(x)': { name: 'paren(x)' }
  }
};

const literalBackslashNSerialized: SerializedMachine = {
  title: "LiteralBackslashN",
  initial: "a\\nb",
  context: {},
  parallel: {},
  states: {
    "a\\nb": { name: "a\\nb" }
  }
};

const literalBackslashNComplexitySerialized: SerializedMachine = {
  title: "LiteralBackslashNComplexity",
  initial: "a\\nb",
  context: {},
  parallel: {},
  states: {
    "a\\nb": {
      name: "a\\nb",
      run: [{ pulse: "load" }],
      on: { next: { target: "a\\nb" } }
    }
  }
};

function eventAliasesFromMermaid(code: string): string[] {
  const aliases: string[] = [];
  const pattern = /^\s*([A-Za-z0-9_]+)\{\{"event: save[-_]draft"\}\}/gm;
  let match = pattern.exec(code);
  while (match) {
    aliases.push(match[1]);
    match = pattern.exec(code);
  }
  return aliases;
}

function eventAliasesFromPlantUml(code: string): string[] {
  const aliases: string[] = [];
  const pattern = /^rectangle "event: save[-_]draft" as ([A-Za-z0-9_]+)$/gm;
  let match = pattern.exec(code);
  while (match) {
    aliases.push(match[1]);
    match = pattern.exec(code);
  }
  return aliases;
}

function mermaidCompositionStateLabels(code: string): string[] {
  const labels: string[] = [];
  const pattern = /^\s*[A-Za-z0-9_]+\["state: ([^"]+)"\]$/gm;
  let match = pattern.exec(code);
  while (match) {
    labels.push(match[1]);
    match = pattern.exec(code);
  }
  return labels;
}

function plantUmlCompositionStateLabels(code: string): string[] {
  const labels: string[] = [];
  const pattern = /^rectangle "state: ([^"]+)" as [A-Za-z0-9_]+$/gm;
  let match = pattern.exec(code);
  while (match) {
    labels.push(match[1]);
    match = pattern.exec(code);
  }
  return labels;
}

async function expectMermaidToParse(code: string): Promise<void> {
  const { window } = new JSDOM("<!doctype html><html><body></body></html>");
  (globalThis as any).window = window;
  (globalThis as any).document = window.document;
  Object.defineProperty(globalThis, "navigator", { value: window.navigator, configurable: true });
  const { default: createDOMPurify } = await import("dompurify");
  (globalThis as any).DOMPurify = createDOMPurify(window);
  const { default: mermaid } = await import("mermaid");
  mermaid.initialize({ startOnLoad: false });

  await expect(mermaid.parse(code)).resolves.toBeTruthy();
}

function quadrantRowCounts(plantuml: string): number[] {
  return (plantuml.match(/rectangle "[^"]+" as Q[1-4]/g) || [])
    .map((box) => (box.match(/\\n│/g) || []).length);
}

function mermaidComplexityCoordinates(mermaid: string): Array<{ label: string; x: number; y: number }> {
  const coordinates: Array<{ label: string; x: number; y: number }> = [];
  const pattern = /^\s{2}([^\n:]+): \[([0-9.]+), ([0-9.]+)\]$/gm;
  let match = pattern.exec(mermaid);
  while (match) {
    coordinates.push({ label: match[1], x: Number(match[2]), y: Number(match[3]) });
    match = pattern.exec(mermaid);
  }
  return coordinates;
}

function plantUmlQuadrantRows(plantuml: string, alias: string): string[] {
  const match = new RegExp(`rectangle "([^"]+)" as ${alias}`).exec(plantuml);
  if (!match) {
    return [];
  }
  return match[1]
    .split("\\n")
    .filter((line) => line.indexOf("│") === 0 && line.lastIndexOf("│") === line.length - 1);
}

function shortenExpectedPlantUmlLabel(label: string): string {
  return label.length > 22 ? `${label.slice(0, 21)}…` : label;
}

function complexityQuadrant(point: { x: number; y: number }): "Q1" | "Q2" | "Q3" | "Q4" {
  if (point.x >= 0.5 && point.y >= 0.5) return "Q1";
  if (point.x < 0.5 && point.y >= 0.5) return "Q2";
  if (point.x < 0.5 && point.y < 0.5) return "Q3";
  return "Q4";
}

function plantUmlComplexityCoordinates(plantuml: string): Array<{ label: string; quadrant: "Q1" | "Q2" | "Q3" | "Q4"; x: number; y: number }> {
  const coordinates: Array<{ label: string; quadrant: "Q1" | "Q2" | "Q3" | "Q4"; x: number; y: number }> = [];
  for (const quadrant of ["Q1", "Q2", "Q3", "Q4"] as const) {
    const rows = plantUmlQuadrantRows(plantuml, quadrant).map((row) => row.slice(1, -1));
    for (let labelRow = 1; labelRow < rows.length; labelRow++) {
      const bulletColumn = rows[labelRow - 1].indexOf("●");
      if (bulletColumn < 0) {
        continue;
      }

      const label = rows[labelRow].trim();
      if (!label) {
        continue;
      }

      const localX = bulletColumn / (rows[labelRow - 1].length - 2);
      const localY = (rows.length - 1 - (labelRow - 1)) / (rows.length - 1);
      coordinates.push({
        label,
        quadrant,
        x: quadrant === "Q1" || quadrant === "Q4" ? 0.5 + localX * 0.5 : localX * 0.5,
        y: quadrant === "Q1" || quadrant === "Q2" ? 0.5 + localY * 0.5 : localY * 0.5
      });
    }
  }
  return coordinates;
}

function placedPlantUmlLabel(plantuml: string, alias: string, label: string): {
  bulletRow: number;
  labelRow: number;
  bulletColumn: number;
  labelStart: number;
  labelEnd: number;
} {
  const rows = plantUmlQuadrantRows(plantuml, alias).map((row) => row.slice(1, -1));
  const labelRow = rows.findIndex((row) => row.indexOf(label) >= 0);
  expect(labelRow).toBeGreaterThan(0);
  const bulletRow = labelRow - 1;
  const bulletColumn = rows[bulletRow].indexOf("●");
  expect(bulletColumn).toBeGreaterThanOrEqual(0);
  const labelStart = rows[labelRow].indexOf(label);

  return {
    bulletRow,
    labelRow,
    bulletColumn,
    labelStart,
    labelEnd: labelStart + label.length - 1
  };
}

function maxComplexityQuadrantSize(machine: SerializedMachine): number {
  const groups = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  for (const point of collectAdditionalDiagramModel(machine).complexityPoints) {
    if (point.x >= 0.5 && point.y >= 0.5) groups.Q1 += 1;
    else if (point.x < 0.5 && point.y >= 0.5) groups.Q2 += 1;
    else if (point.x < 0.5 && point.y < 0.5) groups.Q3 += 1;
    else groups.Q4 += 1;
  }
  return Math.max(3, groups.Q1, groups.Q2, groups.Q3, groups.Q4);
}

function expectedComplexityQuadrantHeight(machine: SerializedMachine): number {
  const tallestQuadrant = maxComplexityQuadrantSize(machine);
  return Math.max(5, tallestQuadrant * 2 + 2);
}

describe("pulse map", () => {
  it("renders entry success/failure and exit pulse edges", async () => {
    const mermaid = (await documentate(allFeaturesSerialized, { format: "mermaid-pulses" })).mermaid!;
    const plantuml = (await documentate(allFeaturesSerialized, { format: "plantuml-pulses" })).plantuml!;

    expect(mermaid).toContain('root_created -->|"entry: hydrateOrder ✓"| root_ready');
    expect(mermaid).toContain('root_processing -->|"exit: releaseReservation on cancel"| root_cancelled');
    expect(plantuml).toContain('root_created --> root_ready : entry: hydrateOrder ✓');
    expect(plantuml).toContain('root_processing --> root_cancelled : exit: releaseReservation on cancel');
  });
});

describe("additional diagram label escaping", () => {
  it("escapes unsafe labels consistently for Mermaid and PlantUML additional maps", async () => {
    const mermaidPulses = (await documentate(unsafeLabelSerialized, { format: "mermaid-pulses" })).mermaid!;
    const plantUmlPulses = (await documentate(unsafeLabelSerialized, { format: "plantuml-pulses" })).plantuml!;
    const mermaidGuards = (await documentate(unsafeLabelSerialized, { format: "mermaid-guards" })).mermaid!;
    const plantUmlGuards = (await documentate(unsafeLabelSerialized, { format: "plantuml-guards" })).plantuml!;
    const mermaidComposition = (await documentate(unsafeLabelSerialized, { format: "mermaid-composition" })).mermaid!;
    const plantUmlComposition = (await documentate(unsafeLabelSerialized, { format: "plantuml-composition" })).plantuml!;
    const expectedGuard = "has ＂quote＂ ｜ pipe （and） ［brackets］ ｛braces｝ ＼ slash newline";

    expect(mermaidPulses).toContain('entry: load＼cache｜warm again ✓');
    expect(plantUmlPulses).toContain('entry: load＼cache｜warm again ✓');
    expect(mermaidGuards).toContain(`guard: ${expectedGuard}?`);
    expect(plantUmlGuards).toContain(`if (guard: ${expectedGuard}?) then (target)`);
    expect(mermaidComposition).toContain("Unsafe ＂Root＂ ｜ ｛machine｝\\ninitial: idle ＂start＂");
    expect(plantUmlComposition).toContain("Unsafe ＂Root＂ ｜ ｛machine｝\\ninitial: idle ＂start＂");

    for (const code of [mermaidPulses, mermaidGuards, mermaidComposition]) {
      expect(code).not.toContain('"quote"');
      expect(code).not.toContain('| pipe');
      await expectMermaidToParse(code);
    }
    for (const code of [plantUmlPulses, plantUmlGuards, plantUmlComposition]) {
      expect(code).not.toContain('"quote"');
      expect(code).not.toContain('| pipe');
    }
  });

  it("keeps escaped additional-map labels visually distinguishable instead of collapsing unsafe characters", async () => {
    const mermaid = (await documentate(distinctUnsafeLabelsSerialized, { format: "mermaid-composition" })).mermaid!;
    const plantuml = (await documentate(distinctUnsafeLabelsSerialized, { format: "plantuml-composition" })).plantuml!;
    const expectedLabels = ["a＼b", "a/b", "a｜b", "quote ＂x＂", "bracket［x］", "brace｛x｝", "paren（x）"];

    for (const labels of [mermaidCompositionStateLabels(mermaid), plantUmlCompositionStateLabels(plantuml)]) {
      expect(labels).toHaveLength(expectedLabels.length);
      expect(new Set(labels).size).toBe(expectedLabels.length);
      expect(labels).toEqual(expect.arrayContaining(expectedLabels));
    }

    await expectMermaidToParse(mermaid);
  });

  it("escapes literal backslash-n labels in additional maps without creating line breaks", async () => {
    const mermaid = (await documentate(literalBackslashNSerialized, { format: "mermaid-composition" })).mermaid!;
    const plantuml = (await documentate(literalBackslashNSerialized, { format: "plantuml-composition" })).plantuml!;

    expect(mermaidCompositionStateLabels(mermaid)).toEqual(expect.arrayContaining(["a＼nb"]));
    expect(plantUmlCompositionStateLabels(plantuml)).toEqual(expect.arrayContaining(["a＼nb"]));
    expect(mermaid).not.toContain("state: a\\nb");
    expect(plantuml).not.toContain("state: a\\nb");
    expect(mermaid).not.toContain("state: a\nb");
    expect(plantuml).not.toContain("state: a\nb");

    await expectMermaidToParse(mermaid);
  });
});

describe("event map", () => {
  it("deduplicates event nodes while preserving state-specific edges", async () => {
    const mermaid = (await documentate(allFeaturesSerialized, { format: "mermaid-events" })).mermaid!;
    const plantuml = (await documentate(allFeaturesSerialized, { format: "plantuml-events" })).plantuml!;

    expect((mermaid.match(/event_submit\{\{"event: submit"\}\}/g) || [])).toHaveLength(1);
    expect(mermaid).toContain("root_created --> event_submit");
    expect(mermaid).toContain("root_ready --> event_submit");
    expect(plantuml).toContain('rectangle "event: submit" as event_submit');
    expect(plantuml).toContain("root_ready --> event_submit");
  });

  it("renders events with colliding sanitized names as distinct Mermaid and PlantUML nodes", async () => {
    const mermaid = (await documentate(aliasCollisionSerialized, { format: "mermaid-events" })).mermaid!;
    const plantuml = (await documentate(aliasCollisionSerialized, { format: "plantuml-events" })).plantuml!;
    const mermaidAliases = eventAliasesFromMermaid(mermaid);
    const plantUmlAliases = eventAliasesFromPlantUml(plantuml);

    expect(mermaidAliases).toHaveLength(2);
    expect(new Set(mermaidAliases).size).toBe(2);
    expect(plantUmlAliases).toHaveLength(2);
    expect(new Set(plantUmlAliases).size).toBe(2);
  });
});

describe("outcome map", () => {
  it("renders state types and serialized outcome edges", async () => {
    const mermaid = (await documentate(allFeaturesSerialized, { format: "mermaid-outcomes" })).mermaid!;
    const plantuml = (await documentate(allFeaturesSerialized, { format: "plantuml-outcomes" })).plantuml!;

    expect(mermaid).toContain('root_ready["ready\\ndefault"]:::default');
    expect(mermaid).toContain('root_ready -->|"guard failure: hasPaymentMethod"| root_paymentRequired');
    expect(plantuml).toContain('rectangle "created\\nprimary" as root_created <<primary>>');
    expect(plantuml).toContain('root_ready --> root_paymentRequired : guard failure: hasPaymentMethod');
  });
});

describe("immediate map", () => {
  it("renders immediate edges with guard metadata", async () => {
    const mermaid = (await documentate(allFeaturesSerialized, { format: "mermaid-immediate" })).mermaid!;
    const plantuml = (await documentate(allFeaturesSerialized, { format: "plantuml-immediate" })).plantuml!;

    expect(mermaid).toContain('root_processing -. "immediate" .-> root_fulfilling');
    expect(mermaid).toContain('root_parallel_fulfillment_queued -. "immediate ［guard: inventoryAvailable; failure: inventoryIssue］" .-> root_parallel_fulfillment_pick');
    expect(plantuml).toContain('root_processing ..> root_fulfilling : immediate');
  });
});

describe("guard decision map", () => {
  it("renders Mermaid guards as the same activity-style decision flow as PlantUML", async () => {
    const mermaid = (await documentate(allFeaturesSerialized, { format: "mermaid-guards" })).mermaid!;
    const plantuml = (await documentate(allFeaturesSerialized, { format: "plantuml-guards" })).plantuml!;
    const model = collectAdditionalDiagramModel(allFeaturesSerialized);

    expect(mermaid).toContain("flowchart TD");
    expect(mermaid).toContain('guard_start(["start"])');
    expect(mermaid).toContain('guard_stop(["stop"])');
    expect(mermaid).not.toContain('decision_1{"guard: hasPaymentMethod"}');
    expect(mermaid).not.toContain('root_ready -->|"event: submit"| decision_1');

    for (let i = 0; i < model.guardDecisions.length; i++) {
      const decision = model.guardDecisions[i];
      expect(mermaid).toContain(`guard_${i}_source["state: ${decision.sourceLabel}"]`);
      expect(mermaid).toContain(`guard_${i}_trigger["${decision.triggerLabel}"]`);
      expect(mermaid).toContain(`guard_${i}_decision{"guard: ${decision.guardName}?"}`);
      expect(plantuml).toContain(`:state: ${decision.sourceLabel};`);
      expect(plantuml).toContain(`:${decision.triggerLabel};`);
      expect(plantuml).toContain(`if (guard: ${decision.guardName}?) then (target)`);

      if (decision.successTargetLabel) {
        expect(mermaid).toContain(`guard_${i}_success["${decision.successTargetLabel}"]`);
        expect(mermaid).toContain(`guard_${i}_decision -->|"target"| guard_${i}_success`);
        expect(plantuml).toContain(`:${decision.successTargetLabel};`);
      }

      if (decision.failureTargetLabel) {
        expect(mermaid).toContain(`guard_${i}_failure["${decision.failureTargetLabel}"]`);
        expect(mermaid).toContain(`guard_${i}_decision -->|"failure target"| guard_${i}_failure`);
        expect(plantuml).toContain(`:${decision.failureTargetLabel};`);
      }
    }

    await expectMermaidToParse(mermaid);
  });
});

describe("composition map", () => {
  it("renders root, nested, and parallel relationships only", async () => {
    const mermaid = (await documentate(allFeaturesSerialized, { format: "mermaid-composition" })).mermaid!;
    const plantuml = (await documentate(allFeaturesSerialized, { format: "plantuml-composition" })).plantuml!;

    expect(mermaid).toContain('machine_root[["OrderWorkflow\\ninitial: created"]]');
    expect(mermaid).toContain('root_processing -->|"nested outcome: captured"| machine_root_state_processing_nested_0');
    expect(plantuml).toContain('machine_root --> root_processing : has state');
    expect(plantuml).toContain('machine_root --> machine_root_parallel_fulfillment : parallel: fulfillment');
    expect(mermaid).not.toContain('event: submit');
  });
});

describe("complexity map", () => {
  it("renders max transition and action loads as visible complexity metadata", async () => {
    const mermaid = (await documentate(allFeaturesSerialized, { format: "mermaid-complexity" })).mermaid!;
    const plantuml = (await documentate(allFeaturesSerialized, { format: "plantuml-complexity" })).plantuml!;

    expect(mermaid).toContain("title State complexity map (max transitions: 6, max actions: 2)");
    expect(plantuml).toContain("title State complexity map\\nMax transition load: 6\\nMax action load: 2");
  });

  it("renders shared scores in Mermaid and fixed-width PlantUML quadrants", async () => {
    const mermaid = (await documentate(allFeaturesSerialized, { format: "mermaid-complexity" })).mermaid!;
    const plantuml = (await documentate(allFeaturesSerialized, { format: "plantuml-complexity" })).plantuml!;

    expect(mermaid).toContain("quadrantChart");
    expect(mermaid).toContain("x-axis Few transitions --> Many transitions");
    expect(mermaid).toContain("root.created: [0.33, 0.93]");
    expect(plantuml).toContain("skinparam rectangle {\n  RoundCorner 12\n  Shadowing false\n  FontName Monospaced\n}");
    expect(plantuml).toContain("┌──────────────────────────────────┐");
    expect(plantuml).toContain("│                                  │");
    expect(plantuml).toContain("└──────────────────────────────────┘");
    expect(plantuml).toContain("Q2 -[hidden]right- Q1");
    expect(plantuml).toContain("Q1 -[hidden]down- Q4");
  });

  it("renders readable contextual complexity labels without PlantUML row collisions", async () => {
    const mermaid = (await documentate(allFeaturesSerialized, { format: "mermaid-complexity" })).mermaid!;
    const plantuml = (await documentate(allFeaturesSerialized, { format: "plantuml-complexity" })).plantuml!;

    expect(mermaid).toContain("root.created: [0.33, 0.93]");
    expect(mermaid).toContain("Payment.created: [0.31, 0.80]");
    expect(mermaid).toContain("root.cancelled: [0.94, 0.03]");
    expect(mermaid).toContain("Payment.cancelled: [0.22, 0.10]");
    expect(mermaid.match(/^  created:/gm)).toBeNull();
    expect(plantuml).not.toMatch(/[A-Za-z]createdcreated[A-Za-z]?/);
    expect(plantuml).not.toMatch(/●[^\n│]*●/);
  });

  it("escapes literal backslash-n in PlantUML complexity labels without breaking quadrant rows", async () => {
    const plantuml = (await documentate(literalBackslashNComplexitySerialized, { format: "plantuml-complexity" })).plantuml!;
    const labels = plantUmlComplexityCoordinates(plantuml).map((point) => point.label);

    expect(labels).toEqual(expect.arrayContaining(["root.a＼nb"]));
    expect(labels).not.toEqual(expect.arrayContaining(["root.a\\nb"]));
    expect(plantuml).toContain("root.a＼nb");
    expect(plantuml).not.toContain("root.a\\nb");
    expect(quadrantRowCounts(plantuml)).toEqual([5, 5, 5, 5]);
  });

  it("renders PlantUML complexity labels on the row immediately below their point", async () => {
    const plantuml = (await documentate(edgeAlignedComplexitySerialized, { format: "plantuml-complexity" })).plantuml!;
    const left = placedPlantUmlLabel(plantuml, "Q3", "root.left");
    const center = placedPlantUmlLabel(plantuml, "Q4", "root.center");
    const right = placedPlantUmlLabel(plantuml, "Q4", "root.right");

    expect(left.labelRow).toBe(left.bulletRow + 1);
    expect(center.labelRow).toBe(center.bulletRow + 1);
    expect(right.labelRow).toBe(right.bulletRow + 1);
  });

  it("adaptively aligns PlantUML complexity labels at left, center, and right positions", async () => {
    const plantuml = (await documentate(edgeAlignedComplexitySerialized, { format: "plantuml-complexity" })).plantuml!;
    const left = placedPlantUmlLabel(plantuml, "Q3", "root.left");
    const center = placedPlantUmlLabel(plantuml, "Q4", "root.center");
    const right = placedPlantUmlLabel(plantuml, "Q4", "root.right");

    expect(left.labelStart).toBe(1);
    expect(Math.abs((center.labelStart + Math.floor("root.center".length / 2)) - center.bulletColumn)).toBeLessThanOrEqual(1);
    expect(right.labelEnd).toBe(32);
  });

  it("renders Mermaid complexity output accepted by Mermaid quadrant charts", async () => {
    const mermaid = (await documentate(allFeaturesSerialized, { format: "mermaid-complexity" })).mermaid!;

    await expectMermaidToParse(mermaid);
  });

  it("packs crowded Mermaid complexity points away from identical coordinates and axes", async () => {
    const mermaid = (await documentate(crowdedComplexitySerialized, { format: "mermaid-complexity" })).mermaid!;
    const coordinates = mermaidComplexityCoordinates(mermaid);

    expect(coordinates).toHaveLength(6);
    expect(new Set(coordinates.map((point) => `${point.x},${point.y}`)).size).toBe(coordinates.length);
    for (const point of coordinates) {
      expect([0, 0.5, 1]).not.toContain(point.x);
      expect([0, 0.5, 1]).not.toContain(point.y);
      expect(point.x).toBeGreaterThan(0.5);
      expect(point.y).toBeLessThan(0.5);
    }
  });

  it("distributes crowded PlantUML complexity points across padded quadrant rows and columns", async () => {
    const plantuml = (await documentate(crowdedComplexitySerialized, { format: "plantuml-complexity" })).plantuml!;
    const q4Rows = plantUmlQuadrantRows(plantuml, "Q4");
    const occupiedRows = q4Rows.filter((row) => row.indexOf("●") >= 0);
    const bulletColumns = occupiedRows.map((row) => row.indexOf("●"));

    expect(q4Rows).toHaveLength(expectedComplexityQuadrantHeight(crowdedComplexitySerialized));
    expect(occupiedRows).toHaveLength(6);
    expect(q4Rows.every((row) => row.length === "│                                  │".length)).toBe(true);
    expect(new Set(bulletColumns).size).toBeGreaterThan(2);
    expect(plantuml).not.toMatch(/\+\d+ more/);
    for (const label of ["root.alpha", "root.beta", "root.gamma", "root.delta", "root.epsilon", "root.zeta"]) {
      expect(plantuml).toContain(label);
    }
  });

  it("renders every PlantUML complexity point using the tallest quadrant height", async () => {
    const plantuml = (await documentate(allFeaturesSerialized, { format: "plantuml-complexity" })).plantuml!;

    expect(plantuml).not.toMatch(/\+\d+ more/);
    const expectedRows = expectedComplexityQuadrantHeight(allFeaturesSerialized);
    expect(quadrantRowCounts(plantuml)).toEqual([expectedRows, expectedRows, expectedRows, expectedRows]);
    expect(plantuml).toContain("root.ready");
    expect(plantuml).toContain("root.invalid");
    expect(plantuml).toContain("Payment.manualReview");
    expect(plantuml).toContain("Fulfillment.queued");
    expect(plantuml).toContain("┌──────────────────────────────────┐");
    expect(plantuml).toContain("└──────────────────────────────────┘");
    for (const row of plantuml.match(/│[^│]*│/g) || []) {
      expect(row.length).toBe("│                                  │".length);
      expect(row).not.toMatch(/●[^│]*●/);
    }
  });

  it("uses the same display coordinates and visual quadrants for Mermaid and PlantUML complexity points", async () => {
    const mermaid = (await documentate(allFeaturesSerialized, { format: "mermaid-complexity" })).mermaid!;
    const plantuml = (await documentate(allFeaturesSerialized, { format: "plantuml-complexity" })).plantuml!;
    const plantUmlByLabel = new Map(
      plantUmlComplexityCoordinates(plantuml).map((point) => [point.label, point])
    );

    for (const mermaidPoint of mermaidComplexityCoordinates(mermaid)) {
      const plantUmlPoint = plantUmlByLabel.get(shortenExpectedPlantUmlLabel(mermaidPoint.label));

      expect(plantUmlPoint).toBeTruthy();
      expect(plantUmlPoint?.quadrant).toBe(complexityQuadrant(mermaidPoint));
      expect(Math.abs((plantUmlPoint?.x || 0) - mermaidPoint.x)).toBeLessThanOrEqual(0.02);
      expect(Math.abs((plantUmlPoint?.y || 0) - mermaidPoint.y)).toBeLessThanOrEqual(0.04);
    }
  });
});

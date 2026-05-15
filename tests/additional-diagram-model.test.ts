import { describe, it } from "mocha";
import expect from "expect";
import { collectAdditionalDiagramModel } from "../lib/documentate/diagram-model";
import type { SerializedMachine } from "../lib/documentate";
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

describe("additional diagram model", () => {
  it("traverses root, nested, and parallel machines deterministically", () => {
    const model = collectAdditionalDiagramModel(allFeaturesSerialized);

    expect(model.machines.map((machine) => machine.path)).toEqual([
      "root",
      "root.state.processing.nested.0",
      "root.parallel.fulfillment"
    ]);
    expect(model.states.map((state) => state.id)).toContain("root:created");
    expect(model.states.map((state) => state.id)).toContain("root.state.processing.nested.0:authorized");
    expect(model.states.map((state) => state.id)).toContain("root.parallel.fulfillment:queued");
  });

  it("keeps aliases unique when state names sanitize to the same value", () => {
    const model = collectAdditionalDiagramModel(aliasCollisionSerialized);
    const hyphenState = model.states.find((state) => state.id === "root:a-b");
    const underscoreState = model.states.find((state) => state.id === "root:a_b");

    expect(hyphenState?.alias).toBeTruthy();
    expect(underscoreState?.alias).toBeTruthy();
    expect(hyphenState?.alias).not.toBe(underscoreState?.alias);
  });

  it("extracts safe pulse, event, immediate, guard, and composition metadata", () => {
    const model = collectAdditionalDiagramModel(allFeaturesSerialized);

    expect(model.pulseEdges).toEqual(expect.arrayContaining([
      expect.objectContaining({ from: "root:created", to: "root:ready", label: "entry: hydrateOrder ✓" }),
      expect.objectContaining({ from: "root:created", to: "root:invalid", label: "entry: hydrateOrder ✗" }),
      expect.objectContaining({ from: "root:processing", to: "root:cancelled", label: "exit: releaseReservation on cancel" })
    ]));
    expect(model.events.filter((event) => event.name === "cancel")).toHaveLength(1);
    expect(model.eventEdges).toEqual(expect.arrayContaining([
      expect.objectContaining({ event: "submit", from: "root:created", to: "root:processing" }),
      expect.objectContaining({ event: "submit", from: "root:ready", to: "root:processing" })
    ]));
    expect(model.immediateEdges).toEqual(expect.arrayContaining([
      expect.objectContaining({ from: "root:processing", to: "root:fulfilling", label: "immediate" }),
      expect.objectContaining({ from: "root.parallel.fulfillment:queued", to: "root.parallel.fulfillment:pick", label: "immediate [guard: inventoryAvailable; failure: inventoryIssue]" })
    ]));
    expect(model.guardDecisions).toEqual(expect.arrayContaining([
      expect.objectContaining({ sourceStateId: "root:ready", triggerLabel: "event: submit", guardName: "hasPaymentMethod", successTargetId: "root:processing", failureTargetId: "root:paymentRequired" }),
      expect.objectContaining({ sourceStateId: "root.parallel.fulfillment:queued", triggerLabel: "immediate", guardName: "inventoryAvailable", successTargetId: "root.parallel.fulfillment:pick", failureTargetId: "root.parallel.fulfillment:inventoryIssue" })
    ]));
    expect(model.compositionEdges).toEqual(expect.arrayContaining([
      expect.objectContaining({ from: "machine:root", to: "root:processing", label: "has state" }),
      expect.objectContaining({ from: "root:processing", to: "machine:root.state.processing.nested.0", label: "nested outcome: captured" }),
      expect.objectContaining({ from: "machine:root", to: "machine:root.parallel.fulfillment", label: "parallel: fulfillment" })
    ]));
  });

  it("scores complexity using transitions, incoming edges, immediates, pulses, and failures", () => {
    const model = collectAdditionalDiagramModel(allFeaturesSerialized);
    const created = model.complexityPoints.find((point) => point.stateId === "root:created");
    const processing = model.complexityPoints.find((point) => point.stateId === "root:processing");
    const queued = model.complexityPoints.find((point) => point.stateId === "root.parallel.fulfillment:queued");

    expect(created).toEqual(expect.objectContaining({ transitionLoad: 2, actionLoad: 2 }));
    expect(processing).toEqual(expect.objectContaining({ transitionLoad: 5, actionLoad: 2 }));
    expect(queued).toEqual(expect.objectContaining({ transitionLoad: 2, actionLoad: 0 }));
    expect(processing?.x).toBe(5 / 6);
    expect(processing?.y).toBe(1);
  });

  it("uses unique contextual labels for duplicate complexity state names", () => {
    const model = collectAdditionalDiagramModel(allFeaturesSerialized);
    const createdLabels = model.complexityPoints
      .filter((point) => point.stateId.endsWith(":created"))
      .map((point) => point.label);
    const cancelledLabels = model.complexityPoints
      .filter((point) => point.stateId.endsWith(":cancelled"))
      .map((point) => point.label);

    expect(createdLabels).toEqual(["root.created", "Payment.created"]);
    expect(cancelledLabels).toEqual(["root.cancelled", "Payment.cancelled"]);
    expect(new Set(model.complexityPoints.map((point) => point.label)).size).toBe(model.complexityPoints.length);
  });
});

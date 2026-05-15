import { documentate } from "../lib/documentate";
import { entry, exit, guard, immediate, init, initial, machine, nested, nestedGuard, parallel, state, transition } from "../lib";
import { describe, it } from "mocha";
import expect from "expect";

const { JSDOM } = require("jsdom");

let mermaidModule: any;

const getMermaid = async () => {
  if (!mermaidModule) {
    const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost" });
    const window = dom.window;

    (globalThis as any).window = window;
    (globalThis as any).document = window.document;
    Object.defineProperty(globalThis, "navigator", { value: window.navigator, configurable: true });
    (globalThis as any).Element = window.Element;
    (globalThis as any).HTMLElement = window.HTMLElement;
    (globalThis as any).SVGElement = window.SVGElement;
    (globalThis as any).CSSStyleSheet = window.CSSStyleSheet;
    (globalThis as any).Node = window.Node;
    (globalThis as any).DOMParser = window.DOMParser;
    (globalThis as any).XMLSerializer = window.XMLSerializer;

    window.SVGElement.prototype.getBBox = function () {
      const text = this.textContent || "";

      return { x: 0, y: 0, width: Math.max(text.length * 8, 20), height: 20 };
    };

    mermaidModule = (await import("mermaid")).default;
  }

  return mermaidModule;
};

const assertMermaidCanParseAndRender = async (diagram: string, id: string) => {
  const mermaid = await getMermaid();

  mermaid.initialize({ startOnLoad: false });
  await mermaid.parse(diagram);

  const { svg } = await mermaid.render(id, diagram);

  expect(svg).toContain("<svg");
};

const getCheckoutMachine = () => machine(
  "Checkout",
  init(initial("idle")),
  state("idle", transition("submit", "loading")),
  state("loading", transition("resolve", "success")),
  state("success")
);

const getOrderMachine = () => {
  const payment = machine(
    "Payment",
    init(initial("waiting")),
    state("waiting", transition("start", "paid")),
    state("paid")
  );
  const inventory = machine(
    "Inventory",
    init(initial("checking")),
    state("checking", transition("reserve", "reserved")),
    state("reserved")
  );
  const shipping = machine(
    "Shipping",
    init(initial("pending")),
    state("pending", transition("ship", "shipped")),
    state("shipped")
  );

  return machine(
    "Order",
    init(initial("created")),
    state("created", transition("pay", "paying")),
    state("paying", nested(payment, "start")),
    parallel(inventory, shipping)
  );
};

describe("Sequence diagram export", () => {
  it("should generate Mermaid sequence code for root transitions", async () => {
    const result = await documentate(getCheckoutMachine(), { format: "mermaid-sequence" });

    expect(result.mermaid).toContain("sequenceDiagram");
    expect(result.mermaid).toContain("participant P0 as Checkout");
    expect(result.mermaid).toContain("P0->>P0: submit: idle -> loading");
    expect(result.mermaid).not.toContain("stateDiagram-v2");
    expect(result.mermaid).not.toContain("@startuml");
  });

  it("should generate PlantUML sequence code for root transitions", async () => {
    const result = await documentate(getCheckoutMachine(), { format: "plantuml-sequence" });

    expect(result.plantuml).toContain("@startuml");
    expect(result.plantuml).toContain('participant "Checkout" as P0');
    expect(result.plantuml).toContain("P0 -> P0: submit: idle -> loading");
    expect(result.plantuml).toContain("@enduml");
    expect(result.plantuml).not.toContain("state ");
  });

  it("should include nested and parallel participants in sequence exports", async () => {
    const mermaidResult = await documentate(getOrderMachine(), { format: "mermaid-sequence" });
    const plantUmlResult = await documentate(getOrderMachine(), { format: "plantuml-sequence" });

    expect(mermaidResult.mermaid).toContain("participant P0 as Order");
    expect(mermaidResult.mermaid).toContain("participant P0_S1_paying_N0 as Payment");
    expect(mermaidResult.mermaid).toContain("participant P0_PAR0 as Inventory");
    expect(mermaidResult.mermaid).toContain("participant P0_PAR1 as Shipping");
    expect(mermaidResult.mermaid).toContain("P0->>P0_S1_paying_N0: nested start");
    expect(mermaidResult.mermaid).toContain("P0->>P0_PAR0: parallel Inventory");

    expect(plantUmlResult.plantuml).toContain('participant "Order" as P0');
    expect(plantUmlResult.plantuml).toContain('participant "Payment" as P0_S1_paying_N0');
    expect(plantUmlResult.plantuml).toContain('participant "Inventory" as P0_PAR0');
    expect(plantUmlResult.plantuml).toContain('participant "Shipping" as P0_PAR1');
    expect(plantUmlResult.plantuml).toContain("P0 -> P0_S1_paying_N0: nested start");
    expect(plantUmlResult.plantuml).toContain("P0 -> P0_PAR0: parallel Inventory");
  });

  it("should show nested observable outcomes consumed by parent reactions as dashed return arrows", async () => {
    const payment = machine(
      "Payment authorization",
      init(initial("waiting")),
      state("waiting", transition("authorize", "authorized")),
      state("authorized")
    );
    function paymentAuthorized() {
      const secret = "SECRET_SHOULD_NOT_LEAK";
      return secret.length > 0;
    }
    const order = machine(
      "Order",
      init(initial("paying")),
      state(
        "paying",
        nested(payment, "authorize"),
        immediate("paymentAccepted", nestedGuard(payment, paymentAuthorized)),
        transition("paymentAccepted", "confirmed")
      ),
      state("confirmed")
    );

    const mermaidResult = await documentate(order, { format: "mermaid-sequence" });
    const plantUmlResult = await documentate(order, { format: "plantuml-sequence" });

    expect(mermaidResult.mermaid).toContain("P0_S0_paying_N0-->>P0: outcome captured by paymentAccepted");
    expect(mermaidResult.mermaid).toContain("P0->>P0: paymentAccepted: paying -> confirmed");
    expect(plantUmlResult.plantuml).toContain("P0_S0_paying_N0 --> P0: outcome captured by paymentAccepted");
    expect(plantUmlResult.plantuml).toContain("P0 -> P0: paymentAccepted: paying -> confirmed");
    expect(mermaidResult.mermaid).not.toContain("SECRET_SHOULD_NOT_LEAK");
    expect(plantUmlResult.plantuml).not.toContain("SECRET_SHOULD_NOT_LEAK");
  });

  it("should not show return arrows for a structurally identical but different nested guard machine", async () => {
    const paymentA = machine(
      "Payment authorization",
      init(initial("waiting")),
      state("waiting", transition("authorize", "authorized")),
      state("authorized")
    );
    const paymentB = machine(
      "Payment authorization",
      init(initial("waiting")),
      state("waiting", transition("authorize", "authorized")),
      state("authorized")
    );
    function paymentAuthorized() {
      return true;
    }
    const order = machine(
      "Order",
      init(initial("paying")),
      state(
        "paying",
        nested(paymentA, "authorize"),
        immediate("paymentAccepted", nestedGuard(paymentB, paymentAuthorized)),
        transition("paymentAccepted", "confirmed")
      ),
      state("confirmed")
    );

    const mermaidResult = await documentate(order, { format: "mermaid-sequence" });
    const plantUmlResult = await documentate(order, { format: "plantuml-sequence" });

    expect(mermaidResult.mermaid).toContain("P0->>P0_S0_paying_N0: nested authorize");
    expect(mermaidResult.mermaid).toContain("P0->>P0: paymentAccepted: paying -> confirmed");
    expect(mermaidResult.mermaid).not.toContain("P0_S0_paying_N0-->>P0: outcome captured by paymentAccepted");
    expect(plantUmlResult.plantuml).toContain("P0 -> P0_S0_paying_N0: nested authorize");
    expect(plantUmlResult.plantuml).toContain("P0 -> P0: paymentAccepted: paying -> confirmed");
    expect(plantUmlResult.plantuml).not.toContain("P0_S0_paying_N0 --> P0: outcome captured by paymentAccepted");
  });

  it("should not show return arrows without a nested outcome consumed by a local parent reaction", async () => {
    const payment = machine(
      "Payment authorization",
      init(initial("waiting")),
      state("waiting", transition("authorize", "authorized")),
      state("authorized")
    );
    function paymentAuthorized() {
      return true;
    }
    const nestedOnlyOrder = machine(
      "Order",
      init(initial("paying")),
      state("paying", nested(payment, "authorize")),
      state("confirmed")
    );
    const parallelOrder = machine(
      "Parallel order",
      init(initial("paying")),
      state(
        "paying",
        immediate("paymentAccepted", nestedGuard(payment, paymentAuthorized)),
        transition("paymentAccepted", "confirmed")
      ),
      state("confirmed"),
      parallel(payment)
    );

    const nestedOnlyMermaid = await documentate(nestedOnlyOrder, { format: "mermaid-sequence" });
    const nestedOnlyPlantUml = await documentate(nestedOnlyOrder, { format: "plantuml-sequence" });
    const parallelMermaid = await documentate(parallelOrder, { format: "mermaid-sequence" });
    const parallelPlantUml = await documentate(parallelOrder, { format: "plantuml-sequence" });

    expect(nestedOnlyMermaid.mermaid).not.toContain("-->>P0: outcome captured by");
    expect(nestedOnlyPlantUml.plantuml).not.toContain("--> P0: outcome captured by");
    expect(parallelMermaid.mermaid).not.toContain("-->>P0: outcome captured by");
    expect(parallelPlantUml.plantuml).not.toContain("--> P0: outcome captured by");
  });

  it("should not show return arrows for enumerable machine identity properties on plain serialized machines", async () => {
    const nestedMachine: any = {
      title: "Payment authorization",
      states: {
        waiting: { name: "waiting", on: { authorize: { target: "authorized" } } },
        authorized: { name: "authorized" }
      },
      parallel: {},
      context: {},
      initial: "waiting",
      __xRobotMachineIdentity: "spoofed-payment"
    };
    const guardMachine: any = {
      title: "Payment authorization",
      states: {
        waiting: { name: "waiting", on: { authorize: { target: "authorized" } } },
        authorized: { name: "authorized" }
      },
      parallel: {},
      context: {},
      initial: "waiting",
      __xRobotMachineIdentity: "spoofed-payment"
    };
    const order: any = {
      title: "Order",
      states: {
        paying: {
          name: "paying",
          nested: [{ machine: nestedMachine, transition: "authorize" }],
          immediate: [{ immediate: "paymentAccepted", guards: [{ guard: "paymentAuthorized", machine: guardMachine }] }],
          on: { paymentAccepted: { target: "confirmed" } }
        },
        confirmed: { name: "confirmed" }
      },
      parallel: {},
      context: {},
      initial: "paying"
    };

    const mermaidResult = await documentate(order, { format: "mermaid-sequence" });
    const plantUmlResult = await documentate(order, { format: "plantuml-sequence" });

    expect(mermaidResult.mermaid).toContain("P0->>P0_S0_paying_N0: nested authorize");
    expect(mermaidResult.mermaid).not.toContain("P0_S0_paying_N0-->>P0: outcome captured by paymentAccepted");
    expect(plantUmlResult.plantuml).toContain("P0 -> P0_S0_paying_N0: nested authorize");
    expect(plantUmlResult.plantuml).not.toContain("P0_S0_paying_N0 --> P0: outcome captured by paymentAccepted");
  });

  it("should not show return arrows when a nested machine has no explicit transition", async () => {
    const payment = machine(
      "Payment authorization",
      init(initial("waiting")),
      state("waiting", transition("authorize", "authorized")),
      state("authorized")
    );
    function paymentAuthorized() {
      return true;
    }
    const order = machine(
      "Order",
      init(initial("paying")),
      state(
        "paying",
        nested(payment),
        immediate("paymentAccepted", nestedGuard(payment, paymentAuthorized)),
        transition("paymentAccepted", "confirmed")
      ),
      state("confirmed")
    );

    const mermaidResult = await documentate(order, { format: "mermaid-sequence" });
    const plantUmlResult = await documentate(order, { format: "plantuml-sequence" });

    expect(mermaidResult.mermaid).not.toContain("P0_S0_paying_N0-->>P0: outcome captured by paymentAccepted");
    expect(plantUmlResult.plantuml).not.toContain("P0_S0_paying_N0 --> P0: outcome captured by paymentAccepted");
  });

  it("should keep nested aliases unique when state names sanitize to the same value", async () => {
    const firstNested = machine(
      "First nested",
      init(initial("idle")),
      state("idle")
    );
    const secondNested = machine(
      "Second nested",
      init(initial("idle")),
      state("idle")
    );
    const root = machine(
      "Collision root",
      init(initial("a-b")),
      state("a-b", nested(firstNested, "start")),
      state("a_b", nested(secondNested, "start"))
    );

    const mermaidResult = await documentate(root, { format: "mermaid-sequence" });
    const plantUmlResult = await documentate(root, { format: "plantuml-sequence" });

    expect(mermaidResult.mermaid).toContain("participant P0_S0_a_b_N0 as First nested");
    expect(mermaidResult.mermaid).toContain("participant P0_S1_a_b_N0 as Second nested");
    expect(mermaidResult.mermaid).toContain("P0->>P0_S0_a_b_N0: nested start");
    expect(mermaidResult.mermaid).toContain("P0->>P0_S1_a_b_N0: nested start");

    expect(plantUmlResult.plantuml).toContain('participant "First nested" as P0_S0_a_b_N0');
    expect(plantUmlResult.plantuml).toContain('participant "Second nested" as P0_S1_a_b_N0');
    expect(plantUmlResult.plantuml).toContain("P0 -> P0_S0_a_b_N0: nested start");
    expect(plantUmlResult.plantuml).toContain("P0 -> P0_S1_a_b_N0: nested start");
  });

  it("should use deterministic default labels when titles are missing", async () => {
    const serialized = {
      states: {
        parent: {
          name: "parent",
          nested: [
            {
              transition: "start",
              machine: {
                states: { idle: { name: "idle" } },
                parallel: {},
                context: {},
                initial: "idle"
              }
            }
          ]
        }
      },
      parallel: {
        worker: {
          states: { idle: { name: "idle" } },
          parallel: {},
          context: {},
          initial: "idle"
        }
      },
      context: {},
      initial: "parent"
    };

    const result = await documentate(serialized, { format: "mermaid-sequence" });

    expect(result.mermaid).toContain("participant P0 as Machine");
    expect(result.mermaid).toContain("participant P0_S0_parent_N0 as Nested machine 1");
    expect(result.mermaid).toContain("participant P0_PAR0 as Parallel machine worker");
  });

  it("should keep aliases unique and independent from unsafe duplicate titles", async () => {
    const root = {
      title: "Root",
      states: {},
      parallel: {
        first: {
          title: "Worker",
          states: { idle: { name: "idle" } },
          parallel: {},
          context: {},
          initial: "idle"
        },
        second: {
          title: "Worker",
          states: { idle: { name: "idle" } },
          parallel: {},
          context: {},
          initial: "idle"
        },
        unsafe: {
          title: 'Bad "Worker" <tag>',
          states: { idle: { name: "idle" } },
          parallel: {},
          context: {},
          initial: "idle"
        }
      },
      context: {},
      initial: undefined
    };

    const mermaidResult = await documentate(root, { format: "mermaid-sequence" });
    const plantUmlResult = await documentate(root, { format: "plantuml-sequence" });

    expect(mermaidResult.mermaid).toContain("participant P0_PAR0 as Worker");
    expect(mermaidResult.mermaid).toContain("participant P0_PAR1 as Worker");
    expect(mermaidResult.mermaid).toContain("participant P0_PAR2 as Bad #quot;Worker#quot; &lt;tag&gt;");
    expect(mermaidResult.mermaid).not.toContain("as Worker Worker");
    expect(mermaidResult.mermaid).not.toContain("Bad_Worker");

    expect(plantUmlResult.plantuml).toContain('participant "Worker" as P0_PAR0');
    expect(plantUmlResult.plantuml).toContain('participant "Worker" as P0_PAR1');
    expect(plantUmlResult.plantuml).toContain('participant "Bad \\"Worker\\" <tag>" as P0_PAR2');
  });

  it("should include only serialized function names in high-level sequence exports", async () => {
    function guardName() {
      const secret = "SECRET_SHOULD_NOT_LEAK";
      return secret.length > 0;
    }
    function cleanupName() {
      const secret = "SECRET_SHOULD_NOT_LEAK";
      return secret.length;
    }
    function entryName() {
      const secret = "SECRET_SHOULD_NOT_LEAK";
      return secret.length;
    }
    const safeMachine = machine(
      "Safe",
      init(initial("idle")),
      state("idle", entry(entryName), transition("submit", "done", guard(guardName), exit(cleanupName))),
      state("done")
    );

    const mermaidResult = await documentate(safeMachine, { format: "mermaid-sequence", level: "high" });
    const plantUmlResult = await documentate(safeMachine, { format: "plantuml-sequence", level: "high" });

    expect(mermaidResult.mermaid).toContain("guardName");
    expect(mermaidResult.mermaid).toContain("cleanupName");
    expect(plantUmlResult.plantuml).toContain("guardName");
    expect(plantUmlResult.plantuml).toContain("cleanupName");
    expect(mermaidResult.mermaid).not.toContain("SECRET_SHOULD_NOT_LEAK");
    expect(plantUmlResult.plantuml).not.toContain("SECRET_SHOULD_NOT_LEAK");
    expect(mermaidResult.mermaid).not.toContain("function ");
    expect(plantUmlResult.plantuml).not.toContain("function ");
  });

  it("should integrate sequence formats without changing existing state diagram formats", async () => {
    const machineResult = await documentate(getCheckoutMachine(), { format: "mermaid-sequence" });
    const serialized = {
      title: "Serialized",
      states: {
        idle: { name: "idle", on: { go: { target: "done" } } },
        done: { name: "done" }
      },
      parallel: {},
      context: {},
      initial: "idle"
    };
    const serializedResult = await documentate(serialized, { format: "plantuml-sequence" });
    const stateMermaidResult = await documentate(getCheckoutMachine(), { format: "mermaid" });
    const statePlantUmlResult = await documentate(getCheckoutMachine(), { format: "plantuml" });
    const allResult = await documentate(getCheckoutMachine(), { format: "all" });

    expect(machineResult.mermaid).toContain("sequenceDiagram");
    expect(serializedResult.plantuml).toContain('participant "Serialized" as P0');
    expect(serializedResult.plantuml).toContain("P0 -> P0: go: idle -> done");
    expect(stateMermaidResult.mermaid).toContain("stateDiagram-v2");
    expect(stateMermaidResult.mermaid).not.toContain("sequenceDiagram");
    expect(statePlantUmlResult.plantuml).toContain("state idle");
    expect(allResult.mermaid).toContain("stateDiagram-v2");
    expect(allResult.mermaid).not.toContain("sequenceDiagram");
    expect(allResult.plantuml).toContain("state idle");
  });

  it("should parse and render generated Mermaid sequence diagrams", async () => {
    const result = await documentate(getOrderMachine(), { format: "mermaid-sequence" });

    await assertMermaidCanParseAndRender(result.mermaid!, "sequence-order");
  });
});

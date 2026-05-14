import { documentate } from "../lib/documentate";
import {
  context,
  description,
  entry,
  exit,
  guard,
  immediate,
  infoState,
  init,
  initial,
  machine,
  nested,
  parallel,
  primaryState,
  state,
  successState,
  transition,
  warningState,
} from "../lib";
import { describe, it } from "mocha";
import expect from "expect";
import bird from "./bird-machine-ts";

const { JSDOM } = require("jsdom");

const assertStrictStateDiagramStructure = (mermaid: string) => {
  expect(mermaid.startsWith("---\ntitle: Bird\n---\n\nstateDiagram-v2\ndirection TB")).toBe(true);
  expect(mermaid).not.toContain("@startuml");
  expect(mermaid).not.toContain("@enduml");
  expect(mermaid).not.toContain("<<");

  const aliases = new Set<string>();
  let openBlocks = 0;
  let openNotes = 0;

  for (const rawLine of mermaid.split("\n")) {
    const line = rawLine.trim();
    if (openNotes > 0) {
      if (line === "end note") {
        openNotes -= 1;
      }
      continue;
    }

    if (line.length === 0 || line === "---" || line.startsWith("title:") || line === "stateDiagram-v2" || line === "direction TB" || line === "--" || line.startsWith("classDef ") || line.startsWith("class ")) {
      continue;
    }

    const stateAlias = line.match(/^state "[^"]+" as ([A-Za-z][A-Za-z0-9]*)$/);
    if (stateAlias) {
      aliases.add(stateAlias[1]);
      continue;
    }

    const stateBlock = line.match(/^state ([A-Za-z][A-Za-z0-9]*) \{$/);
    if (stateBlock) {
      aliases.add(stateBlock[1]);
      openBlocks += 1;
      continue;
    }

    if (line === "}") {
      openBlocks -= 1;
      expect(openBlocks).toBeGreaterThanOrEqual(0);
      continue;
    }

    const noteLine = line.match(/^note right of ([A-Za-z][A-Za-z0-9]*)$/);
    if (noteLine) {
      expect(aliases.has(noteLine[1])).toBe(true);
      openNotes += 1;
      continue;
    }

    const transitionLine = line.match(/^([A-Za-z][A-Za-z0-9]*|\[\*\]) --> ([A-Za-z][A-Za-z0-9]*|\[\*\])(?:: .+)?$/);
    if (transitionLine) {
      if (transitionLine[1] !== "[*]") {
        expect(aliases.has(transitionLine[1])).toBe(true);
      }
      if (transitionLine[2] !== "[*]") {
        expect(aliases.has(transitionLine[2])).toBe(true);
      }
      continue;
    }

    expect(line).toMatch(/^[A-Za-z][A-Za-z0-9]*: .+$/);
  }

  expect(openBlocks).toBe(0);
  expect(openNotes).toBe(0);
};

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

describe("Mermaid Export", () => {
  const getMachine = (title?: string) => {
    const getState = () => ({ title: "Ok", error: null });
    const titleIsValid = (context: any) => context.title.length > 0 ? true : [{ message: "Title is required" }];
    async function saveTitle(context: any) { await new Promise(r => setTimeout(r, 100)); }
    function cacheTitle(context: any) { return { ...context, oldTitle: context.title }; }
    function updateTitle(context: any, event: any) { return event ? { ...context, title: event.target?.value } : context; }
    function restoreTitle(context: any) { return { ...context, title: context.oldTitle }; }
    function updateError(context: any, error: any) { return { ...context, error }; }

    return machine(
      title || "My machine",
      init(context(getState), initial("preview")),
      successState("preview", description("Initial state"), entry(cacheTitle), transition("edit", "editMode")),
      infoState("editMode", description("The user tries to edit the title"), entry(updateTitle), transition("input", "editMode"), transition("cancel", "cancel"), transition("save", "save", guard(titleIsValid))),
      warningState("cancel", description("The user cancels the edition"), entry(restoreTitle), transition("preview", "preview")),
      primaryState("save", description("The user saves the title"), entry(saveTitle, "preview", "error")),
      warningState("error", description("We failed to save the title to the db"), entry(updateError))
    );
  };

  it("should generate mermaid code in low level format", async () => {
    const result = await documentate(getMachine(), { format: 'mermaid' });
    expect(result.mermaid).toContain("stateDiagram-v2");
    expect(result.mermaid).toContain("direction TB");
    expect(result.mermaid).toContain("[*] --> preview");
    expect(result.mermaid).toContain("preview --> editMode: edit");
  });

  it("should generate mermaid code in high level format", async () => {
    const result = await documentate(getMachine(), { format: 'mermaid', level: 'high' });
    expect(result.mermaid).toContain("title: My machine");
    expect(result.mermaid).toContain("direction TB");
    expect(result.mermaid).toContain('state "preview" as preview');
    expect(result.mermaid).toContain('state "save" as save');
    expect(result.mermaid).toContain("preview: Initial state");
    expect(result.mermaid).toContain("preview: └ En-cacheTitle");
    expect(result.mermaid).toContain("editMode --> save: save<br>└ G-titleIsValid");
    expect(result.mermaid).toContain("save: └┬ AEn-saveTitle");
  });

  it("should preserve nested tree indentation in high level mermaid state labels", async () => {
    const result = await documentate(getMachine(), { format: 'mermaid', level: 'high' });

    expect(result.mermaid).toContain(
      "save: └┬ AEn-saveTitle<br>\u2007├┬ success<br>\u2007│└ T-preview<br>\u2007└┬ failure<br>\u2007\u2007└ T-error"
    );
  });

  it("should allow custom title", async () => {
    const result = await documentate(getMachine("Custom Title"), { format: 'mermaid', level: 'high' });
    expect(result.mermaid).toContain("title: Custom Title");
  });

  it("should include state descriptions in high level", async () => {
    const result = await documentate(getMachine(), { format: 'mermaid', level: 'high' });
    expect(result.mermaid).toContain("preview: Initial state");
    expect(result.mermaid).toContain("save: The user saves the title");
    expect(result.mermaid).toContain("error: We failed to save the title to the db");
  });

  it("should include state types in low level", async () => {
    const result = await documentate(getMachine(), { format: 'mermaid' });
    expect(result.mermaid).toContain("class preview success");
    expect(result.mermaid).toContain("class editMode info");
  });

  it("should assign the def class to states created without an alias", async () => {
    const defaultMachine = machine(
      "Default styles",
      init(initial("idle")),
      state("idle", transition("load", "loading")),
      state("loading", transition("resolve", "loaded"), transition("reject", "error")),
      successState("loaded"),
      warningState("error")
    );

    const result = await documentate(defaultMachine, { format: 'mermaid' });

    expect(result.mermaid).toContain("class idle def");
    expect(result.mermaid).toContain("class loading def");
    expect(result.mermaid).toContain("class loaded success");
    expect(result.mermaid).toContain("class error warning");
  });

  it("should include nested machine states and transitions in low level format", async () => {
    const stopwalk = machine(
      "Stopwalk",
      init(initial("wait")),
      state("wait", transition("start", "walk")),
      state("walk", transition("stop", "wait"))
    );
    const stoplight = machine(
      "Stoplight",
      init(initial("green")),
      state("green", transition("next", "red")),
      state("red", nested(stopwalk))
    );

    const result = await documentate(stoplight, { format: 'mermaid' });

    expect(result.mermaid).toContain("state red {");
    expect(result.mermaid).toContain('state "wait" as RedStopwalkWait');
    expect(result.mermaid).toContain("[*] --> RedStopwalkWait");
    expect(result.mermaid).toContain("RedStopwalkWait --> RedStopwalkWalk: start");
  });

  it("should keep nested child descriptions inside the composite state in high level format", async () => {
    const stopwalk = machine(
      "Stopwalk",
      init(initial("wait")),
      state("wait", description("Wait for the walk signal"), transition("start", "walk")),
      state("walk", description("Walk across the street"), transition("stop", "wait"))
    );
    const stoplight = machine(
      "Stoplight",
      init(initial("green")),
      state("green", transition("next", "red")),
      state("red", nested(stopwalk))
    );

    const result = await documentate(stoplight, { format: 'mermaid', level: 'high' });

    expect(result.mermaid).toContain([
      "state red {",
      '  state "wait" as RedStopwalkWait',
      '  state "walk" as RedStopwalkWalk',
      "",
      "  RedStopwalkWait: Wait for the walk signal",
      "  RedStopwalkWalk: Walk across the street",
      "",
      "  [*] --> RedStopwalkWait",
      "  RedStopwalkWait --> RedStopwalkWalk: start",
      "  RedStopwalkWalk --> RedStopwalkWait: stop",
      "}"
    ].join("\n"));
  });

  it("should include nested transition metadata in high level format", async () => {
    const stopwalk = machine(
      "Stopwalk",
      init(initial("wait")),
      state("wait", transition("start", "walk")),
      state("walk", transition("stop", "wait"))
    );
    const stoplight = machine(
      "Stoplight",
      init(initial("green")),
      state("green", transition("next", "red")),
      state("red", nested(stopwalk, "start"), immediate("green"))
    );

    const result = await documentate(stoplight, { format: 'mermaid', level: 'high' });

    expect(result.mermaid).toContain("note right of red\n  └ T-stopwalk.start\nend note");
  });

  it("should include exit pulses in high level transition labels", async () => {
    function cleanup(context: any) {
      context.cleaned = true;
    }

    const myMachine = machine(
      "Test",
      init(initial("idle")),
      state("idle", transition("start", "loading", exit(cleanup))),
      state("loading")
    );

    const result = await documentate(myMachine, { format: 'mermaid', level: 'high' });

    expect(result.mermaid).toContain("idle --> loading: start<br>[exit: cleanup]");
  });

  it("should include parallel machine states and transitions in low level format", async () => {
    const boldMachine = machine("Bold", init(initial("off")), state("off", transition("on", "on")), state("on", transition("off", "off")));
    const underlineMachine = machine("Underline", init(initial("off")), state("off", transition("on", "on")), state("on", transition("off", "off")));
    const editorMachine = machine("Editor", parallel(boldMachine, underlineMachine));

    const result = await documentate(editorMachine, { format: 'mermaid' });

    expect(result.mermaid).not.toContain('state "Parallel states" as EditorParallelStates {');
    expect(result.mermaid).toMatch(/state "Parallel states" as EditorParallelStates\nstate EditorParallelStates \{\n  state "off" as EditorBoldOff\n  state "on" as EditorBoldOn\n+  \[\*\] --> EditorBoldOff\n  EditorBoldOff --> EditorBoldOn: on\n  EditorBoldOn --> EditorBoldOff: off\n  --\n  state "off" as EditorUnderlineOff\n  state "on" as EditorUnderlineOn\n+  \[\*\] --> EditorUnderlineOff\n  EditorUnderlineOff --> EditorUnderlineOn: on\n  EditorUnderlineOn --> EditorUnderlineOff: off\n\}/);
    expect(result.mermaid).not.toContain("  class EditorBoldOff def");
    expect(result.mermaid).not.toContain("  class EditorUnderlineOff def");
  });

  it("should represent the all-features machine consistently in low and high level formats", async () => {
    const lowResult = await documentate(bird, { format: 'mermaid', level: 'low' });
    const highResult = await documentate(bird, { format: 'mermaid', level: 'high' });

    const commonExpectations = (mermaid: string) => {
      expect(mermaid).toContain("title: Bird");
      expect(mermaid).toContain('state "land" as land');
      expect(mermaid).toContain('state "takingoff" as takingoff');
      expect(mermaid).toContain('state "flying" as flying');
      expect(mermaid).toContain('state "landing" as landing');
      expect(mermaid).toContain('state "fatal" as fatal');
      expect(mermaid).toContain("class land primary");
      expect(mermaid).toContain("class takingoff info");
      expect(mermaid).toContain("class flying success");
      expect(mermaid).toContain("class landing warning");
      expect(mermaid).toContain("class fatal danger");
      expect(mermaid).toContain("state takingoff {");
      expect(mermaid).toContain('state "closed" as TakingoffLeftWingClosed');
      expect(mermaid).toContain("state landing {");
      expect(mermaid).toContain('state "closed" as LandingRightWingClosed');
      expect(mermaid).toContain('state "Parallel states" as BirdParallelStates');
      expect(mermaid).toContain("state BirdParallelStates {");
      expect(mermaid).toContain("--");
      expect(mermaid).toContain("[*] --> land");
      expect(mermaid).toContain("land --> takingoff: takeoff");
      expect(mermaid).toContain("flying --> landing: land");
    };

    commonExpectations(lowResult.mermaid!);
    commonExpectations(highResult.mermaid!);

    expect(lowResult.mermaid).toContain("TakingoffLeftWingClosed --> TakingoffLeftWingOpened: open");
    expect(lowResult.mermaid).toContain("LandingRightWingOpened --> LandingRightWingClosed: close");
    expect(lowResult.mermaid).toContain("takingoff --> flying: flying");
    expect(lowResult.mermaid).toContain("landing --> land: land");
    expect(lowResult.mermaid).not.toContain("<br>└ G-isLeftWingClosed");
    expect(lowResult.mermaid).not.toContain("<br>├ G-isLeftWingOpened");
    expect(lowResult.mermaid).not.toContain("The bird is taking off");
    expect(lowResult.mermaid).not.toContain("AEn-sendStateToApiForBird");
    expect(lowResult.mermaid).not.toContain("T-leftwing.open");

    expect(highResult.mermaid).toContain("note right of takingoff\n  The bird is taking off\n  ├ T-leftwing.open\n  ├ T-rightwing.open\n  ├┬ AEn-sendStateToApiForBird");
    expect(highResult.mermaid).toContain("TakingoffLeftWingClosed --> TakingoffLeftWingOpened: open<br>└ G-isLeftWingClosed");
    expect(highResult.mermaid).toContain("LandingRightWingOpened --> LandingRightWingClosed: close<br>└ G-isRightWingOpened");
    expect(highResult.mermaid).toContain("takingoff --> flying: flying<br>├ G-isLeftWingOpened<br>└ G-isRightWingOpened");
    expect(highResult.mermaid).toContain("landing --> land: land<br>├ G-isLeftWingClosed<br>└ G-isRightWingClosed");
  });

  it("should emit a strictly structured Mermaid state diagram for the all-features machine", async () => {
    const result = await documentate(bird, { format: 'mermaid', level: 'high' });

    assertStrictStateDiagramStructure(result.mermaid!);
  });

  it("should parse and render the all-features machine with Mermaid", async () => {
    const lowResult = await documentate(bird, { format: 'mermaid', level: 'low' });
    const highResult = await documentate(bird, { format: 'mermaid', level: 'high' });

    await assertMermaidCanParseAndRender(lowResult.mermaid!, "all-features-low");
    await assertMermaidCanParseAndRender(highResult.mermaid!, "all-features-high");
  });
});

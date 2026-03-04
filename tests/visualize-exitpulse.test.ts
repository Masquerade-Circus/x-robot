import { documentate } from "../lib/documentate";
import {
  exit,
  init,
  initial,
  machine,
  state,
  transition,
} from "../lib";
import { describe, it } from "mocha";
import expect from "expect";

describe("Visualize exit", () => {
  it("should show exit in plantuml diagram", async () => {
    function cleanup(context: any) {
      context.cleaned = true;
    }

    const myMachine = machine(
      "Test",
      init(initial("idle")),
      state("idle", transition("start", "loading", exit(cleanup))),
      state("loading")
    );

    const result = await documentate(myMachine, { format: 'plantuml', level: 'high' });
    const plantUmlCode = result.plantuml!;
    
    expect(plantUmlCode).toContain("[exit: cleanup]");
  });
});

import {
  VISUALIZATION_LEVEL,
  getPlantUmlCode,
} from "../lib/visualize";
import {
  exitPulse,
  init,
  initial,
  machine,
  pulse,
  state,
  transition,
} from "../lib";
import { describe, it } from "mocha";
import expect from "expect";
import { serialize } from "../lib/serialize";

describe("Visualize exitPulse", () => {
  it("should show exitPulse in plantuml diagram", () => {
    function cleanup(context: any) {
      context.cleaned = true;
    }

    const myMachine = machine(
      "Test",
      init(initial("idle")),
      state("idle", transition("start", "loading", exitPulse(cleanup))),
      state("loading")
    );

    const serialized = serialize(myMachine);
    const plantUmlCode = getPlantUmlCode(serialized, VISUALIZATION_LEVEL.HIGH);
    
    expect(plantUmlCode).toContain("[exit: cleanup]");
  });
});

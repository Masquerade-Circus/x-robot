import { documentate } from "../lib/documentate";
import {
  context,
  dangerState,
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
  nestedGuard,
  parallel,
  primaryState,
  state,
  successState,
  transition,
  warningState,
} from "../lib";
import { describe, it } from "mocha";

import bird from "./bird-machine-ts";
import expect from "expect";
import fs from "fs";

// Generate a diagram from a serialized machine
describe("Generate a diagram from a serialized machine", () => {
  const getMachine = (title?: string) => {
    const getState = () => ({
      title: "Ok",
      error: null,
    });

    const titleIsValid = (context) => {
      if (context.title.length > 0) {
        return true;
      }
      return [{ message: "Title is required" }];
    };

    async function saveTitle(context) {
      // Save the title
      await new Promise((resolve) => setTimeout(resolve, 100));
      return;
    }

    function cacheTitle(context) {
      return { ...context, oldTitle: context.title };
    }

    function updateTitle(context, event) {
      if (!event) {
        return context;
      }

      return { ...context, title: event.target.value };
    }

    function restoreTitle(context) {
      return { ...context, title: context.oldTitle };
    }

    function updateError(context, error) {
      return { ...context, error };
    }

    const myMachine = machine(
      title || "My machine",
      init(context(getState), initial("preview")),
      successState(
        "preview",
        description("Initial state"),
        // Save the current title as oldTitle so we can reset later.
        entry(cacheTitle),
        transition("edit", "editMode")
      ),
      infoState(
        "editMode",
        description("The user tries to edit the title"),
        // Update title with the event value
        entry(updateTitle),
        transition("input", "editMode"),
        transition("cancel", "cancel"),
        transition(
          "save",
          "save",
          // Check if the title is valid. If so continue with the state.
          // If not, the machine keeps its current state.
          // In this case we came from editMode, so we keep the editMode state and update the context with the validation error.
          guard(titleIsValid)
        )
      ),
      warningState(
        "cancel",
        description("The user cancels the edition"),
        // Reset the title back to oldTitle
        entry(restoreTitle),
        immediate("preview")
      ),
      primaryState(
        "save",
        description("The user saves the title"),
        // If the guard is true, we try to save the title.
        // If the save action succeeds, we immediately go to the preview state.
        // If the save action fails, we update the context with the error and go to the error state.
        entry(saveTitle, "preview", "error")
      ),
      dangerState("error", description("We failed to save the title to the db"), entry(updateError))
      // Should we provide a retry or...?
    );

    return myMachine;
  };

  it("should generate a diagram from a serialized machine in low level plantuml string format", async () => {
    const plantUmlCode = `
@startuml

state preview<<success>>
state editMode<<info>>
state cancel<<warning>>
state save<<primary>>
state error<<danger>>

[*] --> preview
preview -[#skyblue]-> editMode: edit
editMode -[#skyblue]-> editMode: input
editMode -[#tan]-> cancel: cancel
editMode -[#lightsteelblue]-> save: save
cancel -[#mediumseagreen,dashed]-> preview: preview
save -[#mediumseagreen]-> preview: preview
save -[#indianred]-> error: error

hide empty description
skinparam backgroundColor white
skinparam shadowing false
skinparam note {
  BackgroundColor white
  BorderColor slategray
  FontName monospaced
}
skinparam ArrowFontName monospaced
skinparam state {
  FontName monospaced
  AttributeFontName monospaced
  BackgroundColor white
  BorderColor slategray
  ArrowColor slategray
  ArrowThickness 2
  MessageAlignment left
  BackgroundColor<<danger>> Implementation
  BorderColor<<danger>> indianred
  BackgroundColor<<info>> Application
  BorderColor<<info>> skyblue
  BackgroundColor<<warning>> Strategy
  BorderColor<<warning>> tan
  BackgroundColor<<success>> Technology
  BorderColor<<success>> mediumseagreen
  BackgroundColor<<primary>> Motivation
  BorderColor<<primary>> lightsteelblue
}
@enduml
`;

    const myMachine = getMachine();

    const result = await documentate(myMachine, { format: 'plantuml' });

    expect(result.plantuml).toContain("@startuml");
    expect(result.plantuml).toContain("state preview<<success>>");
    expect(result.plantuml).toContain("save -[#mediumseagreen]-> preview: preview");
    expect(result.plantuml).toContain("@enduml");
  });

  it("should generate a diagram from a serialized machine in high level plantuml string format", async () => {
    const myMachine = getMachine();

    const result = await documentate(myMachine, { format: 'plantuml', level: 'high' });

    expect(result.plantuml).toContain("title My machine");
    expect(result.plantuml).toContain("save: └┬ AP:saveTitle");
    expect(result.plantuml).toContain("save -[#indianred]-> error: error");
    expect(result.plantuml).toContain("editMode -[#lightsteelblue]-> save: save\\n└ G:titleIsValid");
  });

  it("should allow to pass a title for the plantuml diagram", async () => {
    const myMachine = getMachine("My Awesome PlantUML Machine Diagram");

    const result = await documentate(myMachine, { format: 'plantuml', level: 'high' });

    expect(result.plantuml).toContain("title My Awesome PlantUML Machine Diagram");
    expect(result.plantuml).toContain("save: └┬ AP:saveTitle");
    expect(result.plantuml).toContain("error: └ P:updateError");
  });

  it("should allow to pass descriptions for the states of the plantuml diagram", async () => {
    const myMachine = getMachine("My Awesome PlantUML Machine Diagram");

    const result = await documentate(myMachine, { format: 'plantuml', level: 'high' });

    expect(result.plantuml).toContain("preview: Initial state");
    expect(result.plantuml).toContain("save: The user saves the title");
    expect(result.plantuml).toContain("error: We failed to save the title to the db");
  });

  it("should allow to pass a custom skinparams string to generate a custom style", async () => {
    const plantUmlCode = `
@startuml

title My Awesome PlantUML Machine Diagram

state preview<<success>>
state editMode<<info>>
state cancel<<warning>>
state save<<primary>>
state error<<danger>>

preview: Initial state
editMode: The user tries to edit the title
cancel: The user cancels the edition
save: The user saves the title
error: We failed to save the title to the db

preview: └ P:cacheTitle
editMode: └ P:updateTitle
cancel: └ P:restoreTitle
save: └┬ A:saveTitle\\n ├┬ success\\n │└ T:preview\\n └┬ failure\\n  ├ P:updateError\\n  └ T:error
error: └ P:updateError

[*] --> preview
preview -[#skyblue]-> editMode: edit
editMode -[#skyblue]-> editMode: input
editMode -[#tan]-> cancel: cancel
editMode -[#lightsteelblue]-> save: save\\n└┬ G:titleIsValid\\n └┬ failure\\n  └ P:updateError
cancel -[#mediumseagreen,dashed]-> preview: preview
save -[#mediumseagreen]-> preview: preview
save -[#indianred]-> error: error

hide empty description
skinparam backgroundColor white
skinparam shadowing false
skinparam note {
  BackgroundColor white
  BorderColor slategray
  FontName monospaced
}
skinparam ArrowFontName monospaced
skinparam state {
  FontName monospaced
  AttributeFontName monospaced
  BackgroundColor white
  BorderColor slategray
  ArrowColor slategray
  ArrowThickness 2
  MessageAlignment left
  BackgroundColor<<danger>> Implementation
  BorderColor<<danger>> indianred
  BackgroundColor<<info>> Application
  BorderColor<<info>> skyblue
  BackgroundColor<<warning>> Strategy
  BorderColor<<warning>> tan
  BackgroundColor<<success>> Technology
  BorderColor<<success>> mediumseagreen
  BackgroundColor<<primary>> Motivation
  BorderColor<<primary>> lightsteelblue
}
skinparam backgroundColor red
@enduml
`;

    const myMachine = getMachine("My Awesome PlantUML Machine Diagram");

    const result = await documentate(myMachine, { format: 'plantuml', level: 'high', skinparam: "skinparam backgroundColor red" });

    expect(result.plantuml).toContain("title My Awesome PlantUML Machine Diagram");
    expect(result.plantuml).toContain("skinparam backgroundColor red");
    expect(result.plantuml).toContain("save: └┬ AP:saveTitle");
  });

  it("should generate a diagram from a serialized machine in png format", async () => {
    const myMachine = getMachine("My Awesome PlantUML Machine Diagram");

    const result = await documentate(myMachine, { format: 'png', level: 'high' });

    expect(result.png).toBeDefined();

    expect(fs.existsSync(result.png)).toBeTruthy();

    fs.unlinkSync(result.png);
  });

  it("should generate a diagram from a serialized machine in svg format", async () => {
    const myMachine = getMachine("My Awesome PlantUML Machine Diagram");

    const result = await documentate(myMachine, { format: 'svg', level: 'high' });

    expect(result.svg).toBeDefined();

    expect(fs.existsSync(result.svg)).toBeTruthy();

    fs.unlinkSync(result.svg);
  });

  it("should generate a diagram from a machine in plantuml string format", async () => {
    const myMachine = getMachine("My Awesome PlantUML Machine Diagram");

    const plantUmlCode = `
@startuml

title My Awesome PlantUML Machine Diagram

state preview<<success>>
state editMode<<info>>
state cancel<<warning>>
state save<<primary>>
state error<<danger>>

preview: Initial state
editMode: The user tries to edit the title
cancel: The user cancels the edition
save: The user saves the title
error: We failed to save the title to the db

preview: └ P:cacheTitle
editMode: └ P:updateTitle
cancel: └ P:restoreTitle
save: └┬ A:saveTitle\\n ├┬ success\\n │└ T:preview\\n └┬ failure\\n  ├ P:updateError\\n  └ T:error
error: └ P:updateError

[*] --> preview
preview -[#skyblue]-> editMode: edit
editMode -[#skyblue]-> editMode: input
editMode -[#tan]-> cancel: cancel
editMode -[#lightsteelblue]-> save: save\\n└┬ G:titleIsValid\\n └┬ failure\\n  └ P:updateError
cancel -[#mediumseagreen,dashed]-> preview: preview
save -[#mediumseagreen]-> preview: preview
save -[#indianred]-> error: error

hide empty description
skinparam backgroundColor white
skinparam shadowing false
skinparam note {
  BackgroundColor white
  BorderColor slategray
  FontName monospaced
}
skinparam ArrowFontName monospaced
skinparam state {
  FontName monospaced
  AttributeFontName monospaced
  BackgroundColor white
  BorderColor slategray
  ArrowColor slategray
  ArrowThickness 2
  MessageAlignment left
  BackgroundColor<<danger>> Implementation
  BorderColor<<danger>> indianred
  BackgroundColor<<info>> Application
  BorderColor<<info>> skyblue
  BackgroundColor<<warning>> Strategy
  BorderColor<<warning>> tan
  BackgroundColor<<success>> Technology
  BorderColor<<success>> mediumseagreen
  BackgroundColor<<primary>> Motivation
  BorderColor<<primary>> lightsteelblue
}
@enduml
`;

    const result = await documentate(myMachine, { format: 'plantuml', level: 'high' });

    expect(result.plantuml).toContain("title My Awesome PlantUML Machine Diagram");
    expect(result.plantuml).toContain("save: └┬ AP:saveTitle");
    expect(result.plantuml).toContain("editMode -[#lightsteelblue]-> save: save\\n└ G:titleIsValid");
  });

  it("should generate a diagram from a machine in png format", async () => {
    const myMachine = getMachine();

    const result = await documentate(myMachine, { format: 'png' });

    expect(result.png).toBeDefined();

    expect(fs.existsSync(result.png)).toBeTruthy();

    fs.unlinkSync(result.png);
  });

  it("should generate a diagram from a machine in svg format", async () => {
    const myMachine = getMachine();

    const result = await documentate(myMachine, { format: 'svg' });

    expect(result.svg).toBeDefined();

    expect(fs.existsSync(result.svg)).toBeTruthy();

    fs.unlinkSync(result.svg);
  });

  it("should generate a diagram for a serialized machine with nested machines", async () => {
    let leftWingMachine = machine(
      "Left wing",
      init(initial("closed")),
      state("closed", transition("open", "opened")),
      state("opened", transition("close", "closed"))
    );
    let rightWingMachine = machine(
      "Right wing",
      init(initial("closed")),
      state("closed", transition("open", "opened")),
      state("opened", transition("close", "closed"))
    );

    function wingsAreOpened(context) {
      return leftWingMachine.current === "opened" && rightWingMachine.current === "opened";
    }

    function wingsAreClosed(context) {
      return !wingsAreOpened(context);
    }

    let bird = machine(
      "Bird",
      init(initial("land")),
      state("land", transition("takeoff", "takingoff")),
      state("takingoff", nested(leftWingMachine), nested(rightWingMachine), immediate("flying", guard(wingsAreOpened))),
      state("flying", transition("land", "landing")),
      state("landing", nested(leftWingMachine), nested(rightWingMachine), immediate("land", guard(wingsAreClosed)))
    );

    const result = await documentate(bird, { format: 'plantuml', level: 'high' });

    expect(result.plantuml).toContain("title Bird");
    expect(result.plantuml).toContain('state "closed" as TakingoffLeftWingClosed<<default>>');
    expect(result.plantuml).toContain("takingoff -[#slategray,dashed]-> flying: flying\\n└ G:wingsAreOpened");
    expect(result.plantuml).toContain("landing -[#slategray,dashed]-> land: land\\n└ G:wingsAreClosed");
  });

  it("should generate a diagram for a serialized machine with all features available", async () => {
    const result = await documentate(bird, { format: 'plantuml', level: 'high' });

    expect(result.plantuml).toContain("title Bird");
    expect(result.plantuml).toContain('state "closed" as TakingoffLeftWingClosed<<default>>');
    expect(result.plantuml).toContain("takingoff -[#mediumseagreen,dashed]-> flying");
    expect(result.plantuml).toContain("flying\\n├ G:isLeftWingOpened");
    expect(result.plantuml).toContain("flying -[#tan]-> landing: land");
  });

  it("should allow to pass an option to display the final mark for the final states");
});

describe("Readme examples", () => {
  it("Simple example", async () => {
    const stoplight = machine(
      "Stoplight",
      init(initial("green")),
      state("green", transition("next", "yellow")),
      state("yellow", transition("next", "red")),
      state("red", transition("next", "green"))
    );

    const result = await documentate(stoplight, { format: 'svg', level: 'high' });

    expect(result.svg).toBeDefined();
    if (result.svg) fs.unlinkSync(result.svg);
  });

  it("Async example", async () => {
    // Action
    async function fetchDog() {
      let response = await fetch("https://dog.ceo/api/breeds/image/random");
      let json = await response.json();
      return json.data;
    }

    // Producers
    function assignDog(context, dog) {
      context.dog = dog;
    }

    function assignError(context, error) {
      context.error = error;
    }

    // Machine definition
    const fetchMachine = machine(
      "Dog API",
      init(
        context({
          dog: null,
          error: null,
        }),
        initial("idle")
      ),
      state("idle", transition("fetch", "loading")),
      state("loading", entry(fetchDog, "resolved", "rejected"), transition("cancel", "idle")),
      state("resolved", immediate("idle")),
      state("rejected")
    );

    const result = await documentate(fetchMachine, { format: 'svg', level: 'high' });

    expect(result.svg).toBeDefined();
    if (result.svg) fs.unlinkSync(result.svg);

    const plantUmlResult = await documentate(fetchMachine, { format: 'plantuml', level: 'high' });
    expect(plantUmlResult.plantuml).toContain("AP:fetchDog");
  });

  it("Nested example", async () => {
    const stopwalk = machine("Stopwalk", init(initial("wait")), state("wait", transition("start", "walk")), state("walk", transition("stop", "wait")));

    // Guard to prevent the machine to transition to 'green' if the stopwalk machine is in 'walk' state
    const canGoToGreen = () => {
      return stopwalk.current === "wait";
    };

    const stoplight = machine(
      "Stoplight",
      init(initial("green")),
      state("green", transition("next", "yellow")),
      state("yellow", transition("next", "red")),
      state("red", nested(stopwalk, "start"), immediate("green", guard(canGoToGreen)))
    );

    const result = await documentate(stoplight, { format: 'svg', level: 'high' });

    expect(result.svg).toBeDefined();
    if (result.svg) fs.unlinkSync(result.svg);
  });

  it("Parallel example", async () => {
    const boldMachine = machine("Bold", init(initial("off")), state("on", transition("off", "off")), state("off", transition("on", "on")));
    const underlineMachine = machine("Underline", init(initial("off")), state("on", transition("off", "off")), state("off", transition("on", "on")));
    const italicsMachine = machine("Italics", init(initial("off")), state("on", transition("off", "off")), state("off", transition("on", "on")));
    const listMachine = machine(
      "List",
      init(initial("none")),
      state("none", transition("bullets", "bullets"), transition("numbers", "numbers")),
      state("bullets", transition("none", "none")),
      state("numbers", transition("none", "none"))
    );

    const wordMachine = machine("Word Machine", parallel(boldMachine, underlineMachine, italicsMachine, listMachine));

    const result = await documentate(wordMachine, { format: 'svg' });

    expect(result.svg).toBeDefined();
    if (result.svg) fs.unlinkSync(result.svg);
  });
});

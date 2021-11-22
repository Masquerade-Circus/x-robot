import {
  VISUALIZATION_LEVEL,
  createPlantUmlStringFromMachine,
  createPngFromMachine,
  createPngFromPlantUmlCode,
  createSvgFromMachine,
  createSvgFromPlantUmlCode,
  getPlantUmlCode,
} from "../lib/visualize";
import {
  action,
  context,
  dangerState,
  description,
  guard,
  immediate,
  infoState,
  initial,
  machine,
  nested,
  nestedGuard,
  parallel,
  primaryState,
  producer,
  state,
  states,
  successState,
  transition,
  warningState,
} from "../lib";
import { describe, it } from "mocha";

import bird from "./bird-machine-ts";
import expect from "expect";
import fs from "fs";
import { serialize } from "../lib/serialize";

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
      title,
      states(
        successState(
          "preview",
          description("Initial state"),
          // Save the current title as oldTitle so we can reset later.
          producer(cacheTitle),
          transition("edit", "editMode")
        ),
        infoState(
          "editMode",
          description("The user tries to edit the title"),
          // Update title with the event value
          producer(updateTitle),
          transition("input", "editMode"),
          transition("cancel", "cancel"),
          transition(
            "save",
            "save",
            // Check if the title is valid. If so continue with the state.
            // If not, the machine keeps its current state.
            // In this case we came from editMode, so we keep the editMode state and update the context with the validation error.
            guard(titleIsValid, producer(updateError))
          )
        ),
        warningState(
          "cancel",
          description("The user cancels the edition"),
          // Reset the title back to oldTitle
          producer(restoreTitle),
          immediate("preview")
        ),
        primaryState(
          "save",
          description("The user saves the title"),
          // If the guard is true, we try to save the title.
          // If the save action succeeds, we immediately go to the preview state.
          // If the save action fails, we update the context with the error and go to the error state.
          action(saveTitle, "preview", producer(updateError, "error"))
        ),
        dangerState("error", description("We failed to save the title to the db"), producer(updateError))
        // Should we provide a retry or...?
      ),
      context(getState),
      initial("preview")
    );

    return myMachine;
  };

  it("should generate a diagram from a serialized machine in low level plantuml string format", () => {
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

    const serializedMachine = serialize(myMachine);

    expect(getPlantUmlCode(serializedMachine)).toEqual(plantUmlCode);
  });

  it("should generate a diagram from a serialized machine in high level plantuml string format", () => {
    const plantUmlCode = `
@startuml

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

    const myMachine = getMachine();

    const serializedMachine = serialize(myMachine);

    expect(getPlantUmlCode(serializedMachine, VISUALIZATION_LEVEL.HIGH)).toEqual(plantUmlCode);
  });

  it("should allow to pass a title for the plantuml diagram", () => {
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

    const myMachine = getMachine("My Awesome PlantUML Machine Diagram");

    const serializedMachine = serialize(myMachine);

    expect(
      getPlantUmlCode(serializedMachine, {
        level: VISUALIZATION_LEVEL.HIGH,
      })
    ).toEqual(plantUmlCode);
  });

  it("should allow to pass descriptions for the states of the plantuml diagram", () => {
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

    const myMachine = getMachine("My Awesome PlantUML Machine Diagram");

    const serializedMachine = serialize(myMachine);

    expect(getPlantUmlCode(serializedMachine, VISUALIZATION_LEVEL.HIGH)).toEqual(plantUmlCode);
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

    const serializedMachine = serialize(myMachine);

    expect(
      getPlantUmlCode(serializedMachine, {
        level: VISUALIZATION_LEVEL.HIGH,
        skinparam: "skinparam backgroundColor red",
      })
    ).toEqual(plantUmlCode);
  });

  it("should generate a diagram from a serialized machine in png format", async () => {
    const myMachine = getMachine("My Awesome PlantUML Machine Diagram");

    const plantUmlCode = getPlantUmlCode(serialize(myMachine), VISUALIZATION_LEVEL.HIGH);

    const png = await createPngFromPlantUmlCode(plantUmlCode);

    expect(png).toBeDefined();

    // expect that the file exists and is not empty
    expect(fs.existsSync(png)).toBeTruthy();

    // Remove the file
    fs.unlinkSync(png);
  });

  it("should generate a diagram from a serialized machine in svg format", async () => {
    const myMachine = getMachine("My Awesome PlantUML Machine Diagram");

    const plantUmlCode = getPlantUmlCode(serialize(myMachine), VISUALIZATION_LEVEL.HIGH);

    const svg = await createSvgFromPlantUmlCode(plantUmlCode, {
      outDir: "./tmp",
      fileName: "my-awesome-plantuml-machine-diagram",
    });

    expect(svg).toBeDefined();

    // expect that the file exists and is not empty
    expect(fs.existsSync(svg)).toBeTruthy();

    // Remove the file
    fs.unlinkSync(svg);
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

    const plantUmlString = createPlantUmlStringFromMachine(myMachine, VISUALIZATION_LEVEL.HIGH);

    expect(plantUmlString).toEqual(plantUmlCode);
  });

  it("should generate a diagram from a machine in png format", async () => {
    const myMachine = getMachine();

    const png = await createPngFromMachine(myMachine);

    expect(png).toBeDefined();

    // expect that the file exists and is not empty
    expect(fs.existsSync(png)).toBeTruthy();

    // Remove the file
    fs.unlinkSync(png);
  });

  it("should generate a diagram from a machine in svg format", async () => {
    const myMachine = getMachine();

    const svg = await createSvgFromMachine(myMachine);

    expect(svg).toBeDefined();

    // expect that the file exists and is not empty
    expect(fs.existsSync(svg)).toBeTruthy();

    // Remove the file
    fs.unlinkSync(svg);
  });

  it("should generate a diagram for a serialized machine with nested machines", async () => {
    let leftWingMachine = machine(
      "Left wing",
      states(state("closed", transition("open", "opened")), state("opened", transition("close", "closed"))),
      initial("closed")
    );
    let rightWingMachine = machine(
      "Right wing",
      states(state("closed", transition("open", "opened")), state("opened", transition("close", "closed"))),
      initial("closed")
    );

    function wingsAreOpened(context) {
      return leftWingMachine.current === "opened" && rightWingMachine.current === "opened";
    }

    function wingsAreClosed(context) {
      return !wingsAreOpened(context);
    }

    let bird = machine(
      "Bird",
      states(
        state("land", transition("takeoff", "takingoff")),
        state("takingoff", nested(leftWingMachine), nested(rightWingMachine), immediate("flying", guard(wingsAreOpened))),
        state("flying", transition("land", "landing")),
        state("landing", nested(leftWingMachine), nested(rightWingMachine), immediate("land", guard(wingsAreClosed)))
      ),
      initial("land")
    );

    const plantUmlCode = getPlantUmlCode(serialize(bird), {
      level: VISUALIZATION_LEVEL.HIGH,
    });

    let expectedPlantUmlCode = `
@startuml

title Bird

state land<<default>>
state takingoff<<default>>
state flying<<default>>
state landing<<default>>

state takingoff {
  note "Left wing" as NTakingoffLeftWing

  state "closed" as TakingoffLeftWingClosed<<default>>
  state "opened" as TakingoffLeftWingOpened<<default>>

  [*] --> TakingoffLeftWingClosed
  TakingoffLeftWingClosed -[#slategray]-> TakingoffLeftWingOpened: open
  TakingoffLeftWingOpened -[#slategray]-> TakingoffLeftWingClosed: close

  ||

  note "Right wing" as NTakingoffRightWing

  state "closed" as TakingoffRightWingClosed<<default>>
  state "opened" as TakingoffRightWingOpened<<default>>

  [*] --> TakingoffRightWingClosed
  TakingoffRightWingClosed -[#slategray]-> TakingoffRightWingOpened: open
  TakingoffRightWingOpened -[#slategray]-> TakingoffRightWingClosed: close
}

state landing {
  note "Left wing" as NLandingLeftWing

  state "closed" as LandingLeftWingClosed<<default>>
  state "opened" as LandingLeftWingOpened<<default>>

  [*] --> LandingLeftWingClosed
  LandingLeftWingClosed -[#slategray]-> LandingLeftWingOpened: open
  LandingLeftWingOpened -[#slategray]-> LandingLeftWingClosed: close

  ||

  note "Right wing" as NLandingRightWing

  state "closed" as LandingRightWingClosed<<default>>
  state "opened" as LandingRightWingOpened<<default>>

  [*] --> LandingRightWingClosed
  LandingRightWingClosed -[#slategray]-> LandingRightWingOpened: open
  LandingRightWingOpened -[#slategray]-> LandingRightWingClosed: close
}

[*] --> land
land -[#slategray]-> takingoff: takeoff
takingoff -[#slategray,dashed]-> flying: flying\\n└ G:wingsAreOpened
flying -[#slategray]-> landing: land
landing -[#slategray,dashed]-> land: land\\n└ G:wingsAreClosed

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

    expect(plantUmlCode).toEqual(expectedPlantUmlCode);
  });

  it("should generate a diagram for a serialized machine with all features available", async () => {
    const plantUmlCode = getPlantUmlCode(serialize(bird), {
      level: VISUALIZATION_LEVEL.HIGH,
    });

    let expectedPlantUmlCode = `
@startuml

title Bird

state land<<primary>>
state takingoff<<info>>
state flying<<success>>
state landing<<warning>>
state fatal<<danger>>

state takingoff {
  note "Left wing" as NTakingoffLeftWing

  state "closed" as TakingoffLeftWingClosed<<default>>
  state "opened" as TakingoffLeftWingOpened<<default>>
  state "fatal" as TakingoffLeftWingFatal<<default>>

  TakingoffLeftWingClosed: The left wing is closed
  TakingoffLeftWingOpened: The left wing is opened
  TakingoffLeftWingFatal: Is the left wing injured?

  TakingoffLeftWingClosed: ├┬ A:sendStateToApiForLeftWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateLeftWingToClosed
  TakingoffLeftWingOpened: ├┬ A:sendStateToApiForLeftWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateLeftWingToOpened
  TakingoffLeftWingFatal: ├┬ A:sendStateToApiForLeftWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n├ P:updateLeftWingToFatal\\n└ P:updateError

  [*] --> TakingoffLeftWingClosed
  TakingoffLeftWingClosed -[#slategray]-> TakingoffLeftWingFatal: fatal
  TakingoffLeftWingClosed -[#slategray]-> TakingoffLeftWingOpened: open\\n└┬ G:isLeftWingClosed\\n └┬ failure\\n  └ P:updateError
  TakingoffLeftWingOpened -[#slategray]-> TakingoffLeftWingFatal: fatal
  TakingoffLeftWingOpened -[#slategray]-> TakingoffLeftWingClosed: close\\n└┬ G:isLeftWingOpened\\n └┬ failure\\n  └ P:updateError
  TakingoffLeftWingFatal -[#slategray]-> TakingoffLeftWingFatal: fatal

  ||

  note "Right wing" as NTakingoffRightWing

  state "closed" as TakingoffRightWingClosed<<default>>
  state "opened" as TakingoffRightWingOpened<<default>>
  state "fatal" as TakingoffRightWingFatal<<default>>

  TakingoffRightWingClosed: The right wing is closed
  TakingoffRightWingOpened: The right wing is opened
  TakingoffRightWingFatal: Is the right wing injured?

  TakingoffRightWingClosed: ├┬ A:sendStateToApiForRightWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateRightWingToClosed
  TakingoffRightWingOpened: ├┬ A:sendStateToApiForRightWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateRightWingToOpened
  TakingoffRightWingFatal: ├┬ A:sendStateToApiForRightWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n├ P:updateRightWingToFatal\\n└ P:updateError

  [*] --> TakingoffRightWingClosed
  TakingoffRightWingClosed -[#slategray]-> TakingoffRightWingFatal: fatal
  TakingoffRightWingClosed -[#slategray]-> TakingoffRightWingOpened: open\\n└┬ G:isRightWingClosed\\n └┬ failure\\n  └ P:updateError
  TakingoffRightWingOpened -[#slategray]-> TakingoffRightWingFatal: fatal
  TakingoffRightWingOpened -[#slategray]-> TakingoffRightWingClosed: close\\n└┬ G:isRightWingOpened\\n └┬ failure\\n  └ P:updateError
  TakingoffRightWingFatal -[#slategray]-> TakingoffRightWingFatal: fatal
}

state landing {
  note "Left wing" as NLandingLeftWing

  state "closed" as LandingLeftWingClosed<<default>>
  state "opened" as LandingLeftWingOpened<<default>>
  state "fatal" as LandingLeftWingFatal<<default>>

  LandingLeftWingClosed: The left wing is closed
  LandingLeftWingOpened: The left wing is opened
  LandingLeftWingFatal: Is the left wing injured?

  LandingLeftWingClosed: ├┬ A:sendStateToApiForLeftWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateLeftWingToClosed
  LandingLeftWingOpened: ├┬ A:sendStateToApiForLeftWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateLeftWingToOpened
  LandingLeftWingFatal: ├┬ A:sendStateToApiForLeftWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n├ P:updateLeftWingToFatal\\n└ P:updateError

  [*] --> LandingLeftWingClosed
  LandingLeftWingClosed -[#slategray]-> LandingLeftWingFatal: fatal
  LandingLeftWingClosed -[#slategray]-> LandingLeftWingOpened: open\\n└┬ G:isLeftWingClosed\\n └┬ failure\\n  └ P:updateError
  LandingLeftWingOpened -[#slategray]-> LandingLeftWingFatal: fatal
  LandingLeftWingOpened -[#slategray]-> LandingLeftWingClosed: close\\n└┬ G:isLeftWingOpened\\n └┬ failure\\n  └ P:updateError
  LandingLeftWingFatal -[#slategray]-> LandingLeftWingFatal: fatal

  ||

  note "Right wing" as NLandingRightWing

  state "closed" as LandingRightWingClosed<<default>>
  state "opened" as LandingRightWingOpened<<default>>
  state "fatal" as LandingRightWingFatal<<default>>

  LandingRightWingClosed: The right wing is closed
  LandingRightWingOpened: The right wing is opened
  LandingRightWingFatal: Is the right wing injured?

  LandingRightWingClosed: ├┬ A:sendStateToApiForRightWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateRightWingToClosed
  LandingRightWingOpened: ├┬ A:sendStateToApiForRightWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateRightWingToOpened
  LandingRightWingFatal: ├┬ A:sendStateToApiForRightWing\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n├ P:updateRightWingToFatal\\n└ P:updateError

  [*] --> LandingRightWingClosed
  LandingRightWingClosed -[#slategray]-> LandingRightWingFatal: fatal
  LandingRightWingClosed -[#slategray]-> LandingRightWingOpened: open\\n└┬ G:isRightWingClosed\\n └┬ failure\\n  └ P:updateError
  LandingRightWingOpened -[#slategray]-> LandingRightWingFatal: fatal
  LandingRightWingOpened -[#slategray]-> LandingRightWingClosed: close\\n└┬ G:isRightWingOpened\\n └┬ failure\\n  └ P:updateError
  LandingRightWingFatal -[#slategray]-> LandingRightWingFatal: fatal
}

state "Parallel states" as BirdParallelStates {
  note "Flying time" as NBirdFlyingTime

  state "stopped" as BirdFlyingTimeStopped<<default>>
  state "started" as BirdFlyingTimeStarted<<default>>

  BirdFlyingTimeStopped: The bird is not flying
  BirdFlyingTimeStarted: The bird is flying

  BirdFlyingTimeStopped: └ P:stopTimer
  BirdFlyingTimeStarted: └ P:startTimer

  [*] --> BirdFlyingTimeStopped
  BirdFlyingTimeStopped -[#slategray]-> BirdFlyingTimeStarted: start\\n└ G:isTimeStopped
  BirdFlyingTimeStarted -[#slategray]-> BirdFlyingTimeStopped: stop\\n└ G:isTimeStarted

  --

  note "Walking time" as NBirdWalkingTime

  state "stopped" as BirdWalkingTimeStopped<<default>>
  state "started" as BirdWalkingTimeStarted<<default>>

  BirdWalkingTimeStopped: The bird is not walking
  BirdWalkingTimeStarted: The bird is walking

  BirdWalkingTimeStopped: └ P:stopTimer
  BirdWalkingTimeStarted: └ P:startTimer

  [*] --> BirdWalkingTimeStopped
  BirdWalkingTimeStopped -[#slategray]-> BirdWalkingTimeStarted: start\\n└ G:isTimeStopped
  BirdWalkingTimeStarted -[#slategray]-> BirdWalkingTimeStopped: stop\\n└ G:isTimeStarted
}

land: The bird is on the ground
takingoff: The bird is taking off
flying: The bird is on the air
landing: The bird is landing
fatal: Is the bird dead?

land: ├┬ A:sendStateToApiForBird\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n├ P:updateBirdToLand\\n├ T:flyingtime/stop\\n└ T:walkingtime/start
takingoff: ├ T:leftwing.open\\n├ T:rightwing.open\\n├┬ A:sendStateToApiForBird\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateBirdToTakingoff
flying: ├┬ A:sendStateToApiForBird\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n├ P:updateBirdToFlying\\n├ T:flyingtime/start\\n└ T:walkingtime/stop
landing: ├ T:leftwing.close\\n├ T:rightwing.close\\n├┬ A:sendStateToApiForBird\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n└ P:updateBirdToLanding
fatal: ├┬ A:sendStateToApiForBird\\n│└┬ failure\\n│ ├ P:updateError\\n│ └ T:fatal\\n├ P:updateBirdToFatal\\n└ P:updateError

[*] --> land
land -[#indianred]-> fatal: fatal
land -[#skyblue]-> takingoff: takeoff
takingoff -[#indianred]-> fatal: fatal
takingoff -[#mediumseagreen,dashed]-> flying: flying\\n├┬ G:isLeftWingOpened\\n│└┬ failure\\n│ └ P:updateError\\n└┬ G:isRightWingOpened\\n └┬ failure\\n  └ P:updateError
flying -[#indianred]-> fatal: fatal
flying -[#tan]-> landing: land
landing -[#indianred]-> fatal: fatal
landing -[#lightsteelblue,dashed]-> land: land\\n├┬ G:isLeftWingClosed\\n│└┬ failure\\n│ └ P:updateError\\n└┬ G:isRightWingClosed\\n └┬ failure\\n  └ P:updateError
fatal -[#indianred]-> fatal: fatal

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

    expect(plantUmlCode).toEqual(expectedPlantUmlCode);

    const svg = await createSvgFromPlantUmlCode(plantUmlCode, {
      outDir: "./tmp",
      fileName: "bird-machine-diagram",
    });

    expect(svg).toBeDefined();

    // expect that the file exists and is not empty
    expect(fs.existsSync(svg)).toBeTruthy();

    // Remove the file
    fs.unlinkSync(svg);
  });

  it("should allow to pass an option to display the final mark for the final states");
});

describe("Readme examples", () => {
  it("Simple example", async () => {
    const stoplight = machine(
      "Stoplight",
      states(state("green", transition("next", "yellow")), state("yellow", transition("next", "red")), state("red", transition("next", "green"))),
      initial("green")
    );

    const svg = await createSvgFromMachine(stoplight, {
      fileName: "toggle-machine-diagram",
      outDir: "./docs/images",
      level: VISUALIZATION_LEVEL.HIGH,
    });

    expect(svg).toBeDefined();
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
      initial("idle"),
      context({
        dog: null,
        error: null,
      }),
      states(
        state("idle", transition("fetch", "loading")),
        state("loading", action(fetchDog, producer(assignDog, "resolved"), producer(assignError, "rejected")), transition("cancel", "idle")),
        state("resolved", immediate("idle")),
        state("rejected")
      )
    );

    const svg = await createSvgFromMachine(fetchMachine, {
      fileName: "fetch-machine-diagram",
      outDir: "./docs/images",
      level: VISUALIZATION_LEVEL.HIGH,
    });

    expect(svg).toBeDefined();
  });

  it("Nested example", async () => {
    const stopwalk = machine("Stopwalk", states(state("wait", transition("start", "walk")), state("walk", transition("stop", "wait"))), initial("wait"));

    // Guard to prevent the machine to transition to 'green' if the stopwalk machine is in 'walk' state
    const canGoToGreen = () => {
      return stopwalk.current === "wait";
    };

    const stoplight = machine(
      "Stoplight",
      states(
        state("green", transition("next", "yellow")),
        state("yellow", transition("next", "red")),
        state("red", nested(stopwalk, "start"), immediate("green", guard(canGoToGreen)))
      ),
      initial("green")
    );

    const svg = await createSvgFromMachine(stoplight, {
      fileName: "stoplight-machine-diagram",
      outDir: "./docs/images",
      level: VISUALIZATION_LEVEL.HIGH,
    });

    expect(svg).toBeDefined();
  });

  it("Parallel example", async () => {
    const boldMachine = machine("Bold", states(state("on", transition("off", "off")), state("off", transition("on", "on"))), initial("off"));
    const underlineMachine = machine("Underline", states(state("on", transition("off", "off")), state("off", transition("on", "on"))), initial("off"));
    const italicsMachine = machine("Italics", states(state("on", transition("off", "off")), state("off", transition("on", "on"))), initial("off"));
    const listMachine = machine(
      "List",
      states(
        state("none", transition("bullets", "bullets"), transition("numbers", "numbers")),
        state("bullets", transition("none", "none")),
        state("numbers", transition("none", "none"))
      ),
      initial("none")
    );

    const wordMachine = machine("Word Machine", parallel(boldMachine, underlineMachine, italicsMachine, listMachine));

    const svg = await createSvgFromMachine(wordMachine, {
      fileName: "word-machine-diagram",
      outDir: "./docs/images",
    });

    expect(svg).toBeDefined();
  });
});

/* 
@startuml

title Bird

state land<<primary>>
state takingoff<<info>>
state flying<<success>>
state landing<<warning>>
state fatal<<danger>>

state takingoff {
  note "Left wing" as NTakingoffLeftWing

  state "closed" as TakingoffLeftWingClosed<<default>>
  state "opened" as TakingoffLeftWingOpened<<default>>
  state "fatal" as TakingoffLeftWingFatal<<default>>

  TakingoffLeftWingClosed: The left wing is closed
  TakingoffLeftWingOpened: The left wing is opened
  TakingoffLeftWingFatal: Is the left wing injured?

  TakingoffLeftWingClosed: ├┬ A:sendStateToApiForLeftWing\n│└┬ failure\n│ ├ P:updateError\n│ └ T:fatal\n└ P:updateLeftWingToClosed
  TakingoffLeftWingOpened: ├┬ A:sendStateToApiForLeftWing\n│└┬ failure\n│ ├ P:updateError\n│ └ T:fatal\n└ P:updateLeftWingToOpened
  TakingoffLeftWingFatal: ├┬ A:sendStateToApiForLeftWing\n│└┬ failure\n│ ├ P:updateError\n│ └ T:fatal\n├ P:updateLeftWingToFatal\n└ P:updateError

  [*] --> TakingoffLeftWingClosed
  TakingoffLeftWingClosed -[#slategray]-> TakingoffLeftWingFatal: fatal
  TakingoffLeftWingClosed -[#slategray]-> TakingoffLeftWingOpened: open\n└┬ G:isLeftWingClosed\n └┬ failure\n  └ P:updateError
  TakingoffLeftWingOpened -[#slategray]-> TakingoffLeftWingFatal: fatal
  TakingoffLeftWingOpened -[#slategray]-> TakingoffLeftWingClosed: close\n└┬ G:isLeftWingOpened\n └┬ failure\n  └ P:updateError
  TakingoffLeftWingFatal -[#slategray]-> TakingoffLeftWingFatal: fatal

  ||

  note "Right wing" as NTakingoffRightWing

  state "closed" as TakingoffRightWingClosed<<default>>
  state "opened" as TakingoffRightWingOpened<<default>>
  state "fatal" as TakingoffRightWingFatal<<default>>

  TakingoffRightWingClosed: The right wing is closed
  TakingoffRightWingOpened: The right wing is opened
  TakingoffRightWingFatal: Is the right wing injured?

  TakingoffRightWingClosed: ├┬ A:sendStateToApiForRightWing\n│└┬ failure\n│ ├ P:updateError\n│ └ T:fatal\n└ P:updateRightWingToClosed
  TakingoffRightWingOpened: ├┬ A:sendStateToApiForRightWing\n│└┬ failure\n│ ├ P:updateError\n│ └ T:fatal\n└ P:updateRightWingToOpened
  TakingoffRightWingFatal: ├┬ A:sendStateToApiForRightWing\n│└┬ failure\n│ ├ P:updateError\n│ └ T:fatal\n├ P:updateRightWingToFatal\n└ P:updateError

  [*] --> TakingoffRightWingClosed
  TakingoffRightWingClosed -[#slategray]-> TakingoffRightWingFatal: fatal
  TakingoffRightWingClosed -[#slategray]-> TakingoffRightWingOpened: open\n└┬ G:isRightWingClosed\n └┬ failure\n  └ P:updateError
  TakingoffRightWingOpened -[#slategray]-> TakingoffRightWingFatal: fatal
  TakingoffRightWingOpened -[#slategray]-> TakingoffRightWingClosed: close\n└┬ G:isRightWingOpened\n └┬ failure\n  └ P:updateError
  TakingoffRightWingFatal -[#slategray]-> TakingoffRightWingFatal: fatal
}

state landing {
  note "Left wing" as NLandingLeftWing

  state "closed" as LandingLeftWingClosed<<default>>
  state "opened" as LandingLeftWingOpened<<default>>
  state "fatal" as LandingLeftWingFatal<<default>>

  LandingLeftWingClosed: The left wing is closed
  LandingLeftWingOpened: The left wing is opened
  LandingLeftWingFatal: Is the left wing injured?

  LandingLeftWingClosed: ├┬ A:sendStateToApiForLeftWing\n│└┬ failure\n│ ├ P:updateError\n│ └ T:fatal\n└ P:updateLeftWingToClosed
  LandingLeftWingOpened: ├┬ A:sendStateToApiForLeftWing\n│└┬ failure\n│ ├ P:updateError\n│ └ T:fatal\n└ P:updateLeftWingToOpened
  LandingLeftWingFatal: ├┬ A:sendStateToApiForLeftWing\n│└┬ failure\n│ ├ P:updateError\n│ └ T:fatal\n├ P:updateLeftWingToFatal\n└ P:updateError

  [*] --> LandingLeftWingClosed
  LandingLeftWingClosed -[#slategray]-> LandingLeftWingFatal: fatal
  LandingLeftWingClosed -[#slategray]-> LandingLeftWingOpened: open\n└┬ G:isLeftWingClosed\n └┬ failure\n  └ P:updateError
  LandingLeftWingOpened -[#slategray]-> LandingLeftWingFatal: fatal
  LandingLeftWingOpened -[#slategray]-> LandingLeftWingClosed: close\n└┬ G:isLeftWingOpened\n └┬ failure\n  └ P:updateError
  LandingLeftWingFatal -[#slategray]-> LandingLeftWingFatal: fatal

  ||

  note "Right wing" as NLandingRightWing

  state "closed" as LandingRightWingClosed<<default>>
  state "opened" as LandingRightWingOpened<<default>>
  state "fatal" as LandingRightWingFatal<<default>>

  LandingRightWingClosed: The right wing is closed
  LandingRightWingOpened: The right wing is opened
  LandingRightWingFatal: Is the right wing injured?

  LandingRightWingClosed: ├┬ A:sendStateToApiForRightWing\n│└┬ failure\n│ ├ P:updateError\n│ └ T:fatal\n└ P:updateRightWingToClosed
  LandingRightWingOpened: ├┬ A:sendStateToApiForRightWing\n│└┬ failure\n│ ├ P:updateError\n│ └ T:fatal\n└ P:updateRightWingToOpened
  LandingRightWingFatal: ├┬ A:sendStateToApiForRightWing\n│└┬ failure\n│ ├ P:updateError\n│ └ T:fatal\n├ P:updateRightWingToFatal\n└ P:updateError

  [*] --> LandingRightWingClosed
  LandingRightWingClosed -[#slategray]-> LandingRightWingFatal: fatal
  LandingRightWingClosed -[#slategray]-> LandingRightWingOpened: open\n└┬ G:isRightWingClosed\n └┬ failure\n  └ P:updateError
  LandingRightWingOpened -[#slategray]-> LandingRightWingFatal: fatal
  LandingRightWingOpened -[#slategray]-> LandingRightWingClosed: close\n└┬ G:isRightWingOpened\n └┬ failure\n  └ P:updateError
  LandingRightWingFatal -[#slategray]-> LandingRightWingFatal: fatal
}

state "Parallel states" as BirdParallelStates {
  note "Flying time" as NBirdFlyingTime

  state "stopped" as BirdFlyingTimeStopped<<default>>
  state "started" as BirdFlyingTimeStarted<<default>>

  BirdFlyingTimeStopped: The bird is not flying
  BirdFlyingTimeStarted: The bird is flying

  BirdFlyingTimeStopped: └ P:stopTimer
  BirdFlyingTimeStarted: └ P:startTimer

  [*] --> BirdFlyingTimeStopped
  BirdFlyingTimeStopped -[#slategray]-> BirdFlyingTimeStarted: start\n└ G:isTimeStopped
  BirdFlyingTimeStarted -[#slategray]-> BirdFlyingTimeStopped: stop\n└ G:isTimeStarted

  --

  note "Walking time" as NBirdWalkingTime

  state "stopped" as BirdWalkingTimeStopped<<default>>
  state "started" as BirdWalkingTimeStarted<<default>>

  BirdWalkingTimeStopped: The bird is not walking
  BirdWalkingTimeStarted: The bird is walking

  BirdWalkingTimeStopped: └ P:stopTimer
  BirdWalkingTimeStarted: └ P:startTimer

  [*] --> BirdWalkingTimeStopped
  BirdWalkingTimeStopped -[#slategray]-> BirdWalkingTimeStarted: start\n└ G:isTimeStopped
  BirdWalkingTimeStarted -[#slategray]-> BirdWalkingTimeStopped: stop\n└ G:isTimeStarted
}

land: The bird is on the ground
takingoff: The bird is taking off
flying: The bird is on the air
landing: The bird is landing
fatal: Is the bird dead?

land: ├┬ A:sendStateToApiForBird\n│└┬ failure\n│ ├ P:updateError\n│ └ T:fatal\n├ P:updateBirdToLand\n├ T:flyingtime/stop\n└ T:walkingtime/start
takingoff: ├ T:leftwing.open\n├ T:rightwing.open\n├┬ A:sendStateToApiForBird\n│└┬ failure\n│ ├ P:updateError\n│ └ T:fatal\n└ P:updateBirdToTakingoff
flying: ├┬ A:sendStateToApiForBird\n│└┬ failure\n│ ├ P:updateError\n│ └ T:fatal\n├ P:updateBirdToFlying\n├ T:flyingtime/start\n└ T:walkingtime/stop
landing: ├ T:leftwing.close\n├ T:rightwing.close\n├┬ A:sendStateToApiForBird\n│└┬ failure\n│ ├ P:updateError\n│ └ T:fatal\n└ P:updateBirdToLanding
fatal: ├┬ A:sendStateToApiForBird\n│└┬ failure\n│ ├ P:updateError\n│ └ T:fatal\n├ P:updateBirdToFatal\n└ P:updateError

[*] --> land
land -[#indianred]-> fatal: fatal
land -[#skyblue]-> takingoff: takeoff
takingoff -[#indianred]-> fatal: fatal
takingoff -[#mediumseagreen,dashed]-> flying: flying\n├┬ G:isLeftWingOpened\n│└┬ failure\n│ └ P:updateError\n└┬ G:isRightWingOpened\n └┬ failure\n  └ P:updateError
flying -[#indianred]-> fatal: fatal
flying -[#tan]-> landing: land
landing -[#indianred]-> fatal: fatal
landing -[#lightsteelblue,dashed]-> land: land\n├┬ G:isLeftWingClosed\n│└┬ failure\n│ └ P:updateError\n└┬ G:isRightWingClosed\n └┬ failure\n  └ P:updateError
fatal -[#indianred]-> fatal: fatal

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

*/

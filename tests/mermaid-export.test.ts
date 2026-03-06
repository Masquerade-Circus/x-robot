import { documentate } from "../lib/documentate";
import {
  context,
  description,
  entry,
  guard,
  infoState,
  init,
  initial,
  machine,
  primaryState,
  state,
  successState,
  transition,
  warningState,
} from "../lib";
import { describe, it } from "mocha";
import expect from "expect";

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
    expect(result.mermaid).toContain("[*] --> preview");
    expect(result.mermaid).toContain("preview --> editMode: edit");
  });

  it("should generate mermaid code in high level format", async () => {
    const result = await documentate(getMachine(), { format: 'mermaid', level: 'high' });
    expect(result.mermaid).toContain("title: My machine");
    expect(result.mermaid).toContain("preview: Initial state");
    expect(result.mermaid).toContain("preview: └ P-cacheTitle");
    expect(result.mermaid).toContain("editMode --> save: save<br>└ G-titleIsValid");
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
});

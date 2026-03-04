import {
  context,
  dangerState,
  entry,
  exit,
  guard,
  immediate,
  infoState,
  initial,
  init,
  machine,
  primaryState,
  state,
  successState,
  transition,
  warningState,
} from "../lib";
import { describe, it } from "mocha";

import expect from "expect";
import { documentate } from "../lib/documentate";

// Serialize
describe("Serialize", () => {
  it("should serialize a machine correctly", async () => {
    const getState = () => ({
      title: "Ok",
      error: null,
    });

    const titleIsValid = (context: any) => {
      if (context.title.length > 0) {
        return true;
      }
      return [{ message: "Title is required" }];
    };

    async function saveTitle(context: any) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    function cacheTitle(context: any) {
      context.oldTitle = context.title;
    }

    function updateTitle(context: any, event: any) {
      if (!event) {
        return;
      }
      context.title = event.target.value;
    }

    function restoreTitle(context: any) {
      context.title = context.oldTitle;
    }

    function updateError(context: any, error: any) {
      context.error = error;
    }

    const myMachine = machine(
      "Title component",
      init(
        initial("preview"),
        context(getState)
      ),
      successState(
        "preview",
        entry(cacheTitle),
        transition("edit", "editMode")
      ),
      infoState(
        "editMode",
        entry(updateTitle),
        transition("input", "editMode"),
        transition("cancel", "cancel"),
        transition(
          "save",
          "save",
          guard(titleIsValid)
        )
      ),
      warningState(
        "cancel",
        entry(restoreTitle),
        immediate("preview")
      ),
      primaryState(
        "save",
        entry(saveTitle, "preview", "error")
      ),
      dangerState("error")
    );

    let serializedMachine = {
      states: {
        preview: {
          run: [
            {
              pulse: "cacheTitle",
              isAsync: false,
            },
          ],
          on: {
            edit: { target: "editMode" },
          },
          type: "success",
        },
        editMode: {
          run: [
            {
              pulse: "updateTitle",
              isAsync: false,
            },
          ],
          on: {
            input: { target: "editMode" },
            cancel: { target: "cancel" },
            save: {
              target: "save",
              guards: [
                {
                  guard: "titleIsValid",
                },
              ],
            },
          },
          type: "info",
        },
        cancel: {
          run: [
            {
              pulse: "restoreTitle",
              isAsync: false,
            },
          ],
          on: {
            preview: { target: "preview" },
          },
          immediate: [{ immediate: "preview" }],
          type: "warning",
        },
        save: {
          run: [
            {
              pulse: "saveTitle",
              success: "preview",
              failure: "error",
              isAsync: true,
            },
          ],
          on: {
            preview: { target: "preview" },
            error: { target: "error" },
          },
          type: "primary",
        },
        error: {
          type: "danger",
        },
      },
      parallel: {},
      title: "Title component",
      initial: "preview",
      context: getState(),
    };

    const result = await documentate(myMachine, { format: 'serialized' });
    expect(result.serialized).toEqual(serializedMachine);
  });

  it("should serialize exit in transitions", async () => {
    function cleanup(context: any) {
      context.cleaned = true;
    }

    const myMachine = machine(
      "Test",
      init(initial("idle")),
      state("idle", transition("start", "loading", exit(cleanup))),
      state("loading")
    );

    const result = await documentate(myMachine, { format: 'serialized' });
    const serialized = result.serialized!;
    
    expect(serialized.states.idle.on.start.exit).toBeDefined();
    expect(serialized.states.idle.on.start.exit).toHaveLength(1);
    expect(serialized.states.idle.on.start.exit[0].pulse).toBe("cleanup");
  });

  it("should serialize exit with failure transition", async () => {
    function cleanup(context: any) {
      context.cleaned = true;
    }

    const myMachine = machine(
      "Test",
      init(initial("idle")),
      state("idle", transition("start", "loading", exit(cleanup, "failure"))),
      state("loading"),
      state("failure")
    );

    const result = await documentate(myMachine, { format: 'serialized' });
    const serialized = result.serialized!;
    
    expect(serialized.states.idle.on.start.exit[0].pulse).toBe("cleanup");
    expect(serialized.states.idle.on.start.exit[0].failure).toBe("failure");
  });
});

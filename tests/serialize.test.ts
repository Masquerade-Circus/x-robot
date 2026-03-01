import {
  context,
  dangerState,
  guard,
  immediate,
  infoState,
  initial,
  machine,
  primaryState,
  pulse,
  states,
  successState,
  transition,
  warningState,
} from "../lib";
import { describe, it } from "mocha";

import expect from "expect";
import { serialize } from "../lib/serialize";

// Serialize
describe("Serialize", () => {
  it("should serialize a machine correctly", () => {
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
      states(
        successState(
          "preview",
          pulse(cacheTitle),
          transition("edit", "editMode")
        ),
        infoState(
          "editMode",
          pulse(updateTitle),
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
          pulse(restoreTitle),
          immediate("preview")
        ),
        primaryState(
          "save",
          pulse(saveTitle, "preview", "error")
        ),
        dangerState("error")
      ),
      context(getState),
      initial("preview")
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

    expect(serialize(myMachine)).toEqual(serializedMachine);
  });
});

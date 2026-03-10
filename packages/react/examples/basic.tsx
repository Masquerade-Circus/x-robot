import React from "react";
import { context, entry, init, initial, machine, state, transition } from "x-robot";
import { useMachine } from "@x-robot/react";

const lightMachine = machine(
  "Light switch",
  init(initial("off"), context({ presses: 0 })),
  state(
    "off",
    entry((ctx: any, payload?: { presses: number }) => ({
      ...ctx,
      presses: payload?.presses ?? ctx.presses
    })),
    transition("toggle", "on")
  ),
  state(
    "on",
    entry((ctx: any, payload?: { presses: number }) => ({
      ...ctx,
      presses: payload?.presses ?? ctx.presses
    })),
    transition("toggle", "off")
  )
);

export function LightSwitchExample() {
  const { current, context, invoke } = useMachine(lightMachine, { autostart: true });

  return (
    <button
      type="button"
      onClick={() => invoke("toggle", { presses: context.presses + 1 })}
      aria-pressed={current === "on"}
    >
      {current === "on" ? "On" : "Off"} ({context.presses} presses)
    </button>
  );
}

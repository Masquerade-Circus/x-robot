import React from "react";

import { machine, init, initial, state, transition, type MachineSnapshot } from "x-robot";
import { useMachine } from "@x-robot/react";

const checkoutMachine = machine(
  "Checkout",
  init(initial("idle")),
  state("idle", transition("submit", "done")),
  state("done")
);

const startSnapshot: MachineSnapshot = {
  current: "idle",
  context: {},
  history: []
};

export function SmokeComponent() {
  const { current, invoke, cleanup } = useMachine(checkoutMachine, {
    autostart: true,
    startSnapshot,
    devtools: { name: "Checkout" }
  });

  void invoke("submit");
  cleanup();

  return React.createElement("output", null, current);
}

import { defineComponent, h } from "vue";

import { useMachine } from "@x-robot/vue";
import { machine, init, initial, state, transition, type MachineSnapshot } from "x-robot";

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

export const SmokeComponent = defineComponent({
  name: "SmokeComponent",
  setup() {
    const { current, invoke, snapshot, cleanup } = useMachine(checkoutMachine, {
      autostart: true,
      startSnapshot,
      devtools: { name: "Checkout" }
    });

    void invoke("submit");
    snapshot();
    cleanup();

    return () => h("output", current.value);
  }
});

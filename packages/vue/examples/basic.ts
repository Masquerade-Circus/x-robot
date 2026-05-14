import { defineComponent } from "vue";
import { context, entry, init, initial, machine, state, transition } from "x-robot";
import { useMachine } from "@x-robot/vue";

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

export const LightSwitchExample = defineComponent({
  name: "LightSwitchExample",
  setup() {
    const { current, context, invoke } = useMachine(lightMachine, { autostart: true });

    function toggle() {
      void invoke("toggle", { presses: context.value.presses + 1 });
    }

    return {
      current,
      context,
      toggle
    };
  },
  template: `
    <button type="button" @click="toggle" :aria-pressed="current === 'on'">
      {{ current === "on" ? "On" : "Off" }} ({{ context.presses }} presses)
    </button>
  `
});

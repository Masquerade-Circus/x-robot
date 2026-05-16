# Framework Adapters

Use the official adapters when a React or Vue component needs to rerender from machine state. Keep the machine definition in core `x-robot`, then call the adapter wrapper methods from the framework layer.

## React

Install the core runtime and React adapter:

```bash
npm install x-robot @x-robot/react react react-dom
```

Create the machine with `x-robot`, then read and invoke it through `useMachine()`:

```tsx
import { init, initial, machine, state, transition } from "x-robot";
import { useMachine } from "@x-robot/react";

const toggleMachine = machine(
  "Toggle",
  init(initial("off")),
  state("off", transition("toggle", "on")),
  state("on", transition("toggle", "off"))
);

export function ToggleButton() {
  const { current, invoke } = useMachine(toggleMachine, {
    autostart: true
  });

  return (
    <button type="button" onClick={() => invoke("toggle")}>
      {current}
    </button>
  );
}
```

The React hook also exposes wrappers for manual startup and delayed events:

<!-- x-robot:fragment -->

```tsx
const { start, invoke, invokeAfter } = useMachine(toggleMachine);

await start();
await invoke("toggle");
const cancel = invokeAfter(500, "toggle");
```

## Vue

Install the core runtime and Vue adapter:

```bash
npm install x-robot @x-robot/vue vue
```

Create the machine with `x-robot`, then use the composable in `setup()`:

```ts
import { defineComponent } from "vue";
import { init, initial, machine, state, transition } from "x-robot";
import { useMachine } from "@x-robot/vue";

const toggleMachine = machine(
  "Toggle",
  init(initial("off")),
  state("off", transition("toggle", "on")),
  state("on", transition("toggle", "off"))
);

export const ToggleButton = defineComponent({
  setup() {
    const { current, invoke } = useMachine(toggleMachine, {
      autostart: true
    });

    function toggle() {
      void invoke("toggle");
    }

    return { current, toggle };
  },
  template: `
    <button type="button" @click="toggle">
      {{ current }}
    </button>
  `
});
```

Vue unwraps `current` in templates. In script code, read refs with `.value` when needed.

The Vue composable exposes the same wrapper methods:

<!-- x-robot:fragment -->

```ts
const { start, invoke, invokeAfter } = useMachine(toggleMachine);

await start();
await invoke("toggle");
const cancel = invokeAfter(500, "toggle");
```

## v1 reactivity contract

Framework state updates are guaranteed for transitions triggered through the wrappers returned by `useMachine()`:

*   `start()`
*   `invoke()`
*   `invokeAfter()`

Direct external calls such as `invoke(machine, "event")` mutate the machine, but are not tracked by the React/Vue adapters in v1 and should not be relied on for framework updates. Use the wrapper methods when UI state must update.

For package-level details, see `packages/react/README.md` and `packages/vue/README.md`.

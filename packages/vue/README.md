# @x-robot/vue

`@x-robot/vue` is the official Vue adapter for X-Robot.

It provides a small `useMachine()` composable that mirrors machine state into Vue refs while keeping the runtime model of `x-robot` intact.

## Installation

```bash
npm install x-robot @x-robot/vue vue
```

Peer dependencies:

*   `vue >= 3`
*   `x-robot`

## Basic Usage

```ts
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
  setup() {
    const { current, context, invoke } = useMachine(lightMachine, { autostart: true });

    function toggle() {
      void invoke("toggle", { presses: context.value.presses + 1 });
    }

    return { current, context, toggle };
  },
  template: `
    <button type="button" @click="toggle" :aria-pressed="current === 'on'">
      {{ current === "on" ? "On" : "Off" }} ({{ context.presses }} presses)
    </button>
  `
});
```

## Vue Reactivity Contract

`useMachine(machine, options?)` exposes machine state through Vue refs:

*   `current` is a `ref()`
*   `context` is a `shallowRef()`
*   `fatal` is a `shallowRef()`
*   `isAsync` is a `ref()`

In templates, Vue unwraps these refs automatically. In script code, read and write them through `.value`.

`useMachine(machine, options?)` guarantees reactive updates for transitions triggered through the wrappers returned by the composable:

*   `start()`
*   `invoke()`
*   `invokeAfter()`

That means this is supported:

```ts
const { current, invoke, snapshot } = useMachine(checkoutMachine, { autostart: true });

await invoke("submit", { email: "ada@example.com" });
console.log(current.value);
console.log(snapshot().current);
```

This is not tracked in v1 and should not be relied on for Vue updates:

```ts
import { invoke } from "x-robot";

const value = useMachine(checkoutMachine);

await invoke(checkoutMachine, "submit");
console.log(value.current.value);
// Vue is not guaranteed to update here.
```

If you need guaranteed updates, call the wrapper returned by `useMachine()`.

## API

```ts
const {
  machine,
  current,
  context,
  fatal,
  isAsync,
  start,
  invoke,
  invokeAfter,
  snapshot,
  cleanup
} = useMachine(machineInstance, {
  autostart: true,
  devtools: { name: "Checkout" }
});
```

Options:

*   `autostart?: boolean`
*   `devtools?: boolean | { name?: string }`
*   `startSnapshot?: MachineSnapshot`

## Devtools

If `devtools` is enabled, the composable uses `x-robot/devtools` internally. Keep that connection in development builds only when possible.

## Cleanup

Call `cleanup()` when you need to tear down the adapter manually, or let Vue lifecycle cleanup run automatically when the component scope is disposed.

## Examples

*   Tiny example: `packages/vue/examples/basic.ts`
*   Realistic async example: `packages/vue/examples/fetch.ts`

## Local Verification

```bash
npm run build --workspace @x-robot/vue
npm test --workspace @x-robot/vue
npm run test:smoke --workspace @x-robot/vue
npm run verify:vue:publish
```

See `docs/guides/publishing-adapters.md` for the publication, update, and long-term maintenance policy for this adapter and future official adapters.

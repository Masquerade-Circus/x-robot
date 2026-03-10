# @x-robot/react

`@x-robot/react` is the official React adapter for X-Robot.

It provides a small `useMachine()` hook that mirrors machine state inside React while keeping the runtime model of `x-robot` intact.

## Installation

```bash
npm install x-robot @x-robot/react react react-dom
```

Peer dependencies:

- `react >= 18`
- `react-dom >= 18`
- `x-robot`

## Basic Usage

```tsx
import { machine, init, initial, state, transition } from "x-robot";
import { useMachine } from "@x-robot/react";

const checkoutMachine = machine(
  "Checkout",
  init(initial("idle")),
  state("idle", transition("submit", "done")),
  state("done")
);

function CheckoutButton() {
  const { current, invoke, cleanup } = useMachine(checkoutMachine, {
    autostart: true,
    devtools: { name: "Checkout" }
  });

  return (
    <button
      type="button"
      onClick={() => invoke("submit")}
      onBlur={cleanup}
    >
      {current}
    </button>
  );
}
```

## Reactivity Contract

`useMachine(machine, options?)` guarantees rerenders for transitions triggered through the wrappers returned by the hook:

- `start()`
- `invoke()`
- `invokeAfter()`

That means this is supported:

```tsx
const { invoke, snapshot } = useMachine(checkoutMachine, { autostart: true });

await invoke("submit", { orderId: 42 });
console.log(snapshot().current);
```

This is not tracked in v1 and should not be relied on for React updates:

```tsx
import { invoke } from "x-robot";

const value = useMachine(checkoutMachine);

await invoke(checkoutMachine, "submit");
// React is not guaranteed to rerender here.
```

If you need guaranteed updates, call the wrapper returned by `useMachine()`.

## API

```tsx
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

- `autostart?: boolean`
- `devtools?: boolean | { name?: string }`
- `startSnapshot?: MachineSnapshot`

## Devtools

If `devtools` is enabled, the hook uses `x-robot/devtools` internally. Keep that connection in development builds only when possible.

## Cleanup

Call `cleanup()` when you need to tear down the adapter manually, or let React lifecycle cleanup run automatically on unmount.

## Examples

- Tiny example: `packages/react/examples/basic.tsx`
- Realistic async example: `packages/react/examples/fetch.tsx`

## Local Verification

```bash
npm run build --workspace @x-robot/react
npm test --workspace @x-robot/react
npm run test:smoke --workspace @x-robot/react
```

See `docs/guides/publishing-adapters.md` for the publication, update, and long-term maintenance policy for this adapter and future official adapters.

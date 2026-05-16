# Devtools

`x-robot/devtools` connects a machine to the Redux DevTools Extension.

It is optional, development-focused, and works by wrapping machine operations. If the extension is not installed, the wrapper still works and simply skips monitor integration.

## Import

Install the main package as usual:

```bash
npm install x-robot
```

Import the devtools entrypoint when you want it:

```javascript
import { connectXRobot } from "x-robot/devtools";
```

## Basic Usage

<!-- x-robot:fragment -->

```javascript
import { connectXRobot } from "x-robot/devtools";

const devtools = connectXRobot(machine, {
  name: "Checkout"
});

await devtools.start();
await devtools.invoke("submit", { orderId: 1 });
```

`connectXRobot(machine, options)` returns wrapped controls for one machine connection.

## Options

### `name`

Use `options.name` to label the connection in Redux DevTools.

<!-- x-robot:fragment -->

```javascript
const devtools = connectXRobot(machine, {
  name: "Checkout"
});
```

If you do not pass a name, the module falls back to the machine title, machine id, or `x-robot`.

## Returned API

`connectXRobot()` returns these properties:

| Property | What it does |
| --- | --- |
| `machine` | The same machine instance you connected |
| `start(snapshotOrPayload?)` | Starts the machine or restores from a snapshot |
| `invoke(transition, payload?)` | Triggers a transition and sends it to Redux DevTools |
| `invokeAfter(timeInMilliseconds, transition, payload?)` | Schedules a tracked delayed transition and returns a cancel function |
| `snapshot()` | Returns the current devtools snapshot |
| `disconnect()` | Unsubscribes from the Redux DevTools monitor |
| `cleanup()` | Alias of `disconnect()` |

The wrappers preserve sync and async behavior. If the underlying `start()` or `invoke()` call is synchronous, the wrapper is synchronous. If it returns a promise, the wrapper returns that promise and sends the update after it resolves.

<!-- x-robot:fragment -->

```javascript
const devtools = connectXRobot(machine, { name: "Checkout" });

const result = devtools.invoke("submit");

if (result instanceof Promise) {
  await result;
}
```

## Redux DevTools Actions

Incoming monitor actions map to machine behavior like this:

| DevTools action | Behavior |
| --- | --- |
| `JUMP_TO_STATE` | Restores the selected snapshot |
| `JUMP_TO_ACTION` | Restores the selected snapshot |
| `IMPORT_STATE` | Restores the selected imported state and updates the lifted timeline |
| `COMMIT` | Re-initializes Redux DevTools with the current machine snapshot |
| `RESET` | Restores the snapshot captured when you connected and re-initializes the monitor |
| `ROLLBACK` | Restores the rollback snapshot and re-initializes the monitor |
| `PAUSE_RECORDING` | Stops outgoing monitor updates until recording is resumed |
| `LOCK_CHANGES` | Blocks wrapped `start()`, `invoke()`, and `invokeAfter()` mutations |

In practice, this means time-travel and import actions can move the machine to earlier snapshots, while pause and lock only affect the wrapped devtools connection.

## Exclude Devtools from Production

`x-robot/devtools` is opt-in. The safest pattern is to import it only in development.

Recommended with a dynamic import when your environment exposes `import.meta.env.DEV`:

<!-- x-robot:fragment -->

```javascript
if (import.meta.env.DEV) {
  const { connectXRobot } = await import("x-robot/devtools");
  const devtools = connectXRobot(machine, { name: "Checkout" });
  devtools.start();
}
```

If your bundler replaces a compile-time constant such as `__DEV__`, the same pattern works there too:

<!-- x-robot:fragment -->

```javascript
if (__DEV__) {
  const { connectXRobot } = await import("x-robot/devtools");
  connectXRobot(machine, { name: "Checkout" });
}
```

Other setups may use a bundler alias or a no-op module replacement, but the important part is the same: avoid assuming a static top-level import will always be removed from production bundles.

## Limitations

*   Only wrapped calls are tracked.
*   Direct `invoke(machine, ...)` calls outside the returned wrappers are not observed.
*   Monitor features depend on the Redux DevTools Extension being available.
*   Teardown is manual unless your host app calls `disconnect()` or `cleanup()`.

## Cleanup

Disconnect when the host lifecycle ends:

<!-- x-robot:fragment -->

```javascript
const devtools = connectXRobot(machine, { name: "Checkout" });

devtools.start();

return () => {
  devtools.cleanup();
};
```

See the [Devtools Checkout recipe](../recipes/devtools-checkout.md) for a compact end-to-end example.

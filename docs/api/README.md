x-robot - v1.2.0 / [Modules](modules.md)

# X-Robot FSM

X-Robot FSM: A lightweight, developer-friendly finite state machine library for JavaScript and TypeScript.

## Why X-Robot?

*   **Entry pulses** — Async state management without boilerplate
*   **Frozen state by default** — No manual cloning required
*   **Native async guards** — No workarounds needed
*   **Small bundle** — 15.06KB core, 78.44KB with `documentate` + `validate`
*   **Fast** — 1.1-20.3x faster than XState in benchmarks
*   **TypeScript** — Includes TypeScript types for machine definitions and generated code
*   **Living visual docs** — `documentate()` separates visual outputs by concept:
    *   Mermaid: Markdown-friendly source diagrams and previews
    *   PlantUML: richer source diagrams and preferred visual styling
    *   SVG formats: explicit `svg-*` exports for sharing, embedding, and vector assets
    *   PNG formats: explicit `png-*` exports for raster docs, tickets, and slides
*   **Redux DevTools integration** — Inspect wrapped machine operations with `x-robot/devtools`

## Quick Start

```javascript
import {
  machine,
  state,
  initial,
  init,
  context,
  transition,
  invoke,
  entry
} from "x-robot";

// Define a fetch machine with async handling
async function fetchData(ctx) {
  const res = await fetch("/api/data");
  ctx.data = await res.json();
}

const fetchMachine = machine(
  "Fetch",
  init(initial("idle"), context({ data: null, error: null })),
  state("idle", transition("fetch", "loading")),
  state("loading", entry(fetchData, "success", "error")),
  state("success", transition("reset", "idle")),
  state("error", transition("reset", "idle"))
);

await invoke(fetchMachine, "fetch");
console.log(fetchMachine.current); // "success" or "error"
console.log(fetchMachine.context.data); // { ... }
```

## Installation

```bash
npm install x-robot
# or
bun add x-robot
```

## Framework Adapters

Official framework adapters:

*   `@x-robot/react` - React hook: `useMachine(machine, options?)`
*   `@x-robot/vue` - Vue composable: `useMachine(machine, options?)`
*   v1 contract: framework updates are guaranteed only for the wrapper methods returned by the adapter (`start`, `invoke`, `invokeAfter`)
*   Important caveat: direct external `invoke(machine, ...)` calls are not tracked in v1

Adapter docs:

*   React: `packages/react/README.md`
*   Vue: `packages/vue/README.md`

## Key Features

*   Nested and parallel states
*   Guards (synchronous and asynchronous)
*   Immediate transitions
*   Entry and exit pulses
*   Context management with frozen state
*   Delayed transitions with invokeAfter()
*   History tracking
*   Redux DevTools integration via `x-robot/devtools`
*   Machine validation with validate()
*   Code generation (TypeScript, ESM, CJS)
*   Diagram generation:
    *   Mermaid: Markdown-friendly state diagrams, sequence diagrams, and focused structural maps
    *   PlantUML: richer source diagrams for state, sequence, and focused structural views
    *   SVG formats: explicit `svg-*` exports for sharing, embedding, and vector assets
    *   PNG formats: explicit `png-*` exports for raster images in docs, tickets, and slides
*   SCXML import/export

## Redux DevTools

Use `x-robot/devtools` to connect a machine to the Redux DevTools Extension during development.

```javascript
if (import.meta.env.DEV) {
  const { connectXRobot } = await import("x-robot/devtools");
  const connection = connectXRobot(fetchMachine, {
    name: "Fetch"
  });

  await connection.start();
  await connection.invoke("fetch");
  connection.disconnect();
}
```

See `docs/guides/devtools.md` for setup, supported monitor actions, production exclusion, and cleanup patterns.

## API Overview

| Function        | Purpose                                                          |
| --------------- | ---------------------------------------------------------------- |
| `machine()`     | Create a state machine                                           |
| `state()`       | Define a state                                                   |
| `transition()`  | Define state transitions                                         |
| `invoke()`      | Trigger a transition                                             |
| `entry()`       | Entry pulse - runs when entering a state                         |
| `exit()`        | Exit pulse - runs when leaving a state                           |
| `guard()`       | Conditional transitions                                          |
| `invokeAfter()` | Delayed transitions                                              |
| `connectXRobot()` | Connect Redux DevTools via `x-robot/devtools`                  |
| `documentate()` | Generate code, serialization, Mermaid diagrams, PlantUML diagrams, explicit `svg-*` image exports, and explicit `png-*` image exports via `x-robot/documentate` |
| `validate()`    | Validate machine structure via `x-robot/validate`                |

## Documentation

`docs/guides/getting-started.md` · `docs/guides/visualization.md` · `docs/guides/serialization.md` · `docs/guides/devtools.md` · `docs/guides/publishing-adapters.md` · `packages/react/README.md` · `packages/vue/README.md` · `docs/concepts/` · `docs/api/` · `docs/recipes/` · `docs/performance.md`

## License

Apache-2.0

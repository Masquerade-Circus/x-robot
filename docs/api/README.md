x-robot - v0.3.0 / [Modules](modules.md)

# X-Robot

A lightweight, developer-friendly finite state machine library for JavaScript and TypeScript.

## Why X-Robot?

- **Entry pulses** — Async state management without boilerplate
- **Frozen state by default** — No manual cloning required
- **Native async guards** — No workarounds needed
- **Small bundle** — 15.57KB core, 110KB with full features
- **Fast** — 4-23x faster than XState in benchmarks
- **TypeScript** — Full type safety out of the box

## Quick Start

```javascript
import { machine, state, initial, init, context, transition, invoke, entry } from "x-robot";

// Define a fetch machine with async handling
const fetchMachine = machine(
  "Fetch",
  init(initial("idle"), context({ data: null, error: null })),
  state("idle", transition("fetch", "loading")),
  state("loading", entry(async (ctx) => {
    const res = await fetch("/api/data");
    ctx.data = await res.json();
  }, "success", "error")),
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

## Key Features

- Nested and parallel states
- Guards (synchronous and asynchronous)
- Entry and exit pulses
- Context management with frozen state
- Delayed transitions with invokeAfter()
- History tracking
- Machine validation with validate()
- Code generation (TypeScript, ESM, CJS)
- Diagram generation (SVG, PNG, PlantUML)
- SCXML import/export

## API Overview

| Function | Purpose |
|----------|---------|
| `machine()` | Create a state machine |
| `state()` | Define a state |
| `transition()` | Define state transitions |
| `invoke()` | Trigger a transition |
| `entry()` | Entry pulse - runs when entering a state |
| `exit()` | Exit pulse - runs when leaving a state |
| `guard()` | Conditional transitions |
| `invokeAfter()` | Delayed transitions |
| `documentate()` | Generate code, diagrams, serialization |
| `validate()` | Validate machine structure |

## Documentation

[Getting Started](./docs/guides/getting-started.md) · [Concepts](./docs/concepts/) · [API](./docs/api/) · [Recipes](./docs/recipes/) · [Performance](./docs/performance.md)

## License

Apache-2.0

# Getting Started

This guide walks through creating your first state machine with X-Robot.

## Installation

```bash
npm install x-robot
# or
bun add x-robot
```

## Your First Machine

A finite state machine has states and transitions. Let's build a simple toggle:

```javascript
import { machine, state, transition, invoke } from "x-robot";

const toggle = machine(
  "Toggle",
  state("off", transition("toggle", "on")),
  state("on", transition("toggle", "off"))
);

console.log(toggle.current); // "off"

invoke(toggle, "toggle");
console.log(toggle.current); // "on"

invoke(toggle, "toggle");
console.log(toggle.current); // "off"
```

## Understanding the Parts

### machine(name, ...states)

Creates a new state machine.

```javascript
const myMachine = machine("MyMachine", state("idle"));
```

### state(name, ...handlers)

Defines a state. Handlers include transitions, pulses, guards, etc.

```javascript
state("idle", transition("start", "running"))
```

### transition(event, target, ...options)

Defines how the machine responds to events.

```javascript
transition("toggle", "on")           // Simple
transition("submit", "saving", guard(canSubmit))  // With guard
```

### invoke(machine, event, payload?)

Triggers a transition.

```javascript
invoke(myMachine, "submit", { data: "value" });
```

## Adding Context

Context stores data associated with the machine:

```javascript
import { initial, init, context } from "x-robot";

const counter = machine(
  "Counter",
  init(
    initial("idle"),
    context({ count: 0 })
  ),
  state("idle", transition("increment", "idle"))
);

invoke(counter, "increment");
console.log(counter.context.count); // 1
```

## Working with Async

The Pulse concept handles async operations:

```javascript
import { entry } from "x-robot";

const fetcher = machine(
  "Fetcher",
  init(initial("idle"), context({ data: null })),
  state("idle", transition("fetch", "loading")),
  state("loading", entry(async (ctx) => {
    const res = await fetch("/api/data");
    ctx.data = await res.json();
  }, "success", "error")),
  state("success"),
  state("error")
);

await invoke(fetcher, "fetch");
console.log(fetcher.current); // "success" or "error"
```

## Complete Example

Here's a form submission machine with validation:

```javascript
import { machine, state, transition, invoke, initial, init, context, entry, guard } from "x-robot";

const formMachine = machine(
  "Form",
  init(
    initial("pristine"),
    context({ values: {}, errors: {} })
  ),
  state("pristine", transition("change", "dirty")),
  state("dirty", 
    transition("validate", "validating"),
    transition("submit", "submitting", guard((ctx) => Object.keys(ctx.errors).length === 0))
  ),
  state("validating", entry((ctx) => {
    ctx.errors = validateForm(ctx.values);
  }, "dirty", "error")),
  state("submitting", entry(async (ctx) => {
    await submitForm(ctx.values);
  }, "success", "failure")),
  state("success", transition("reset", "pristine")),
  state("failure", transition("retry", "dirty")),
  state("error")
);
```

## Next Steps

- [Async Guide](./async.md) — Deep dive into Pulse
- [Guards Guide](./guards.md) — Conditional transitions
- [Immediate Transitions](./immediate-transitions.md) — Auto-transitioning states
- [Visualization](./visualization.md) — Generate diagrams
- [Concepts: Pulse](../concepts/pulse.md) — Understand the core concept
- [Recipes](../recipes/) — Common patterns

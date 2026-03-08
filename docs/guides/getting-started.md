# Getting Started

This guide walks through creating your first state machine with X-Robot.

## Installation

```bash
npm install x-robot
# or
bun add x-robot
```

## Your First Machine

```mermaid
---
title: Toggle
---

stateDiagram-v2

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state off
state on
class off def
class on def


[*] --> off
off --> on: toggle
on --> off: toggle
```

```javascript
import { machine, state, transition } from "x-robot";

const toggle = machine(
  "Toggle",
  state("off", transition("toggle", "on")),
  state("on", transition("toggle", "off"))
);
```

## Understanding the Parts

### machine(name, ...states)

Creates a new state machine.

```mermaid
---
title: MyMachine
---

stateDiagram-v2

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state idle
class idle def


[*] --> idle
```

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

```mermaid
---
title: Counter
---

stateDiagram-v2

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state idle
state counting
class idle def
class counting def

counting: └┬ En-incrementCount<br> └┬ success<br>  └ T-idle

[*] --> idle
idle --> counting: increment
counting --> idle: idle
```

```javascript
import { context, entry, initial, init } from "x-robot";

function incrementCount(ctx) {
  ctx.count += 1;
}

const counter = machine(
  "Counter",
  init(
    initial("idle"),
    context({ count: 0 })
  ),
  state("idle", transition("increment", "counting")),
  state("counting", entry(incrementCount, "idle"))
);

invoke(counter, "increment");
console.log(counter.context.count); // 1
```

## Working with Async

The Pulse concept handles async operations:

```mermaid
---
title: Fetcher
---

stateDiagram-v2

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state idle
state loading
state success
state error
class idle def
class loading def
class success def
class error def

loading: └┬ AEn-fetchData<br> ├┬ success<br> │└ T-success<br> └┬ failure<br>  └ T-error

[*] --> idle
idle --> loading: fetch
loading --> success: success
loading --> error: error
```

```javascript
import { entry } from "x-robot";

async function fetchData(ctx) {
  const res = await fetch("/api/data");
  ctx.data = await res.json();
}

const fetcher = machine(
  "Fetcher",
  init(initial("idle"), context({ data: null })),
  state("idle", transition("fetch", "loading")),
  state("loading", entry(fetchData, "success", "error")),
  state("success"),
  state("error")
);

await invoke(fetcher, "fetch");
console.log(fetcher.current); // "success" or "error"
```

## Complete Example

Here's a form submission machine with validation:

```mermaid
---
title: Form
---

stateDiagram-v2

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state pristine
state dirty
state validating
state submitting
state success
state failure
state error
class pristine def
class dirty def
class validating def
class submitting def
class success def
class failure def
class error def

validating: └┬ En-validateFormValues<br> ├┬ success<br> │└ T-dirty<br> └┬ failure<br>  └ T-error
submitting: └┬ AEn-submitFormData<br> ├┬ success<br> │└ T-success<br> └┬ failure<br>  └ T-failure

[*] --> pristine
pristine --> dirty: change
dirty --> validating: validate
dirty --> submitting: submit<br>└ G-canSubmit
validating --> dirty: dirty
validating --> error: error
submitting --> success: success
submitting --> failure: failure
success --> pristine: reset
failure --> dirty: retry
```

```javascript
import { machine, state, transition, invoke, initial, init, context, entry, guard } from "x-robot";

function validateFormValues(ctx) {
  ctx.errors = validateForm(ctx.values);
}

async function submitFormData(ctx) {
  await submitForm(ctx.values);
}

function canSubmit(ctx) {
  return Object.keys(ctx.errors).length === 0;
}

const formMachine = machine(
  "Form",
  init(
    initial("pristine"),
    context({ values: {}, errors: {} })
  ),
  state("pristine", transition("change", "dirty")),
  state("dirty", 
    transition("validate", "validating"),
    transition("submit", "submitting", guard(canSubmit))
  ),
  state("validating", entry(validateFormValues, "dirty", "error")),
  state("submitting", entry(submitFormData, "success", "failure")),
  state("success", transition("reset", "pristine")),
  state("failure", transition("retry", "dirty")),
  state("error")
);
```

## Next Steps

*   [Async Guide](./async.md) — Deep dive into Pulse
*   [Guards Guide](./guards.md) — Conditional transitions
*   [Immediate Transitions](./immediate-transitions.md) — Auto-transitioning states
*   [Visualization](./visualization.md) — Generate diagrams
*   [Concepts: Pulse](../concepts/pulse.md) — Understand the core concept
*   [Recipes](../recipes/) — Common patterns

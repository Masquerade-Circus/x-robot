# Immediate Transitions

Immediate transitions allow a state to automatically transition to another state without waiting for an event. They're useful for validation, computed states, and redirecting based on conditions.

## Basic Usage

```mermaid
---
title: MyMachine
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "idle" as idle
state "processing" as processing
state "complete" as complete
class idle def
class processing def
class complete def


[*] --> idle
idle --> processing: start
processing --> complete: complete
```

```javascript
import { immediate, init, initial, machine, state, transition } from "x-robot";

const myMachine = machine(
  "MyMachine",
  init(initial("idle")),
  state("idle", transition("start", "processing")),
  state("processing", immediate("complete")),
  state("complete")
);
```

## With Guards

Immediate transitions can use guards to conditionally redirect:

```mermaid
---
title: Auth
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "checking" as checking
state "authenticated" as authenticated
state "unauthenticated" as unauthenticated
class checking def
class authenticated def
class unauthenticated def


[*] --> checking
checking --> authenticated: authenticated<br>└ G-isAuthenticated
checking --> unauthenticated: unauthenticated
```

```javascript
function isAuthenticated(ctx) {
  return ctx.user !== null;
}

const authMachine = machine(
  "Auth",
  init(initial("checking")),
  state(
    "checking",
    immediate("authenticated", guard(isAuthenticated)),
    immediate("unauthenticated")
  ),
  state("authenticated"),
  state("unauthenticated")
);
```

## Use Cases

### Validation Redirect

Redirect based on validation results:

```mermaid
---
title: Form
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "idle" as idle
state "validating" as validating
state "valid" as valid
state "invalid" as invalid
state "submitting" as submitting
class idle def
class validating def
class valid def
class invalid def
class submitting def


[*] --> idle
idle --> validating: submit
validating --> valid: valid<br>└ G-isValid
validating --> invalid: invalid
valid --> submitting: submit
```

```javascript
function isValid(ctx) {
  return Object.keys(ctx.errors).length === 0;
}

const formMachine = machine(
  "Form",
  init(initial("idle")),
  state("idle", transition("submit", "validating")),
  state("validating", 
    immediate("valid", guard(isValid)),
    immediate("invalid")
  ),
  state("valid", transition("submit", "submitting")),
  state("invalid"),
  state("submitting")
);
```

### Initial State Logic

Process and redirect on initialization:

```mermaid
---
title: Init
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "boot" as boot
state "loading" as loading
state "hasCache" as hasCache
state "ready" as ready
class boot def
class loading def
class hasCache def
class ready def


[*] --> boot
boot --> hasCache: hasCache<br>└ G-hasCache
boot --> loading: loading
loading --> ready: ready
hasCache --> ready: ready
```

```javascript
function hasCache(ctx) {
  return !!ctx.cachedData;
}

const initMachine = machine(
  "Init",
  init(initial("boot")),
  state(
    "boot",
    immediate("hasCache", guard(hasCache)),
    immediate("loading")
  ),
  state("loading", immediate("ready")),
  state("hasCache", immediate("ready")),
  state("ready")
);
```

### Computed States

Create states that automatically compute and redirect:

```mermaid
---
title: Filter
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "all" as all
state "filtering" as filtering
state "empty" as empty
state "results" as results
class all def
class filtering def
class empty def
class results def


[*] --> all
all --> filtering: filter
filtering --> empty: empty<br>└ G-noResults
filtering --> results: results
```

```javascript
function noResults(ctx) {
  return ctx.items.length === 0;
}

const filterMachine = machine(
  "Filter",
  init(initial("all")),
  state("all", transition("filter", "filtering")),
  state("filtering", immediate("empty", guard(noResults)), immediate("results")),
  state("empty"),
  state("results")
);
```

## With Entry Pulses

Immediate transitions work with entry pulses:

```mermaid
---
title: Process
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "idle" as idle
state "processing" as processing
state "success" as success
state "failure" as failure
class idle def
class processing def
class success def
class failure def

processing: └ En-computeResult

[*] --> idle
idle --> processing: start
processing --> success: success<br>└ G-isSuccess
processing --> failure: failure
```

```javascript
function computeResult(ctx) {
  ctx.result = compute(ctx.input);
}

function isSuccess(ctx) {
  return ctx.result !== null;
}

const processMachine = machine(
  "Process",
  init(initial("idle")),
  state("idle", transition("start", "processing")),
  state("processing", 
    entry(computeResult),
    immediate("success", guard(isSuccess)),
    immediate("failure")
  ),
  state("success"),
  state("failure")
);
```

The entry pulse runs first, then the immediate transition evaluates guards.

## Next Steps

*   [Guards Guide](./guards.md) — Conditional transitions
*   [Concepts: Guards](../concepts/guards.md) — Deep dive

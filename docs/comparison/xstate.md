# XState vs X-Robot

A comparison of two state machine libraries.

## Quick Comparison

| Feature | X-Robot Core | X-Robot + Modules | XState Interpreter | XState Web | XState Full |
|---------|--------------|-------------------|-------------------|------------|-------------|
| Bundle Size | 15.06KB | 57.84KB | 30KB | 47KB | 59KB |
| Nested States | ✅ | ✅ | ❌ | ✅ | ✅ |
| Parallel States | ✅ | ✅ | ❌ | ✅ | ✅ |
| Guards | ✅ | ✅ | ✅ | ✅ | ✅ |
| Async Guards | ✅ | ✅ | ❌ | ❌ | ❌ |
| Frozen State | Default | Default | ❌ | ❌ | Optional |
| Code Generation | ✅ | ✅ | ❌ | ❌ | ❌ |
| SCXML | ✅ | ✅ | ❌ | ❌ | ✅ |
| Machine Validation | ❌ | ✅ | ❌ | ❌ | ❌ |
| Actor Model | ❌ | ❌ | ❌ | ❌ | ✅ |

## Async Guards

X-Robot supports native async guards:

```javascript
// X-Robot
import { transition, guard } from "x-robot";

state("idle", transition("check", "granted", guard(async (ctx) => {
  const res = await fetch("/api/permission");
  return (await res.json()).allowed;
})));
```

XState requires workarounds:

```javascript
// XState: needs invoke
{
  idle: { on: { check: "checking" }},
  checking: {
    invoke: {
      src: async () => await checkPermission(),
      onDone: { target: "granted" },
      onError: { target: "denied" }
    }
  }
}
```

## API Comparison

### XState

```javascript
// XState
const toggleMachine = createMachine(
  "Toggle",
  {
    initial: "off",
    states: {
      off: { on: { toggle: "on" }},
      on: { on: { toggle: "off" }}
    }
  }
);
```

### X-Robot

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
// X-Robot: simpler
const toggle = machine(
  "Toggle",
  state("off", transition("toggle", "on")),
  state("on", transition("toggle", "off"))
);
```

### Pulse vs Actions

XState requires separate action types:

```javascript
// XState: action + reducer
{
  loading: {
    invoke: {
      src: "fetchData",
      onDone: { target: "success", actions: "assignData" },
      onError: { target: "error", actions: "assignError" }
    }
  }
}
```

X-Robot: single function handles both:

```javascript
// X-Robot: single function
import { machine, state, transition, entry } from "x-robot";

state("loading", entry(async (ctx) => {
  ctx.data = await fetchData();
}, "success", "error"))
```

## When to Choose X-Robot

*   Bundle size is critical (15.06KB vs 30KB+)
*   Native async guards needed
*   Simpler API preferred
*   Code generation required
*   Machine validation needed

## When to Choose XState

*   Actor model required
*   Larger ecosystem needed
*   Enterprise support required
*   Visual editor required
*   More community resources

## Performance

See [Performance](../performance.md) for benchmarks.

## Migration

X-Robot can import SCXML from XState:

```javascript
import { documentate } from "x-robot/documentate";

// Convert XState machine to SCXML
const xstateScxml = convertToScxml(xstateMachine);

// Get serialized representation
const { serialized } = await documentate(xstateScxml, { format: "serialized" });
```

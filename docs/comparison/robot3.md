# Robot3 vs X-Robot

A comparison with the minimalist state machine library.

## Quick Comparison

| Feature | X-Robot Core | X-Robot + Modules | Robot3 | Robot3 + robot3-viz |
|---------|--------------|-------------------|--------|----------------------|
| Bundle Size / Tooling Size | 15.06KB | 78.44KB | ~1KB | ~1KB + 12.77MB npm tree |
| Installable / external | npm package | npm packages | npm package | npm packages + external visualizer |
| TypeScript | Included | Included | Basic | Basic |
| Nested States | ✅ | ✅ | ❌ | ❌ |
| Parallel States | ✅ | ✅ | ❌ | ❌ |
| Guards | ✅ | ✅ | Limited | Limited |
| Async Support | ✅ | ✅ | Via callbacks | Via callbacks |
| Code Generation | ✅ | ✅ | ❌ | ❌ |
| Mermaid visual docs | ❌ | ✅ | ❌ | ❌ |
| PlantUML visual docs | ❌ | ✅ | ❌ | ❌ |
| SVG image exports | ❌ | ✅ | ❌ | ✅ |
| PNG image exports | ❌ | ✅ | ❌ | ❌ |
| Serialization | ✅ | ✅ | ❌ | ❌ |

## Philosophy

**Robot3** — Extreme minimalism. Core FSM only.

**X-Robot** — Balance of simplicity and capability, including generated visual documentation through `documentate()` when teams need diagrams that stay close to the machine definition.

`documentate()` can keep visual documentation tied to the machine source by concept:

*   Mermaid: Markdown-friendly source diagrams and previews for state, sequence, and focused structural views.
*   PlantUML: richer source diagrams and the preferred visual style for state, sequence, and focused structural views.
*   SVG formats: explicit `svg-*` exports, such as `svg-sequence` and `svg-events`, for sharing, embedding, and vector assets.
*   PNG formats: explicit `png-*` exports, such as `png-guards` and `png-composition`, for raster images in docs, tickets, and slides.

Focused structural views include guards, events, pulses, outcomes, immediate transitions, composition, and complexity. These outputs help with PR review, onboarding, conceptual debugging, and project documentation.

## API Comparison

### Robot3

```javascript
import { createMachine } from "robot3";

const machine = createMachine({
  idle: "loading",
  loading: function(ctx) {
    return fetch("/api").then(() => "success");
  },
  success: "idle"
});
```

### X-Robot

```mermaid
---
title: Fetch
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
state "loading" as loading
state "success" as success
state "error" as error
class idle def
class loading def
class success def
class error def

loading: └┬ AEn-anonymous<br> ├┬ success<br> │└ T-success<br> └┬ failure<br>  └ T-error

[*] --> idle
idle --> loading: fetch
loading --> success: success
loading --> error: error
success --> idle: reset
```
```javascript
import { machine, state, transition, entry } from "x-robot";

const fetchMachine = machine(
  "Fetch",
  state("idle", transition("fetch", "loading")),
  state("loading", entry(async (ctx) => {
    await fetch("/api");
  }, "success", "error")),
  state("success", transition("reset", "idle")),
  state("error")
);
```

## When to Choose Robot3

*   Extreme bundle size constraints
*   Simple FSM only
*   No TypeScript needed
*   Maximum simplicity

## When to Choose X-Robot

*   Nested or parallel states needed
*   TypeScript support with generated code and machine helpers is useful
*   Guards needed
*   Code generation required
*   Generated visual documentation required:
    *   Mermaid source diagrams for Markdown-friendly previews
    *   PlantUML source diagrams for richer visual styling
    *   Sequence diagrams and focused structural views
    *   Explicit `svg-*` exports for sharing, embedding, and vector assets
    *   Explicit `png-*` exports for raster docs, tickets, and slides
*   Serialization needed
*   More features but still small

## Feature Matrix

| Feature | Robot3 | X-Robot |
|---------|--------|---------|
| Simple transitions | ✅ | ✅ |
| Context | ✅ | ✅ |
| Nested states | ❌ | ✅ |
| Parallel states | ❌ | ✅ |
| Async guards | ❌ | ✅ |
| Exit actions | Limited | ✅ |
| History tracking | ❌ | ✅ |
| SCXML | ❌ | ✅ |
| Code generation | ❌ | ✅ |
| Validation | ❌ | ✅ |

## Migration from Robot3

Robot3 machines can be converted to X-Robot:

```javascript
// Robot3
import { createMachine } from "robot3";

const robotMachine = createMachine({
  idle: "loading",
  loading: "success",
  success: "idle"
});
```

```mermaid
---
title: Machine
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
state "loading" as loading
state "success" as success
class idle def
class loading def
class success def


[*] --> idle
idle --> loading: start
loading --> success: done
success --> idle: reset
```
```javascript
import { machine, state, transition } from "x-robot";

const xRobotMachine = machine(
  "Machine",
  state("idle", transition("start", "loading")),
  state("loading", transition("done", "success")),
  state("success", transition("reset", "idle"))
);
```

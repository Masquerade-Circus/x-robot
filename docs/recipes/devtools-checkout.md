# Devtools Checkout

Compact checkout flow with Redux DevTools wired only in development.

## Machine

```mermaid
---
title: Checkout
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "review" as review
state "submitting" as submitting
state "success" as success
state "error" as error
class review def
class submitting def
class success def
class error def

submitting: └┬ AEn-submitOrder<br> ├┬ success<br> │└ T-success<br> └┬ failure<br>  └ T-error

[*] --> review
review --> submitting: submit
submitting --> success: success
submitting --> error: error
```

```javascript
import {
  context,
  entry,
  init,
  initial,
  machine,
  state,
  transition
} from "x-robot";

async function submitOrder(ctx, payload) {
  ctx.orderId = payload.orderId;
}

const checkoutMachine = machine(
  "Checkout",
  init(initial("review"), context({ orderId: null })),
  state("review", transition("submit", "submitting")),
  state("submitting", entry(submitOrder, "success", "error")),
  state("success"),
  state("error")
);

let disposeDevtools = () => undefined;

if (import.meta.env.DEV) {
  const { connectXRobot } = await import("x-robot/devtools");
  const {
    machine: checkout,
    start,
    invoke,
    snapshot,
    cleanup
  } = connectXRobot(checkoutMachine, {
    name: "Checkout"
  });

  await start();
  await invoke("submit", { orderId: 42 });

  console.log(checkout.current);
  console.log(snapshot());

  disposeDevtools = cleanup;
}
```

## Lifecycle Integration

Use `cleanup()` or `disconnect()` when the owning view, page, or component goes away.

```javascript
function dispose() {
  disposeDevtools();
}
```

## Host Patterns

*   Vanilla JavaScript: create the devtools connection during setup and call the stored disposer when tearing down the page or widget.
*   Effect-style lifecycle: create the connection inside the effect and return `cleanup` from the effect callback.
*   Mount/unmount lifecycle: connect on mount, disconnect on unmount.

Use the wrapped `start()` and `invoke()` methods for tracked transitions. Direct `invoke(checkoutMachine, ...)` calls bypass the connection and do not appear in Redux DevTools.

# Nested Machines

Nesting machines within other machines creates hierarchical state organizations.

## Basic Nesting

```mermaid
---
title: Stoplight
---

stateDiagram-v2

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state green
state yellow
state red
class green def
class yellow def
class red def


[*] --> green
green --> yellow: next
yellow --> red: next
red --> green: green<br>└ G-canGoToGreen
```

```javascript
import { guard, immediate, init, initial, machine, nested, state, transition } from "x-robot";

const stopwalk = machine(
  "Stopwalk",
  init(initial("wait")),
  state("wait", transition("start", "walk")),
  state("walk", transition("stop", "wait"))
);

function canGoToGreen() {
  return stopwalk.current === "wait";
}

const stoplight = machine(
  "Stoplight",
  init(initial("green")),
  state("green", transition("next", "yellow")),
  state("yellow", transition("next", "red")),
  state("red", nested(stopwalk, "start"), immediate("green", guard(canGoToGreen)))
);
```

## Invoking Nested Transitions

Use dot notation:

```javascript
invoke(stoplight, "next");        // green -> yellow
invoke(stoplight, "next");        // yellow -> red
invoke(stoplight, "red.start");   // stopwalk: wait -> walk
invoke(stoplight, "red.stop");    // stopwalk: walk -> wait
```

## Accessing Nested State

```javascript
console.log(stoplight.current);   // "red"
console.log(stopwalk.current);    // "wait" or "walk"
```

## Initial State in Nested Machines

```mermaid
---
title: App
---

stateDiagram-v2

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state public
state private
state loggingOut
class public def
class private def
class loggingOut def


[*] --> public
public --> private: login
```

```javascript
const auth = machine(
  "Auth",
  init(initial("unauthenticated")),
  state("unauthenticated", transition("login", "authenticating")),
  state("authenticating", transition("success", "authenticated")),
  state("authenticated", transition("logout", "unauthenticated"))
);

const app = machine(
  "App",
  init(initial("public")),
  state("public", transition("login", "private")),
  state("private", nested(auth)),  // Starts in "unauthenticated"
  state("loggingOut")
);
```

## Guards with Nested Machines

```javascript
const isAuthenticated = () => auth.current === "authenticated";

state("private", 
  nested(auth),
  transition("logout", "loggingOut", guard(isAuthenticated))
);
```

## Exit Handling

Invoke child transitions from the parent using dot notation:

```javascript
state("private", nested(auth));

invoke(app, "private.logout");
```

## Use Cases

### Authentication

```mermaid
---
title: App
---

stateDiagram-v2

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state guest
state loggingIn
state authenticated
state loggingOut
class guest def
class loggingIn def
class authenticated def
class loggingOut def

loggingIn: └┬ AEn-anonymous<br> ├┬ success<br> │└ T-authenticated<br> └┬ failure<br>  └ T-guest
loggingOut: └┬ AEn-anonymous<br> └┬ success<br>  └ T-guest

[*] --> guest
guest --> loggingIn: login
loggingIn --> authenticated: authenticated
loggingIn --> guest: guest
loggingOut --> guest: guest
```

```javascript
const auth = machine(
  "Auth",
  init(initial("authenticated")),
  state("authenticated", transition("logout", "loggedOut")),
  state("loggedOut")
);

const app = machine(
  "App",
  init(initial("guest")),
  state("guest", transition("login", "loggingIn")),
  state("loggingIn", entry(async (ctx, credentials) => {
    ctx.user = await authenticate(credentials);
  }, "authenticated", "guest")),
  state("authenticated", nested(auth, "logout")),
  state("loggingOut", entry(async (ctx) => {
    await logout();
    ctx.user = null;
  }, "guest"))
);
```

### Form Wizards

```mermaid
---
title: Wizard
---

stateDiagram-v2

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state step1
state step2
state complete
class step1 def
class step2 def
class complete def


[*] --> step1
step1 --> step1: back
step2 --> step1: back
```

```javascript
const step1 = machine("Step1", init(initial("pending")),
  state("pending", transition("next", "completed")),
  state("completed")
);

const step2 = machine("Step2", init(initial("pending")),
  state("pending", transition("next", "completed")),
  state("completed")
);

const wizard = machine(
  "Wizard",
  init(initial("step1")),
  state("step1", nested(step1, "next"), transition("back", "step1")),
  state("step2", nested(step2, "next"), transition("back", "step1")),
  state("complete")
);
```

## Best Practices

1.  **Limit nesting depth** — 2-3 levels maximum
2.  **Use clear names** — `auth.logout` clearer than `auth.logout`
3.  **Pass data explicitly** — Parent and child machines keep separate contexts
4.  **Consider parallel** — If regions are independent, use parallel states

## Next Steps

*   [Parallel States](./parallel-states.md) — Independent regions
*   [Concepts: Nested](../concepts/nested.md) — Deep dive
*   [Recipes: Wizard](../recipes/wizard.md) — Multi-step forms

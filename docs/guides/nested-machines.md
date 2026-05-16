# Nested Machines

Nesting machines within other machines creates hierarchical state organizations.

## Basic Nesting

```mermaid
---
title: Stoplight
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "green" as green
state "yellow" as yellow
state "red" as red
class green def
class yellow def
class red def

state red {
  state "wait" as RedStopwalkWait
  state "walk" as RedStopwalkWalk


  [*] --> RedStopwalkWait
  RedStopwalkWait --> RedStopwalkWalk: start
  RedStopwalkWalk --> RedStopwalkWait: stop
}

note right of red
  └ T-stopwalk.start
end note

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

<!-- x-robot:fragment -->

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
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "public" as public
state "private" as private
state "loggingOut" as loggingOut
class public def
class private def
class loggingOut def

state private {
  state "unauthenticated" as PrivateAuthUnauthenticated
  state "authenticating" as PrivateAuthAuthenticating
  state "authenticated" as PrivateAuthAuthenticated


  [*] --> PrivateAuthUnauthenticated
  PrivateAuthUnauthenticated --> PrivateAuthAuthenticating: login
  PrivateAuthAuthenticating --> PrivateAuthAuthenticated: success
  PrivateAuthAuthenticated --> PrivateAuthUnauthenticated: logout
}


[*] --> public
public --> private: login
```

<!-- x-robot:fragment -->

```mermaid
---
title: App
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "public" as public
state "private" as private
state "loggingOut" as loggingOut
class public def
class private def
class loggingOut def

state private {
  state "unauthenticated" as PrivateAuthUnauthenticated
  state "authenticating" as PrivateAuthAuthenticating
  state "authenticated" as PrivateAuthAuthenticated


  [*] --> PrivateAuthUnauthenticated
  PrivateAuthUnauthenticated --> PrivateAuthAuthenticating: login
  PrivateAuthAuthenticating --> PrivateAuthAuthenticated: success
  PrivateAuthAuthenticated --> PrivateAuthUnauthenticated: logout
}


[*] --> public
public --> private: login
```

<!-- x-robot:fragment -->

```mermaid
---
title: App
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "public" as public
state "private" as private
state "loggingOut" as loggingOut
class public def
class private def
class loggingOut def

state private {
  state "unauthenticated" as PrivateAuthUnauthenticated
  state "authenticating" as PrivateAuthAuthenticating
  state "authenticated" as PrivateAuthAuthenticated


  [*] --> PrivateAuthUnauthenticated
  PrivateAuthUnauthenticated --> PrivateAuthAuthenticating: login
  PrivateAuthAuthenticating --> PrivateAuthAuthenticated: success
  PrivateAuthAuthenticated --> PrivateAuthUnauthenticated: logout
}


[*] --> public
public --> private: login
```
```javascript
import { init, initial, machine, nested, state, transition } from "x-robot";

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

<!-- x-robot:fragment -->

```javascript
const isAuthenticated = () => auth.current === "authenticated";

state("private", 
  nested(auth),
  transition("logout", "loggingOut", guard(isAuthenticated))
);
```

## Exit Handling

Invoke child transitions from the parent using dot notation:

<!-- x-robot:fragment -->

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
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "guest" as guest
state "loggingIn" as loggingIn
state "authenticated" as authenticated
state "loggingOut" as loggingOut
class guest def
class loggingIn def
class authenticated def
class loggingOut def

state authenticated {
  state "authenticated" as AuthenticatedAuthAuthenticated
  state "loggedOut" as AuthenticatedAuthLoggedOut


  [*] --> AuthenticatedAuthAuthenticated
  AuthenticatedAuthAuthenticated --> AuthenticatedAuthLoggedOut: logout
}

loggingIn: └┬ AEn-anonymous<br> ├┬ success<br> │└ T-authenticated<br> └┬ failure<br>  └ T-guest
note right of authenticated
  └ T-auth.logout
end note
loggingOut: └┬ AEn-anonymous<br> └┬ success<br>  └ T-guest

[*] --> guest
guest --> loggingIn: login
loggingIn --> authenticated: authenticated
loggingIn --> guest: guest
loggingOut --> guest: guest
```

<!-- x-robot:fragment -->

```mermaid
---
title: App
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "guest" as guest
state "loggingIn" as loggingIn
state "authenticated" as authenticated
state "loggingOut" as loggingOut
class guest def
class loggingIn def
class authenticated def
class loggingOut def

state authenticated {
  state "authenticated" as AuthenticatedAuthAuthenticated
  state "loggedOut" as AuthenticatedAuthLoggedOut


  [*] --> AuthenticatedAuthAuthenticated
  AuthenticatedAuthAuthenticated --> AuthenticatedAuthLoggedOut: logout
}

loggingIn: └┬ AEn-anonymous<br> ├┬ success<br> │└ T-authenticated<br> └┬ failure<br>  └ T-guest
note right of authenticated
  └ T-auth.logout
end note
loggingOut: └┬ AEn-anonymous<br> └┬ success<br>  └ T-guest

[*] --> guest
guest --> loggingIn: login
loggingIn --> authenticated: authenticated
loggingIn --> guest: guest
loggingOut --> guest: guest
```

<!-- x-robot:fragment -->

```mermaid
---
title: App
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "guest" as guest
state "loggingIn" as loggingIn
state "authenticated" as authenticated
state "loggingOut" as loggingOut
class guest def
class loggingIn def
class authenticated def
class loggingOut def

state authenticated {
  state "authenticated" as AuthenticatedAuthAuthenticated
  state "loggedOut" as AuthenticatedAuthLoggedOut


  [*] --> AuthenticatedAuthAuthenticated
  AuthenticatedAuthAuthenticated --> AuthenticatedAuthLoggedOut: logout
}

loggingIn: └┬ AEn-anonymous<br> ├┬ success<br> │└ T-authenticated<br> └┬ failure<br>  └ T-guest
note right of authenticated
  └ T-auth.logout
end note
loggingOut: └┬ AEn-anonymous<br> └┬ success<br>  └ T-guest

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
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "step1" as step1
state "step2" as step2
state "complete" as complete
class step1 def
class step2 def
class complete def

state step1 {
  state "pending" as Step1Step1Pending
  state "completed" as Step1Step1Completed


  [*] --> Step1Step1Pending
  Step1Step1Pending --> Step1Step1Completed: next
}
state step2 {
  state "pending" as Step2Step2Pending
  state "completed" as Step2Step2Completed


  [*] --> Step2Step2Pending
  Step2Step2Pending --> Step2Step2Completed: next
}

note right of step1
  └ T-step1.next
end note
note right of step2
  └ T-step2.next
end note

[*] --> step1
step1 --> step1: back
step2 --> step1: back
```

<!-- x-robot:fragment -->

```mermaid
---
title: Wizard
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "step1" as step1
state "step2" as step2
state "complete" as complete
class step1 def
class step2 def
class complete def

state step1 {
  state "pending" as Step1Step1Pending
  state "completed" as Step1Step1Completed


  [*] --> Step1Step1Pending
  Step1Step1Pending --> Step1Step1Completed: next
}
state step2 {
  state "pending" as Step2Step2Pending
  state "completed" as Step2Step2Completed


  [*] --> Step2Step2Pending
  Step2Step2Pending --> Step2Step2Completed: next
}

note right of step1
  └ T-step1.next
end note
note right of step2
  └ T-step2.next
end note

[*] --> step1
step1 --> step1: back
step2 --> step1: back
```

<!-- x-robot:fragment -->

```mermaid
---
title: Wizard
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "step1" as step1
state "step2" as step2
state "complete" as complete
class step1 def
class step2 def
class complete def

state step1 {
  state "pending" as Step1Step1Pending
  state "completed" as Step1Step1Completed


  [*] --> Step1Step1Pending
  Step1Step1Pending --> Step1Step1Completed: next
}
state step2 {
  state "pending" as Step2Step2Pending
  state "completed" as Step2Step2Completed


  [*] --> Step2Step2Pending
  Step2Step2Pending --> Step2Step2Completed: next
}

note right of step1
  └ T-step1.next
end note
note right of step2
  └ T-step2.next
end note

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

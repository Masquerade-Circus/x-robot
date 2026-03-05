# Nested State Machines

Nested machines allow hierarchical state organization. A machine can contain other machines as states.

## Basic Nesting

```javascript
import { machine, state, transition, initial, init, nested, guard, invoke, entry } from "x-robot";

// Child machine
const stopwatch = machine(
  "Stopwatch",
  init(initial("stopped")),
  state("stopped", transition("start", "running")),
  state("running", transition("stop", "stopped"))
);

// Parent machine
const timer = machine(
  "Timer",
  init(initial("idle")),
  state("idle", transition("begin", "timing")),
  state("timing", nested(stopwatch, "pause"), transition("cancel", "idle")),
  state("paused")
);
```

The nested machine runs within the parent state. Transitions in the child can trigger parent transitions using dot notation.

## Invoking Nested Transitions

```javascript
// Start stopwatch from parent
invoke(timer, "begin");      // timer.current = "timing", stopwatch.current = "stopped"
invoke(timer, "timing.start"); // stopwatch.current = "running"

// Access nested state
console.log(timer.current);        // "timing"
console.log(stopwatch.current);   // "running"
```

## Nested with Initial State

```javascript
const auth = machine(
  "Auth",
  init(initial("unauthenticated")),
  state("unauthenticated", transition("login", "authenticating")),
  state("authenticating", entry(async (ctx) => {
    ctx.user = await authenticate(ctx.credentials);
  }, "authenticated", "failed")),
  state("authenticated", transition("logout", "unauthenticated")),
  state("failed", transition("retry", "authenticating"))
);

const app = machine(
  "App",
  init(initial("public")),
  state("public", transition("login", "private")),
  state("private", nested(auth, "logout")),
  state("loggingOut")
);
```

## Guards with Nested Machines

Use guards to control when nested machines can transition:

```javascript
const canLogout = () => auth.current === "authenticated";

state("private", 
  nested(auth),
  transition("logout", "loggingOut", guard(canLogout))
);
```

## Exit from Nested Machine

The parent can listen to child transitions:

```javascript
state("private", 
  nested(auth),
  transition("private.logout", "loggingOut")  // listens to auth.logout
);
```

## Use Cases

### Authentication Flow

```
App
├── public
│   └── Auth (nested)
│       ├── unauthenticated
│       ├── authenticating
│       ├── authenticated
│       └── failed
└── private
```

### Form Wizard

```
Wizard
├── step1
│   └── Validation (nested)
├── step2
│   └── Validation (nested)
└── step3
    └── Validation (nested)
```

### Game States

```
Game
├── menu
├── playing
│   └── Player (nested)
│       ├── idle
│       ├── walking
│       ├── running
│       └── jumping
├── paused
└── gameOver
```

## Limitations

- Child machines cannot directly transition to parent states
- Context sharing requires explicit parent-child relationship
- Deep nesting (3+ levels) can become complex to visualize

## Next Steps

- [Parallel States](./parallel.md) — Multiple independent states
- [Guides: Nested Machines](../guides/nested-machines.md) — Practical examples
- [Recipes: Wizard](../recipes/wizard.md) — Multi-step forms

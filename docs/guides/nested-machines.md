# Nested Machines

Nesting machines within other machines creates hierarchical state organizations.

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
  state("idle", transition("start", "timing")),
  state("timing", nested(stopwatch)),
  state("stopped")
);
```

## Invoking Nested Transitions

Use dot notation:

```javascript
invoke(timer, "start");           // timer: idle -> timing
                                  // stopwatch: stopped (initial)

invoke(timer, "timing.start");    // stopwatch: stopped -> running

invoke(timer, "timing.stop");    // stopwatch: running -> stopped
```

## Accessing Nested State

```javascript
console.log(timer.current);       // "timing"
console.log(stopwatch.current);   // "running"
```

## Initial State in Nested Machines

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

Listen for child machine transitions:

```javascript
state("private", 
  nested(auth),
  transition("private.logout", "loggingOut")
);
```

## Use Cases

### Authentication

```javascript
const app = machine(
  "App",
  init(initial("guest")),
  state("guest", transition("login", "loggingIn")),
  state("loggingIn", entry(async (ctx) => {
    ctx.user = await authenticate(ctx.credentials);
  }, "authenticated", "guest")),
  state("authenticated", nested(auth, "logout")),
  state("loggingOut", entry(async (ctx) => {
    await logout();
    ctx.user = null;
  }, "guest"))
);
```

### Form Wizards

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

1. **Limit nesting depth** — 2-3 levels maximum
2. **Use clear names** — `auth.logout` clearer than `auth.logout`
3. **Share context when needed** — Pass parent context to children
4. **Consider parallel** — If regions are independent, use parallel states

## Next Steps

- [Parallel States](./parallel-states.md) — Independent regions
- [Concepts: Nested](../concepts/nested.md) — Deep dive
- [Recipes: Wizard](../recipes/wizard.md) — Multi-step forms

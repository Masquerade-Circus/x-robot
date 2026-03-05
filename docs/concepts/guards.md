# Guards

Guards determine whether a transition should occur. They receive context and optional payload, returning a boolean.

## Synchronous Guards

```javascript
import { machine, state, transition, initial, init, invoke, guard, entry } from "x-robot";

const canProceed = (ctx, payload) => payload.length > 0;

const formMachine = machine(
  "Form",
  init(initial("idle")),
  state("idle", transition("submit", "validating", guard(canProceed))),
  state("validating")
);

invoke(formMachine, "submit", "hi"); // transitions to "validating"
invoke(formMachine, "submit", "");    // stays in "idle"
```

## Async Guards

X-Robot supports native async guards — no workarounds required:

```javascript
const checkPermission = async (ctx) => {
  const res = await fetch("/api/permission");
  const data = await res.json();
  return data.allowed;
};

state("idle", transition("proceed", "active", guard(checkPermission)));
```

When the guard is async, the transition waits for resolution:

```javascript
await invoke(machine, "proceed");
// If checkPermission returns true: transitions to "active"
// If checkPermission returns false: stays in "idle"
```

## Guard with Failure Transition

You can specify a failure state for when the guard returns false:

```javascript
state("idle", transition("submit", "success", guard(validateInput, "error")));
// success: if guard returns true
// error: if guard returns false
```

## Multiple Guards

Combine guards with logical operations:

```javascript
const allPass = (ctx) => guards.every(g => g(ctx));

state("idle", transition("next", "step2", guard(allPass)));
```

## Guards vs Entry Pulses

Guards run before the transition. Entry pulses run after entering the new state:

```javascript
const notify = (ctx) => {
  console.log("Approved! Notifying:", ctx.user);
};

state("review", 
  transition("approve", "approved", guard(canApprove)),
  entry(notify),  // runs after entering "approved"
  transition("reject", "rejected")
);
```

## Common Patterns

### Form Validation

```javascript
const isValidEmail = (ctx, email) => /@/.test(email);
const isValidPassword = (ctx, pw) => pw.length >= 8;

state("idle", transition("submit", "valid", guard((ctx, payload) => 
  isValidEmail(ctx, payload.email) && isValidPassword(ctx, payload.password)
, "invalid"))),
```

### Role-Based Access

```javascript
const isAdmin = (ctx) => ctx.user?.role === "admin";

state("settings", transition("delete", "confirm", guard(isAdmin)));
```

### Conditional History

```javascript
const shouldSaveHistory = (ctx) => ctx.preferences.saveHistory;

state("editing", transition("save", "saved", guard(shouldSaveHistory)));
```

## Comparison with XState

XState requires workarounds for async guards:

```javascript
// XState: uses invoke workaround
{
  idle: {
    on: { check: "checking" }
  },
  checking: {
    invoke: {
      src: async () => await checkPermission(),
      onDone: { target: "active" },
      onError: { target: "idle" }
    }
  }
}
```

X-Robot:

```javascript
// X-Robot: native async guard
state("idle", transition("check", "active", guard(asyncCheckPermission)));
```

## Next Steps

- [Pulse](./pulse.md) — Combined with guards
- [Context](./context.md) — Accessing state in guards
- [Guides: Using Guards](../guides/guards.md) — Practical examples
- [Guides: Immediate Transitions](../guides/immediate-transitions.md) — Guards with auto-transition

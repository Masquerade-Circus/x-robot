# Immediate Transitions

Immediate transitions allow a state to automatically transition to another state without waiting for an event. They're useful for validation, computed states, and redirecting based on conditions.

## Basic Usage

```javascript
import { machine, state, transition, immediate, initial, init } from "x-robot";

const myMachine = machine(
  "MyMachine",
  init(initial("idle")),
  state("idle", transition("start", "processing")),
  state("processing", immediate("complete")),
  state("complete")
);
```

When the machine enters "processing", it immediately transitions to "complete" without any additional event.

## With Guards

Immediate transitions can use guards to conditionally redirect:

```javascript
const authMachine = machine(
  "Auth",
  init(initial("checking")),
  state("checking", immediate("authenticated", guard(isAuthenticated))),
  state("authenticated"),
  state("unauthenticated")
);

function isAuthenticated(ctx) {
  return ctx.user !== null;
}
```

## Use Cases

### Validation Redirect

Redirect based on validation results:

```javascript
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

function isValid(ctx) {
  return Object.keys(ctx.errors).length === 0;
}
```

### Initial State Logic

Process and redirect on initialization:

```javascript
const initMachine = machine(
  "Init",
  init(initial("boot")),
  state("boot", immediate("loading", guard(hasCache))),
  state("loading", immediate("ready")),
  state("hasCache"),
  state("ready")
);
```

### Computed States

Create states that automatically compute and redirect:

```javascript
const filterMachine = machine(
  "Filter",
  init(initial("all")),
  state("all", transition("filter", "filtering")),
  state("filtering", immediate("empty", guard(noResults)), immediate("results")),
  state("empty"),
  state("results")
);

function noResults(ctx) {
  return ctx.items.length === 0;
}
```

## With Entry Pulses

Immediate transitions work with entry pulses:

```javascript
const machine = machine(
  "Process",
  init(initial("idle")),
  state("idle", transition("start", "processing")),
  state("processing", 
    entry((ctx) => {
      ctx.result = compute(ctx.input);
    }),
    immediate("success", guard(isSuccess)),
    immediate("failure")
  ),
  state("success"),
  state("failure")
);
```

The entry pulse runs first, then the immediate transition evaluates guards.

## Multiple Immediate Transitions

A state can have multiple immediate transitions with guards:

```javascript
state("checking", 
  immediate("admin", guard(isAdmin)),
  immediate("user", guard(isUser)),
  immediate("guest")
)
```

The first guard that passes wins.

## vs Regular Transitions

| Feature | Regular Transition | Immediate Transition |
|---------|------------------|---------------------|
| Trigger | Event (invoke) | Automatic on entry |
| Guards | Yes | Yes |
| Entry pulse | After transition | Before immediate |
| Use case | User actions | Computed/validation |

## API Reference

```typescript
immediate(target: string, ...guards: GuardDirective[]): ImmediateDirective
```

- `target`: State to transition to
- `guards`: Optional guards to evaluate

## Next Steps

- [Guides: Guards](./guards.md) — Conditional transitions
- [Guides: Async](./async.md) — Combining with async operations
- [Concepts: Guards](../concepts/guards.md) — Deep dive into guards

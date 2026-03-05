# Context

Context holds the machine's state data — analogous to Redux state or Vue/React component data.

## Defining Context

```javascript
import { machine, initial, init, context, entry, exit, nested, transition } from "x-robot";

const myMachine = machine(
  "MyMachine",
  init(
    initial("idle"),
    context({
      user: null,
      items: [],
      count: 0
    })
  )
);
```

## Accessing Context

```javascript
console.log(myMachine.context.user);  // null
console.log(myMachine.context.count); // 0
```

## Modifying Context

### With Pulse

```javascript
state("idle", entry((ctx) => {
  ctx.count++;
  ctx.items.push({ id: 1, name: "Item" });
}))
```

### With Entry/Exit Actions

```javascript
state("active", 
  entry((ctx) => {
    ctx.enteredAt = Date.now();
    ctx.active = true;
  }),
  exit((ctx) => {
    ctx.active = false;
  })
)
```

## Frozen Mode

By default, X-Robot uses frozen mode. Each pulse receives a shallow clone of context:

```javascript
const myMachine = machine(
  "Test",
  init(initial("idle"), context({ value: 1 })),
  state("idle", entry((ctx) => {
    ctx.value = 2;
  }))
);

invoke(myMachine, "update");
console.log(myMachine.context.value); // 1 (unchanged)
```

This prevents accidental mutations and makes state changes explicit.

### Disabling Frozen Mode

```javascript
import { shouldFreeze } from "x-robot";

const myMachine = machine(
  "Test",
  init(initial("idle"), context({ value: 1 }), shouldFreeze(false)),
  state("idle", entry((ctx) => {
    ctx.value = 2;
  }))
);

invoke(myMachine, "update");
console.log(myMachine.context.value); // 2 (changed)
```

## Context with Nested Machines

When machines are nested, child machines can access parent context:

```javascript
const childMachine = machine(
  "Child",
  init(initial("idle")),
  state("idle", transition("update", "updated"))
);

const parentMachine = machine(
  "Parent",
  init(initial("start"), context({ shared: "data" })),
  state("start", nested(childMachine))
);
```

## Serialization

Save and restore context with `snapshot()` and `start()`:

```javascript
import { snapshot, start } from "x-robot";

// Get snapshot
const saved = snapshot(myMachine);

// Restore to a new machine
const newMachine = machine("MyMachine", /* definition */);
start(newMachine, saved);
```

## Best Practices

1. **Keep context minimal** — Store only what's needed for state transitions
2. **Use frozen mode** — Default behavior prevents bugs
3. **Immutable patterns** — When disabled, use spread operator for new objects
4. **Serialize for persistence** — Use documentate() for save/restore

## Comparison

| Approach | Mutates Original | Manual Clone | X-Robot Support |
|----------|------------------|--------------|-----------------|
| Frozen (default) | No | No | ✅ (default) |
| Mutable | Yes | No | ✅ shouldFreeze(false) |
| Immutable | No | Yes | Manual |

## Next Steps

- [Pulse](./pulse.md) — Context modification
- [Guards](./guards.md) — Context in conditions
- [Saving and Restoring](../guides/saving-and-restoring.md) — Persist runtime state

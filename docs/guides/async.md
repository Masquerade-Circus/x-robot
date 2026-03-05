# Async Operations

X-Robot's Pulse concept makes async state management simple. One function handles the async operation and state transition.

## Basic Async with Pulse

```javascript
import { machine, state, transition, invoke, entry, initial, init, context } from "x-robot";

const fetchMachine = machine(
  "Fetch",
  init(initial("idle"), context({ data: null, error: null })),
  state("idle", transition("fetch", "loading")),
  state("loading", entry(async (ctx) => {
    const res = await fetch("/api/data");
    ctx.data = await res.json();
  }, "success", "error")),
  state("success"),
  state("error")
);
```

The pulse function:
1. Receives the context
2. Performs async work
3. Modifies context directly
4. Transitions to "success" on resolve or "error" on reject

## Using invoke()

```javascript
invoke(fetchMachine, "fetch");

// Machine is now in "loading"
// When resolved: transitions to "success" or "error"
```

For async operations, use await:

```javascript
await invoke(fetchMachine, "fetch");
console.log(fetchMachine.current); // "success" or "error"
```

## Error Handling

### Automatic Error Transitions

```javascript
state("loading", entry(async (ctx) => {
  const res = await fetch("/api/data");
  if (!res.ok) {
    throw new Error("HTTP " + res.status);
  }
  ctx.data = await res.json();
}, "success", "error"))
```

### Manual Error Handling

```javascript
state("loading", entry(async (ctx) => {
  try {
    const res = await fetch("/api/data");
    ctx.data = await res.json();
  } catch (e) {
    ctx.error = e.message;
    throw e; // Trigger failure transition
  }
}, "success", "error"))
```

## Multiple Async Operations

```javascript
const workflow = machine(
  "Workflow",
  init(initial("idle")),
  state("idle", transition("start", "step1")),
  state("step1", entry(async (ctx) => {
    await step1(ctx);
  }, "step2", "error")),
  state("step2", entry(async (ctx) => {
    await step2(ctx);
  }, "step3", "error")),
  state("step3", entry(async (ctx) => {
    await step3(ctx);
  }, "complete", "error")),
  state("complete"),
  state("error")
);
```

## Retrying Failed Operations

```javascript
const withRetry = machine(
  "Retry",
  init(initial("idle")),
  state("idle", transition("start", "running")),
  state("running", entry(async (ctx) => {
    let attempts = 0;
    while (attempts < 3) {
      try {
        await riskyOperation();
        return;
      } catch (e) {
        attempts++;
        if (attempts >= 3) throw e;
        await delay(1000 * attempts);
      }
    }
  }, "success", "failed")),
  state("success"),
  state("failed", transition("retry", "running"))
);
```

## Async Guards

Combine async operations with guards:

```javascript
state("idle", transition("proceed", "active", guard(async (ctx) => {
  const permission = await checkPermission(ctx.userId);
  return permission.granted;
})))
```

## Comparison: X-Robot vs Redux

Redux requires multiple functions:

```javascript
// Redux: Action + Thunk + Reducer
const fetchRequest = () => ({ type: "FETCH_REQUEST" });
const fetchSuccess = (data) => ({ type: "FETCH_SUCCESS", payload: data });
const fetchFailure = (error) => ({ type: "FETCH_FAILURE", payload: error });

const fetchThunk = () => async (dispatch) => {
  dispatch(fetchRequest());
  try {
    const data = await api.fetch();
    dispatch(fetchSuccess(data));
  } catch (error) {
    dispatch(fetchFailure(error));
  }
};

function reducer(state, action) {
  // Handle each action type
}
```

X-Robot: Single function:

```javascript
// X-Robot: One pulse
state("loading", entry(async (ctx) => {
  ctx.data = await api.fetch();
}, "success", "error"))
```

## Best Practices

1. **Keep pulses focused** — One async operation per pulse
2. **Handle errors explicitly** — Use try/catch with throw
3. **Update context in pulse** — Don't rely on external state
4. **Use guards for validation** — Before transitioning to async states

## Next Steps

- [Guards Guide](./guards.md) — Conditional transitions
- [Concepts: Pulse](../concepts/pulse.md) — Core concept
- [Recipes: API Fetch](../recipes/api-fetch.md) — Real-world example

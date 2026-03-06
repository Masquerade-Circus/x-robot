# Async Operations

X-Robot's Pulse concept makes async state management simple. One function handles the async operation and state transition.

## Basic Async with Pulse

```javascript
import { machine, state, transition, invoke, entry, initial, init, context } from "x-robot";

async function fetchData(ctx) {
  const res = await fetch("/api/data");
  ctx.data = await res.json();
}

const fetchMachine = machine(
  "Fetch",
  init(initial("idle"), context({ data: null, error: null })),
  state("idle", transition("fetch", "loading")),
  state("loading", entry(fetchData, "success", "error")),
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
async function fetchWithErrorCheck(ctx) {
  const res = await fetch("/api/data");
  if (!res.ok) {
    throw new Error("HTTP " + res.status);
  }
  ctx.data = await res.json();
}

state("loading", entry(fetchWithErrorCheck, "success", "error"))
```

### Manual Error Handling

```javascript
async function fetchWithTryCatch(ctx) {
  try {
    const res = await fetch("/api/data");
    ctx.data = await res.json();
  } catch (e) {
    ctx.error = e.message;
    throw e; // Trigger failure transition
  }
}

state("loading", entry(fetchWithTryCatch, "success", "error"))
```

## Multiple Async Operations

```javascript
async function runStep1(ctx) {
  await step1(ctx);
}

async function runStep2(ctx) {
  await step2(ctx);
}

async function runStep3(ctx) {
  await step3(ctx);
}

const workflow = machine(
  "Workflow",
  init(initial("idle")),
  state("idle", transition("start", "step1")),
  state("step1", entry(runStep1, "step2", "error")),
  state("step2", entry(runStep2, "step3", "error")),
  state("step3", entry(runStep3, "complete", "error")),
  state("complete"),
  state("error")
);
```

## Retrying Failed Operations

```javascript
async function runWithRetry(ctx) {
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
}

const withRetry = machine(
  "Retry",
  init(initial("idle")),
  state("idle", transition("start", "running")),
  state("running", entry(runWithRetry, "success", "failed")),
  state("success"),
  state("failed", transition("retry", "running"))
);
```

## Async Guards

Combine async operations with guards:

```javascript
async function checkUserPermission(ctx) {
  const permission = await checkPermission(ctx.userId);
  return permission.granted;
}

state("idle", transition("proceed", "active", guard(checkUserPermission)))
```

## Comparison: X-Robot vs Redux

Redux requires multiple functions:

```javascript
// Redux: Action + Thunk + Reducer
function fetchRequest() {
  return { type: "FETCH_REQUEST" };
}

function fetchSuccess(data) {
  return { type: "FETCH_SUCCESS", payload: data };
}

function fetchFailure(error) {
  return { type: "FETCH_FAILURE", payload: error };
}

function fetchThunk() {
  return async function(dispatch) {
    dispatch(fetchRequest());
    try {
      const data = await api.fetch();
      dispatch(fetchSuccess(data));
    } catch (error) {
      dispatch(fetchFailure(error));
    }
  };
}

function reducer(state, action) {
  // Handle each action type
}
```

X-Robot: Single function:

```javascript
// X-Robot: One pulse
async function loadData(ctx) {
  ctx.data = await api.fetch();
}

state("loading", entry(loadData, "success", "error"))
```

## Best Practices

1. **Keep pulses focused** — One async operation per pulse
2. **Handle errors explicitly** — Use try/catch with throw
3. **Update context in pulse** — Don't rely on external state
4. **Use guards for validation** — Before transitioning to async states

## Next Steps

- [Guards Guide](./guards.md) — Conditional transitions
- [Concepts: Pulse](../concepts/pulse.md) — Core concept

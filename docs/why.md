# Why Finite State Machines?

```javascript
import { machine, state, transition, entry, guard } from "x-robot";
```

## The Problem with Booleans

Most developers manage UI state with booleans. It starts simply:

```javascript
let isLoading = false;
let isSuccess = false;
let isError = false;
let isSubmitting = false;
let isValidated = false;
let hasError = false;
```

Then the complexity grows. You need to track more states:

```javascript
const formState = {
  isEmpty: true,
  isFocused: false,
  isValid: false,
  isValidating: false,
  isSubmitting: false,
  isSubmitted: false,
  isSuccess: false,
  isError: false,
  errorMessage: null
};
```

This approach has fundamental problems:

1. **Invalid states are possible** — You can have `isLoading = true` and `isSuccess = true` simultaneously
2. **Transitions are unclear** — How do you go from "submitting" to "error"?
3. **Testing is difficult** — Every boolean combination is a potential state
4. **Logic spreads** — Validation, submission, and error handling get mixed across components

## The Solution: State Machines

A finite state machine (FSM) defines all valid states and the transitions between them:

```javascript
const formMachine = machine(
  "Form",
  state("idle", transition("submit", "submitting")),
  state("submitting", entry(async (ctx) => {
    ctx.data = await submitForm(ctx.values);
  }, "success", "error")),
  state("success", transition("reset", "idle")),
  state("error", transition("retry", "submitting"), transition("reset", "idle"))
);
```

Benefits:

- **Only valid states exist** — The machine enforces valid transitions
- **Transitions are explicit** — Every path is defined
- **Self-documenting** — The machine definition shows all possible states
- **Testable** — Each state and transition can be tested independently

## Why X-Robot?

State machines exist in other libraries. Why choose X-Robot?

### 1. Pulse Makes Async Simple

Traditional approaches require multiple functions:

```javascript
// Redux: action + reducer
async function submitForm(values) {
  return { type: "SUBMIT", payload: values };
}
function formReducer(state, action) {
  if (action.type === "SUBMIT_SUCCESS") {
    return { ...state, data: action.payload };
  }
}
```

X-Robot combines action and state update in one function:

```javascript
// X-Robot: single pulse
state("submitting", entry(async (ctx) => {
  ctx.data = await submitForm(ctx.values);
}, "success", "error"));
```

### 2. Frozen State by Default

X-Robot clones context before each pulse, preventing accidental mutations:

```javascript
// In frozen mode (default), this is safe:
state("updating", entry((ctx) => {
  ctx.counter++; // modifies cloned context
  throw new Error("Oops");
}));
// Original state is unchanged
```

### 3. Native Async Guards

No workarounds for async validation:

```javascript
transition("submit", "validating", guard(async (ctx) => {
  const isValid = await validateEmail(ctx.email);
  return isValid;
})),
```

### 4. Small Bundle, High Performance

- Core: 15.57KB minified
- With modules: 110KB (documentate, validate)
- Performance: 4-23x faster than XState

### 5. Built-in Tools

- `documentate()` — Code generation, diagrams, SCXML
- `validate()` — Machine structure validation
- History tracking — Built-in state history

## When to Use State Machines

State machines are ideal for:

- **Form workflows** — Validation, submission, success/error states
- **API calls** — Loading, success, error handling
- **UI interactions** — Modals, wizards, animations
- **Game state** — Player states, level transitions
- **Business logic** — Order processing, approval flows
- **Communication protocols** — Connection states, message handling

## When Not to Use

State machines add structure. They're overkill for:

- Simple toggle states (on/off)
- Unrelated pieces of UI state
- Very small applications with minimal state

## Next Steps

- [Getting Started](./guides/getting-started.md) — Create your first machine
- [Concepts](./concepts/pulse.md) — Understand the Pulse concept
- [API Reference](./api/) — Explore all functions

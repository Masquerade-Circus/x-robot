# Form Validation

Managing form state with validation.

## Problem

Track form states: pristine, dirty, validating, valid, invalid, submitting, success, error.

## Solution

```javascript
import { machine, state, transition, initial, init, context, invoke, entry, guard } from "x-robot";

const validate = (values) => {
  const errors = {};
  if (!values.email || !/@/.test(values.email)) {
    errors.email = "Invalid email";
  }
  if (!values.password || values.password.length < 8) {
    errors.password = "Password must be 8+ characters";
  }
  return errors;
};

const formMachine = machine(
  "Form",
  init(
    initial("pristine"),
    context({ values: {}, errors: {}, submitted: false })
  ),
  state("pristine", 
    transition("change", "dirty")
  ),
  state("dirty", 
    transition("validate", "validating"),
    transition("submit", "validating", guard((ctx) => {
      const errors = validate(ctx.values);
      return Object.keys(errors).length === 0;
    }))
  ),
  state("validating", 
    entry((ctx) => {
      ctx.errors = validate(ctx.values);
    }, "valid", "invalid")
  ),
  state("valid", 
    transition("submit", "submitting")
  ),
  state("invalid", 
    transition("change", "dirty"),
    transition("submit", "invalid")
  ),
  state("submitting", 
    entry(async (ctx) => {
      const res = await fetch("/api/submit", {
        method: "POST",
        body: JSON.stringify(ctx.values)
      });
      if (!res.ok) throw new Error("Submit failed");
      ctx.submitted = true;
    }, "success", "error")
  ),
  state("success", 
    transition("reset", "pristine")
  ),
  state("error", 
    transition("retry", "valid"),
    transition("reset", "pristine")
  )
);

// Usage
invoke(formMachine, "change", { email: "test" });
invoke(formMachine, "validate");
await invoke(formMachine, "submit");
```

## State Diagram

```
pristine → dirty → validating → valid → submitting → success
                ↑            ↓         ↓          |
                └────────────┴──────────┴──→ error
                                    ↑      ↓
                              invalid ←────┘
```

## Key Points

- Guard on submit prevents invalid submissions
- Validation runs before submit
- Error state allows retry

## With Async Validation

```javascript
state("validating", 
  entry(async (ctx) => {
    // Server-side validation
    const res = await fetch("/api/validate", {
      method: "POST",
      body: JSON.stringify(ctx.values)
    });
    ctx.errors = await res.json();
  }, "valid", "invalid")
)
```

## Next Steps

- [API Fetch](./api-fetch.md) — Data fetching
- [Wizard](./wizard.md) — Multi-step forms

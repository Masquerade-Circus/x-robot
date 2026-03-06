# Form Validation

Managing form state with validation.

## Problem

Track form states: pristine, dirty, validating, valid, invalid, submitting, success, error.

## Solution

```javascript
import { machine, state, transition, initial, init, context, invoke, entry, guard } from "x-robot";

function validateForm(values) {
  const errors = {};
  if (!values.email || !/@/.test(values.email)) {
    errors.email = "Invalid email";
  }
  if (!values.password || values.password.length < 8) {
    errors.password = "Password must be 8+ characters";
  }
  return errors;
}

function canSubmitForm(ctx) {
  const errors = validateForm(ctx.values);
  return Object.keys(errors).length === 0;
}

function validateFormInContext(ctx) {
  ctx.errors = validateForm(ctx.values);
}

async function submitForm(ctx) {
  const res = await fetch("/api/submit", {
    method: "POST",
    body: JSON.stringify(ctx.values)
  });
  if (!res.ok) throw new Error("Submit failed");
  ctx.submitted = true;
}

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
    transition("submit", "validating", guard(canSubmitForm))
  ),
  state("validating", 
    entry(validateFormInContext, "valid", "invalid")
  ),
  state("valid", 
    transition("submit", "submitting")
  ),
  state("invalid", 
    transition("change", "dirty"),
    transition("submit", "invalid")
  ),
  state("submitting", 
    entry(submitForm, "success", "error")
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

## Diagram

```mermaid
---
title: Form
---

stateDiagram-v2

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state pristine
state dirty
state validating
state valid
state invalid
state submitting
state success
state error

[*] --> pristine
pristine --> dirty: change
dirty --> validating: validate
dirty --> validating: submit
validating --> valid: done
validating --> invalid: done
valid --> submitting: submit
invalid --> dirty: change
invalid --> invalid: submit
submitting --> success: done
submitting --> error: done
success --> pristine: reset
error --> valid: retry
error --> pristine: reset
```

## With Async Validation

```javascript
async function validateOnServer(ctx) {
  // Server-side validation
  const res = await fetch("/api/validate", {
    method: "POST",
    body: JSON.stringify(ctx.values)
  });
  ctx.errors = await res.json();
}

state("validating", 
  entry(validateOnServer, "valid", "invalid")
)
```

## Next Steps

- [API Fetch](./api-fetch.md) — Data fetching
- [Wizard](./wizard.md) — Multi-step forms

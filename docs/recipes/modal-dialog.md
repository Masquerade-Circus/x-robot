# Modal Dialog

Managing modal dialog state.

## Problem

Track modal states: closed, opening, open, closing.

## Solution

```javascript
import { machine, state, transition, initial, init, context, invoke, entry } from "x-robot";

function prepareContent(ctx) {
  ctx.content = { title: "Confirm", message: "Are you sure?" };
}

async function handleConfirmation(ctx) {
  // Handle confirmation
  await handleConfirm(ctx.data);
}

function clearContent(ctx) {
  ctx.content = null;
}

const modalMachine = machine(
  "Modal",
  init(
    initial("closed"),
    context({ content: null })
  ),
  state("closed", 
    transition("open", "opening")
  ),
  state("opening", 
    entry(prepareContent, "open", "closed")
  ),
  state("open", 
    transition("close", "closing"),
    transition("confirm", "confirming"),
    transition("cancel", "closing")
  ),
  state("confirming", 
    entry(handleConfirmation, "closed", "error")
  ),
  state("closing", 
    entry(clearContent, "closed")
  ),
  state("error", 
    transition("close", "closing")
  )
);

// Usage
invoke(modalMachine, "open");
// After animation: modalMachine.current === "open"

invoke(modalMachine, "confirm");
// modalMachine.current === "closed"
```

## Diagram

```mermaid
---
title: Modal
---

stateDiagram-v2

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state closed
state opening
state open
state confirming
state closing
state error

[*] --> closed
closed --> opening: open
opening --> open: done
opening --> closed: done
open --> closing: close
open --> confirming: confirm
open --> closing: cancel
confirming --> closed: done
confirming --> error: done
closing --> closed: done
error --> closing: close
```

## With Animation Support

```javascript
function startOpenAnimation(ctx) {
  // Start opening animation
  animateOpen();
}

function onOpenComplete(ctx) {
  // Animation complete
}

function startCloseAnimation(ctx) {
  // Start closing animation
  animateClose();
}

const modalMachine = machine(
  "Modal",
  init(initial("closed")),
  state("closed", transition("open", "opening")),
  state("opening", 
    entry(startOpenAnimation, "open", "closed"),
    transition("cancel", "closing")
  ),
  state("open", 
    entry(onOpenComplete),
    transition("close", "closing")
  ),
  state("closing", 
    entry(startCloseAnimation, "closed")
  )
);
```

## State Diagram

```
closed → opening → open → closing → closed
              ↑         |         |
              |         ↓         ↓
              └──── confirming → error
```

## Use Cases

- Confirmation dialogs
- Alert modals
- Form modals
- Side panels

## Variations

### Alert Only

```javascript
function showAlert(ctx) {
  // Show alert
}

function hideAlert(ctx) {
  // Hide alert
}

const alertMachine = machine(
  "Alert",
  init(initial("hidden")),
  state("hidden", transition("show", "showing")),
  state("showing", entry(showAlert, "visible", "hidden")),
  state("visible", transition("dismiss", "hiding")),
  state("hiding", entry(hideAlert, "hidden"))
);
```

### With Form

```javascript
async function submitFormData(ctx) {
  await submitForm(ctx.formData);
}

const formModal = machine(
  "FormModal",
  init(initial("closed"), context({ formData: {} })),
  state("closed", transition("open", "opening")),
  state("opening", transition("ready", "open")),
  state("open", 
    transition("close", "closing"),
    transition("submit", "submitting")
  ),
  state("submitting", 
    entry(submitFormData, "closed", "error")
  ),
  state("closing", transition("closed")),
  state("error", transition("retry", "open"))
);
```

## Next Steps

- [Wizard](./wizard.md) — Multi-step forms
- [Form Validation](./form-validation.md) — Input handling

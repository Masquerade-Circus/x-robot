# Modal Dialog

Managing modal dialog state.

## Problem

Track modal states: closed, opening, open, closing.

## Solution

```javascript
import { machine, state, transition, initial, init, context, invoke, entry } from "x-robot";

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
    entry((ctx) => {
      ctx.content = { title: "Confirm", message: "Are you sure?" };
    }, "open", "closed")
  ),
  state("open", 
    transition("close", "closing"),
    transition("confirm", "confirming"),
    transition("cancel", "closing")
  ),
  state("confirming", 
    entry(async (ctx) => {
      // Handle confirmation
      await handleConfirm(ctx.data);
    }, "closed", "error")
  ),
  state("closing", 
    entry((ctx) => {
      ctx.content = null;
    }, "closed")
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

## With Animation Support

```javascript
const modalMachine = machine(
  "Modal",
  init(initial("closed")),
  state("closed", transition("open", "opening")),
  state("opening", 
    entry((ctx) => {
      // Start opening animation
      animateOpen();
    }, "open", "closed"),
    transition("cancel", "closing")
  ),
  state("open", 
    entry((ctx) => {
      // Animation complete
    }),
    transition("close", "closing")
  ),
  state("closing", 
    entry((ctx) => {
      // Start closing animation
      animateClose();
    }, "closed")
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
const alertMachine = machine(
  "Alert",
  init(initial("hidden")),
  state("hidden", transition("show", "showing")),
  state("showing", entry((ctx) => {}, "visible", "hidden")),
  state("visible", transition("dismiss", "hiding")),
  state("hiding", entry((ctx) => {}, "hidden"))
);
```

### With Form

```javascript
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
    entry(async (ctx) => {
      await submitForm(ctx.formData);
    }, "closed", "error")
  ),
  state("closing", transition("closed")),
  state("error", transition("retry", "open"))
);
```

## Next Steps

- [Wizard](./wizard.md) — Multi-step forms
- [Form Validation](./form-validation.md) — Input handling

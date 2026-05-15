# Modal Dialog

Managing modal dialog state.

## Problem

Track modal states: closed, opening, open, closing.

## Solution

```mermaid
---
title: Modal
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "closed" as closed
state "opening" as opening
state "open" as open
state "confirming" as confirming
state "closing" as closing
state "error" as error
class closed def
class opening def
class open def
class confirming def
class closing def
class error def

opening: └┬ En-prepareContent<br> ├┬ success<br> │└ T-open<br> └┬ failure<br>  └ T-closed
confirming: └┬ AEn-handleConfirmation<br> ├┬ success<br> │└ T-closed<br> └┬ failure<br>  └ T-error
closing: └┬ En-clearContent<br> └┬ success<br>  └ T-closed

[*] --> closed
closed --> opening: open
opening --> open: open
opening --> closed: closed
open --> closing: close
open --> confirming: confirm
open --> closing: cancel
confirming --> closed: closed
confirming --> error: error
closing --> closed: closed
error --> closing: close
```
```javascript
import { machine, state, transition, initial, init, context, invoke, entry } from "x-robot";

function prepareContent(ctx) {
  ctx.content = { title: "Confirm", message: "Are you sure?" };
}

async function handleConfirmation(ctx, data) {
  // Handle confirmation
  await handleConfirm(data);
}

function clearContent(ctx) {
  ctx.content = null;
}

const modalMachine = machine(
  "Modal",
  init(
    initial("closed"),
    context({ content: null, data: null })
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

invoke(modalMachine, "confirm", { id: 123 });
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

opening: └┬ En:prepareContent<br> ├┬ success<br> │└ T:open<br> └┬ failure<br>  └ T:closed
confirming: └┬ AEn:handleConfirmation<br> ├┬ success<br> │└ T:closed<br> └┬ failure<br>  └ T:error
closing: └┬ En:clearContent<br> └┬ success<br>  └ T:closed

[*] --> closed
closed --> opening: open
opening --> open: open
opening --> closed: closed
open --> closing: close
open --> confirming: confirm
open --> closing: cancel
confirming --> closed: closed
confirming --> error: error
closing --> closed: closed
error --> closing: close
```

## With Animation Support

```mermaid
---
title: Modal
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "closed" as closed
state "opening" as opening
state "open" as open
state "closing" as closing
class closed def
class opening def
class open def
class closing def

opening: └┬ En-startOpenAnimation<br> ├┬ success<br> │└ T-open<br> └┬ failure<br>  └ T-closed
open: └ En-onOpenComplete
closing: └┬ En-startCloseAnimation<br> └┬ success<br>  └ T-closed

[*] --> closed
closed --> opening: open
opening --> open: open
opening --> closed: closed
opening --> closing: cancel
open --> closing: close
closing --> closed: closed
```
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

    closed → opening → open → closing → closed
                  ↑         |         |
                  |         ↓         ↓
                  └──── confirming → error

## Use Cases

*   Confirmation dialogs
*   Alert modals
*   Form modals
*   Side panels

## Variations

### Alert Only

```mermaid
---
title: Alert
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "hidden" as hidden
state "showing" as showing
state "visible" as visible
state "hiding" as hiding
class hidden def
class showing def
class visible def
class hiding def

showing: └┬ En-showAlert<br> ├┬ success<br> │└ T-visible<br> └┬ failure<br>  └ T-hidden
hiding: └┬ En-hideAlert<br> └┬ success<br>  └ T-hidden

[*] --> hidden
hidden --> showing: show
showing --> visible: visible
showing --> hidden: hidden
visible --> hiding: dismiss
hiding --> hidden: hidden
```
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

```mermaid
---
title: FormModal
---

stateDiagram-v2
direction TB

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state "closed" as closed
state "opening" as opening
state "open" as open
state "submitting" as submitting
state "closing" as closing
state "error" as error
class closed def
class opening def
class open def
class submitting def
class closing def
class error def

submitting: └┬ AEn-submitFormData<br> ├┬ success<br> │└ T-closed<br> └┬ failure<br>  └ T-error

[*] --> closed
closed --> opening: open
opening --> open: ready
open --> closing: close
open --> submitting: submit
submitting --> closed: closed
submitting --> error: error
closing --> closed: closed
error --> open: retry
```
```javascript
async function submitFormData(ctx, formData) {
  await submitForm(formData ?? ctx.formData);
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
  state("closing", transition("closed", "closed")),
  state("error", transition("retry", "open"))
);
```

## Next Steps

*   [Wizard](./wizard.md) — Multi-step forms
*   [Form Validation](./form-validation.md) — Input handling

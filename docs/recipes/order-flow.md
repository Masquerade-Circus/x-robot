# Order Processing Flow

A complete finite state machine for an e-commerce order processing system. This example demonstrates how X-Robot handles complex real-world scenarios with many states, multiple entry actions, failure handling, and automatic transitions.

## Overview

This machine manages the complete lifecycle of an order from creation to delivery, including:

- Draft and creation states
- Payment authorization and capture
- Store confirmation
- Processing and fulfillment
- Multiple cancellation paths
- Error handling and recovery

## The Machine

```javascript
import {
  context,
  dangerState,
  entry,
  immediate,
  init,
  initial,
  machine,
  primaryState,
  state,
  successState,
  transition,
  warningState,
} from "x-robot";
import { validate } from "x-robot";

// Helper: updates context with payload data
function updateState(context, payload) {
  return { ...context, ...payload };
}

// Entry actions (async operations)
async function getClient() {}
async function getItemsAndTaxes() {}
async function getAmounts() {}
async function draft() {}
async function expireDraft() {}
async function getStore() {}
async function getRetailer() {}
async function setI18N() {}
async function validatePickupTime() {}
async function getCard() {}
async function create() {}
async function authorize() {}
async function capture() {}
async function voidOrRefundOrder() {}
async function update() {}
async function sendNotificationToClient() {}
async function sendNotificationToStore() {}
async function increaseSuccessfulStoreOrderCount() {}
async function decreaseSuccessfulStoreOrderCount() {}
async function setError() {}
async function createTransaction() {}
async function throwError() {}
async function setTimeoutTasks() {}
async function getTransaction() {}
async function expire() {}
async function updateTransaction() {}
async function setCancelledById() {}

// Create entry action directives
const actionGetClient = entry(getClient);
const actionGetItemsAndTaxes = entry(getItemsAndTaxes);
const actionGetAmounts = entry(getAmounts);
const actionDraft = entry(draft);
const actionExpireDraft = entry(expireDraft);
const actionGetStore = entry(getStore);
const actionGetRetailer = entry(getRetailer);
const actionSetI18N = entry(setI18N);
const actionValidatePickupTime = entry(validatePickupTime);
const actionGetCard = entry(getCard);
const actionCreate = entry(create);
const actionAuthorize = entry(authorize, undefined, "authorizationFailure");
const actionCapture = entry(capture, undefined, "captureFailure");
const actionVoidOrRefundOrder = entry(voidOrRefundOrder, undefined, "voidOrRefundFailure");
const actionUpdate = entry(update);
const actionSendNotificationToClient = entry(sendNotificationToClient);
const actionSendNotificationToStore = entry(sendNotificationToStore);
const actionIncreaseSuccessfulStoreOrderCount = entry(increaseSuccessfulStoreOrderCount);
const actionDecreaseSuccessfulStoreOrderCount = entry(decreaseSuccessfulStoreOrderCount);
const actionSetError = entry(setError);
const actionCreateTransaction = entry(createTransaction);
const actionThrowError = entry(throwError);
const actionSetTimeoutTasks = entry(setTimeoutTasks);
const actionGetTransaction = entry(getTransaction);
const actionExpire = entry(expire);
const actionUpdateTransaction = entry(updateTransaction);
const actionSetCancelledById = entry(setCancelledById);

const orderMachine = machine(
  "Order",
  init(
    initial("draft"),
    context({})
  ),
  
  // Error states (danger)
  dangerState("fatal", actionUpdate, actionUpdateTransaction),
  dangerState("authorizationFailure", actionSetError, actionCreateTransaction, actionUpdate, actionSendNotificationToClient, actionThrowError),
  dangerState("voidOrRefundFailure", actionSetError, actionUpdateTransaction, actionUpdate, actionThrowError),
  dangerState("captureFailure", actionSetError, actionVoidOrRefundOrder, actionUpdate, actionUpdateTransaction, actionSendNotificationToClient, actionSendNotificationToStore, actionThrowError),

  // Initial state - draft
  state(
    "draft",
    actionGetClient,
    actionGetItemsAndTaxes,
    actionGetAmounts,
    actionDraft,
    transition("expiredDraft", "expiredDraft"),
    transition("create", "created")
  ),

  // Draft expired
  warningState("expiredDraft", actionGetClient, actionExpireDraft),

  // Order created - primary workflow starts here
  primaryState(
    "created",
    actionGetClient,
    actionGetStore,
    actionGetRetailer,
    actionSetI18N,
    actionValidatePickupTime,
    actionGetItemsAndTaxes,
    actionGetAmounts,
    actionGetCard,
    actionCreate,
    actionAuthorize,
    actionCreateTransaction,
    actionUpdate,
    immediate("waitingForStore"),
    transition("expire", "expired")
  ),

  // Order expired
  warningState(
    "expired",
    actionGetClient,
    actionGetStore,
    actionGetRetailer,
    actionSetI18N,
    actionGetCard,
    actionGetItemsAndTaxes,
    actionExpire,
    actionGetTransaction,
    actionVoidOrRefundOrder,
    actionUpdate,
    actionUpdateTransaction,
    actionSendNotificationToClient
  ),

  // Waiting for store confirmation
  primaryState(
    "waitingForStore",
    actionSendNotificationToClient,
    actionSetTimeoutTasks,
    actionUpdate,
    transition("expire", "expired"),
    transition("cancel", "cancelledByStore"),
    transition("cancelByClient", "cancelledByClient"),
    transition("cancelByCustomerSupport", "cancelledByCustomerSupport"),
    transition("requestChanges", "changesRequestedByStore"),
    transition("process", "processing")
  ),

  // Cancellation states
  warningState(
    "cancelledByStore",
    actionGetClient,
    actionGetStore,
    actionGetRetailer,
    actionSetI18N,
    actionGetCard,
    actionGetItemsAndTaxes,
    actionUpdate,
    actionVoidOrRefundOrder,
    actionUpdate,
    actionUpdateTransaction,
    actionSendNotificationToClient
  ),

  warningState(
    "cancelledByClient",
    actionGetClient,
    actionGetStore,
    actionGetRetailer,
    actionSetI18N,
    actionGetCard,
    actionGetItemsAndTaxes,
    actionGetTransaction,
    actionVoidOrRefundOrder,
    actionUpdate,
    actionSendNotificationToStore,
    actionSendNotificationToClient
  ),

  warningState(
    "cancelledByCustomerSupport",
    actionGetClient,
    actionGetStore,
    actionGetRetailer,
    actionSetI18N,
    actionGetCard,
    actionGetItemsAndTaxes,
    actionGetTransaction,
    actionSetCancelledById,
    actionVoidOrRefundOrder,
    actionDecreaseSuccessfulStoreOrderCount,
    actionUpdate,
    actionUpdateTransaction,
    actionSendNotificationToClient
  ),

  // Change request states
  state(
    "changesRequestedByStore",
    actionGetClient,
    actionGetStore,
    actionGetRetailer,
    actionSetI18N,
    actionGetCard,
    actionGetItemsAndTaxes,
    actionGetAmounts,
    actionUpdate,
    actionSendNotificationToClient,
    transition("rejectChanges", "changesRejectedByClient"),
    transition("acceptChanges", "changesAcceptedByClient"),
    transition("cancelByCustomerSupport", "cancelledByCustomerSupport")
  ),

  warningState(
    "changesRejectedByClient",
    actionGetClient,
    actionGetStore,
    actionGetRetailer,
    actionSetI18N,
    actionGetCard,
    actionGetItemsAndTaxes,
    actionGetTransaction,
    actionVoidOrRefundOrder,
    actionUpdate,
    actionUpdateTransaction,
    actionSendNotificationToClient,
    actionSendNotificationToStore
  ),

  state(
    "changesAcceptedByClient",
    actionGetClient,
    actionGetStore,
    actionGetRetailer,
    actionSetI18N,
    actionGetCard,
    actionGetItemsAndTaxes,
    actionUpdate,
    actionSendNotificationToStore,
    transition("cancelByCustomerSupport", "cancelledByCustomerSupport"),
    transition("process", "processing"),
    transition("cancel", "cancelledByStore")
  ),

  // Processing states
  primaryState(
    "processing",
    actionGetClient,
    actionGetStore,
    actionGetRetailer,
    actionSetI18N,
    actionGetCard,
    actionGetItemsAndTaxes,
    actionUpdate,
    actionSendNotificationToClient,
    transition("cancelProcessing", "processingCancelledByStore"),
    transition("finishProcessing", "processed"),
    transition("cancelByCustomerSupport", "cancelledByCustomerSupport")
  ),

  warningState(
    "processingCancelledByStore",
    actionGetClient,
    actionGetStore,
    actionGetRetailer,
    actionSetI18N,
    actionGetCard,
    actionGetItemsAndTaxes,
    actionGetTransaction,
    actionVoidOrRefundOrder,
    actionUpdate,
    actionUpdateTransaction,
    actionSendNotificationToClient
  ),

  state(
    "processed",
    actionGetClient,
    actionGetStore,
    actionGetRetailer,
    actionSetI18N,
    actionGetCard,
    actionGetItemsAndTaxes,
    actionGetTransaction,
    actionUpdate,
    actionCapture,
    actionUpdateTransaction,
    immediate("ready")
  ),

  // Ready for delivery
  primaryState(
    "ready",
    actionIncreaseSuccessfulStoreOrderCount,
    actionUpdate,
    actionSendNotificationToClient,
    transition("complete", "completed"),
    transition("cancelReady", "readyCancelledByStore"),
    transition("cancelByCustomerSupport", "cancelledByCustomerSupport"),
    transition("deliver", "waitingForDelivery")
  ),

  warningState(
    "readyCancelledByStore",
    actionGetClient,
    actionGetStore,
    actionGetRetailer,
    actionSetI18N,
    actionGetCard,
    actionGetItemsAndTaxes,
    actionGetTransaction,
    actionVoidOrRefundOrder,
    actionDecreaseSuccessfulStoreOrderCount,
    actionUpdate,
    actionUpdateTransaction,
    actionSendNotificationToClient
  ),

  // Delivery states
  state(
    "waitingForDelivery",
    actionGetClient,
    actionGetStore,
    actionGetRetailer,
    actionSetI18N,
    actionGetCard,
    actionGetItemsAndTaxes,
    actionGetTransaction,
    actionUpdate,
    transition("complete", "completed"),
    transition("cancelWaitingForDelivery", "waitingForDeliveryCancelledByStore"),
    transition("cancelByCustomerSupport", "cancelledByCustomerSupport")
  ),

  warningState(
    "waitingForDeliveryCancelledByStore",
    actionGetClient,
    actionGetStore,
    actionGetRetailer,
    actionSetI18N,
    actionGetCard,
    actionGetItemsAndTaxes,
    actionGetTransaction,
    actionVoidOrRefundOrder,
    actionDecreaseSuccessfulStoreOrderCount,
    actionUpdate,
    actionUpdateTransaction,
    actionSendNotificationToClient
  ),

  // Final success state
  successState(
    "completed",
    actionGetClient,
    actionGetStore,
    actionGetRetailer,
    actionSetI18N,
    actionGetCard,
    actionUpdate,
    transition("cancelCompleted", "completedCancelledByStore"),
    transition("cancelByCustomerSupport", "cancelledByCustomerSupport")
  ),

  warningState(
    "completedCancelledByStore",
    actionGetClient,
    actionGetStore,
    actionGetRetailer,
    actionSetI18N,
    actionGetCard,
    actionGetItemsAndTaxes,
    actionGetTransaction,
    actionVoidOrRefundOrder,
    actionDecreaseSuccessfulStoreOrderCount,
    actionUpdate,
    actionUpdateTransaction,
    actionSendNotificationToClient
  )
);

// Validate the machine structure
validate(orderMachine);
```

## Key Patterns

### 1. State Types

X-Robot provides visual state types that help categorize states in diagrams:

```javascript
primaryState("created", ...)   // Blue - main workflow
warningState("expired", ...)   // Yellow - warnings/cancellations  
dangerState("fatal", ...)      // Red - errors/failures
successState("completed", ...)  // Green - final success
state("draft", ...)            // Default - neutral
```

### 2. Multiple Entry Actions

Each state can have multiple entry actions that run sequentially:

```javascript
primaryState(
  "created",
  actionGetClient,      // Runs first
  actionGetStore,      // Runs second
  actionGetRetailer,    // Runs third
  actionSetI18N,
  actionValidatePickupTime,
  actionGetItemsAndTaxes,
  actionGetAmounts,
  actionGetCard,
  actionCreate,
  actionAuthorize,
  actionCreateTransaction,
  actionUpdate
)
```

### 3. Failure Transitions

Entry actions can trigger failure transitions when errors occur:

```javascript
// On success: continues normally
// On failure: transitions to "authorizationFailure"
actionAuthorize = entry(authorize, undefined, "authorizationFailure")

// Capture with failure handling
actionCapture = entry(capture, undefined, "captureFailure")

// Void or refund with failure
actionVoidOrRefundOrder = entry(voidOrRefundOrder, undefined, "voidOrRefundFailure")
```

### 4. Immediate Transitions

States can automatically transition to other states without events:

```javascript
// After "created" entry actions complete, immediately go to "waitingForStore"
primaryState(
  "created",
  ...actions,
  immediate("waitingForStore")
)

// After processing completes, immediately go to "ready"
state(
  "processed",
  ...actions,
  immediate("ready")
)
```

### 5. Validation

Validate the machine structure before use:

```javascript
import { validate } from "x-robot";

validate(orderMachine); // Throws if invalid
```

## Flow Diagram

To visualize this machine, use the visualization guide:

```javascript
import { documentate } from "x-robot";

const { svg } = await documentate(orderMachine, { 
  format: "svg", 
  level: "high" 
});
```

This generates a comprehensive state diagram showing all 23 states, their transitions, and entry actions.

## Next Steps

- [Visualization](../guides/visualization.md) — Generate diagrams
- [Guides: Guards](../guides/guards.md) — Add conditional logic
- [Guides: Immediate Transitions](../guides/immediate-transitions.md) — Auto-transitions
- [Recipes: Wizard](../recipes/wizard.md) — Another complex pattern

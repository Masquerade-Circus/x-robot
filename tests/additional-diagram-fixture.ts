import type { SerializedMachine } from "../lib/documentate";

export const callbackBodySentinel = "CALLBACK_BODY_SENTINEL";
export const payloadSentinel = "PAYLOAD_SENTINEL";

export const allFeaturesSerialized: SerializedMachine = {
  title: "OrderWorkflow",
  initial: "created",
  context: { hidden: payloadSentinel },
  parallel: {
    fulfillment: {
      title: "Fulfillment",
      initial: "queued",
      context: {},
      parallel: {},
      states: {
        queued: {
          name: "queued",
          immediate: [
            {
              immediate: "pick",
              guards: [{ guard: "inventoryAvailable", failure: "inventoryIssue" }]
            }
          ]
        },
        pick: {
          name: "pick",
          type: "primary",
          run: [{ pulse: "allocateInventory", success: "pack", failure: "inventoryIssue" }]
        },
        pack: {
          name: "pack",
          on: {
            ship: { target: "shipped", exit: [{ pulse: "printLabel" }] }
          }
        },
        shipped: { name: "shipped", type: "success" },
        inventoryIssue: {
          name: "inventoryIssue",
          type: "warning",
          on: { retry: { target: "queued" } }
        }
      }
    }
  },
  states: {
    created: {
      name: "created",
      type: "primary",
      run: [{ pulse: "hydrateOrder", success: "ready", failure: "invalid" }],
      on: {
        submit: { target: "processing", guards: [{ guard: "hasLineItems", failure: "invalid" }] },
        cancel: { target: "cancelled" }
      }
    },
    ready: {
      name: "ready",
      on: {
        submit: { target: "processing", guards: [{ guard: "hasPaymentMethod", failure: "paymentRequired" }] },
        cancel: { target: "cancelled" }
      }
    },
    processing: {
      name: "processing",
      type: "primary",
      nested: [
        {
          transition: "captured",
          machine: {
            title: "Payment",
            initial: "created",
            context: {},
            parallel: {},
            states: {
              created: {
                name: "created",
                type: "primary",
                run: [{ pulse: "reserveFunds", success: "authorized", failure: "paymentFailed" }],
                on: { cancel: { target: "cancelled", guards: [{ guard: "canCancel", failure: "manualReview" }] } }
              },
              authorized: {
                name: "authorized",
                type: "success",
                on: { capture: { target: "captured", exit: [{ pulse: "auditCapture" }] } }
              },
              captured: { name: "captured", type: "success" },
              manualReview: {
                name: "manualReview",
                type: "warning",
                on: { approve: { target: "authorized" }, reject: { target: "paymentFailed" } }
              },
              paymentFailed: { name: "paymentFailed", type: "danger" },
              cancelled: { name: "cancelled", type: "danger" }
            }
          }
        }
      ],
      immediate: [{ immediate: "fulfilling" }],
      on: { cancel: { target: "cancelled", exit: [{ pulse: "releaseReservation", failure: "cancelled" }] } }
    },
    fulfilling: {
      name: "fulfilling",
      type: "primary",
      on: { ship: { target: "completed" }, cancel: { target: "cancelled" } }
    },
    paymentRequired: {
      name: "paymentRequired",
      type: "warning",
      on: { submit: { target: "processing" }, cancel: { target: "cancelled" } }
    },
    invalid: { name: "invalid", type: "warning", on: { fix: { target: "ready" } } },
    completed: { name: "completed", type: "success" },
    cancelled: { name: "cancelled", type: "danger" }
  }
};

import {
  context,
  entry,
  exit,
  cancel,
  getState,
  guard,
  immediate,
  init,
  initial,
  invoke,
  invokeAfter,
  machine,
  nested,
  parallel,
  snapshot,
  start,
  state,
  transition
} from "../lib";
import { describe, it } from "mocha";

import expect from "expect";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("Async workflow contracts", () => {
  it("does not enter the target state or run entry pulses when an async guard returns false", async () => {
    let targetEntryRuns = 0;

    const workflow = machine(
      "Async guard false",
      init(initial("idle")),
      state(
        "idle",
        transition(
          "submit",
          "effect",
          guard(async () => {
            await delay(1);
            return false;
          })
        )
      ),
      state(
        "effect",
        entry(async () => {
          targetEntryRuns += 1;
        })
      )
    );

    await invoke(workflow, "submit");

    expect(getState(workflow)).toBe("idle");
    expect(targetEntryRuns).toBe(0);
  });

  it("does not run target entry pulses when an async guard rejects", async () => {
    let targetEntryRuns = 0;

    const workflow = machine(
      "Async guard rejects",
      init(initial("idle")),
      state(
        "idle",
        transition(
          "submit",
          "effect",
          guard(async () => {
            await delay(1);
            throw new Error("guard rejected");
          })
        )
      ),
      state(
        "effect",
        entry(async () => {
          targetEntryRuns += 1;
        })
      ),
      state("fatal")
    );

    await expect(invoke(workflow, "submit")).rejects.toThrow("guard rejected");

    expect(getState(workflow)).toBe("idle");
    expect(targetEntryRuns).toBe(0);
    expect(workflow.fatal).toBeUndefined();
  });

  it("stops evaluating async guards after the first failed guard", async () => {
    let secondGuardRuns = 0;

    const workflow = machine(
      "Async guard short circuit",
      init(initial("idle")),
      state(
        "idle",
        transition(
          "submit",
          "effect",
          guard(async () => {
            await delay(1);
            return false;
          }),
          guard(async () => {
            secondGuardRuns += 1;
            return true;
          })
        )
      ),
      state("effect")
    );

    await invoke(workflow, "submit");

    expect(getState(workflow)).toBe("idle");
    expect(secondGuardRuns).toBe(0);
  });

  it("models payment authorize/capture/void/refund with async guards and entry effects", async () => {
    const payment = machine(
      "Payment workflow",
      init(
        initial("initialized"),
        context({
          authorized: false,
          captured: false,
          voided: false,
          refunded: false,
          riskApproved: true,
          balanceAvailable: true,
          refundAllowed: true,
          rejectedReason: null
        })
      ),
      state(
        "initialized",
        transition(
          "authorize",
          "authorized",
          guard(async (ctx) => ctx.riskApproved === true, "rejected")
        ),
        transition("rejected", "rejected")
      ),
      state(
        "authorized",
        entry(async (ctx) => ({ ...ctx, authorized: true })),
        transition(
          "capture",
          "captured",
          guard(async (ctx) => ctx.balanceAvailable === true, "rejected")
        ),
        transition("void", "voided"),
        transition("rejected", "rejected")
      ),
      state("voided", entry(async (ctx) => ({ ...ctx, voided: true }))),
      state(
        "captured",
        entry(async (ctx) => ({ ...ctx, captured: true })),
        transition(
          "refund",
          "refunded",
          guard(async (ctx) => ctx.refundAllowed === true, "rejected")
        ),
        transition("rejected", "rejected")
      ),
      state("refunded", entry(async (ctx) => ({ ...ctx, refunded: true }))),
      state(
        "rejected",
        entry(async (ctx, reason) => ({ ...ctx, rejectedReason: reason ?? "rejected" }))
      )
    );

    await invoke(payment, "authorize");
    expect(getState(payment)).toBe("authorized");
    expect(payment.context.authorized).toBe(true);

    await invoke(payment, "capture");
    expect(getState(payment)).toBe("captured");
    expect(payment.context.captured).toBe(true);

    const rejectedRefundPayment = machine(
      "Rejected refund payment workflow",
      init(
        initial("captured"),
        context({ captured: true, refunded: false, refundAllowed: false, rejectedReason: null })
      ),
      state(
        "captured",
        transition(
          "refund",
          "refunded",
          guard(async (ctx) => ctx.refundAllowed === true, "rejected")
        ),
        transition("rejected", "rejected")
      ),
      state("refunded", entry(async (ctx) => ({ ...ctx, refunded: true }))),
      state("rejected", entry(async (ctx, reason) => ({ ...ctx, rejectedReason: reason ?? "rejected" })))
    );

    await invoke(rejectedRefundPayment, "refund");
    await delay(1);
    expect(getState(rejectedRefundPayment)).toBe("rejected");
    expect(rejectedRefundPayment.context.refunded).toBe(false);
    expect(rejectedRefundPayment.context.rejectedReason).toBe(false);

    const voidPayment = machine(
      "Void payment workflow",
      init(initial("initialized"), context({ authorized: false, voided: false, riskApproved: true })),
      state(
        "initialized",
        transition("authorize", "authorized", guard(async (ctx) => ctx.riskApproved === true, "rejected")),
        transition("rejected", "rejected")
      ),
      state("authorized", entry(async (ctx) => ({ ...ctx, authorized: true })), transition("void", "voided")),
      state("voided", entry(async (ctx) => ({ ...ctx, voided: true }))),
      state("rejected")
    );

    await invoke(voidPayment, "authorize");
    await invoke(voidPayment, "void");

    expect(getState(voidPayment)).toBe("voided");
    expect(voidPayment.context.authorized).toBe(true);
    expect(voidPayment.context.voided).toBe(true);
  });

  it("handles duplicate async guarded transitions deterministically", async () => {
    let effectRuns = 0;
    const gate = deferred<boolean>();

    const workflow = machine(
      "Duplicate guarded transition",
      init(initial("idle"), context({ count: 0 })),
      state(
        "idle",
        transition(
          "submit",
          "done",
          guard(async () => gate.promise)
        )
      ),
      state(
        "done",
        entry(async (ctx) => {
          effectRuns += 1;
          return { ...ctx, count: ctx.count + 1 };
        })
      )
    );

    const first = invoke(workflow, "submit");
    const second = invoke(workflow, "submit");
    gate.resolve(true);
    const results = await Promise.allSettled([first, second]);

    expect(getState(workflow)).toBe("done");
    expect(workflow.context.count).toBe(1);
    expect(effectRuns).toBe(1);
    expect(results[0].status).toBe("fulfilled");
    expect(results[1].status).toBe("rejected");
  });

  it("revalidates queued events against the current state before running guards", async () => {
    const gate = deferred<boolean>();
    let cancelGuardRuns = 0;

    const workflow = machine(
      "Queued event revalidation",
      init(initial("idle")),
      state(
        "idle",
        transition("approve", "approved", guard(async () => gate.promise)),
        transition("cancel", "cancelled", guard(() => {
          cancelGuardRuns += 1;
          return true;
        }))
      ),
      state("approved"),
      state("cancelled")
    );

    const pendingApproval = invoke(workflow, "approve");
    const queuedCancel = invoke(workflow, "cancel");
    gate.resolve(true);
    const results = await Promise.allSettled([pendingApproval, queuedCancel]);

    expect(getState(workflow)).toBe("approved");
    expect(cancelGuardRuns).toBe(0);
    expect(results[0].status).toBe("fulfilled");
    expect(results[1].status).toBe("rejected");
  });

  it("cancel(machine) prevents a pending async guard from committing its transition", async () => {
    const gate = deferred<boolean>();

    const workflow = machine(
      "Cancel pending guard",
      init(initial("idle")),
      state("idle", transition("approve", "approved", guard(async () => gate.promise))),
      state("approved")
    );

    const pendingApproval = invoke(workflow, "approve");
    cancel(workflow);
    gate.resolve(true);
    await pendingApproval;

    expect(getState(workflow)).toBe("idle");
  });

  it("cancel(machine) prevents a pending async entry pulse from committing context or transition", async () => {
    const gate = deferred<{ applied: boolean }>();

    const workflow = machine(
      "Cancel pending entry",
      init(initial("idle"), context({ applied: false })),
      state("idle", transition("activate", "active")),
      state(
        "active",
        entry(async () => gate.promise, "done")
      ),
      state("done")
    );

    const pendingActivation = invoke(workflow, "activate");
    cancel(workflow);
    gate.resolve({ applied: true });
    await pendingActivation;

    expect(getState(workflow)).toBe("active");
    expect(workflow.context.applied).toBe(false);
  });

  it("cancel(machine) clears queued invocations", async () => {
    const gate = deferred<boolean>();
    let queuedGuardRuns = 0;

    const workflow = machine(
      "Cancel queued invocations",
      init(initial("idle")),
      state(
        "idle",
        transition("approve", "approved", guard(async () => gate.promise)),
        transition("cancelled", "cancelled", guard(() => {
          queuedGuardRuns += 1;
          return true;
        }))
      ),
      state("approved"),
      state("cancelled")
    );

    const pendingApproval = invoke(workflow, "approve");
    const queued = invoke(workflow, "cancelled");
    cancel(workflow);
    gate.resolve(true);
    const results = await Promise.allSettled([pendingApproval, queued]);

    expect(getState(workflow)).toBe("idle");
    expect(queuedGuardRuns).toBe(0);
    expect(results[0].status).toBe("fulfilled");
    expect(results[1].status).toBe("rejected");
  });

  it("cancel(parent) cancels pending nested machine invocations", async () => {
    const gate = deferred<{ applied: boolean }>();

    const child = machine(
      "Nested cancellable child",
      init(initial("idle"), context({ applied: false })),
      state("idle", transition("start", "running")),
      state("running", entry(async () => gate.promise, "done")),
      state("done")
    );

    const parent = machine(
      "Nested cancellable parent",
      init(initial("idle")),
      state("idle", transition("activate", "active")),
      state("active", nested(child, "start"))
    );

    const pending = invoke(parent, "activate");
    await delay(5);
    cancel(parent);
    gate.resolve({ applied: true });
    await pending;

    expect(getState(child)).toBe("running");
    expect(child.context.applied).toBe(false);
  });

  it("cancel(parent) cancels pending parallel machine invocations", async () => {
    const gate = deferred<{ applied: boolean }>();

    const region = machine(
      "Parallel cancellable region",
      init(initial("idle"), context({ applied: false })),
      state("idle", transition("start", "running")),
      state("running", entry(async () => gate.promise, "done")),
      state("done")
    );

    const parent = machine("Parallel cancellable parent", parallel(region));

    const pending = invoke(parent, `${region.id}/start`);
    await delay(5);
    cancel(parent);
    gate.resolve({ applied: true });
    await pending;

    expect(getState(region)).toBe("running");
    expect(region.context.applied).toBe(false);
  });

  it("queued invocations wait for async guard failure transition effects", async () => {
    const guardGate = deferred<boolean>();
    const failureEntryGate = deferred<void>();
    const order: string[] = [];

    const workflow = machine(
      "Queued guard failure effects",
      init(initial("idle"), context({ failureReady: false })),
      state(
        "idle",
        transition("submit", "done", guard(async () => guardGate.promise, "failed")),
        transition("failed", "failed"),
        transition("recover", "recovered", guard(() => {
          order.push("recover-before-failure-entry");
          return true;
        }))
      ),
      state(
        "failed",
        entry(async (ctx) => {
          order.push("failure-entry-start");
          await failureEntryGate.promise;
          order.push("failure-entry-done");
          return { ...ctx, failureReady: true };
        }),
        transition("recover", "recovered", guard((ctx) => {
          order.push(ctx.failureReady ? "recover-after-entry" : "recover-before-entry");
          return true;
        }))
      ),
      state("done"),
      state("recovered")
    );

    const submit = invoke(workflow, "submit");
    const recover = invoke(workflow, "recover");
    guardGate.resolve(false);
    await delay(5);

    expect(order).toEqual(["failure-entry-start"]);

    failureEntryGate.resolve();
    await Promise.all([submit, recover]);

    expect(order).toEqual(["failure-entry-start", "failure-entry-done", "recover-after-entry"]);
    expect(getState(workflow)).toBe("recovered");
  });

  it("queued invocations wait for async immediate transitions", async () => {
    const immediateGate = deferred<boolean>();
    const order: string[] = [];

    const workflow = machine(
      "Queued immediate chain",
      init(initial("idle"), context({ immediateReady: false })),
      state("idle", transition("activate", "checking")),
      state(
        "checking",
        immediate("ready"),
        transition("ready", "ready", guard(() => {
          order.push("immediate-guard-start");
          return immediateGate.promise.then((result) => {
            order.push("immediate-guard-done");
            return result;
          });
        }))
      ),
      state(
        "ready",
        entry((ctx) => Promise.resolve({ ...ctx, immediateReady: true })),
        transition("finish", "finished", guard((ctx) => {
          order.push(ctx.immediateReady ? "finish-after-immediate" : "finish-before-immediate");
          return true;
        }))
      ),
      state("finished")
    );

    const activate = invoke(workflow, "activate");
    const finish = invoke(workflow, "finish");
    await delay(5);

    expect(order).toEqual(["immediate-guard-start"]);

    immediateGate.resolve(true);
    await Promise.all([activate, finish]);

    expect(order).toEqual(["immediate-guard-start", "immediate-guard-done", "finish-after-immediate"]);
    expect(getState(workflow)).toBe("finished");
  });

  it("queued invocations wait for async exit pulses", async () => {
    const exitGate = deferred<{ exited: boolean }>();
    const order: string[] = [];

    const workflow = machine(
      "Queued exit pulse",
      init(initial("idle"), context({ exited: false })),
      state(
        "idle",
        transition("leave", "left", exit(async () => {
          order.push("exit-start");
          const result = await exitGate.promise;
          order.push("exit-done");
          return result;
        }))
      ),
      state(
        "left",
        transition("finish", "finished", guard((ctx) => {
          order.push(ctx.exited ? "finish-after-exit" : "finish-before-exit");
          return true;
        }))
      ),
      state("finished")
    );

    const leave = invoke(workflow, "leave");
    const finish = invoke(workflow, "finish");
    await delay(5);

    expect(order).toEqual(["exit-start"]);

    exitGate.resolve({ exited: true });
    await Promise.all([leave, finish]);

    expect(order).toEqual(["exit-start", "exit-done", "finish-after-exit"]);
    expect(getState(workflow)).toBe("finished");
  });

  it("new invoke after cancel is not affected by old async completion", async () => {
    const firstGate = deferred<{ value: string }>();

    const workflow = machine(
      "Cancel then reinvoke",
      init(initial("idle"), context({ value: "initial" })),
      state("idle", transition("start", "working")),
      state(
        "working",
        transition("reset", "idle"),
        entry(async (_ctx, payload) => payload.gate.promise, "done")
      ),
      state("done", transition("reset", "idle"))
    );

    const first = invoke(workflow, "start", { gate: firstGate });
    cancel(workflow);
    await invoke(workflow, "reset");

    const secondGate = deferred<{ value: string }>();
    const second = invoke(workflow, "start", { gate: secondGate });

    firstGate.resolve({ value: "old" });
    await first;
    secondGate.resolve({ value: "new" });
    await second;

    expect(getState(workflow)).toBe("done");
    expect(workflow.context.value).toBe("new");
  });

  it("supports timeout-controlled async guards", async () => {
    let targetEntryRuns = 0;

    const workflow = machine(
      "Timeout controlled guard",
      init(initial("idle")),
      state(
        "idle",
        transition(
          "submit",
          "effect",
          guard(
            async () => Promise.race([delay(25).then(() => true), delay(5).then(() => false)]),
            "timedOut"
          )
        ),
        transition("timedOut", "timedOut")
      ),
      state("effect", entry(async () => { targetEntryRuns += 1; })),
      state("timedOut")
    );

    await invoke(workflow, "submit");

    expect(getState(workflow)).toBe("timedOut");
    expect(targetEntryRuns).toBe(0);
  });

  it("cancels scheduled transitions without applying delayed effects", async () => {
    let delayedEffects = 0;

    const workflow = machine(
      "Scheduled transition cancellation",
      init(initial("idle")),
      state("idle", transition("timeout", "timedOut")),
      state("timedOut", entry(() => { delayedEffects += 1; }))
    );

    const cancel = invokeAfter(workflow, 10, "timeout");
    cancel();
    await delay(25);

    expect(getState(workflow)).toBe("idle");
    expect(delayedEffects).toBe(0);
  });

  it("restores snapshots with nested machines inside parallel regions", () => {
    const checkoutFlow = machine(
      "Flow",
      init(initial("draft"), context({ step: 1 })),
      state("draft", transition("advance", "review")),
      state("review")
    );
    const checkoutRegion = machine(
      "Checkout",
      init(initial("closed")),
      state("closed", transition("open", "open")),
      state("open", nested(checkoutFlow, "advance"))
    );
    const inventoryRegion = machine(
      "Inventory",
      init(initial("available")),
      state("available", transition("reserve", "reserved")),
      state("reserved")
    );
    const workspace = machine("Workspace", parallel(checkoutRegion, inventoryRegion));

    invoke(workspace, "checkout/open");
    invoke(workspace, "inventory/reserve");

    const snap = snapshot(workspace);
    const restoredFlow = machine("Flow", init(initial("draft"), context({ step: 0 })), state("draft", transition("advance", "review")), state("review"));
    const restoredWorkspace = machine(
      "Workspace",
      parallel(
        machine("Checkout", init(initial("closed")), state("closed", transition("open", "open")), state("open", nested(restoredFlow, "advance"))),
        machine("Inventory", init(initial("available")), state("available", transition("reserve", "reserved")), state("reserved"))
      )
    );

    start(restoredWorkspace, snap);

    expect(getState(restoredWorkspace)).toEqual({ checkout: "open", inventory: "reserved" });
    expect(getState(restoredFlow)).toBe("review");
    expect(restoredFlow.context.step).toBe(1);
  });

  it("restores state and context after async guarded workflows", async () => {
    const workflow = machine(
      "Snapshot async workflow",
      init(initial("idle"), context({ approved: false, attempts: 0 })),
      state("idle", transition("approve", "approved", guard(async () => true))),
      state("approved", entry(async (ctx) => ({ ...ctx, approved: true, attempts: ctx.attempts + 1 })))
    );

    await invoke(workflow, "approve");
    const snap = snapshot(workflow);
    const restored = machine(
      "Snapshot async workflow",
      init(initial("idle"), context({ approved: false, attempts: 0 })),
      state("idle", transition("approve", "approved", guard(async () => true))),
      state("approved", entry(async (ctx) => ({ ...ctx, approved: true, attempts: ctx.attempts + 1 })))
    );

    start(restored, snap);

    expect(getState(restored)).toBe("approved");
    expect(restored.context).toEqual({ approved: true, attempts: 1 });
  });

  it("does not rerun async entry pulses when restoring a snapshot", async () => {
    let entryRuns = 0;
    const workflow = machine(
      "No rerun async entry restore",
      init(initial("idle")),
      state("idle", transition("activate", "active")),
      state("active", entry(async () => { entryRuns += 1; }))
    );

    await invoke(workflow, "activate");
    expect(entryRuns).toBe(1);

    const restored = machine(
      "No rerun async entry restore",
      init(initial("idle")),
      state("idle", transition("activate", "active")),
      state("active", entry(async () => { entryRuns += 1; }))
    );

    start(restored, snapshot(workflow));

    expect(getState(restored)).toBe("active");
    expect(entryRuns).toBe(1);
  });

  it("keeps payment operations idempotent when duplicate events are sent", async () => {
    const gate = deferred<boolean>();
    let captureEffects = 0;

    const payment = machine(
      "Idempotent payment",
      init(initial("authorized"), context({ captureCount: 0 })),
      state(
        "authorized",
        transition(
          "capture",
          "captured",
          guard(async () => gate.promise)
        )
      ),
      state(
        "captured",
        entry(async (ctx) => {
          captureEffects += 1;
          return { ...ctx, captureCount: ctx.captureCount + 1 };
        })
      )
    );

    const first = invoke(payment, "capture");
    const second = invoke(payment, "capture");
    gate.resolve(true);
    const results = await Promise.allSettled([first, second]);

    expect(getState(payment)).toBe("captured");
    expect(payment.context.captureCount).toBe(1);
    expect(captureEffects).toBe(1);
    expect(results[0].status).toBe("fulfilled");
    expect(results[1].status).toBe("rejected");
  });
});

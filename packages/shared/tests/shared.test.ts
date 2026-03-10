import expect from "expect";
import { describe, it } from "mocha";

import { context, entry, init, initial, machine, state, transition } from "../../../lib";
import { createTrackedMachineAdapter, readMachineState } from "../src";

describe("@x-robot/shared", () => {
  it("reads a stable adapter snapshot from a machine", () => {
    const checkoutMachine = machine(
      "Checkout",
      init(initial("idle"), context({ count: 1 })),
      state("idle", transition("submit", "done")),
      state("done")
    );

    const adapterState = readMachineState(checkoutMachine);

    expect(adapterState).toMatchObject({
      id: "checkout",
      title: "Checkout",
      current: "idle",
      context: { count: 1 },
      isAsync: false
    });

    adapterState.context.count = 99;

    expect(checkoutMachine.context.count).toBe(1);
    expect(readMachineState(checkoutMachine).context.count).toBe(1);
  });

  it("tracks synchronous start and invoke wrappers", () => {
    const updates: any[] = [];
    const checkoutMachine = machine(
      "Checkout",
      init(initial("idle"), context({ started: false })),
      state(
        "idle",
        entry((ctx: any) => ({ ...ctx, started: true })),
        transition("submit", "done")
      ),
      state("done")
    );

    const tracked = createTrackedMachineAdapter(checkoutMachine, (snapshot, action) => {
      updates.push({ action, snapshot });
    });

    expect(tracked.start()).toBe(undefined);
    expect(tracked.invoke("submit", { orderId: 1 })).toBe(undefined);
    expect(checkoutMachine.current).toBe("done");
    expect(updates).toHaveLength(2);
    expect(updates[0]).toMatchObject({
      action: { kind: "start", type: "@@x-robot/start" },
      snapshot: { current: "idle", context: { started: true } }
    });
    expect(updates[1]).toMatchObject({
      action: { kind: "invoke", type: "submit", payload: { orderId: 1 } },
      snapshot: { current: "done" }
    });
  });

  it("preserves async invoke behavior while notifying with the resolved snapshot", async () => {
    const updates: any[] = [];
    const checkoutMachine = machine(
      "Async checkout",
      init(initial("idle"), context({ saved: false })),
      state("idle", transition("submit", "saving")),
      state(
        "saving",
        entry(async (ctx: any) => {
          await new Promise((resolve) => setTimeout(resolve, 5));
          return { ...ctx, saved: true };
        })
      )
    );

    const tracked = createTrackedMachineAdapter(checkoutMachine, (snapshot, action) => {
      updates.push({ action, snapshot });
    });

    const result = tracked.invoke("submit", { orderId: 1 });

    expect(result).toBeInstanceOf(Promise);
    await result;
    expect(updates).toHaveLength(1);
    expect(updates[0]).toMatchObject({
      action: { kind: "invoke", type: "submit", payload: { orderId: 1 } },
      snapshot: {
        current: "saving",
        context: { saved: true },
        isAsync: true
      }
    });
  });

  it("tracks invokeAfter and exposes cleanup aliases for future adapters", (done) => {
    const updates: any[] = [];
    const checkoutMachine = machine(
      "Checkout",
      init(initial("idle")),
      state("idle", transition("timeout", "done")),
      state("done")
    );

    const tracked = createTrackedMachineAdapter(checkoutMachine, (snapshot, action) => {
      updates.push({ action, snapshot });
    });

    const cancelFirst = tracked.invokeAfter(10, "timeout");

    expect(typeof cancelFirst).toBe("function");
    expect(typeof tracked.disconnect).toBe("function");
    expect(tracked.cleanup).toBe(tracked.disconnect);

    setTimeout(() => {
      expect(checkoutMachine.current).toBe("done");
      expect(updates).toHaveLength(1);
      expect(updates[0]).toMatchObject({
        action: { kind: "invokeAfter", type: "timeout", timeInMilliseconds: 10 },
        snapshot: { current: "done" }
      });

      const delayedMachine = machine(
        "Delayed checkout",
        init(initial("idle")),
        state("idle", transition("timeout", "done")),
        state("done")
      );

      const delayedTracked = createTrackedMachineAdapter(delayedMachine);
      delayedTracked.invokeAfter(20, "timeout");
      delayedTracked.cleanup();

      setTimeout(() => {
        expect(delayedMachine.current).toBe("idle");
        done();
      }, 35);
    }, 30);
  });

  it("waits for async invokeAfter transitions before notifying", (done) => {
    const updates: any[] = [];
    const checkoutMachine = machine(
      "Async delayed checkout",
      init(initial("idle"), context({ saved: false })),
      state("idle", transition("submit", "saving")),
      state(
        "saving",
        entry(async (ctx: any) => {
          await new Promise((resolve) => setTimeout(resolve, 5));
          return { ...ctx, saved: true };
        })
      )
    );

    const tracked = createTrackedMachineAdapter(checkoutMachine, (snapshot, action) => {
      updates.push({ action, snapshot });
    });

    tracked.invokeAfter(10, "submit", { orderId: 7 });

    setTimeout(() => {
      expect(updates).toHaveLength(1);
      expect(updates[0]).toMatchObject({
        action: {
          kind: "invokeAfter",
          type: "submit",
          payload: { orderId: 7 },
          timeInMilliseconds: 10
        },
        snapshot: {
          current: "saving",
          context: { saved: true },
          isAsync: true
        }
      });
      done();
    }, 30);
  });
});

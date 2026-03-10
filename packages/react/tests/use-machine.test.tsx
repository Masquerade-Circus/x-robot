import React from "react";
import expect from "expect";
import { afterEach, describe, it } from "mocha";
import { act, create, type ReactTestRenderer } from "react-test-renderer";

import {
  context,
  entry,
  init,
  initial,
  machine,
  snapshot as runtimeSnapshot,
  state,
  transition
} from "x-robot";
import { useMachine } from "../src";

type HookValue = ReturnType<typeof useMachine>;

function wait(timeInMilliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeInMilliseconds));
}

function Probe(props: {
  target: Parameters<typeof useMachine>[0];
  options?: Parameters<typeof useMachine>[1];
  onRender(value: HookValue): void;
}) {
  const value = useMachine(props.target, props.options);
  props.onRender(value);

  return React.createElement("output", { "data-current": value.current }, value.current);
}

describe("@x-robot/react useMachine", () => {
  let renderer: ReactTestRenderer | undefined;
  const originalWindow = (globalThis as any).window;

  afterEach(() => {
    if (renderer) {
      renderer.unmount();
      renderer = undefined;
    }

    if (originalWindow === undefined) {
      delete (globalThis as any).window;
    } else {
      (globalThis as any).window = originalWindow;
    }
  });

  it("returns the public contract and autostarts with an optional start snapshot", async () => {
    const checkoutMachine = machine(
      "Checkout",
      init(initial("idle"), context({ started: false, restored: false })),
      state(
        "idle",
        entry((ctx: any) => ({ ...ctx, started: true })),
        transition("submit", "done")
      ),
      state("done")
    );

    const startSnapshot = {
      ...runtimeSnapshot(checkoutMachine),
      current: "done",
      context: { started: false, restored: true }
    };

    let rendered: HookValue | undefined;

    await act(async () => {
      renderer = create(
        React.createElement(Probe, {
          target: checkoutMachine,
          options: {
            autostart: true,
            startSnapshot
          },
          onRender(value: HookValue) {
            rendered = value;
          }
        })
      );
    });

    expect(rendered).toBeDefined();
    expect(rendered).toMatchObject({
      machine: checkoutMachine,
      current: "done",
      context: { started: false, restored: true },
      fatal: undefined,
      isAsync: false
    });
    expect(typeof rendered!.start).toBe("function");
    expect(typeof rendered!.invoke).toBe("function");
    expect(typeof rendered!.invokeAfter).toBe("function");
    expect(typeof rendered!.snapshot).toBe("function");
    expect(typeof rendered!.cleanup).toBe("function");
    expect(rendered!.snapshot()).toMatchObject({
      current: "done",
      context: { started: false, restored: true }
    });
  });

  it("rerenders after wrapped invoke calls", async () => {
    const checkoutMachine = machine(
      "Checkout",
      init(initial("idle"), context({ submitted: false })),
      state("idle", transition("submit", "done")),
      state("done", entry((ctx: any) => ({ ...ctx, submitted: true })))
    );

    let rendered: HookValue | undefined;

    await act(async () => {
      renderer = create(
        React.createElement(Probe, {
          target: checkoutMachine,
          onRender(value: HookValue) {
            rendered = value;
          }
        })
      );
    });

    act(() => {
      rendered!.invoke("submit", { orderId: 1 });
    });

    expect(rendered).toMatchObject({
      current: "done",
      context: { submitted: true }
    });
    expect(rendered!.snapshot()).toMatchObject({
      current: "done",
      context: { submitted: true }
    });
  });

  it("waits for async wrapped invokes before rerendering", async () => {
    const checkoutMachine = machine(
      "Async checkout",
      init(initial("idle"), context({ saved: false })),
      state("idle", transition("submit", "saving")),
      state(
        "saving",
        entry(async (ctx: any) => {
          await wait(5);
          return { ...ctx, saved: true };
        })
      )
    );

    let rendered: HookValue | undefined;

    await act(async () => {
      renderer = create(
        React.createElement(Probe, {
          target: checkoutMachine,
          onRender(value: HookValue) {
            rendered = value;
          }
        })
      );
    });

    await act(async () => {
      await rendered!.invoke("submit", { orderId: 1 });
    });

    expect(rendered).toMatchObject({
      current: "saving",
      context: { saved: true },
      isAsync: true
    });
  });

  it("cleans up pending wrapper work on unmount", async () => {
    const checkoutMachine = machine(
      "Checkout",
      init(initial("idle")),
      state("idle", transition("timeout", "done")),
      state("done")
    );

    let rendered: HookValue | undefined;

    await act(async () => {
      renderer = create(
        React.createElement(Probe, {
          target: checkoutMachine,
          onRender(value: HookValue) {
            rendered = value;
          }
        })
      );
    });

    act(() => {
      rendered!.invokeAfter(10, "timeout");
    });

    await act(async () => {
      renderer!.unmount();
      renderer = undefined;
    });

    await wait(25);

    expect(checkoutMachine.current).toBe("idle");
  });

  it("supports the devtools branch when enabled", async () => {
    const sendCalls: Array<{ action: any; state: any }> = [];

    (globalThis as any).window = {
      __REDUX_DEVTOOLS_EXTENSION__: {
        connect() {
          return {
            init() {},
            send(action: any, state: any) {
              sendCalls.push({ action, state });
            },
            subscribe() {
              return () => undefined;
            }
          };
        }
      }
    };

    const checkoutMachine = machine(
      "Checkout",
      init(initial("idle")),
      state("idle", transition("submit", "done")),
      state("done")
    );

    let rendered: HookValue | undefined;

    await act(async () => {
      renderer = create(
        React.createElement(Probe, {
          target: checkoutMachine,
          options: { devtools: { name: "Checkout" } },
          onRender(value: HookValue) {
            rendered = value;
          }
        })
      );
    });

    act(() => {
      rendered!.invoke("submit");
    });

    expect(rendered).toMatchObject({ current: "done" });
    expect(sendCalls).toHaveLength(1);
    expect(sendCalls[0].action).toEqual({ type: "submit", payload: undefined });
  });

  it("reconnects cleanly when the machine instance changes", async () => {
    const firstMachine = machine(
      "First",
      init(initial("idle")),
      state("idle", transition("submit", "done")),
      state("done")
    );
    const secondMachine = machine(
      "Second",
      init(initial("draft")),
      state("draft", transition("publish", "published")),
      state("published")
    );

    let rendered: HookValue | undefined;

    await act(async () => {
      renderer = create(
        React.createElement(Probe, {
          target: firstMachine,
          onRender(value: HookValue) {
            rendered = value;
          }
        })
      );
    });

    expect(rendered).toMatchObject({ machine: firstMachine, current: "idle" });

    await act(async () => {
      renderer!.update(
        React.createElement(Probe, {
          target: secondMachine,
          onRender(value: HookValue) {
            rendered = value;
          }
        })
      );
    });

    expect(rendered).toMatchObject({ machine: secondMachine, current: "draft" });
  });
});

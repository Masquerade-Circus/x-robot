import expect from "expect";
import { afterEach, describe, it } from "mocha";
import { defineComponent, h, nextTick, type Ref, type ShallowRef } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";

import {
  context,
  entry,
  init,
  initial,
  invoke as runtimeInvoke,
  machine,
  snapshot as runtimeSnapshot,
  state,
  transition
} from "x-robot";
import { useMachine } from "../src";

type HookValue = ReturnType<typeof useMachine>;

interface FakeDevToolsConnection {
  listeners: Array<(message: any) => void>;
  sendCalls: Array<{ action: any; state: any }>;
  init(state: any): void;
  send(action: any, state: any): void;
  subscribe(listener: (message: any) => void): () => void;
  dispatch(message: any): void;
}

function createFakeDevToolsConnection(): FakeDevToolsConnection {
  return {
    listeners: [],
    sendCalls: [],
    init() {},
    send(action: any, state: any) {
      this.sendCalls.push({ action, state });
    },
    subscribe(listener: (message: any) => void) {
      this.listeners.push(listener);

      return () => {
        this.listeners = this.listeners.filter((item) => item !== listener);
      };
    },
    dispatch(message: any) {
      for (const listener of this.listeners) {
        listener(message);
      }
    }
  };
}

function wait(timeInMilliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeInMilliseconds));
}

function isRefLike<T>(value: unknown): value is Ref<T> {
  return !!value && typeof value === "object" && "value" in value;
}

function isShallowRefLike<T>(value: unknown): value is ShallowRef<T> {
  return isRefLike<T>(value);
}

describe("@x-robot/vue useMachine", () => {
  let wrapper: VueWrapper<any> | undefined;
  const originalWindow = globalThis.window;

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = undefined;
    }

    if (originalWindow === undefined) {
      delete (globalThis as { window?: Window }).window;
    } else {
      globalThis.window = originalWindow;
    }
  });

  it("returns the public contract, exposes Vue refs, and autostarts with startSnapshot", async () => {
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

    wrapper = mount(
      defineComponent({
        setup() {
          const value = useMachine(checkoutMachine, {
            autostart: true,
            startSnapshot
          });

          rendered = value;
          return () => h("output", { "data-current": value.current.value }, value.current.value);
        }
      })
    );

    await nextTick();

    expect(rendered).toBeDefined();
    expect(rendered!.machine).toBe(checkoutMachine);
    expect(isRefLike(rendered!.current)).toBe(true);
    expect(isShallowRefLike(rendered!.context)).toBe(true);
    expect(isShallowRefLike(rendered!.fatal)).toBe(true);
    expect(isRefLike(rendered!.isAsync)).toBe(true);
    expect(rendered!.current.value).toBe("done");
    expect(rendered!.context.value).toEqual({ started: false, restored: true });
    expect(rendered!.fatal.value).toBe(undefined);
    expect(rendered!.isAsync.value).toBe(false);
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

  it("updates refs after wrapped synchronous invoke calls", async () => {
    const checkoutMachine = machine(
      "Checkout",
      init(initial("idle"), context({ submitted: false })),
      state("idle", transition("submit", "done")),
      state("done", entry((ctx: any) => ({ ...ctx, submitted: true })))
    );

    let rendered: HookValue | undefined;

    wrapper = mount(
      defineComponent({
        setup() {
          const value = useMachine(checkoutMachine);
          rendered = value;
          return () => h("output", { "data-current": value.current.value }, value.current.value);
        }
      })
    );

    rendered!.invoke("submit", { orderId: 1 });
    await nextTick();

    expect(rendered!.current.value).toBe("done");
    expect(rendered!.context.value).toEqual({ submitted: true });
    expect(rendered!.snapshot()).toMatchObject({
      current: "done",
      context: { submitted: true }
    });
  });

  it("does not guarantee reactive updates for direct external runtime invokes", async () => {
    const checkoutMachine = machine(
      "Checkout",
      init(initial("idle"), context({ submitted: false })),
      state("idle", transition("submit", "done")),
      state("done", entry((ctx: any) => ({ ...ctx, submitted: true })))
    );

    let rendered: HookValue | undefined;

    wrapper = mount(
      defineComponent({
        setup() {
          const value = useMachine(checkoutMachine);
          rendered = value;
          return () => h("output", { "data-current": value.current.value }, value.current.value);
        }
      })
    );

    runtimeInvoke(checkoutMachine, "submit", { orderId: 1 });
    await nextTick();

    expect(checkoutMachine.current).toBe("done");
    expect(rendered!.current.value).toBe("idle");
    expect(rendered!.context.value).toEqual({ submitted: false });
    expect(rendered!.snapshot()).toMatchObject({
      current: "done",
      context: { submitted: true }
    });
  });

  it("waits for async wrapped invokes before updating refs", async () => {
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

    wrapper = mount(
      defineComponent({
        setup() {
          const value = useMachine(checkoutMachine);
          rendered = value;
          return () => h("output", { "data-current": value.current.value }, value.current.value);
        }
      })
    );

    await rendered!.invoke("submit", { orderId: 1 });
    await nextTick();

    expect(rendered!.current.value).toBe("saving");
    expect(rendered!.context.value).toEqual({ saved: true });
    expect(rendered!.isAsync.value).toBe(true);
  });

  it("cleans up pending wrapper work on unmount", async () => {
    const checkoutMachine = machine(
      "Checkout",
      init(initial("idle")),
      state("idle", transition("timeout", "done")),
      state("done")
    );

    let rendered: HookValue | undefined;

    wrapper = mount(
      defineComponent({
        setup() {
          const value = useMachine(checkoutMachine);
          rendered = value;
          return () => h("output", { "data-current": value.current.value }, value.current.value);
        }
      })
    );

    rendered!.invokeAfter(10, "timeout");
    wrapper.unmount();
    wrapper = undefined;

    await wait(25);

    expect(checkoutMachine.current).toBe("idle");
  });

  it("cancels delayed wrapper transitions when the returned cleanup runs", async () => {
    const checkoutMachine = machine(
      "Checkout",
      init(initial("idle")),
      state("idle", transition("timeout", "done")),
      state("done")
    );

    let rendered: HookValue | undefined;

    wrapper = mount(
      defineComponent({
        setup() {
          const value = useMachine(checkoutMachine);
          rendered = value;
          return () => h("output", { "data-current": value.current.value }, value.current.value);
        }
      })
    );

    const cancel = rendered!.invokeAfter(10, "timeout");
    cancel();

    await wait(25);

    expect(checkoutMachine.current).toBe("idle");
    expect(rendered!.current.value).toBe("idle");
  });

  it("supports the devtools branch when enabled", async () => {
    const sendCalls: Array<{ action: any; state: any }> = [];

    globalThis.window = ({
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
    } as unknown) as Window & typeof globalThis;

    const checkoutMachine = machine(
      "Checkout",
      init(initial("idle")),
      state("idle", transition("submit", "done")),
      state("done")
    );

    let rendered: HookValue | undefined;

    wrapper = mount(
      defineComponent({
        setup() {
          const value = useMachine(checkoutMachine, { devtools: { name: "Checkout" } });
          rendered = value;
          return () => h("output", { "data-current": value.current.value }, value.current.value);
        }
      })
    );

    rendered!.invoke("submit");
    await nextTick();

    expect(rendered!.current.value).toBe("done");
    expect(sendCalls).toHaveLength(1);
    expect(sendCalls[0].action).toEqual({ type: "submit", payload: undefined });
  });

  it("updates refs when Redux DevTools restores a snapshot", async () => {
    const fakeConnection = createFakeDevToolsConnection();

    globalThis.window = ({
      __REDUX_DEVTOOLS_EXTENSION__: {
        connect() {
          return fakeConnection;
        }
      }
    } as unknown) as Window & typeof globalThis;

    const checkoutMachine = machine(
      "Checkout",
      init(initial("idle"), context({ step: 1 })),
      state("idle", transition("submit", "done")),
      state("done")
    );

    let rendered: HookValue | undefined;

    wrapper = mount(
      defineComponent({
        setup() {
          const value = useMachine(checkoutMachine, { devtools: { name: "Checkout" } });
          rendered = value;
          return () => h("output", { "data-current": value.current.value }, value.current.value);
        }
      })
    );

    rendered!.invoke("submit");
    await nextTick();
    expect(rendered!.current.value).toBe("done");

    fakeConnection.dispatch({
      type: "DISPATCH",
      payload: { type: "JUMP_TO_STATE" },
      state: JSON.stringify({
        ...rendered!.snapshot(),
        current: "idle",
        context: { step: 99 },
        history: ["State: idle"]
      })
    });
    await nextTick();

    expect(checkoutMachine.current).toBe("idle");
    expect(rendered!.snapshot()).toMatchObject({
      current: "idle",
      context: { step: 99 }
    });
    expect(rendered!.current.value).toBe("idle");
    expect(rendered!.context.value).toEqual({ step: 99 });
  });
});

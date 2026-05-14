import { readFile } from "fs/promises";
import { join } from "path";

import expect from "expect";
import { afterEach, describe, it } from "mocha";

import { context, entry, init, initial, machine, state, transition } from "../lib";
import { connectXRobot } from "../lib/devtools";

interface FakeDevToolsConnection {
  initCalls: any[];
  sendCalls: Array<{ action: any; state: any }>;
  listeners: Array<(message: any) => void>;
  init(state: any): void;
  send(action: any, state: any): void;
  subscribe(listener: (message: any) => void): () => void;
  dispatch(message: any): void;
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: {
      connect(options: Record<string, any>): FakeDevToolsConnection;
    };
  }
}

function createFakeDevToolsConnection(): FakeDevToolsConnection {
  return {
    initCalls: [],
    sendCalls: [],
    listeners: [],
    init(state: any) {
      this.initCalls.push(state);
    },
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

describe("connectXRobot", () => {
  const originalWindow = (globalThis as any).window;

  afterEach(() => {
    if (originalWindow === undefined) {
      delete (globalThis as any).window;
    } else {
      (globalThis as any).window = originalWindow;
    }
  });

  it("returns destructurable wrappers and works without Redux DevTools", () => {
    delete (globalThis as any).window;

    const myMachine = machine(
      "Checkout",
      init(initial("idle")),
      state("idle", transition("submit", "done")),
      state("done")
    );

    const connected = connectXRobot(myMachine, { name: "Checkout" });

    expect(connected.machine).toBe(myMachine);
    expect(typeof connected.start).toBe("function");
    expect(typeof connected.invoke).toBe("function");
    expect(typeof connected.invokeAfter).toBe("function");
    expect(typeof connected.snapshot).toBe("function");

    connected.invoke("submit", { orderId: 1 });

    expect(myMachine.current).toBe("done");
    expect(connected.snapshot()).toMatchObject({
      id: "checkout",
      title: "Checkout",
      current: "done",
      isAsync: false
    });
  });

  it("initializes Redux DevTools and sends wrapped start/invoke actions", () => {
    const fakeConnection = createFakeDevToolsConnection();
    const connectCalls: any[] = [];

    (globalThis as any).window = {
      __REDUX_DEVTOOLS_EXTENSION__: {
        connect(options: Record<string, any>) {
          connectCalls.push(options);
          return fakeConnection;
        }
      }
    };

    const myMachine = machine(
      "Checkout",
      init(initial("idle"), context({ started: false })),
      state(
        "idle",
        entry((ctx: any): any => ({ ...ctx, started: true })),
        transition("submit", "done")
      ),
      state("done")
    );

    const { start, invoke } = connectXRobot(myMachine, { name: "Checkout" });

    expect(connectCalls).toEqual([{ name: "Checkout" }]);
    expect(fakeConnection.initCalls).toHaveLength(1);
    expect(fakeConnection.initCalls[0]).toMatchObject({
      id: "checkout",
      title: "Checkout",
      current: "idle",
      isAsync: false,
      context: { started: false }
    });

    start();
    invoke("submit", { orderId: 1 });

    expect(fakeConnection.sendCalls).toHaveLength(2);
    expect(fakeConnection.sendCalls[0].action).toEqual({
      type: "@@x-robot/start",
      payload: undefined
    });
    expect(fakeConnection.sendCalls[0].state.context).toEqual({ started: true });
    expect(fakeConnection.sendCalls[1].action).toEqual({
      type: "submit",
      payload: { orderId: 1 }
    });
    expect(fakeConnection.sendCalls[1].state.current).toBe("done");
  });

  it("waits for async invokes before sending the resulting state", async () => {
    const fakeConnection = createFakeDevToolsConnection();

    (globalThis as any).window = {
      __REDUX_DEVTOOLS_EXTENSION__: {
        connect() {
          return fakeConnection;
        }
      }
    };

    const myMachine = machine(
      "Async checkout",
      init(initial("idle"), context({ saved: false })),
      state("idle", transition("submit", "saving")),
      state(
        "saving",
        entry(async (ctx) => {
          await new Promise((resolve) => setTimeout(resolve, 5));
          return { ...ctx, saved: true };
        })
      )
    );

    const { invoke } = connectXRobot(myMachine, { name: "Async checkout" });
    const result = invoke("submit", { orderId: 1 });

    expect(result).toBeInstanceOf(Promise);
    await result;

    expect(fakeConnection.sendCalls).toHaveLength(1);
    expect(fakeConnection.sendCalls[0].action).toEqual({
      type: "submit",
      payload: { orderId: 1 }
    });
    expect(fakeConnection.sendCalls[0].state).toMatchObject({
      current: "saving",
      context: { saved: true },
      isAsync: true
    });
  });

  it("exports the devtools subpath from package.json", async () => {
    const packageJson = JSON.parse(
      await readFile(join(process.cwd(), "package.json"), "utf-8")
    );

    expect(packageJson.exports["./devtools"]).toEqual({
      import: "./dist/devtools/index.mjs",
      require: "./dist/devtools/index.js"
    });
  });

  it("restores machine state when Redux DevTools dispatches JUMP_TO_STATE", () => {
    const fakeConnection = createFakeDevToolsConnection();

    (globalThis as any).window = {
      __REDUX_DEVTOOLS_EXTENSION__: {
        connect() {
          return fakeConnection;
        }
      }
    };

    const myMachine = machine(
      "Checkout",
      init(initial("idle"), context({ step: 1 })),
      state("idle", transition("submit", "done")),
      state("done")
    );

    const connected = connectXRobot(myMachine, { name: "Checkout" });
    connected.invoke("submit", { orderId: 1 });

    fakeConnection.dispatch({
      type: "DISPATCH",
      payload: { type: "JUMP_TO_STATE" },
      state: JSON.stringify({
        ...connected.snapshot(),
        current: "idle",
        context: { step: 99 },
        history: ["State: idle"]
      })
    });

    expect(myMachine.current).toBe("idle");
    expect(myMachine.context).toEqual({ step: 99 });
    expect(myMachine.history).toEqual(["State: idle"]);
  });

  it("notifies internal snapshot listeners when Redux DevTools restores state", () => {
    const fakeConnection = createFakeDevToolsConnection();
    const snapshots: any[] = [];

    (globalThis as any).window = {
      __REDUX_DEVTOOLS_EXTENSION__: {
        connect() {
          return fakeConnection;
        }
      }
    };

    const myMachine = machine(
      "Checkout",
      init(initial("idle"), context({ step: 1 })),
      state("idle", transition("submit", "done")),
      state("done")
    );

    const connected = connectXRobot(myMachine, {
      name: "Checkout",
      onSnapshot(snapshot: any) {
        snapshots.push(snapshot);
      }
    });

    connected.invoke("submit");

    fakeConnection.dispatch({
      type: "DISPATCH",
      payload: { type: "JUMP_TO_STATE" },
      state: JSON.stringify({
        ...connected.snapshot(),
        current: "idle",
        context: { step: 99 },
        history: ["State: idle"]
      })
    });

    expect(snapshots).toHaveLength(1);
    expect(snapshots[0]).toMatchObject({
      current: "idle",
      context: { step: 99 }
    });
  });

  it("imports the latest lifted state from Redux DevTools", () => {
    const fakeConnection = createFakeDevToolsConnection();

    (globalThis as any).window = {
      __REDUX_DEVTOOLS_EXTENSION__: {
        connect() {
          return fakeConnection;
        }
      }
    };

    const myMachine = machine(
      "Checkout",
      init(initial("idle"), context({ imported: false })),
      state("idle", transition("submit", "done")),
      state("done")
    );

    const connected = connectXRobot(myMachine, { name: "Checkout" });

    const importedState = {
      ...connected.snapshot(),
      current: "done",
      context: { imported: true },
      history: ["State: idle", "Transition: submit", "State: done"]
    };

    const nextLiftedState = {
      actionsById: {
        0: { action: { type: "@@INIT" } },
        1: { action: { type: "submit" } }
      },
      computedStates: [
        { state: connected.snapshot() },
        { state: JSON.stringify(importedState) }
      ],
      currentStateIndex: 1
    };

    fakeConnection.dispatch({
      type: "DISPATCH",
      payload: {
        type: "IMPORT_STATE",
        nextLiftedState
      }
    });

    expect(myMachine.current).toBe("done");
    expect(myMachine.context).toEqual({ imported: true });
    expect(fakeConnection.sendCalls.at(-1)).toEqual({
      action: null,
      state: nextLiftedState
    });
  });

  it("re-initializes DevTools on COMMIT with the current snapshot", () => {
    const fakeConnection = createFakeDevToolsConnection();

    (globalThis as any).window = {
      __REDUX_DEVTOOLS_EXTENSION__: {
        connect() {
          return fakeConnection;
        }
      }
    };

    const myMachine = machine(
      "Checkout",
      init(initial("idle"), context({ committed: false })),
      state("idle", transition("submit", "done")),
      state("done")
    );

    const connected = connectXRobot(myMachine, { name: "Checkout" });
    connected.invoke("submit", { orderId: 1 });

    fakeConnection.dispatch({
      type: "DISPATCH",
      payload: { type: "COMMIT" }
    });

    expect(fakeConnection.initCalls.at(-1)).toMatchObject({
      current: "done"
    });
  });

  it("restores the original snapshot on RESET and re-initializes DevTools", () => {
    const fakeConnection = createFakeDevToolsConnection();

    (globalThis as any).window = {
      __REDUX_DEVTOOLS_EXTENSION__: {
        connect() {
          return fakeConnection;
        }
      }
    };

    const myMachine = machine(
      "Checkout",
      init(initial("idle"), context({ reset: false })),
      state("idle", transition("submit", "done")),
      state("done")
    );

    const connected = connectXRobot(myMachine, { name: "Checkout" });
    connected.invoke("submit", { orderId: 1 });

    fakeConnection.dispatch({
      type: "DISPATCH",
      payload: { type: "RESET" }
    });

    expect(myMachine.current).toBe("idle");
    expect(myMachine.context).toEqual({ reset: false });
    expect(fakeConnection.initCalls.at(-1)).toMatchObject({
      current: "idle",
      context: { reset: false }
    });
  });

  it("restores the rollback snapshot and re-initializes DevTools", () => {
    const fakeConnection = createFakeDevToolsConnection();

    (globalThis as any).window = {
      __REDUX_DEVTOOLS_EXTENSION__: {
        connect() {
          return fakeConnection;
        }
      }
    };

    const myMachine = machine(
      "Checkout",
      init(initial("idle"), context({ rollback: false })),
      state("idle", transition("submit", "done")),
      state("done")
    );

    const connected = connectXRobot(myMachine, { name: "Checkout" });
    connected.invoke("submit", { orderId: 1 });

    fakeConnection.dispatch({
      type: "DISPATCH",
      payload: { type: "ROLLBACK" },
      state: JSON.stringify({
        ...connected.snapshot(),
        current: "idle",
        context: { rollback: true },
        history: ["State: idle", "Rollback: true"]
      })
    });

    expect(myMachine.current).toBe("idle");
    expect(myMachine.context).toEqual({ rollback: true });
    expect(fakeConnection.initCalls.at(-1)).toMatchObject({
      current: "idle",
      context: { rollback: true }
    });
  });

  it("pauses recording without blocking machine transitions", () => {
    const fakeConnection = createFakeDevToolsConnection();

    (globalThis as any).window = {
      __REDUX_DEVTOOLS_EXTENSION__: {
        connect() {
          return fakeConnection;
        }
      }
    };

    const myMachine = machine(
      "Checkout",
      init(initial("idle")),
      state("idle", transition("review", "review")),
      state("review", transition("submit", "done")),
      state("done")
    );

    const connected = connectXRobot(myMachine, { name: "Checkout" });

    fakeConnection.dispatch({
      type: "DISPATCH",
      payload: { type: "PAUSE_RECORDING", status: true }
    });

    connected.invoke("review");

    expect(myMachine.current).toBe("review");
    expect(fakeConnection.sendCalls).toHaveLength(0);

    fakeConnection.dispatch({
      type: "DISPATCH",
      payload: { type: "PAUSE_RECORDING", status: false }
    });

    connected.invoke("submit");

    expect(myMachine.current).toBe("done");
    expect(fakeConnection.sendCalls).toHaveLength(1);
    expect(fakeConnection.sendCalls[0].action).toEqual({
      type: "submit",
      payload: undefined
    });
  });

  it("locks changes until Redux DevTools unlocks them", () => {
    const fakeConnection = createFakeDevToolsConnection();

    (globalThis as any).window = {
      __REDUX_DEVTOOLS_EXTENSION__: {
        connect() {
          return fakeConnection;
        }
      }
    };

    const myMachine = machine(
      "Checkout",
      init(initial("idle")),
      state("idle", transition("submit", "done")),
      state("done")
    );

    const connected = connectXRobot(myMachine, { name: "Checkout" });

    fakeConnection.dispatch({
      type: "DISPATCH",
      payload: { type: "LOCK_CHANGES", status: true }
    });

    connected.invoke("submit");

    expect(myMachine.current).toBe("idle");
    expect(fakeConnection.sendCalls).toHaveLength(0);

    fakeConnection.dispatch({
      type: "DISPATCH",
      payload: { type: "LOCK_CHANGES", status: false }
    });

    connected.invoke("submit");

    expect(myMachine.current).toBe("done");
    expect(fakeConnection.sendCalls).toHaveLength(1);
    expect(fakeConnection.sendCalls[0].action).toEqual({
      type: "submit",
      payload: undefined
    });
  });

  it("disconnects and cleans up Redux DevTools listeners idempotently", () => {
    const fakeConnection = createFakeDevToolsConnection();

    (globalThis as any).window = {
      __REDUX_DEVTOOLS_EXTENSION__: {
        connect() {
          return fakeConnection;
        }
      }
    };

    const myMachine = machine(
      "Checkout",
      init(initial("idle")),
      state("idle", transition("submit", "done")),
      state("done")
    );

    const connected = connectXRobot(myMachine, { name: "Checkout" });

    expect(fakeConnection.listeners).toHaveLength(1);
    expect(typeof (connected as any).disconnect).toBe("function");
    expect(typeof (connected as any).cleanup).toBe("function");

    (connected as any).disconnect();

    expect(fakeConnection.listeners).toHaveLength(0);

    fakeConnection.dispatch({
      type: "DISPATCH",
      payload: { type: "LOCK_CHANGES", status: true }
    });

    connected.invoke("submit");

    expect(myMachine.current).toBe("done");

    (connected as any).cleanup();
    (connected as any).disconnect();

    expect(fakeConnection.listeners).toHaveLength(0);
  });
});

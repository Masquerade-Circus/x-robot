import { connectXRobot, type XRobotDevtoolsState } from "x-robot/devtools";
import {
  getCurrentInstance,
  getCurrentScope,
  onMounted,
  onScopeDispose,
  ref,
  shallowRef
} from "vue";

import {
  createTrackedMachineAdapter,
  readMachineState,
  type AdapterSnapshot,
  type TrackedMachineAdapter
} from "./internal";
import type {
  UseMachineAdapter,
  UseMachineDevtoolsOptions,
  UseMachineOptions,
  UseMachineResult,
  UseMachineSnapshot
} from "./types";

function isPromiseLike(value: unknown): value is Promise<void> {
  return !!value && typeof (value as Promise<void>).then === "function";
}

function noop(): void {}

function normalizeDevtoolsOptions(
  devtools: UseMachineOptions["devtools"]
): UseMachineDevtoolsOptions | null {
  if (!devtools) {
    return null;
  }

  if (devtools === true) {
    return {};
  }

  return devtools;
}

function getAdapterSnapshot(snapshot: XRobotDevtoolsState): AdapterSnapshot {
  return {
    ...snapshot,
    fatal: snapshot.fatal
      ? {
          name: snapshot.fatal.name,
          message: snapshot.fatal.message
        }
      : undefined
  };
}

function createDevtoolsAdapter(
  machine: TrackedMachineAdapter["machine"],
  options: UseMachineDevtoolsOptions,
  onUpdate: (snapshot: AdapterSnapshot) => void
): UseMachineAdapter {
  let isDisconnected = false;
  const connection = connectXRobot(machine, {
    ...options,
    onSnapshot(snapshot: XRobotDevtoolsState) {
      if (isDisconnected) {
        return;
      }

      onUpdate(getAdapterSnapshot(snapshot));
    }
  });
  const timeouts = new Set<() => void>();

  function notify(): void {
    if (isDisconnected) {
      return;
    }

    onUpdate(getAdapterSnapshot(connection.snapshot()));
  }

  function runTrackedOperation(
    operation: () => Promise<void> | void
  ): Promise<void> | void {
    if (isDisconnected) {
      return;
    }

    const result = operation();

    if (isPromiseLike(result)) {
      return result.then(() => {
        notify();
      });
    }

    notify();
    return result;
  }

  function start(snapshotOrPayload?: unknown): Promise<void> | void {
    return runTrackedOperation(() => connection.start(snapshotOrPayload));
  }

  function invoke(transition: string, payload?: unknown): Promise<void> | void {
    return runTrackedOperation(() => connection.invoke(transition, payload));
  }

  function invokeAfter(
    timeInMilliseconds: number,
    transition: string,
    payload?: unknown
  ): () => void {
    if (isDisconnected) {
      return noop;
    }

    let cancelTimeout = noop;
    const timeoutId = setTimeout(() => {
      timeouts.delete(cancelTimeout);

      runTrackedOperation(() => connection.invoke(transition, payload));
    }, timeInMilliseconds);

    cancelTimeout = () => {
      clearTimeout(timeoutId);
      timeouts.delete(cancelTimeout);
    };

    timeouts.add(cancelTimeout);
    return cancelTimeout;
  }

  function disconnect(): void {
    if (isDisconnected) {
      return;
    }

    isDisconnected = true;

    for (const cancelTimeout of Array.from(timeouts)) {
      cancelTimeout();
    }

    timeouts.clear();
    connection.disconnect();
  }

  return {
    machine,
    start,
    invoke,
    invokeAfter,
    snapshot: () => getAdapterSnapshot(connection.snapshot()),
    disconnect,
    cleanup: disconnect
  };
}

function createAdapter(
  machine: TrackedMachineAdapter["machine"],
  devtools: UseMachineOptions["devtools"],
  onUpdate: (snapshot: AdapterSnapshot) => void
): UseMachineAdapter {
  const normalizedDevtools = normalizeDevtoolsOptions(devtools);

  if (normalizedDevtools) {
    return createDevtoolsAdapter(machine, normalizedDevtools, onUpdate);
  }

  return createTrackedMachineAdapter(machine, onUpdate);
}

export function useMachine(
  machine: TrackedMachineAdapter["machine"],
  options: UseMachineOptions = {}
): UseMachineResult {
  const initialSnapshot = readMachineState(machine);
  const current = ref(initialSnapshot.current);
  const context = shallowRef(initialSnapshot.context);
  const fatal = shallowRef(initialSnapshot.fatal);
  const isAsync = ref(initialSnapshot.isAsync);
  const { autostart = false, startSnapshot } = options;

  function syncSnapshot(snapshot: UseMachineSnapshot): UseMachineSnapshot {
    current.value = snapshot.current;
    context.value = snapshot.context;
    fatal.value = snapshot.fatal;
    isAsync.value = snapshot.isAsync;
    return snapshot;
  }

  const adapter = createAdapter(machine, options.devtools, (snapshot) => {
    syncSnapshot(snapshot);
  });

  let isCleanedUp = false;
  let autostarted = false;

  function start(snapshotOrPayload?: unknown): Promise<void> | void {
    const nextValue = snapshotOrPayload === undefined ? startSnapshot : snapshotOrPayload;
    return adapter.start(nextValue);
  }

  function invoke(transition: string, payload?: unknown): Promise<void> | void {
    return adapter.invoke(transition, payload);
  }

  function invokeAfter(
    timeInMilliseconds: number,
    transition: string,
    payload?: unknown
  ): () => void {
    return adapter.invokeAfter(timeInMilliseconds, transition, payload);
  }

  function snapshot(): UseMachineSnapshot {
    return adapter.snapshot();
  }

  function cleanup(): void {
    if (isCleanedUp) {
      return;
    }

    isCleanedUp = true;
    adapter.cleanup();
  }

  syncSnapshot(adapter.snapshot());

  if (getCurrentScope()) {
    onScopeDispose(cleanup);
  }

  if (autostart) {
    const instance = getCurrentInstance();

    if (instance) {
      onMounted(() => {
        if (autostarted) {
          return;
        }

        autostarted = true;
        start();
      });
    } else if (!autostarted) {
      autostarted = true;
      start();
    }
  }

  return {
    machine,
    current,
    context,
    fatal,
    isAsync,
    start,
    invoke,
    invokeAfter,
    snapshot,
    cleanup
  };
}

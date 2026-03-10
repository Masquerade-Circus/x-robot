import {
  createTrackedMachineAdapter,
  readMachineState,
  type AdapterSnapshot,
  type TrackedMachineAdapter
} from "./internal";
import { connectXRobot, type XRobotDevtoolsState } from "x-robot/devtools";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DependencyList
} from "react";

import type {
  UseMachineAdapter,
  UseMachineDevtoolsOptions,
  UseMachineOptions,
  UseMachineResult
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

function createDevtoolsAdapter(
  machine: TrackedMachineAdapter["machine"],
  options: UseMachineDevtoolsOptions,
  onUpdate: (snapshot: AdapterSnapshot) => void
): UseMachineAdapter {
  const connection = connectXRobot(machine, options);
  const timeouts = new Set<() => void>();
  let isDisconnected = false;

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

function useStableAdapter(
  machine: TrackedMachineAdapter["machine"],
  devtools: UseMachineOptions["devtools"],
  onUpdate: (snapshot: AdapterSnapshot) => void
): UseMachineAdapter {
  const normalizedDevtools = normalizeDevtoolsOptions(devtools);
  const dependencies: DependencyList = [
    machine,
    Boolean(normalizedDevtools),
    normalizedDevtools?.name
  ];

  return useMemo(() => {
    if (normalizedDevtools) {
      return createDevtoolsAdapter(machine, normalizedDevtools, onUpdate);
    }

    return createTrackedMachineAdapter(machine, (snapshot) => {
      onUpdate(snapshot);
    });
  }, dependencies);
}

export function useMachine(
  machine: TrackedMachineAdapter["machine"],
  options: UseMachineOptions = {}
): UseMachineResult {
  const mountedRef = useRef(true);
  const [currentSnapshot, setCurrentSnapshot] = useState<AdapterSnapshot>(() => {
    return readMachineState(machine);
  });
  const adapter = useStableAdapter(machine, options.devtools, (snapshot) => {
    if (mountedRef.current) {
      setCurrentSnapshot(snapshot);
    }
  });
  const { autostart = false, startSnapshot } = options;
  const autostartedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    setCurrentSnapshot(adapter.snapshot());
    autostartedRef.current = false;

    return () => {
      mountedRef.current = false;
      adapter.cleanup();
    };
  }, [adapter]);

  const start = useCallback(
    (snapshotOrPayload?: unknown): Promise<void> | void => {
      const nextValue = snapshotOrPayload === undefined ? startSnapshot : snapshotOrPayload;

      return adapter.start(nextValue);
    },
    [adapter, startSnapshot]
  );

  useEffect(() => {
    if (!autostart || autostartedRef.current) {
      return;
    }

    autostartedRef.current = true;
    start();
  }, [autostart, start]);

  const invoke = useCallback(
    (transition: string, payload?: unknown): Promise<void> | void => {
      return adapter.invoke(transition, payload);
    },
    [adapter]
  );

  const invokeAfter = useCallback(
    (timeInMilliseconds: number, transition: string, payload?: unknown): (() => void) => {
      return adapter.invokeAfter(timeInMilliseconds, transition, payload);
    },
    [adapter]
  );

  const snapshot = useCallback((): AdapterSnapshot => {
    return adapter.snapshot();
  }, [adapter]);

  const cleanup = useCallback((): void => {
    adapter.cleanup();
  }, [adapter]);

  return {
    machine,
    current: currentSnapshot.current,
    context: currentSnapshot.context,
    fatal: currentSnapshot.fatal,
    isAsync: currentSnapshot.isAsync,
    start,
    invoke,
    invokeAfter,
    snapshot,
    cleanup
  };
}

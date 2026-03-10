// src/internal/snapshot.ts
import { snapshot as runtimeSnapshot } from "x-robot";
function getFatalState(machine) {
  if (!(machine.fatal instanceof Error)) {
    return void 0;
  }
  return {
    name: machine.fatal.name,
    message: machine.fatal.message
  };
}
function readMachineState(machine) {
  return {
    ...runtimeSnapshot(machine),
    id: machine.id,
    title: machine.title,
    isAsync: machine.isAsync,
    fatal: getFatalState(machine)
  };
}

// src/internal/tracked.ts
import {
  invoke as runtimeInvoke,
  start as runtimeStart
} from "x-robot";
function isPromiseLike(value) {
  return !!value && typeof value.then === "function";
}
function isMachineSnapshot(value) {
  return !!value && typeof value === "object" && "current" in value && "context" in value && "history" in value;
}
function noop() {
}
function createTrackedMachineAdapter(machine, onUpdate = noop) {
  let isDisconnected = false;
  const timeouts = /* @__PURE__ */ new Set();
  function notify(action) {
    if (isDisconnected) {
      return;
    }
    onUpdate(readMachineState(machine), action);
  }
  function runTrackedOperation(action, operation) {
    if (isDisconnected) {
      return;
    }
    const result = operation();
    if (isPromiseLike(result)) {
      return result.then(() => {
        notify(action);
      });
    }
    notify(action);
    return result;
  }
  function start(snapshotOrPayload) {
    return runTrackedOperation({
      kind: "start",
      type: isMachineSnapshot(snapshotOrPayload) ? "@@x-robot/restore" : "@@x-robot/start",
      payload: snapshotOrPayload
    }, () => runtimeStart(machine, snapshotOrPayload));
  }
  function invoke(transition, payload) {
    return runTrackedOperation({
      kind: "invoke",
      type: transition,
      payload
    }, () => runtimeInvoke(machine, transition, payload));
  }
  function invokeAfter(timeInMilliseconds, transition, payload) {
    if (isDisconnected) {
      return noop;
    }
    let cancelTimeout = noop;
    const timeoutId = setTimeout(() => {
      timeouts.delete(cancelTimeout);
      runTrackedOperation({
        kind: "invokeAfter",
        type: transition,
        payload,
        timeInMilliseconds
      }, () => runtimeInvoke(machine, transition, payload));
    }, timeInMilliseconds);
    cancelTimeout = () => {
      clearTimeout(timeoutId);
      timeouts.delete(cancelTimeout);
    };
    timeouts.add(cancelTimeout);
    return cancelTimeout;
  }
  function disconnect() {
    if (isDisconnected) {
      return;
    }
    isDisconnected = true;
    for (const cancelTimeout of Array.from(timeouts)) {
      cancelTimeout();
    }
    timeouts.clear();
  }
  return {
    machine,
    start,
    invoke,
    invokeAfter,
    snapshot: () => readMachineState(machine),
    disconnect,
    cleanup: disconnect
  };
}

// src/useMachine.ts
import { connectXRobot } from "x-robot/devtools";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
function isPromiseLike2(value) {
  return !!value && typeof value.then === "function";
}
function noop2() {
}
function normalizeDevtoolsOptions(devtools) {
  if (!devtools) {
    return null;
  }
  if (devtools === true) {
    return {};
  }
  return devtools;
}
function createDevtoolsAdapter(machine, options, onUpdate) {
  const connection = connectXRobot(machine, options);
  const timeouts = /* @__PURE__ */ new Set();
  let isDisconnected = false;
  function notify() {
    if (isDisconnected) {
      return;
    }
    onUpdate(getAdapterSnapshot(connection.snapshot()));
  }
  function runTrackedOperation(operation) {
    if (isDisconnected) {
      return;
    }
    const result = operation();
    if (isPromiseLike2(result)) {
      return result.then(() => {
        notify();
      });
    }
    notify();
    return result;
  }
  function start(snapshotOrPayload) {
    return runTrackedOperation(() => connection.start(snapshotOrPayload));
  }
  function invoke(transition, payload) {
    return runTrackedOperation(() => connection.invoke(transition, payload));
  }
  function invokeAfter(timeInMilliseconds, transition, payload) {
    if (isDisconnected) {
      return noop2;
    }
    let cancelTimeout = noop2;
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
  function disconnect() {
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
function getAdapterSnapshot(snapshot) {
  return {
    ...snapshot,
    fatal: snapshot.fatal ? {
      name: snapshot.fatal.name,
      message: snapshot.fatal.message
    } : void 0
  };
}
function useStableAdapter(machine, devtools, onUpdate) {
  const normalizedDevtools = normalizeDevtoolsOptions(devtools);
  const dependencies = [
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
function useMachine(machine, options = {}) {
  const mountedRef = useRef(true);
  const [currentSnapshot, setCurrentSnapshot] = useState(() => {
    return readMachineState(machine);
  });
  const adapter = useStableAdapter(machine, options.devtools, (snapshot2) => {
    if (mountedRef.current) {
      setCurrentSnapshot(snapshot2);
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
  const start = useCallback((snapshotOrPayload) => {
    const nextValue = snapshotOrPayload === void 0 ? startSnapshot : snapshotOrPayload;
    return adapter.start(nextValue);
  }, [adapter, startSnapshot]);
  useEffect(() => {
    if (!autostart || autostartedRef.current) {
      return;
    }
    autostartedRef.current = true;
    start();
  }, [autostart, start]);
  const invoke = useCallback((transition, payload) => {
    return adapter.invoke(transition, payload);
  }, [adapter]);
  const invokeAfter = useCallback((timeInMilliseconds, transition, payload) => {
    return adapter.invokeAfter(timeInMilliseconds, transition, payload);
  }, [adapter]);
  const snapshot = useCallback(() => {
    return adapter.snapshot();
  }, [adapter]);
  const cleanup = useCallback(() => {
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
export {
  useMachine
};

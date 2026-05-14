// src/useMachine.ts
import { connectXRobot } from "x-robot/devtools";
import {
  getCurrentInstance,
  getCurrentScope,
  onMounted,
  onScopeDispose,
  ref,
  shallowRef
} from "vue";

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
function getAdapterSnapshot(snapshot) {
  return {
    ...snapshot,
    fatal: snapshot.fatal ? {
      name: snapshot.fatal.name,
      message: snapshot.fatal.message
    } : void 0
  };
}
function createDevtoolsAdapter(machine, options, onUpdate) {
  let isDisconnected = false;
  const connection = connectXRobot(machine, {
    ...options,
    onSnapshot(snapshot) {
      if (isDisconnected) {
        return;
      }
      onUpdate(getAdapterSnapshot(snapshot));
    }
  });
  const timeouts = /* @__PURE__ */ new Set();
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
function createAdapter(machine, devtools, onUpdate) {
  const normalizedDevtools = normalizeDevtoolsOptions(devtools);
  if (normalizedDevtools) {
    return createDevtoolsAdapter(machine, normalizedDevtools, onUpdate);
  }
  return createTrackedMachineAdapter(machine, onUpdate);
}
function useMachine(machine, options = {}) {
  const initialSnapshot = readMachineState(machine);
  const current = ref(initialSnapshot.current);
  const context = shallowRef(initialSnapshot.context);
  const fatal = shallowRef(initialSnapshot.fatal);
  const isAsync = ref(initialSnapshot.isAsync);
  const { autostart = false, startSnapshot } = options;
  function syncSnapshot(snapshot2) {
    current.value = snapshot2.current;
    context.value = snapshot2.context;
    fatal.value = snapshot2.fatal;
    isAsync.value = snapshot2.isAsync;
    return snapshot2;
  }
  const adapter = createAdapter(machine, options.devtools, (snapshot2) => {
    syncSnapshot(snapshot2);
  });
  let isCleanedUp = false;
  let autostarted = false;
  function start(snapshotOrPayload) {
    const nextValue = snapshotOrPayload === void 0 ? startSnapshot : snapshotOrPayload;
    return adapter.start(nextValue);
  }
  function invoke(transition, payload) {
    return adapter.invoke(transition, payload);
  }
  function invokeAfter(timeInMilliseconds, transition, payload) {
    return adapter.invokeAfter(timeInMilliseconds, transition, payload);
  }
  function snapshot() {
    return adapter.snapshot();
  }
  function cleanup() {
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
export {
  useMachine
};

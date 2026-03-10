"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  useMachine: () => useMachine
});
module.exports = __toCommonJS(src_exports);

// src/internal/snapshot.ts
var import_x_robot = require("x-robot");
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
    ...(0, import_x_robot.snapshot)(machine),
    id: machine.id,
    title: machine.title,
    isAsync: machine.isAsync,
    fatal: getFatalState(machine)
  };
}

// src/internal/tracked.ts
var import_x_robot2 = require("x-robot");
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
    }, () => (0, import_x_robot2.start)(machine, snapshotOrPayload));
  }
  function invoke(transition, payload) {
    return runTrackedOperation({
      kind: "invoke",
      type: transition,
      payload
    }, () => (0, import_x_robot2.invoke)(machine, transition, payload));
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
      }, () => (0, import_x_robot2.invoke)(machine, transition, payload));
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
var import_devtools = require("x-robot/devtools");
var import_react = require("react");
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
  const connection = (0, import_devtools.connectXRobot)(machine, options);
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
  return (0, import_react.useMemo)(() => {
    if (normalizedDevtools) {
      return createDevtoolsAdapter(machine, normalizedDevtools, onUpdate);
    }
    return createTrackedMachineAdapter(machine, (snapshot) => {
      onUpdate(snapshot);
    });
  }, dependencies);
}
function useMachine(machine, options = {}) {
  const mountedRef = (0, import_react.useRef)(true);
  const [currentSnapshot, setCurrentSnapshot] = (0, import_react.useState)(() => {
    return readMachineState(machine);
  });
  const adapter = useStableAdapter(machine, options.devtools, (snapshot2) => {
    if (mountedRef.current) {
      setCurrentSnapshot(snapshot2);
    }
  });
  const { autostart = false, startSnapshot } = options;
  const autostartedRef = (0, import_react.useRef)(false);
  (0, import_react.useEffect)(() => {
    mountedRef.current = true;
    setCurrentSnapshot(adapter.snapshot());
    autostartedRef.current = false;
    return () => {
      mountedRef.current = false;
      adapter.cleanup();
    };
  }, [adapter]);
  const start = (0, import_react.useCallback)((snapshotOrPayload) => {
    const nextValue = snapshotOrPayload === void 0 ? startSnapshot : snapshotOrPayload;
    return adapter.start(nextValue);
  }, [adapter, startSnapshot]);
  (0, import_react.useEffect)(() => {
    if (!autostart || autostartedRef.current) {
      return;
    }
    autostartedRef.current = true;
    start();
  }, [autostart, start]);
  const invoke = (0, import_react.useCallback)((transition, payload) => {
    return adapter.invoke(transition, payload);
  }, [adapter]);
  const invokeAfter = (0, import_react.useCallback)((timeInMilliseconds, transition, payload) => {
    return adapter.invokeAfter(timeInMilliseconds, transition, payload);
  }, [adapter]);
  const snapshot = (0, import_react.useCallback)(() => {
    return adapter.snapshot();
  }, [adapter]);
  const cleanup = (0, import_react.useCallback)(() => {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useMachine
});

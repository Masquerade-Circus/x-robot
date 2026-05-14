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

// src/useMachine.ts
var import_devtools = require("x-robot/devtools");
var import_vue = require("vue");

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
  const connection = (0, import_devtools.connectXRobot)(machine, {
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
  const current = (0, import_vue.ref)(initialSnapshot.current);
  const context = (0, import_vue.shallowRef)(initialSnapshot.context);
  const fatal = (0, import_vue.shallowRef)(initialSnapshot.fatal);
  const isAsync = (0, import_vue.ref)(initialSnapshot.isAsync);
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
  if ((0, import_vue.getCurrentScope)()) {
    (0, import_vue.onScopeDispose)(cleanup);
  }
  if (autostart) {
    const instance = (0, import_vue.getCurrentInstance)();
    if (instance) {
      (0, import_vue.onMounted)(() => {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useMachine
});

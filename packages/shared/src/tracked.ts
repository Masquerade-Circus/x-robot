import {
  invoke as runtimeInvoke,
  start as runtimeStart,
  type MachineSnapshot
} from "../../../lib/machine/invoke";
import type { Machine } from "../../../lib/machine/interfaces";

import { readMachineState } from "./snapshot";
import type {
  MachineUpdateListener,
  TrackedMachineAction,
  TrackedMachineAdapter
} from "./types";

function isPromiseLike(value: unknown): value is Promise<void> {
  return !!value && typeof (value as Promise<void>).then === "function";
}

function isMachineSnapshot(value: unknown): value is MachineSnapshot {
  return (
    !!value &&
    typeof value === "object" &&
    "current" in value &&
    "context" in value &&
    "history" in value
  );
}

function noop(): void {}

export function createTrackedMachineAdapter(
  machine: Machine,
  onUpdate: MachineUpdateListener = noop
): TrackedMachineAdapter {
  let isDisconnected = false;
  const timeouts = new Set<() => void>();

  function notify(action: TrackedMachineAction): void {
    if (isDisconnected) {
      return;
    }

    onUpdate(readMachineState(machine), action);
  }

  function runTrackedOperation(
    action: TrackedMachineAction,
    operation: () => Promise<void> | void
  ): Promise<void> | void {
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

  function start(snapshotOrPayload?: MachineSnapshot | unknown): Promise<void> | void {
    return runTrackedOperation(
      {
        kind: "start",
        type: isMachineSnapshot(snapshotOrPayload)
          ? "@@x-robot/restore"
          : "@@x-robot/start",
        payload: snapshotOrPayload
      },
      () => runtimeStart(machine, snapshotOrPayload)
    );
  }

  function invoke(transition: string, payload?: unknown): Promise<void> | void {
    return runTrackedOperation(
      {
        kind: "invoke",
        type: transition,
        payload
      },
      () => runtimeInvoke(machine, transition, payload)
    );
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

      runTrackedOperation(
        {
          kind: "invokeAfter",
          type: transition,
          payload,
          timeInMilliseconds
        },
        () => runtimeInvoke(machine, transition, payload)
      );
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

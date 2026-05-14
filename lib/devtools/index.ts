/** @module x-robot/devtools */
import { invoke as baseInvoke, snapshot as baseSnapshot, start as baseStart, MachineSnapshot } from "../machine/invoke";
import { Machine } from "../machine/interfaces";

/** Options passed to the Redux DevTools connection. */
export interface XRobotDevtoolsOptions {
  /** Name shown for this machine connection in the Redux DevTools monitor. */
  name?: string;
  [key: string]: any;
}

interface InternalXRobotDevtoolsOptions extends XRobotDevtoolsOptions {
  onSnapshot?(state: XRobotDevtoolsState): void;
}

/** Serializable fatal error metadata exposed in the devtools snapshot. */
export interface XRobotDevtoolsFatalState {
  name: string;
  message: string;
}

/** Machine snapshot sent to and restored from Redux DevTools. */
export interface XRobotDevtoolsState extends MachineSnapshot {
  /** Stable machine id used by X-Robot internally. */
  id: string;
  /** Optional machine title shown in docs and visual tooling. */
  title: string | null;
  /** Whether the machine currently runs async transitions or pulses. */
  isAsync: boolean;
  /** Fatal error metadata when the machine is in a fatal condition. */
  fatal?: XRobotDevtoolsFatalState;
}

/** Wrapped machine controls that keep Redux DevTools in sync. */
export interface XRobotDevtoolsConnection {
  /** The original machine instance bound to this devtools connection. */
  machine: Machine;
  /** Starts the machine or restores it from a snapshot. */
  start(snapshotOrPayload?: MachineSnapshot | any): Promise<void> | void;
  /** Invokes a transition through the tracked devtools wrapper. */
  invoke(transition: string, payload?: any): Promise<void> | void;
  /** Schedules a tracked delayed invocation and returns a cancel function. */
  invokeAfter(
    timeInMilliseconds: number,
    transition: string,
    payload?: any
  ): () => void;
  /** Returns the current serialized devtools snapshot for the machine. */
  snapshot(): XRobotDevtoolsState;
  /** Unsubscribes the adapter from Redux DevTools messages. */
  disconnect(): void;
  /** Alias of `disconnect()` for host cleanup lifecycles. */
  cleanup(): void;
}

interface ReduxDevToolsConnection {
  init(state: any): void;
  send(action: any, state: any): void;
  subscribe?(listener: (message: any) => void): () => void;
}

interface ReduxDevToolsExtension {
  connect(options: Record<string, any>): ReduxDevToolsConnection;
}

function getDevTools(): ReduxDevToolsExtension | null {
  const globalWindow = (globalThis as {
    window?: { __REDUX_DEVTOOLS_EXTENSION__?: ReduxDevToolsExtension };
  }).window;

  if (globalWindow && globalWindow.__REDUX_DEVTOOLS_EXTENSION__) {
    return globalWindow.__REDUX_DEVTOOLS_EXTENSION__;
  }

  return null;
}

function isPromiseLike(value: unknown): value is Promise<void> {
  return !!value && typeof (value as Promise<void>).then === "function";
}

function isMachineSnapshot(value: unknown): value is MachineSnapshot {
  return !!value && typeof value === "object" && "current" in value;
}

function parseDevtoolsState<T = any>(value: unknown): T | null {
  if (typeof value === "string") {
    return JSON.parse(value) as T;
  }

  if (value && typeof value === "object") {
    return value as unknown as T;
  }

  return null;
}

function reviveFatalState(
  fatal: XRobotDevtoolsFatalState | undefined
): Error | undefined {
  if (!fatal) {
    return undefined;
  }

  const error = new Error(fatal.message);
  error.name = fatal.name;
  return error;
}

function getFatalState(machine: Machine): XRobotDevtoolsFatalState | undefined {
  if (!(machine.fatal instanceof Error)) {
    return undefined;
  }

  return {
    name: machine.fatal.name,
    message: machine.fatal.message
  };
}

/** Build the serialized snapshot used by the Redux DevTools monitor. */
export function getXRobotDevtoolsState(machine: Machine): XRobotDevtoolsState {
  return {
    ...baseSnapshot(machine),
    id: machine.id,
    title: machine.title,
    isAsync: machine.isAsync,
    fatal: getFatalState(machine)
  };
}

function restoreMachineFromDevtoolsState(
  machine: Machine,
  stateValue: unknown
): void {
  const parsedState = parseDevtoolsState<XRobotDevtoolsState>(stateValue);

  if (!parsedState || !isMachineSnapshot(parsedState)) {
    return;
  }

  baseStart(machine, parsedState);
  machine.fatal = reviveFatalState(parsedState.fatal);
}

function getBooleanStatus(payload: { status?: boolean }, currentValue: boolean): boolean {
  return typeof payload.status === "boolean" ? payload.status : !currentValue;
}

/** Connect a machine to the Redux DevTools Extension with tracked wrappers. */
export function connectXRobot(
  machine: Machine,
  options: XRobotDevtoolsOptions = {}
): XRobotDevtoolsConnection {
  const devTools = getDevTools();
  const { name: optionName, onSnapshot, ...devtoolsOptions } = options as InternalXRobotDevtoolsOptions;
  const name = optionName || machine.title || machine.id || "x-robot";
  const connection = devTools ? devTools.connect({ name, ...devtoolsOptions }) : null;
  const initialSnapshot = getXRobotDevtoolsState(machine);
  let isRecordingPaused = false;
  let isChangesLocked = false;
  let unsubscribeListener: (() => void) | undefined;
  let isDisconnected = false;

  function emitSnapshot(): void {
    if (onSnapshot) {
      onSnapshot(getXRobotDevtoolsState(machine));
    }
  }

  if (connection) {
    connection.init(initialSnapshot);
  }

  if (connection && connection.subscribe) {
    unsubscribeListener = connection.subscribe((message: any) => {
      if (message.type !== "DISPATCH" || !message.payload) {
        return;
      }

      if (
        message.payload.type === "JUMP_TO_STATE" ||
        message.payload.type === "JUMP_TO_ACTION"
      ) {
        restoreMachineFromDevtoolsState(machine, message.state);
        emitSnapshot();
        return;
      }

      if (message.payload.type === "COMMIT") {
        connection.init(getXRobotDevtoolsState(machine));
        return;
      }

      if (message.payload.type === "RESET") {
        restoreMachineFromDevtoolsState(machine, initialSnapshot);
        connection.init(getXRobotDevtoolsState(machine));
        emitSnapshot();
        return;
      }

      if (message.payload.type === "ROLLBACK") {
        restoreMachineFromDevtoolsState(machine, message.state);
        connection.init(getXRobotDevtoolsState(machine));
        emitSnapshot();
        return;
      }

      if (message.payload.type === "PAUSE_RECORDING") {
        isRecordingPaused = getBooleanStatus(message.payload, isRecordingPaused);
        return;
      }

      if (message.payload.type === "LOCK_CHANGES") {
        isChangesLocked = getBooleanStatus(message.payload, isChangesLocked);
        return;
      }

      if (message.payload.type === "IMPORT_STATE") {
        const nextLiftedState = message.payload.nextLiftedState;
        const currentStateIndex = nextLiftedState?.currentStateIndex;
        const computedStates = nextLiftedState?.computedStates;
        const selectedState =
          typeof currentStateIndex === "number" && computedStates?.[currentStateIndex]
            ? computedStates[currentStateIndex].state
            : computedStates?.[computedStates.length - 1]?.state;

        restoreMachineFromDevtoolsState(machine, selectedState);
        connection.send(null, nextLiftedState);
        emitSnapshot();
      }
    });
  }

  function disconnect(): void {
    if (isDisconnected) {
      return;
    }

    isDisconnected = true;

    if (unsubscribeListener) {
      unsubscribeListener();
      unsubscribeListener = undefined;
    }
  }

  function send(action: { type: string; payload: any }) {
    if (connection && !isRecordingPaused) {
      connection.send(action, getXRobotDevtoolsState(machine));
    }
  }

  function runTrackedOperation(
    action: { type: string; payload: any },
    operation: () => Promise<void> | void
  ): Promise<void> | void {
    if (isChangesLocked) {
      return;
    }

    const result = operation();

    if (isPromiseLike(result)) {
      return result.then(() => {
        send(action);
      });
    }

    send(action);
    return result;
  }

  function start(snapshotOrPayload?: MachineSnapshot | any): Promise<void> | void {
    const actionType = isMachineSnapshot(snapshotOrPayload)
      ? "@@x-robot/restore"
      : "@@x-robot/start";

    return runTrackedOperation(
      { type: actionType, payload: snapshotOrPayload },
      () => baseStart(machine, snapshotOrPayload)
    );
  }

  function invoke(transition: string, payload?: any): Promise<void> | void {
    return runTrackedOperation(
      { type: transition, payload },
      () => baseInvoke(machine, transition, payload)
    );
  }

  function invokeAfter(
    timeInMilliseconds: number,
    transition: string,
    payload?: any
  ): () => void {
    if (isChangesLocked) {
      return () => undefined;
    }

    send({
      type: "@@x-robot/invokeAfter",
      payload: {
        timeInMilliseconds,
        transition,
        payload
      }
    });

    const timeoutId = setTimeout(() => {
      invoke(transition, payload);
    }, timeInMilliseconds);

    return () => clearTimeout(timeoutId);
  }

  return {
    machine,
    start,
    invoke,
    invokeAfter,
    snapshot: () => getXRobotDevtoolsState(machine),
    disconnect,
    cleanup: disconnect
  };
}

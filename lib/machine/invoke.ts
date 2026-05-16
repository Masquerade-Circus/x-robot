/** @module x-robot */
import {
  HistoryType,
  Machine,
  PulseDirective,
  START_EVENT,
  StateDirective,
  TransitionDirective
} from "./interfaces";
import {
  canMakeTransition,
  deepCloneUnfreeze,
  deepFreeze,
  hasTransition,
  isEntry,
  isGuard,
  isNestedGuard,
  isNestedMachineWithTransitionDirective,
  isNestedTransition,
  isParallelTransition,
  isValidObject,
  isValidString
} from "../utils/utils";

interface InvocationJob {
  transition: string;
  payload?: any;
  resolve: () => void;
  reject: (error: unknown) => void;
}

interface MachineRuntime {
  running: boolean;
  activeToken?: number;
  nextToken: number;
  queue: InvocationJob[];
}

const runtimes = new WeakMap<Machine, MachineRuntime>();

function getRuntime(machine: Machine): MachineRuntime {
  let runtime = runtimes.get(machine);
  if (!runtime) {
    runtime = {
      running: false,
      activeToken: undefined,
      nextToken: 0,
      queue: []
    };
    runtimes.set(machine, runtime);
  }

  return runtime;
}

function isCurrentInvocation(machine: Machine, token: number): boolean {
  return getRuntime(machine).activeToken === token;
}

function isPromiseLike<T = unknown>(value: unknown): value is Promise<T> {
  return !!value && typeof (value as Promise<T>).then === "function";
}

function cancelledInvocationError(): Error {
  return new Error("Invocation cancelled");
}

function addToHistory(machine: Machine, entry: string): void {
  if (machine.historyLimit === undefined) return;
  if (machine.historyLimit === 0) return;

  machine.history.push(entry);
  if (machine.history.length > machine.historyLimit) {
    machine.history.shift();
  }
}

/**
 * @param machine The machine that is running
 * @param pulse The pulse to invoke
 * @param payload The payload to pass to the pulse
 * @returns Promise or void depending if the machine is async or not
 */
function runPulse(
  machine: Machine,
  pulse: PulseDirective | string | null | undefined,
  payload: any,
  token: number
): Promise<void> | void {
  if (isEntry(pulse)) {
    const isAsync = pulse.pulse.constructor.name === "AsyncFunction";

    addToHistory(
      machine,
      isAsync
        ? `${HistoryType.AsyncPulse}: ${pulse.pulse.name}`
        : `${HistoryType.Pulse}: ${pulse.pulse.name}`
    );

    let context = machine.context;

    if (machine.frozen) {
      context = deepCloneUnfreeze(context);
    }

    const onSuccess = (result: unknown): Promise<void> | void => {
      if (!isCurrentInvocation(machine, token)) {
        return;
      }

      if (isValidObject(result)) {
        context = result;
      }

      machine.context = context;
      if (machine.frozen) {
        deepFreeze(machine.context);
      }

      if (pulse.success) {
        if (isEntry(pulse.success)) {
          return runPulse(machine, pulse.success, undefined, token);
        }
        return invokeNow(machine, pulse.success, undefined, token);
      } else if (pulse.transition) {
        return invokeNow(machine, pulse.transition, undefined, token);
      }
    };

    const onFailure = (error: unknown): Promise<void> | void => {
      if (!isCurrentInvocation(machine, token)) {
        return;
      }

      machine.context = context;
      if (machine.frozen) {
        deepFreeze(machine.context);
      }

      if (pulse.failure) {
        if (isEntry(pulse.failure)) {
          return runPulse(machine, pulse.failure, error, token);
        }
        return invokeNow(machine, pulse.failure, error, token);
      }

      throw error;
    };

    try {
      const result = pulse.pulse(context, payload);
      if (isPromiseLike(result)) {
        return Promise.resolve(result).then(onSuccess, onFailure);
      }

      return onSuccess(result);
    } catch (error) {
      return onFailure(error);
    }
  } else if (isValidString(pulse)) {
    return invokeNow(machine, pulse, undefined, token);
  }
}

function hasFatalError(machine: Machine): boolean {
  return machine.fatal instanceof Error;
}

/**
 *
 * The error handler is called when an error is thrown in a transition
 * First we check if the current state has an error transition and if so we run it
 * If the current state does not have an error transition, we check if the machine has a fatal state and if so we go to it
 * If the machine does not have a fatal state, we rethrow the error
 *
 * @param machine The machine that is running
 * @param state The current state of the machine
 * @param error The error that was thrown
 * @returns Promise or void depending if the machine is async or not and if there is a error transition to invoke
 */
function catchError(
  machine: Machine,
  state: StateDirective,
  error: Error,
  token: number
): Promise<void> | void {
  if (!isCurrentInvocation(machine, token)) {
    return;
  }

  // If frozen, we need to clone the context before modifying
  if (machine.frozen) {
    machine.context = deepCloneUnfreeze(machine.context);
  }

  // Store error in context for easy access (always, as fallback in case pulse doesn't set it)
  machine.context.error = error;

  // If there's an error transition, let it handle the error
  if (hasTransition(state, "error")) {
    return invokeNow(machine, "error", error, token);
  }

  // Check if we have a fatal state and set it as the current state if so
  if ("fatal" in machine.states) {
    machine.current = "fatal";
    machine.fatal = error as Error;
    return;
  }

  // If we don't have a fatal state, we throw the error
  // But we also assign the error to the machine so that it can be accessed
  // from the outside
  machine.fatal = error as Error;
  throw error;
}

/**
 *
 * @param machine The machine that is running
 * @param state The current state of the machine
 * @param payload The payload to pass to the entry pulses
 * @returns Promise as we know that the machine is async
 */
async function runStatePulsesAsync(
  machine: Machine,
  state: StateDirective,
  payload: any,
  token: number
): Promise<void> {
  for (let i = 0; i < state.run.length; i++) {
    const item = state.run[i];
    try {
      if (isEntry(item)) {
        await runPulse(machine, item, payload, token);
        if (!isCurrentInvocation(machine, token)) {
          return;
        }
      }
    } catch (error) {
      await catchError(machine, state, error as Error, token);
      return;
    }
  }
}

/**
 * @param machine The machine that is running
 * @param state The current state of the machine
 * @param payload The payload to pass to the entry pulses
 * @returns void as we know that the machine is not async
 */
function runStatePulsesSync(
  machine: Machine,
  state: StateDirective,
  payload: any,
  token: number
): Promise<void> | void {
  let promise: Promise<void> | undefined;
  for (let i = 0; i < state.run.length; i++) {
    const item = state.run[i];
    const runItem = () => {
      try {
        if (isEntry(item)) {
          return runPulse(machine, item, payload, token);
        }
      } catch (error) {
        return catchError(machine, state, error as Error, token);
      }
    };

    if (promise) {
      promise = promise.then(runItem).catch((error) =>
        catchError(machine, state, error as Error, token)
      );
    } else {
      const result = runItem();
      if (isPromiseLike(result)) {
        promise = result.catch((error) =>
          catchError(machine, state, error as Error, token)
        );
      }
    }
  }

  return promise || void 0;
}

/**
 *
 * @param machine The machine that is running
 * @param state The current state of the machine
 * @param transition The transition that is being invoked
 * @param payload The payload to pass to the guards
 * @param index The current index of the guard in the transition
 * @returns Promise<boolean> | boolean
 */
function runGuards(
  machine: Machine,
  state: StateDirective,
  transition: TransitionDirective,
  payload: any,
  token: number
): Promise<boolean> | boolean {
  return runGuardsFromIndex(machine, state, transition, payload, 0, token);
}

function runGuardFailure(
  machine: Machine,
  guard: any,
  result: any,
  token: number
): Promise<void> | void {
  if (isValidString(guard.failure)) {
    return invokeNow(machine, guard.failure, result, token);
  } else if (isEntry(guard.failure)) {
    return runPulse(machine, guard.failure, result, token);
  } else if (isValidString(result)) {
    if (machine.frozen) {
      machine.context = deepCloneUnfreeze(machine.context);
    }
    machine.context.error = result;
  }
}

function runGuardsFromIndex(
  machine: Machine,
  state: StateDirective,
  transition: TransitionDirective,
  payload: any,
  startIndex: number,
  token: number
): Promise<boolean> | boolean {
  for (let i = startIndex; i < transition.guards.length; i++) {
    let guard = transition.guards[i];

    try {
      if (!isGuard(guard)) {
        return false;
      }

      addToHistory(machine, `${HistoryType.Guard}: ${guard.guard.name}`);

      let guardContext = machine.context;
      if (machine.frozen) {
        guardContext = deepCloneUnfreeze(machine.context);
      }

      let result;

      if (isNestedGuard(guard)) {
        result = guard.guard(guard.machine.context, payload);
      } else {
        result = guard.guard(guardContext, payload);
      }

      if (result instanceof Promise) {
        return result.then((resolvedResult: any) => {
          if (!isCurrentInvocation(machine, token)) {
            return false;
          }

          if (resolvedResult !== true) {
            const failureResult = runGuardFailure(
              machine,
              guard,
              resolvedResult,
              token
            );
            if (isPromiseLike(failureResult)) {
              return failureResult.then(() => false);
            }
            return false;
          }
          // Update context if modified
          if (machine.frozen && guardContext !== machine.context) {
            machine.context = guardContext;
            deepFreeze(machine.context);
          }
          return runGuardsFromIndex(machine, state, transition, payload, i + 1, token);
        });
      }

      if (result !== true) {
        const failureResult = runGuardFailure(machine, guard, result, token);
        if (isPromiseLike(failureResult)) {
          return failureResult.then(() => false);
        }
        return false;
      }
    } catch (error) {
      catchError(machine, state, error as Error, token);
      return false;
    }
  }

  return true;
}

/**
 *
 * @param machine The machine that is running
 * @param state The current state of the machine
 * @param payload The payload to pass to the entry pulses of the nested machine
 * @returns Promise or void depending if the machine is async or not
 */
function runNestedMachines(
  machine: Machine,
  state: StateDirective,
  payload: any,
  token: number
): Promise<void> | void {
  // If there are no nested machines, we can return
  if (state.nested.length === 0) {
    return;
  }

  let promise: Promise<void> | undefined;

  // If the state has a nested machine, we run it
  for (let nestedMachine of state.nested) {
    // If the nested machine is a nested machine with a transition we run the transition on it
    if (isNestedMachineWithTransitionDirective(nestedMachine)) {
      let transition = nestedMachine.transition;
      const runNested = () =>
        isCurrentInvocation(machine, token)
          ? invoke(nestedMachine.machine, transition, payload)
          : undefined;
      if (promise) {
        promise = promise.then(runNested);
      } else {
        const result = runNested();
        if (isPromiseLike(result)) {
          promise = result;
        }
      }
    }
  }

  // Return the promise
  return promise || void 0;
}

/**
 *
 * @param machine The machine that is running
 * @param transition The transition that is being invoked
 * @param payload The payload to pass to the entry pulses of the nested machine
 * @returns Promise or void depending if the machine is async or not
 */
function runNestedTransition(
  machine: Machine,
  transition: string,
  payload: any,
  token: number
): Promise<void> | void {
  // We know that we have a nested transition and that the first part is the current state
  // so we get rid of the first part and split the rest
  let nestedTransitionParts = transition.split(".");
  let stateName = nestedTransitionParts.shift();
  let nestedTransition = nestedTransitionParts.join(".");
  let promise: Promise<void> | undefined;

  // If we have no stateName, we can't make a transition
  if (!stateName) {
    return;
  }

  let currentStateObject = machine.states[machine.current];

  // We loop through the nested machines and invoke the transition if we can
  for (let nestedMachineDirective of currentStateObject.nested) {
    let nestedMachine = nestedMachineDirective.machine;
    let currentNestedState = nestedMachine.states[nestedMachine.current];
    if (
      canMakeTransition(nestedMachine, currentNestedState, nestedTransition)
    ) {
      const runNested = () =>
        isCurrentInvocation(machine, token)
          ? invoke(nestedMachine, nestedTransition, payload)
          : undefined;
      if (promise) {
        promise = promise.then(runNested);
      } else {
        const result = runNested();
        if (isPromiseLike(result)) {
          promise = result;
        }
      }
    }
  }

  // If we have an immediate transitions we can run it
  if (promise) {
    promise = promise.then(() =>
      invokeImmediateDirectives(machine, currentStateObject, payload, token)
    );
  } else {
    const result = invokeImmediateDirectives(machine, currentStateObject, payload, token);
    if (isPromiseLike(result)) {
      promise = result;
    }
  }

  return promise || void 0;
}

/**
 *
 * @param machine The machine that is running
 * @param transition The transition that is being invoked
 * @param payload The payload to pass to the entry pulses of the parallel machine
 * @returns Promise or void depending if the machine is async or not
 */
function runParallelTransition(
  machine: Machine,
  transition: string,
  payload: any,
  token: number
): Promise<void> | void {
  // We know that we have a parallel transition and that the first part is the parallelMachineId
  // so we get rid of the first part and split the rest
  let parallelTransitionParts = transition.split("/");
  let parallelMachineId = parallelTransitionParts.shift();
  let parallelTransition = parallelTransitionParts.join("/");

  // If we have no stateName, we can't make a transition
  if (!parallelMachineId) {
    throw new Error(`Invalid transition ${transition}`);
  }

  // If there is no parallel machine with the given id, we can't make a transition
  let parallelMachine = machine.parallel[parallelMachineId];
  if (!parallelMachine) {
    throw new Error(`Invalid transition ${transition}`);
  }

  // If the parallelMachineId is in the parallel object try to run the transition in the parallel machine
  if (!isCurrentInvocation(machine, token)) {
    return;
  }

  return invoke(parallelMachine, parallelTransition, payload);
}
/**
 *
 * @param machine The machine that is running
 * @param state The current state of the machine
 * @param payload The payload to pass to the entry pulses of the transition
 * @returns Promise or void depending if the machine is async or not
 */
function invokeImmediateDirectives(
  machine: Machine,
  state: StateDirective,
  payload: any,
  token: number
): Promise<void> | void {
  // If there are no immediate directives, we can return
  if (state.immediate.length === 0) {
    return;
  }

  let immediate = state.immediate;
  let promise: Promise<void> | undefined;

  // For each immediate directive
  for (let immediateDirective of immediate) {
    if (hasFatalError(machine)) {
      return;
    }

    // If is a parallel transition we run the transition in the parallel machine
    if (isParallelTransition(immediateDirective.immediate)) {
      let transitionParts = immediateDirective.immediate.split("/");
      let parallelMachineId = transitionParts.shift() as string;
      let parallelTransition = transitionParts.join("/");
      let parallelMachine = machine.parallel[parallelMachineId];
      const runImmediate = () =>
        isCurrentInvocation(machine, token)
          ? invoke(parallelMachine, parallelTransition, payload)
          : undefined;
      if (promise) {
        promise = promise.then(runImmediate);
      } else {
        const result = runImmediate();
        if (isPromiseLike(result)) {
          promise = result;
        }
      }
    }

    // If is a nested transition we run the transition in the nested machine
    else if (isNestedTransition(immediateDirective.immediate)) {
      const runImmediate = () =>
        isCurrentInvocation(machine, token)
          ? invokeNow(machine, immediateDirective.immediate, payload, token)
          : undefined;
      if (promise) {
        promise = promise.then(runImmediate);
      } else {
        const result = runImmediate();
        if (isPromiseLike(result)) {
          promise = result;
        }
      }
    }

    // If is a transition we run the transition
    else {
      const runImmediate = () => {
          // Only run the next immediate if the current state is equal to the state we are in now
          if (machine.current === state.name && isCurrentInvocation(machine, token)) {
            return invokeNow(machine, immediateDirective.immediate, payload, token);
          }
      };
      if (promise) {
        promise = promise.then(runImmediate);
      } else {
        const result = runImmediate();
        if (isPromiseLike(result)) {
          promise = result;
        }
      }
    }
  }

  return promise || void 0;
}

/**
 *
 * @param machine The machine to invoke the transition on
 * @param transition The transition to invoke
 * @param payload The optional payload to pass to the transition
 * @returns Void or a promise if the machine is async
 * @category Invocation
 */
export function invoke(
  machine: Machine,
  transition: string,
  payload?: any
): Promise<void> | void {
  const runtime = getRuntime(machine);

  if (runtime.running || runtime.queue.length > 0) {
    return new Promise<void>((resolve, reject) => {
      runtime.queue.push({ transition, payload, resolve, reject });
    });
  }

  return runSerializedInvocation(machine, transition, payload);
}

function runSerializedInvocation(
  machine: Machine,
  transition: string,
  payload?: any
): Promise<void> | void {
  const runtime = getRuntime(machine);
  runtime.running = true;
  const token = ++runtime.nextToken;
  runtime.activeToken = token;

  try {
    const result = invokeNow(machine, transition, payload, token);

    if (result instanceof Promise) {
      return result.finally(() => {
        finishInvocation(machine, runtime, token);
      });
    }

    finishInvocation(machine, runtime, token);
    return result;
  } catch (error) {
    finishInvocation(machine, runtime, token);
    throw error;
  }
}

function finishInvocation(
  machine: Machine,
  runtime: MachineRuntime,
  token: number
): void {
  if (runtime.activeToken === token) {
    runtime.running = false;
    runtime.activeToken = undefined;
    drainQueue(machine);
  }
}

function drainQueue(machine: Machine): void {
  const runtime = getRuntime(machine);
  if (runtime.running) return;

  const job = runtime.queue.shift();
  if (!job) return;

  try {
    const result = runSerializedInvocation(machine, job.transition, job.payload);
    if (result instanceof Promise) {
      result.then(job.resolve, job.reject);
    } else {
      job.resolve();
    }
  } catch (error) {
    job.reject(error);
  }
}

export function cancel(machine: Machine): void {
  cancelMachine(machine, new Set<Machine>());
}

function cancelMachine(machine: Machine, visited: Set<Machine>): void {
  if (visited.has(machine)) {
    return;
  }
  visited.add(machine);

  const runtime = getRuntime(machine);
  runtime.nextToken += 1;
  runtime.running = false;
  runtime.activeToken = undefined;

  const queued = runtime.queue.splice(0, runtime.queue.length);
  for (const job of queued) {
    job.reject(cancelledInvocationError());
  }

  const currentState = machine.states[machine.current];
  if (currentState) {
    for (const nestedMachine of currentState.nested) {
      cancelMachine(nestedMachine.machine, visited);
    }
  }

  for (const parallelMachine of Object.values(machine.parallel)) {
    cancelMachine(parallelMachine, visited);
  }
}

function invokeNow(
  machine: Machine,
  transition: string,
  payload: any,
  token: number
): Promise<void> | void {
  // If the machine has a fatal error, we will return immediately
  if (hasFatalError(machine)) {
    return;
  }

  // Check if we have received a valid transition as string and throw an error if not
  if (isValidString(transition) === false) {
    throw new Error(
      `Trying to invoke a transition with an invalid string: ${transition}`
    );
  }

  let trimmedTransition = transition.trim();

  // If the transition equals START_EVENT, we get the initial state
  if (trimmedTransition === START_EVENT) {
    transition = machine.initial;
  }

  // Get the current state object
  let currentStateObject = machine.states[machine.current];

  let hasTransition = canMakeTransition(
    machine,
    currentStateObject,
    trimmedTransition
  );

  // Check if the transition exists in the current state and throw an error if not
  if (!hasTransition) {
    throw new Error(
      `The transition '${trimmedTransition}' does not exist in the current state '${machine.current}'`
    );
  }

  // Check if we have a nested or parallel transition
  if (isParallelTransition(trimmedTransition)) {
    return runParallelTransition(machine, trimmedTransition, payload, token);
  }

  if (isNestedTransition(trimmedTransition)) {
    return runNestedTransition(machine, trimmedTransition, payload, token);
  }

  // Only run guards if the transition is not the START_EVENT
  if (trimmedTransition !== START_EVENT) {
    // Add the transition to the history
    addToHistory(machine, `${HistoryType.Transition}: ${trimmedTransition}`);

    // Get the transition object
    let transitionObject = currentStateObject.on[trimmedTransition];

    // If the transition has guards, run them and decide if we should continue
    let guardsResult = runGuards(
        machine,
        currentStateObject,
        transitionObject,
        payload,
        token
      );

    // Handle async guards
    if (guardsResult instanceof Promise) {
      return guardsResult.then((shouldContinue: boolean) => {
        if (!isCurrentInvocation(machine, token)) {
          return;
        }

        if (shouldContinue === false) {
          addToHistory(
            machine,
            `${HistoryType.State}: ${currentStateObject.name}`
          );
          return;
        }
        // Continue with exit handling after async guards
        return handleExitAndContinue(
          machine,
          currentStateObject,
          transitionObject,
          trimmedTransition,
          payload,
          token
        );
      });
    }

    if (guardsResult === false) {
      // As we tried to make a transition, we need to add the current state to the history
      addToHistory(machine, `${HistoryType.State}: ${currentStateObject.name}`);
      return;
    }

    // Run exit(s) from the current state if the transition has them
    return handleExitAndContinue(
      machine,
      currentStateObject,
      transitionObject,
      trimmedTransition,
      payload,
      token
    );
  }

  // Continue with the rest of the transition
  return continueTransition(
    machine,
    currentStateObject,
    trimmedTransition,
    payload,
    token
  );
}

function handleExitAndContinue(
  machine: Machine,
  currentStateObject: StateDirective,
  transitionObject: any,
  trimmedTransition: string,
  payload: any,
  token: number
): Promise<void> | void {
  const exitItems = transitionObject.exit;
  if (exitItems && Array.isArray(exitItems)) {
    const pulsesToRun = Array.isArray(exitItems[0])
      ? exitItems[0]
      : (exitItems as PulseDirective[]);

    let promise: Promise<void> | undefined;
    for (const exitItem of pulsesToRun) {
      const runExit = () => runPulse(machine, exitItem, payload, token);
      if (promise) {
        promise = promise.then(runExit);
      } else {
        const result = runExit();
        if (isPromiseLike(result)) {
          promise = result;
        }
      }
    }

    if (promise) {
      return promise.then(() => {
        if (!isCurrentInvocation(machine, token)) {
          return;
        }

        return continueTransition(
          machine,
          currentStateObject,
          trimmedTransition,
          payload,
          token
        );
      });
    }

    return continueTransition(
      machine,
      currentStateObject,
      trimmedTransition,
      payload,
      token
    );
  }

  return continueTransition(
    machine,
    currentStateObject,
    trimmedTransition,
    payload,
    token
  );
}

function continueTransition(
  machine: Machine,
  currentStateObject: StateDirective,
  trimmedTransition: string,
  payload: any,
  token: number
): Promise<void> | void {
  if (!isCurrentInvocation(machine, token)) {
    return;
  }

  let targetState =
    trimmedTransition === START_EVENT
      ? machine.initial
      : currentStateObject.on[trimmedTransition].target;

  // Check if we have a valid target state as string and throw an error if not
  if (isValidString(targetState) === false) {
    throw new Error(
      `Trying to invoke a transition with an invalid target state: ${targetState}`
    );
  }

  // Check if the target state exists in the machine and throw an error if not
  if (targetState in machine.states === false) {
    throw new Error(
      `Invalid target state '${targetState}' for '${machine.current}.${trimmedTransition}' transition`
    );
  }

  // Get the target state
  let targetStateObject = machine.states[targetState];

  // Only change the current state if the transition is not START_EVENT
  if (trimmedTransition !== START_EVENT) {
    // Set the current state
    machine.current = targetState;
    addToHistory(machine, `${HistoryType.State}: ${targetState}`);
  }

  let promise: Promise<void> | undefined;
  const runStep = (step: () => Promise<void> | void) => {
    if (promise) {
      promise = promise.then(step);
      return;
    }

    const result = step();
    if (isPromiseLike(result)) {
      promise = result;
    }
  };

  runStep(() => runNestedMachines(machine, targetStateObject, payload, token));
  runStep(() =>
    machine.isAsync
      ? runStatePulsesAsync(machine, targetStateObject, payload, token)
      : runStatePulsesSync(machine, targetStateObject, payload, token)
  );
  runStep(() => invokeImmediateDirectives(machine, targetStateObject, payload, token));

  return promise || void 0;
}

/**
 * Starts the machine from its initial state, or restores it from a snapshot.
 *
 * @param machine The machine to start
 * @param snapshotOrPayload Optional: MachineSnapshot to restore state, or payload for initial invocation
 * @returns Void or a promise if the machine is async
 * @category Invocation
 *
 * @example
 * // Start normally (executes entry pulses)
 * start(myMachine);
 *
 * @example
 * // Restore from snapshot (does NOT execute entry pulses)
 * const savedSnapshot = snapshot(myMachine);
 * start(myMachine, savedSnapshot);
 */
export function start(
  machine: Machine,
  snapshotOrPayload?: MachineSnapshot | any
): Promise<void> | void {
  // Check if it's a snapshot (has current property)
  if (
    snapshotOrPayload &&
    typeof snapshotOrPayload === "object" &&
    "current" in snapshotOrPayload
  ) {
    return restoreFromSnapshot(machine, snapshotOrPayload as MachineSnapshot);
  }

  // Original behavior: start normally with optional payload
  // Validate initial transition before invoking
  let canStartMachine = canMakeTransition(
    machine,
    machine.states[machine.current],
    START_EVENT
  );
  // If we can't start the machine, throw an error
  if (!canStartMachine) {
    throw new Error(`The machine has already been started.`);
  }

  return invoke(machine, START_EVENT, snapshotOrPayload);
}

function restoreFromSnapshot(
  machine: Machine,
  snapshot: MachineSnapshot
): void {
  // Restore main machine state
  machine.current = snapshot.current;
  machine.context = deepCloneUnfreeze(snapshot.context);
  machine.history = [...snapshot.history];

  // Add to history if not already present
  if (machine.historyLimit !== 0 && machine.history.length > 0) {
    const lastEntry = machine.history[machine.history.length - 1];
    if (!lastEntry.startsWith("State: ")) {
      machine.history.push(`${HistoryType.State}: ${snapshot.current}`);
    }
  }

  // Restore parallel machines
  if (snapshot.parallel) {
    for (let parallelName in snapshot.parallel) {
      if (machine.parallel[parallelName]) {
        restoreFromSnapshot(
          machine.parallel[parallelName],
          snapshot.parallel[parallelName]
        );
      }
    }
  }

  // Restore nested machines
  if (snapshot.nested) {
    for (let stateName in snapshot.nested) {
      const state = machine.states[stateName];
      if (state && state.nested) {
        for (let nested of state.nested) {
          if (
            snapshot.nested[stateName] &&
            snapshot.nested[stateName][nested.machine.id]
          ) {
            restoreFromSnapshot(
              nested.machine,
              snapshot.nested[stateName][nested.machine.id]
            );
          }
        }
      }
    }
  }
}

/**
 * Invokes an event on the machine after a specified time delay.
 *
 * @param machine The machine to invoke
 * @param timeInMilliseconds Time to wait before invoking
 * @param event The event to invoke
 * @param payload Optional payload for the event
 * @returns A cancel function to stop the scheduled invocation
 *
 * @example
 * const cancelTimeout = invokeAfter(myMachine, 5000, 'timeout', { reason: 'network' });
 *
 * // To cancel before it fires
 * cancelTimeout();
 */
export function invokeAfter(
  machine: Machine,
  timeInMilliseconds: number,
  event: string,
  payload?: any
): () => void {
  const timeoutId = setTimeout(() => {
    invoke(machine, event, payload);
  }, timeInMilliseconds);

  return () => clearTimeout(timeoutId);
}

export interface MachineSnapshot {
  current: string;
  context: any;
  history: string[];
  parallel?: Record<string, MachineSnapshot>;
  nested?: Record<string, Record<string, MachineSnapshot>>;
}

/**
 * Creates a snapshot of the machine's current state.
 *
 * @param machine The machine to snapshot
 * @returns An object containing current state, context, history, and nested/parallel states
 *
 * @example
 * const savedSnapshot = snapshot(myMachine);
 * // savedSnapshot = {
 * //   current: 'loading',
 * //   context: { count: 5 },
 * //   history: ['State: idle', 'Transition: start', 'State: loading'],
 * //   parallel: { bold: {...}, underline: {...} },
 * //   nested: { loading: { fetchData: {...} } }
 * // }
 */
export function snapshot(machine: Machine): MachineSnapshot {
  const snap: MachineSnapshot = {
    current: machine.current,
    context: deepCloneUnfreeze(machine.context),
    history: [...machine.history]
  };

  // Snapshot parallel machines
  if (Object.keys(machine.parallel).length > 0) {
    snap.parallel = {};
    for (let parallelName in machine.parallel) {
      snap.parallel[parallelName] = snapshot(machine.parallel[parallelName]);
    }
  }

  // Snapshot nested machines
  for (let stateName in machine.states) {
    const state = machine.states[stateName];
    if (state.nested && state.nested.length > 0) {
      if (!snap.nested) {
        snap.nested = {};
      }
      snap.nested[stateName] = {};
      for (let nested of state.nested) {
        snap.nested[stateName][nested.machine.id] = snapshot(nested.machine);
      }
    }
  }

  return snap;
}

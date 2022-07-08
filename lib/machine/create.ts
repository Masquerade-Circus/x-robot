/**
 * @module x-robot
 * @description Create a new machine from a set of directives.
 * */
import {
  Action,
  ActionDirective,
  Context,
  ContextDirective,
  DangerStateDirective,
  DescriptionDirective,
  Guard,
  GuardDirective,
  GuardsDirective,
  HistoryType,
  ImmediateDirective,
  InfoStateDirective,
  InitialDirective,
  Machine,
  MachineArguments,
  NestedGuardDirective,
  NestedMachineDirective,
  ParallelDirective,
  PrimaryStateDirective,
  Producer,
  ProducerDirective,
  ProducerDirectiveWithoutTransition,
  RunCollection,
  ShouldFreezeDirective,
  StateDirective,
  StatesDirective,
  SuccessStateDirective,
  TransitionDirective,
  TransitionsDirective,
  WarningStateDirective
} from "./interfaces";
import {
  deepFreeze,
  hasTransition,
  isAction,
  isContextDirective,
  isDescriptionDirective,
  isImmediate,
  isInitialDirective,
  isMachine,
  isNestedImmediateDirective,
  isNestedMachineDirective,
  isParallelDirective,
  isParallelImmediateDirective,
  isProducer,
  isProducerWithTransition,
  isShouldFreezeDirective,
  isStatesDirective,
  isTransition,
  isValidObject,
  isValidString,
  titleToId
} from "../utils";

/**
 * We will create a finite state machine manager
 *
 * This manager will handle the creation of the finite state machine
 * It must be functional and immutable
 * And it must be able to be serialized and return a JSON object representing the state machine
 * */

/**
 * Creates a new machine
 * @param title Title of the machine - This will be used to generate the id of the machine
 * @param args Arguments to the machine
 * @returns Machine
 * @category Creation
 */
export function machine(title: string, ...args: MachineArguments): Machine {
  // Create the machine
  let myMachine: Machine = {
    id: titleToId(title || "x-robot"),
    title,
    states: {},
    context: {},
    initial: "",
    current: "",
    frozen: true,
    isAsync: false,
    history: [],
    parallel: {}
  };

  for (let arg of args) {
    // If arg is a string then it is the title
    if (isValidString(arg)) {
      title = arg;
    }

    // If the argument is a states directive then merge it into the states
    if (isStatesDirective(arg)) {
      myMachine.states = { ...myMachine.states, ...arg };
    }

    // If the argument is a parallel directive then merge it into the parallel
    if (isParallelDirective(arg)) {
      myMachine.parallel = { ...myMachine.parallel, ...arg.parallel };
    }

    // If the argument is a context directive then merge it into the context
    if (isContextDirective(arg)) {
      let newContext =
        typeof arg.context === "function" ? arg.context() : arg.context;
      if (!isValidObject(newContext)) {
        throw new Error(
          "The context passed to the machine must be an object or a function that returns an object."
        );
      }

      myMachine.context = { ...myMachine.context, ...newContext };
    }

    // If the argument is an initial directive then set the initial state
    if (isInitialDirective(arg)) {
      myMachine.initial = arg.initial;
      myMachine.current = myMachine.initial;
      myMachine.history.push(`${HistoryType.State}: ${myMachine.initial}`);
    }

    // If the argument is a shouldFreeze directive then set the freeze flag
    if (isShouldFreezeDirective(arg)) {
      myMachine.frozen = arg.freeze;
    }
  }

  // If freeze is true, we will deep freeze the context
  if (myMachine.frozen) {
    deepFreeze(myMachine.context);
  }

  // Find if the machine is async, if so, add the async property
  // Machin is async if there is a state with an action in the run array
  for (let state in myMachine.states) {
    if (myMachine.states[state].run.length > 0) {
      // Find an action in the run array
      let action = myMachine.states[state].run.find(isAction);
      if (action) {
        myMachine.isAsync = true;
        break;
      }
    }
  }

  // If machine isn't async, we should check if there are any nested machines that are async, if so, we should turn the async flag on
  if (myMachine.isAsync === false) {
    for (let state in myMachine.states) {
      if (myMachine.states[state].nested.length > 0) {
        for (let nestedMachine of myMachine.states[state].nested) {
          if (nestedMachine.machine.isAsync) {
            myMachine.isAsync = true;
            break;
          }
        }
      }
    }
  }

  // If machine isn't async, we should check if there are any parallel machines that are async, if so, we should turn the async flag on
  if (myMachine.isAsync === false) {
    for (let parallel in myMachine.parallel) {
      if (myMachine.parallel[parallel].isAsync) {
        myMachine.isAsync = true;
        break;
      }
    }
  }

  // Return the machine
  return myMachine;
}

/**
 * @param states Array of state directives made with the state method
 * @returns StatesDirective
 * @category Creation
 */
export function states(...states: StateDirective[]): StatesDirective {
  let newStates: StatesDirective = {};

  for (let state of states) {
    newStates[state.name] = state;
  }

  return newStates;
}

/**
 *
 * @param machines Array of parallel machines
 * @returns ParallelDirective
 * @category Creation
 */
export function parallel(...machines: Machine[]): ParallelDirective {
  let obj: ParallelDirective = { parallel: {} };

  for (let machine of machines) {
    obj.parallel[machine.id] = machine;
  }

  return obj;
}

/**
 *
 * @param context The context to be passed to the machine, can be a function that returns an object
 * @returns ContextDirective
 * @category Creation
 */
export function context(context: Context | Function): ContextDirective {
  return {
    context
  };
}

/**
 *
 * @param initial The initial state of the machine
 * @returns InitialDirective
 * @category Creation
 */
export function initial(initial: string): InitialDirective {
  return {
    initial
  };
}

/**
 *
 * @param freeze If false the machine will not be frozen. The machine will be frozen by default.
 * @returns ShouldFreezeDirective
 * @category Creation
 */
export function shouldFreeze(freeze: boolean): ShouldFreezeDirective {
  return {
    freeze
  };
}

/**
 *
 * @param name The name of the state
 * @param args nested machines, actions, producers, transitions, etc.
 * @returns StateDirective
 * @category Creation
 */
export function state(name: string, ...args: RunCollection): StateDirective {
  let run: (ActionDirective | ProducerDirective)[] = [];
  let on: TransitionsDirective = {};
  let immediate: ImmediateDirective[] = [];
  let nested: NestedMachineDirective[] = [];
  let description;

  for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    // If is a nested machine
    if (isNestedMachineDirective(arg)) {
      nested.push(arg);
      // If is action or producer add it to the run array
    } else if (isAction(arg) || isProducer(arg)) {
      run.push(arg);

      // If is an action and has a success transition or a failure transition, then try to add them to the on object
      if (isAction(arg)) {
        let successTransition = isValidString(arg.success)
          ? arg.success
          : isProducerWithTransition(arg.success)
          ? arg.success.transition
          : null;
        // If success is a transition
        if (
          isValidString(successTransition) &&
          hasTransition({ on } as StateDirective, successTransition) === false
        ) {
          on[successTransition] = {
            transition: successTransition,
            target: successTransition,
            guards: []
          };
        }

        let failureTransition = isValidString(arg.failure)
          ? arg.failure
          : isProducerWithTransition(arg.failure)
          ? arg.failure.transition
          : null;
        // If failure is a transition
        if (
          isValidString(failureTransition) &&
          hasTransition({ on } as StateDirective, failureTransition) === false
        ) {
          on[failureTransition] = {
            transition: failureTransition,
            target: failureTransition,
            guards: []
          };
        }
      }

      // If is immediate transition
    } else if (isImmediate(arg)) {
      // Add the immediate transition to the immediate array
      immediate.push(arg);

      let transition = arg.immediate;
      let guards = arg.guards;

      // If the immediate transition is not a nested or parallel machine then add it to the on object
      if (
        !isNestedImmediateDirective(arg) &&
        !isParallelImmediateDirective(arg)
      ) {
        // We turn the immediate transition into a normal transition so that the machine can handle it
        on[transition] = { target: transition, transition: transition, guards };
      }

      // if is a transition
    } else if (isTransition(arg)) {
      on[arg.transition] = arg;
    } else if (isDescriptionDirective(arg)) {
      description = arg.description;
    }
  }

  return {
    name,
    nested,
    run,
    on,
    immediate,
    args,
    type: "default",
    description
  };
}

/**
 *
 * @param transitionName The name of the transition
 * @param target The target state of the transition
 * @param guards The guards of the transition
 * @returns TransitionDirective
 * @category Creation
 */
export function transition(
  transitionName: string,
  target: string,
  ...guards: GuardsDirective
): TransitionDirective {
  return {
    transition: transitionName,
    target,
    guards
  };
}

/**
 *
 * @param action The action to be run
 * @param onSuccessProducer The producer to be run on success with an optional transition name or a transition name
 * @param onFailureProducer The producer to be run on failure with an optional transition name or a transition name
 * @returns ActionDirective
 * @category Creation
 */
export function action(
  action: Action,
  onSuccessProducer?: ProducerDirective | string | null,
  onFailureProducer?: ProducerDirective | string | null
): ActionDirective {
  return {
    action,
    success: onSuccessProducer,
    failure: onFailureProducer
  };
}

/**
 *
 * @param guard The guard to be run
 * @param onFailureProducer The producer to be run on failure, this producer should not have a transition name
 * @returns GuardDirective
 * @category Creation
 */
export function guard(
  guard: Guard,
  onFailureProducer?: ProducerDirectiveWithoutTransition
): GuardDirective {
  return {
    guard,
    failure: onFailureProducer
  };
}

/**
 *
 * @param producer The producer to be run
 * @param transition The transition to be run on producer processed if the logic in which the producer is run allows it
 * @returns ProducerDirective
 * @category Creation
 */
export function producer(
  producer: Producer,
  transition?: string
): ProducerDirective | ProducerDirectiveWithoutTransition {
  return {
    producer,
    transition
  };
}

/**
 *
 * @param target The target state of the transition
 * @param guards The guards of the transition
 * @returns ImmediateDirective
 * @category Creation
 */
export function immediate(
  target: string,
  ...guards: GuardsDirective
): ImmediateDirective {
  return {
    immediate: target,
    guards
  };
}

/**
 * This method returns a nested guard directive.
 * It works like the guard directive but it receives the nested machine context as the first argument instead of the parent machine context.
 *
 * @param machine The nested machine to be run
 * @param guard The guard to be run
 * @param onFailureProducer The producer to be run on failure, this producer should not have a transition name
 * @returns NestedGuardDirective
 * @category Creation
 */
export function nestedGuard(
  machine: Machine,
  guard: Guard,
  onFailureProducer?: ProducerDirectiveWithoutTransition
): NestedGuardDirective {
  return {
    guard,
    machine,
    failure: onFailureProducer
  };
}

/**
 *
 * @param machine The nested machine to be run
 * @param transition The transition to be run when the machine enters in the state that has the nested machine
 * @returns NestedMachineDirective
 * @category Creation
 */
export function nested(
  machine: Machine,
  transition?: string
): NestedMachineDirective {
  return {
    machine,
    transition
  };
}

/**
 * This is used as documentation for the serialization and in the diagram generation of the machine.
 * Not to be used in the machine execution itself.
 *
 * @param description The description of the state
 * @returns DescriptionDirective
 * @category Creation
 */
export function description(description: string): DescriptionDirective {
  return {
    description
  };
}

/**
 * State directive that represents an info state. This is used as documentation for the serialization and in the diagram generation of the machine.
 * Not to be used in the machine execution itself.
 * @param name The name of the state
 * @param args nested machines, actions, producers, transitions, etc.
 * @returns InfoStateDirective
 * @category Creation
 */
export function infoState(
  name: string,
  ...args: RunCollection
): InfoStateDirective {
  let stateObject = state(name, ...args);
  stateObject.type = "info";
  return stateObject as InfoStateDirective;
}

/**
 * State directive that represents a primary state. This is used as documentation for the serialization and in the diagram generation of the machine.
 * Not to be used in the machine execution itself.
 * @param name The name of the state
 * @param args nested machines, actions, producers, transitions, etc.
 * @returns PrimaryStateDirective
 * @category Creation
 */
export function primaryState(
  name: string,
  ...args: RunCollection
): PrimaryStateDirective {
  let stateObject = state(name, ...args);
  stateObject.type = "primary";
  return stateObject as PrimaryStateDirective;
}

/**
 * State directive that represents a success state. This is used as documentation for the serialization and in the diagram generation of the machine.
 * Not to be used in the machine execution itself.
 * @param name The name of the state
 * @param args nested machines, actions, producers, transitions, etc.
 * @returns SuccessStateDirective
 * @category Creation
 */
export function successState(
  name: string,
  ...args: RunCollection
): SuccessStateDirective {
  let stateObject = state(name, ...args);
  stateObject.type = "success";
  return stateObject as SuccessStateDirective;
}

/**
 * State directive that represents a warning state. This is used as documentation for the serialization and in the diagram generation of the machine.
 * Not to be used in the machine execution itself.
 * @param name The name of the state
 * @param args nested machines, actions, producers, transitions, etc.
 * @returns WarningStateDirective
 * @category Creation
 */
export function warningState(
  name: string,
  ...args: RunCollection
): WarningStateDirective {
  let stateObject = state(name, ...args);
  stateObject.type = "warning";
  return stateObject as WarningStateDirective;
}

/**
 * State directive that represents a danger state. This is used as documentation for the serialization and in the diagram generation of the machine.
 * Not to be used in the machine execution itself.
 * @param name The name of the state
 * @param args nested machines, actions, producers, transitions, etc.
 * @returns DangerStateDirective
 * @category Creation
 */
export function dangerState(
  name: string,
  ...args: RunCollection
): DangerStateDirective {
  let stateObject = state(name, ...args);
  stateObject.type = "danger";
  return stateObject as DangerStateDirective;
}

// The current state of the machine or null
export type CurrentState = string | null;

// Object with all the parallel states of the machine
export interface AllStates {
  [key: string]: CurrentState | AllStates;
}

/**
 * Get the current state or the parallel states of the machine if no path is provided
 * Or get the current state of a nested machine if a path is provided
 * @param machine The machine to get the current state of
 * @param path The path to the current state, e.g. 'stateA.stateB.stateC'
 * @returns The current state or null if the path is invalid
 * @category State
 */
export function getState(
  machine: Machine,
  path?: string
): AllStates | CurrentState {
  // If there is no machine we will return null
  if (!isMachine(machine)) {
    return null;
  }

  // If there is no path we will return the current state
  if (!isValidString(path)) {
    let result = {} as AllStates;

    // We will iterate over all the parallel states
    if (Object.keys(machine.parallel).length > 0) {
      for (let parallelName in machine.parallel) {
        result[parallelName] = getState(machine.parallel[parallelName]);
      }
    }

    if (isValidString(machine.current)) {
      result.current = machine.current;
    }

    // If there is only one state and it is the current state we will return it
    if (isValidString(result.current) && Object.keys(result).length === 1) {
      return result.current;
    }

    // If we have more than one state or the state is not the current state we will return the object
    if (Object.keys(result).length > 0) {
      return result;
    }

    // If there is no current state and no parallel states we will return null
    return null;
  }

  let pathParts = path.split(".");
  let stateName = pathParts.shift();

  // If the state name is not a string we will return null
  if (!isValidString(stateName)) {
    return null;
  }

  // Find the state in the parallel states
  if (stateName in machine.parallel) {
    return getState(machine.parallel[stateName], pathParts.join("."));
  }

  // Find the state in the states
  if (stateName in machine.states) {
    // If we have a state we will find the states in the nested machines
    let obj: AllStates = {};

    // Find a nested machine in the state
    for (let nested of machine.states[stateName].nested) {
      obj[nested.machine.id] = getState(nested.machine, pathParts.join("."));
    }

    // If the object is empty we will return null
    if (Object.keys(obj).length === 0) {
      return null;
    }

    // If the object only has one property we will return the value of the property
    if (Object.keys(obj).length === 1) {
      return obj[Object.keys(obj)[0]];
    }

    // If we are here we will return the whole object
    return obj;
  }

  // If we are here check if we have a machine id as the stateName
  let nestedMachineId = stateName;

  // Find a nested machine in the state
  for (stateName in machine.states) {
    for (let nested of machine.states[stateName].nested) {
      if (nested.machine.id === nestedMachineId) {
        return getState(nested.machine, pathParts.join("."));
      }
    }
  }

  // If we are here we will return null
  return null;
}

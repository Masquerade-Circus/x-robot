import {
  ActionDirective,
  ContextDirective,
  DescriptionDirective,
  GuardDirective,
  ImmediateDirective,
  InitialDirective,
  Machine,
  NestedGuardDirective,
  NestedMachineDirective,
  NestedMachineWithTransitionDirective,
  ProducerDirective,
  ProducerDirectiveWithTransition,
  ProducerDirectiveWithoutTransition,
  ShouldFreezeDirective,
  StateDirective,
  StatesDirective,
  TransitionDirective
} from './machine/interfaces';

export function isValidString(str?: any): str is string {
  return str !== null && typeof str === 'string' && str.trim().length > 0;
}

export function isValidObject(obj: any): obj is object {
  return obj !== null && typeof obj === 'object';
}

export function isProducer(producer?: any): producer is ProducerDirective {
  return isValidObject(producer) && 'producer' in producer;
}

export function isProducerWithTransition(producer?: any): producer is ProducerDirectiveWithTransition {
  return isProducer(producer) && isValidString(producer.transition);
}

export function isProducerWithoutTransition(producer?: any): producer is ProducerDirectiveWithoutTransition {
  return !isProducerWithTransition(producer);
}

export function isAction(action?: any): action is ActionDirective {
  return isValidObject(action) && 'action' in action;
}

export function isImmediate(immediate?: any): immediate is ImmediateDirective {
  return isValidObject(immediate) && 'immediate' in immediate;
}

export function isGuard(guard?: any): guard is GuardDirective {
  return isValidObject(guard) && 'guard' in guard;
}

export function isNestedGuard(guard?: any): guard is NestedGuardDirective {
  return isGuard(guard) && 'machine' in guard;
}

export function isTransition(transition?: any): transition is TransitionDirective {
  return isValidObject(transition) && 'transition' in transition && 'target' in transition;
}

export function hasTransition(state: StateDirective, transition: string): boolean {
  return isValidString(transition) && transition in state.on;
}

export function hasState(machine: Machine, state: string): boolean {
  return isValidString(state) && state in machine.states;
}

export function isNestedMachineDirective(machine?: any): machine is NestedMachineDirective {
  return isValidObject(machine) && 'machine' in machine;
}

export function isNestedMachineWithTransitionDirective(machine?: any): machine is NestedMachineWithTransitionDirective {
  return isNestedMachineDirective(machine) && isValidString(machine.transition);
}

export function isMachine(machine?: any): machine is Machine {
  return isValidObject(machine) && 'states' in machine && 'initial' in machine && 'current' in machine;
}

export function isStateDirective(state?: any): state is StateDirective {
  return isValidObject(state) && 'name' in state && 'run' in state && 'on' in state && 'args' in state;
}

export function isContextDirective(context?: any): context is ContextDirective {
  return isValidObject(context) && 'context' in context;
}

export function isStatesDirective(states?: any): states is StatesDirective {
  return isValidObject(states) && Object.keys(states).every((key) => isValidString(key)) && Object.values(states).every((state) => isStateDirective(state));
}

export function isShouldFreezeDirective(shouldFreeze?: any): shouldFreeze is ShouldFreezeDirective {
  return isValidObject(shouldFreeze) && 'freeze' in shouldFreeze;
}

export function isInitialDirective(initial?: any): initial is InitialDirective {
  return isValidObject(initial) && 'initial' in initial;
}

export function isDescriptionDirective(description?: any): description is DescriptionDirective {
  return isValidObject(description) && 'description' in description;
}

/**
 * This method is used to deep freeze an object
 * @param {Object} obj The object to freeze
 * @returns {Object} Object frozen
 */
export function deepFreeze(obj: any) {
  if (typeof obj === 'object' && obj !== null && !Object.isFrozen(obj)) {
    if (Array.isArray(obj)) {
      for (let i = 0, l = obj.length; i < l; i++) {
        deepFreeze(obj[i]);
      }
    } else {
      for (let prop in obj) {
        deepFreeze(obj[prop]);
      }
    }
    Object.freeze(obj);
  }

  return obj;
}

// Creates a deep copy of the context
// @param {Object} context
// @returns {Object}
export function cloneContext(context: any, weakMap = new WeakMap()): any {
  // If context is in the weak map, we will use the weak map value
  if (weakMap.has(context)) {
    return weakMap.get(context);
  }

  // If context is null or undefined, we will return it as is
  if (context === null || context === undefined) {
    return context;
  }

  let result;

  // Check for every type of object property and clone it accordingly
  // If is an array, we will clone it recursively
  if (Array.isArray(context)) {
    result = context.map((item) => cloneContext(item, weakMap));
  }

  // If it is an object, we will clone it recursively
  else if (typeof context === 'object') {
    result = {} as any;
    for (let key in context) {
      result[key] = cloneContext(context[key], weakMap);
    }
  }

  // If it is a date, we will clone it
  else if (context instanceof Date) {
    result = new Date(context.getTime());
  }

  // If it is a Set, we will clone it recursively
  else if (context instanceof Set) {
    result = new Set(context);
  }

  // If it is a Map, we will clone it recursively
  else if (context instanceof Map) {
    let array = Array.from(context, ([key, val]) => [key, cloneContext(val, weakMap)]) as [any, any][];
    result = new Map(array);
  }

  // If it is a RegExp, we will clone it
  else if (context instanceof RegExp) {
    return new RegExp(context.source, context.flags);
  }

  // If it is a instance of a class, we create a new instance of the class
  // Only if we turn the first parameter to true
  else if (false && context instanceof Object && context.constructor) {
    result = new context.constructor(context);
  }

  // If it is a primitive, we will just assign it
  else {
    result = context;
    return result;
  }

  // Add the context to the weak map
  weakMap.set(context, result);

  // Return the cloned context
  return result;
}

export interface Context {
  [key: string]: any;
}

export interface TransitionDirective {
  transition: string;
  target: string;
  guards: GuardsDirective;
}

export interface TransitionsDirective {
  [key: string]: TransitionDirective;
}

export interface ImmediateDirective {
  immediate: string;
  guards: GuardsDirective;
}

export interface Producer {
  (context: Context, payload?: any): Context | void;
}

export interface ProducerDirective {
  producer: Producer;
  transition?: string;
}

export interface ProducerDirectiveWithTransition extends ProducerDirective {
  transition: string;
}

export interface ProducerDirectiveWithoutTransition {
  producer: Producer;
}

export interface Action {
  (context: Context, payload?: any): Promise<void | any>;
}

export interface ActionDirective {
  action: Action;
  success?: ProducerDirective | string | null;
  failure?: ProducerDirective | string;
}

export interface Guard {
  (context: Context, payload?: any): boolean | any;
}

export interface GuardDirective {
  guard: Guard;
  failure?: ProducerDirectiveWithoutTransition;
}

export interface NestedGuardDirective extends GuardDirective {
  machine: Machine;
}

export interface GuardsDirective extends Array<GuardDirective | NestedGuardDirective> {}

export interface DescriptionDirective {
  description: string;
}

export interface RunCollection
  extends Array<
    NestedMachineDirective | ActionDirective | ProducerDirectiveWithoutTransition | TransitionDirective | ImmediateDirective | DescriptionDirective
  > {}

export interface StateDirective {
  name: string;
  run: (ActionDirective | ProducerDirective)[];
  on: TransitionsDirective;
  immediate?: string | string[];
  args: (NestedMachineDirective | ActionDirective | ProducerDirective | TransitionDirective | ImmediateDirective | DescriptionDirective)[];
  type: string;
  nested: NestedMachineDirective[];
  description?: string;
}

export interface StatesDirective {
  [key: string]: StateDirective;
}

export interface Machine {
  title: string | null;
  context: Context;
  isAsync: boolean;
  states: StatesDirective;
  initial: string;
  current: string;
  frozen: boolean;
  fatal?: Error;
  history: string[];
}

export interface NestedMachineDirective {
  machine: Machine;
  transition?: string;
}

export interface NestedMachineWithTransitionDirective extends NestedMachineDirective {
  transition: string;
}

export interface ContextDirective {
  context: Context;
}

export interface InitialDirective {
  initial: string;
}

export interface ShouldFreezeDirective {
  freeze: boolean;
}

export enum HistoryType {
  Transition = 'Transition',
  Action = 'Action',
  Producer = 'Producer',
  State = 'State',
  Guard = 'Guard'
}

/** @module x-robot */
export interface MachineArguments
  extends Array<
    | InitDirective
    | StateDirective
    | ParallelDirective
  > {}

export interface InitDirective {
  initial?: InitialDirective;
  context?: ContextDirective;
  freeze?: ShouldFreezeDirective;
}

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

export interface NestedImmediateDirective extends ImmediateDirective {
  immediate: string;
  guards: GuardsDirective;
}

export interface ParallelImmediateDirective extends ImmediateDirective {
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

export interface Pulse {
  (context: Context, payload?: any): Promise<void | any> | void;
}

export interface PulseDirective {
  pulse: Pulse;
  success?: string;
  failure?: string | PulseDirective;
}

export interface Action {
  (context: Context, payload?: any): Promise<void | any>;
}

export interface ActionDirective {
  action: Action;
  success?: ProducerDirective | string | null;
  failure?: ProducerDirective | string | null;
}

export interface Guard {
  (context: Context, payload?: any): boolean | any;
}

export interface GuardDirective {
  guard: Guard;
  failure?: string | PulseDirective;
}

export interface NestedGuardDirective extends GuardDirective {
  machine: Machine;
  failure?: string | PulseDirective;
}

export interface GuardsDirective
  extends Array<GuardDirective | NestedGuardDirective> {}

export interface DescriptionDirective {
  description: string;
}

export interface RunCollection
  extends Array<
    | NestedMachineDirective
    | PulseDirective
    | TransitionDirective
    | ImmediateDirective
    | DescriptionDirective
  > {}

export interface StateDirective {
  name: string;
  run: PulseDirective[];
  on: TransitionsDirective;
  immediate: ImmediateDirective[];
  args: (
    | NestedMachineDirective
    | PulseDirective
    | TransitionDirective
    | ImmediateDirective
    | DescriptionDirective
  )[];
  type: string;
  nested: NestedMachineDirective[];
  description?: string;
}

export interface InfoStateDirective extends StateDirective {
  type: "info";
}

export interface WarningStateDirective extends StateDirective {
  type: "warning";
}

export interface DangerStateDirective extends StateDirective {
  type: "danger";
}

export interface PrimaryStateDirective extends StateDirective {
  type: "primary";
}

export interface SuccessStateDirective extends StateDirective {
  type: "success";
}

export interface StatesDirective {
  [key: string]: StateDirective;
}

export interface ParallelDirective {
  parallel: Record<string, Machine>;
}

export interface Machine {
  id: string; // This will be the title of the machine in snake case (e.g. 'my-machine')
  title: string | null;
  context: Context;
  isAsync: boolean;
  states: StatesDirective;
  initial: string;
  current: string;
  frozen: boolean;
  fatal?: Error;
  history: string[];
  parallel: ParallelDirective["parallel"];
}

export interface NestedMachineDirective {
  machine: Machine;
  transition?: string;
}

export interface NestedMachineWithTransitionDirective
  extends NestedMachineDirective {
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
  Transition = "Transition",
  Action = "Action",
  Producer = "Producer",
  Pulse = "Pulse",
  AsyncPulse = "Async Pulse",
  State = "State",
  Guard = "Guard"
}

export const START_EVENT = "__start__";

import { Action, ActionDirective, Context, ContextDirective, DescriptionDirective, Guard, GuardDirective, GuardsDirective, ImmediateDirective, InitialDirective, Machine, NestedGuardDirective, NestedMachineDirective, ParallelDirective, Producer, ProducerDirective, ProducerDirectiveWithoutTransition, RunCollection, ShouldFreezeDirective, StateDirective, StatesDirective, TransitionDirective } from './interfaces';
interface MachineArguments extends Array<string | ContextDirective | InitialDirective | ShouldFreezeDirective | StatesDirective | ParallelDirective> {
}
export declare function machine(title: string, ...args: MachineArguments): Machine;
export declare function states(...states: StateDirective[]): StatesDirective;
export declare function parallel(...machines: Machine[]): ParallelDirective;
export declare function context(context: Context | Function): ContextDirective;
export declare function initial(initial: string): InitialDirective;
export declare function shouldFreeze(freeze: boolean): ShouldFreezeDirective;
export declare function state(name: string, ...args: RunCollection): StateDirective;
export declare function transition(transitionName: string, target: string, ...guards: GuardsDirective): TransitionDirective;
export declare function action(action: Action, onSuccessProducer?: ProducerDirective | string | null, onFailureProducer?: ProducerDirective | string): ActionDirective;
export declare function guard(guard: Guard, onFailureProducer?: ProducerDirectiveWithoutTransition): GuardDirective;
export declare function producer(producer: Producer, transition?: string): ProducerDirective | ProducerDirectiveWithoutTransition;
export declare function immediate(target: string, ...guards: GuardsDirective): ImmediateDirective;
export declare function nestedGuard(machine: Machine, guard: Guard, onFailureProducer?: ProducerDirectiveWithoutTransition): NestedGuardDirective;
export declare function nested(machine: Machine, transition?: string): NestedMachineDirective;
export declare function description(description: string): DescriptionDirective;
export declare const infoState: (name: string, ...args: RunCollection) => StateDirective;
export declare const primaryState: (name: string, ...args: RunCollection) => StateDirective;
export declare const successState: (name: string, ...args: RunCollection) => StateDirective;
export declare const warningState: (name: string, ...args: RunCollection) => StateDirective;
export declare const dangerState: (name: string, ...args: RunCollection) => StateDirective;
export {};

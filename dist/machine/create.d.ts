import { Action, ActionDirective, Context, ContextDirective, DangerStateDirective, DescriptionDirective, Guard, GuardDirective, GuardsDirective, ImmediateDirective, InfoStateDirective, InitialDirective, Machine, MachineArguments, NestedGuardDirective, NestedMachineDirective, ParallelDirective, PrimaryStateDirective, Producer, ProducerDirective, ProducerDirectiveWithoutTransition, RunCollection, ShouldFreezeDirective, StateDirective, StatesDirective, SuccessStateDirective, TransitionDirective, WarningStateDirective } from "./interfaces";
export declare function machine(title: string, ...args: MachineArguments): Machine;
export declare function states(...states: StateDirective[]): StatesDirective;
export declare function parallel(...machines: Machine[]): ParallelDirective;
export declare function context(context: Context | Function): ContextDirective;
export declare function initial(initial: string): InitialDirective;
export declare function shouldFreeze(freeze: boolean): ShouldFreezeDirective;
export declare function state(name: string, ...args: RunCollection): StateDirective;
export declare function transition(transitionName: string, target: string, ...guards: GuardsDirective): TransitionDirective;
export declare function action(action: Action, onSuccessProducer?: ProducerDirective | string | null, onFailureProducer?: ProducerDirective | string | null): ActionDirective;
export declare function guard(guard: Guard, onFailureProducer?: ProducerDirectiveWithoutTransition): GuardDirective;
export declare function producer(producer: Producer, transition?: string): ProducerDirective | ProducerDirectiveWithoutTransition;
export declare function immediate(target: string, ...guards: GuardsDirective): ImmediateDirective;
export declare function nestedGuard(machine: Machine, guard: Guard, onFailureProducer?: ProducerDirectiveWithoutTransition): NestedGuardDirective;
export declare function nested(machine: Machine, transition?: string): NestedMachineDirective;
export declare function description(description: string): DescriptionDirective;
export declare function infoState(name: string, ...args: RunCollection): InfoStateDirective;
export declare function primaryState(name: string, ...args: RunCollection): PrimaryStateDirective;
export declare function successState(name: string, ...args: RunCollection): SuccessStateDirective;
export declare function warningState(name: string, ...args: RunCollection): WarningStateDirective;
export declare function dangerState(name: string, ...args: RunCollection): DangerStateDirective;
export declare type CurrentState = string | null;
export interface AllStates {
    [key: string]: CurrentState | AllStates;
}
export declare function getState(machine: Machine, path?: string): AllStates | CurrentState;
//# sourceMappingURL=create.d.ts.map
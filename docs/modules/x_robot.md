[x-robot - v0.3.0](../README.md) / [Modules](../modules.md) / x-robot

# Module: x-robot

**`Description`**

X-Robot is a finite state machine library for nodejs and for the web.

## Table of contents

### Creation Functions

- [init](x_robot.md#init)
- [machine](x_robot.md#machine)
- [states](x_robot.md#states)
- [parallel](x_robot.md#parallel)
- [context](x_robot.md#context)
- [initial](x_robot.md#initial)
- [shouldFreeze](x_robot.md#shouldfreeze)
- [history](x_robot.md#history)
- [state](x_robot.md#state)
- [transition](x_robot.md#transition)
- [entry](x_robot.md#entry)
- [exit](x_robot.md#exit)
- [guard](x_robot.md#guard)
- [immediate](x_robot.md#immediate)
- [nestedGuard](x_robot.md#nestedguard)
- [nested](x_robot.md#nested)
- [description](x_robot.md#description)
- [infoState](x_robot.md#infostate)
- [primaryState](x_robot.md#primarystate)
- [successState](x_robot.md#successstate)
- [warningState](x_robot.md#warningstate)
- [dangerState](x_robot.md#dangerstate)

### Invocation Functions

- [invoke](x_robot.md#invoke)
- [start](x_robot.md#start)

### State Functions

- [getState](x_robot.md#getstate)

### Other Functions

- [invokeAfter](x_robot.md#invokeafter)

### Type Aliases

- [CurrentState](x_robot.md#currentstate)

### Interfaces

- [AllStates](../interfaces/x_robot.AllStates.md)
- [MachineArguments](../interfaces/x_robot.MachineArguments.md)
- [InitDirective](../interfaces/x_robot.InitDirective.md)
- [Context](../interfaces/x_robot.Context.md)
- [TransitionDirective](../interfaces/x_robot.TransitionDirective.md)
- [TransitionsDirective](../interfaces/x_robot.TransitionsDirective.md)
- [ImmediateDirective](../interfaces/x_robot.ImmediateDirective.md)
- [NestedImmediateDirective](../interfaces/x_robot.NestedImmediateDirective.md)
- [ParallelImmediateDirective](../interfaces/x_robot.ParallelImmediateDirective.md)
- [Producer](../interfaces/x_robot.Producer.md)
- [ProducerDirective](../interfaces/x_robot.ProducerDirective.md)
- [ProducerDirectiveWithTransition](../interfaces/x_robot.ProducerDirectiveWithTransition.md)
- [ProducerDirectiveWithoutTransition](../interfaces/x_robot.ProducerDirectiveWithoutTransition.md)
- [Pulse](../interfaces/x_robot.Pulse.md)
- [PulseDirective](../interfaces/x_robot.PulseDirective.md)
- [ExitDirective](../interfaces/x_robot.ExitDirective.md)
- [Action](../interfaces/x_robot.Action.md)
- [ActionDirective](../interfaces/x_robot.ActionDirective.md)
- [Guard](../interfaces/x_robot.Guard.md)
- [GuardDirective](../interfaces/x_robot.GuardDirective.md)
- [NestedGuardDirective](../interfaces/x_robot.NestedGuardDirective.md)
- [GuardsDirective](../interfaces/x_robot.GuardsDirective.md)
- [DescriptionDirective](../interfaces/x_robot.DescriptionDirective.md)
- [RunCollection](../interfaces/x_robot.RunCollection.md)
- [StateDirective](../interfaces/x_robot.StateDirective.md)
- [InfoStateDirective](../interfaces/x_robot.InfoStateDirective.md)
- [WarningStateDirective](../interfaces/x_robot.WarningStateDirective.md)
- [DangerStateDirective](../interfaces/x_robot.DangerStateDirective.md)
- [PrimaryStateDirective](../interfaces/x_robot.PrimaryStateDirective.md)
- [SuccessStateDirective](../interfaces/x_robot.SuccessStateDirective.md)
- [StatesDirective](../interfaces/x_robot.StatesDirective.md)
- [ParallelDirective](../interfaces/x_robot.ParallelDirective.md)
- [Machine](../interfaces/x_robot.Machine.md)
- [NestedMachineDirective](../interfaces/x_robot.NestedMachineDirective.md)
- [NestedMachineWithTransitionDirective](../interfaces/x_robot.NestedMachineWithTransitionDirective.md)
- [ContextDirective](../interfaces/x_robot.ContextDirective.md)
- [InitialDirective](../interfaces/x_robot.InitialDirective.md)
- [ShouldFreezeDirective](../interfaces/x_robot.ShouldFreezeDirective.md)
- [HistoryDirective](../interfaces/x_robot.HistoryDirective.md)

### Enumerations

- [HistoryType](../enums/x_robot.HistoryType.md)

### Variables

- [START\_EVENT](x_robot.md#start_event)

## Creation Functions

### init

▸ **init**(...`directives`): [`InitDirective`](../interfaces/x_robot.InitDirective.md)

Creates an init directive that can contain initial, context, freeze and history options

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...directives` | ([`InitialDirective`](../interfaces/x_robot.InitialDirective.md) \| [`ContextDirective`](../interfaces/x_robot.ContextDirective.md) \| [`ShouldFreezeDirective`](../interfaces/x_robot.ShouldFreezeDirective.md) \| [`HistoryDirective`](../interfaces/x_robot.HistoryDirective.md))[] | InitialDirective, ContextDirective, ShouldFreezeDirective or HistoryDirective |

#### Returns

[`InitDirective`](../interfaces/x_robot.InitDirective.md)

InitDirective

___

### machine

▸ **machine**(`title`, ...`args`): [`Machine`](../interfaces/x_robot.Machine.md)

Creates a new machine

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `title` | `string` | Title of the machine - This will be used to generate the id of the machine |
| `...args` | [`MachineArguments`](../interfaces/x_robot.MachineArguments.md) | Arguments to the machine: init?, state*, parallel* |

#### Returns

[`Machine`](../interfaces/x_robot.Machine.md)

Machine

___

### states

▸ **states**(...`states`): [`StatesDirective`](../interfaces/x_robot.StatesDirective.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...states` | [`StateDirective`](../interfaces/x_robot.StateDirective.md)[] | Array of state directives made with the state method |

#### Returns

[`StatesDirective`](../interfaces/x_robot.StatesDirective.md)

StatesDirective

___

### parallel

▸ **parallel**(...`machines`): [`ParallelDirective`](../interfaces/x_robot.ParallelDirective.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...machines` | [`Machine`](../interfaces/x_robot.Machine.md)[] | Array of parallel machines |

#### Returns

[`ParallelDirective`](../interfaces/x_robot.ParallelDirective.md)

ParallelDirective

___

### context

▸ **context**(`context`): [`ContextDirective`](../interfaces/x_robot.ContextDirective.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `context` | [`Function`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function ) \| [`Context`](../interfaces/x_robot.Context.md) | The context to be passed to the machine, can be a function that returns an object |

#### Returns

[`ContextDirective`](../interfaces/x_robot.ContextDirective.md)

ContextDirective

___

### initial

▸ **initial**(`initial`): [`InitialDirective`](../interfaces/x_robot.InitialDirective.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `initial` | `string` | The initial state of the machine |

#### Returns

[`InitialDirective`](../interfaces/x_robot.InitialDirective.md)

InitialDirective

___

### shouldFreeze

▸ **shouldFreeze**(`freeze`): [`ShouldFreezeDirective`](../interfaces/x_robot.ShouldFreezeDirective.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `freeze` | `boolean` | If false the machine will not be frozen. The machine will be frozen by default. |

#### Returns

[`ShouldFreezeDirective`](../interfaces/x_robot.ShouldFreezeDirective.md)

ShouldFreezeDirective

___

### history

▸ **history**(`limit`): [`HistoryDirective`](../interfaces/x_robot.HistoryDirective.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `limit` | `number` | The maximum number of history entries to keep. Set to 0 to disable history. |

#### Returns

[`HistoryDirective`](../interfaces/x_robot.HistoryDirective.md)

HistoryDirective

___

### state

▸ **state**(`name`, ...`args`): [`StateDirective`](../interfaces/x_robot.StateDirective.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The name of the state |
| `...args` | [`RunCollection`](../interfaces/x_robot.RunCollection.md) | nested machines, actions, producers, transitions, etc. |

#### Returns

[`StateDirective`](../interfaces/x_robot.StateDirective.md)

StateDirective

___

### transition

▸ **transition**(`transitionName`, `target`, ...`args`): [`TransitionDirective`](../interfaces/x_robot.TransitionDirective.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `transitionName` | `string` | The name of the transition |
| `target` | `string` | The target state of the transition |
| `...args` | ([`GuardsDirective`](../interfaces/x_robot.GuardsDirective.md) \| [`GuardDirective`](../interfaces/x_robot.GuardDirective.md) \| { `exit`: [`ExitDirective`](../interfaces/x_robot.ExitDirective.md)[]  })[] | Guards and optional exit or exitPulse at the end |

#### Returns

[`TransitionDirective`](../interfaces/x_robot.TransitionDirective.md)

TransitionDirective

___

### entry

▸ **entry**(`pulse`, `success?`, `failure?`): [`PulseDirective`](../interfaces/x_robot.PulseDirective.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pulse` | [`Pulse`](../interfaces/x_robot.Pulse.md) | The function to run when entering the state |
| `success?` | `string` \| [`PulseDirective`](../interfaces/x_robot.PulseDirective.md) | Optional success transition string |
| `failure?` | `string` \| [`PulseDirective`](../interfaces/x_robot.PulseDirective.md) | Optional failure transition string |

#### Returns

[`PulseDirective`](../interfaces/x_robot.PulseDirective.md)

PulseDirective

___

### exit

▸ **exit**(`handler`, `failure?`): `Object`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `handler` | [`Pulse`](../interfaces/x_robot.Pulse.md) | The function to run when exiting the state |
| `failure?` | `string` | Optional failure transition string |

#### Returns

`Object`

ExitDirective

| Name | Type |
| :------ | :------ |
| `exit` | [`ExitDirective`](../interfaces/x_robot.ExitDirective.md)[] |

___

### guard

▸ **guard**(`guard`, `failure?`): [`GuardDirective`](../interfaces/x_robot.GuardDirective.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `guard` | [`Guard`](../interfaces/x_robot.Guard.md) | The guard function to be run |
| `failure?` | `string` \| [`PulseDirective`](../interfaces/x_robot.PulseDirective.md) | The transition to run on failure (optional) |

#### Returns

[`GuardDirective`](../interfaces/x_robot.GuardDirective.md)

GuardDirective

___

### immediate

▸ **immediate**(`target`, ...`guards`): [`ImmediateDirective`](../interfaces/x_robot.ImmediateDirective.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `string` | The target state of the transition |
| `...guards` | [`GuardsDirective`](../interfaces/x_robot.GuardsDirective.md) | The guards of the transition |

#### Returns

[`ImmediateDirective`](../interfaces/x_robot.ImmediateDirective.md)

ImmediateDirective

___

### nestedGuard

▸ **nestedGuard**(`machine`, `guard`, `failure?`): [`NestedGuardDirective`](../interfaces/x_robot.NestedGuardDirective.md)

This method returns a nested guard directive.
It works like the guard directive but it receives the nested machine context as the first argument instead of the parent machine context.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `machine` | [`Machine`](../interfaces/x_robot.Machine.md) | The nested machine to be run |
| `guard` | [`Guard`](../interfaces/x_robot.Guard.md) | The guard to be run |
| `failure?` | `string` \| [`PulseDirective`](../interfaces/x_robot.PulseDirective.md) | - |

#### Returns

[`NestedGuardDirective`](../interfaces/x_robot.NestedGuardDirective.md)

NestedGuardDirective

___

### nested

▸ **nested**(`machine`, `transition?`): [`NestedMachineDirective`](../interfaces/x_robot.NestedMachineDirective.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `machine` | [`Machine`](../interfaces/x_robot.Machine.md) | The nested machine to be run |
| `transition?` | `string` | The transition to be run when the machine enters in the state that has the nested machine |

#### Returns

[`NestedMachineDirective`](../interfaces/x_robot.NestedMachineDirective.md)

NestedMachineDirective

___

### description

▸ **description**(`description`): [`DescriptionDirective`](../interfaces/x_robot.DescriptionDirective.md)

This is used as documentation for the serialization and in the diagram generation of the machine.
Not to be used in the machine execution itself.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `description` | `string` | The description of the state |

#### Returns

[`DescriptionDirective`](../interfaces/x_robot.DescriptionDirective.md)

DescriptionDirective

___

### infoState

▸ **infoState**(`name`, ...`args`): [`InfoStateDirective`](../interfaces/x_robot.InfoStateDirective.md)

State directive that represents an info state. This is used as documentation for the serialization and in the diagram generation of the machine.
Not to be used in the machine execution itself.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The name of the state |
| `...args` | [`RunCollection`](../interfaces/x_robot.RunCollection.md) | nested machines, actions, producers, transitions, etc. |

#### Returns

[`InfoStateDirective`](../interfaces/x_robot.InfoStateDirective.md)

InfoStateDirective

___

### primaryState

▸ **primaryState**(`name`, ...`args`): [`PrimaryStateDirective`](../interfaces/x_robot.PrimaryStateDirective.md)

State directive that represents a primary state. This is used as documentation for the serialization and in the diagram generation of the machine.
Not to be used in the machine execution itself.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The name of the state |
| `...args` | [`RunCollection`](../interfaces/x_robot.RunCollection.md) | nested machines, actions, producers, transitions, etc. |

#### Returns

[`PrimaryStateDirective`](../interfaces/x_robot.PrimaryStateDirective.md)

PrimaryStateDirective

___

### successState

▸ **successState**(`name`, ...`args`): [`SuccessStateDirective`](../interfaces/x_robot.SuccessStateDirective.md)

State directive that represents a success state. This is used as documentation for the serialization and in the diagram generation of the machine.
Not to be used in the machine execution itself.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The name of the state |
| `...args` | [`RunCollection`](../interfaces/x_robot.RunCollection.md) | nested machines, actions, producers, transitions, etc. |

#### Returns

[`SuccessStateDirective`](../interfaces/x_robot.SuccessStateDirective.md)

SuccessStateDirective

___

### warningState

▸ **warningState**(`name`, ...`args`): [`WarningStateDirective`](../interfaces/x_robot.WarningStateDirective.md)

State directive that represents a warning state. This is used as documentation for the serialization and in the diagram generation of the machine.
Not to be used in the machine execution itself.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The name of the state |
| `...args` | [`RunCollection`](../interfaces/x_robot.RunCollection.md) | nested machines, actions, producers, transitions, etc. |

#### Returns

[`WarningStateDirective`](../interfaces/x_robot.WarningStateDirective.md)

WarningStateDirective

___

### dangerState

▸ **dangerState**(`name`, ...`args`): [`DangerStateDirective`](../interfaces/x_robot.DangerStateDirective.md)

State directive that represents a danger state. This is used as documentation for the serialization and in the diagram generation of the machine.
Not to be used in the machine execution itself.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The name of the state |
| `...args` | [`RunCollection`](../interfaces/x_robot.RunCollection.md) | nested machines, actions, producers, transitions, etc. |

#### Returns

[`DangerStateDirective`](../interfaces/x_robot.DangerStateDirective.md)

DangerStateDirective

___

## Invocation Functions

### invoke

▸ **invoke**(`machine`, `transition`, `payload?`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`void`\> \| `void`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `machine` | [`Machine`](../interfaces/x_robot.Machine.md) | The machine to invoke the transition on |
| `transition` | `string` | The transition to invoke |
| `payload?` | `any` | The optional payload to pass to the transition |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`void`\> \| `void`

Void or a promise if the machine is async

___

### start

▸ **start**(`machine`, `payload?`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`void`\> \| `void`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `machine` | [`Machine`](../interfaces/x_robot.Machine.md) | The machine to run the initial state arguments |
| `payload?` | `any` | The optional payload to pass to the initial state |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`void`\> \| `void`

Void or a promise if the machine is async

___

## State Functions

### getState

▸ **getState**(`machine`, `path?`): [`AllStates`](../interfaces/x_robot.AllStates.md) \| [`CurrentState`](x_robot.md#currentstate)

Get the current state or the parallel states of the machine if no path is provided
Or get the current state of a nested machine if a path is provided

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `machine` | [`Machine`](../interfaces/x_robot.Machine.md) | The machine to get the current state of |
| `path?` | `string` | The path to the current state, e.g. 'stateA.stateB.stateC' |

#### Returns

[`AllStates`](../interfaces/x_robot.AllStates.md) \| [`CurrentState`](x_robot.md#currentstate)

The current state or null if the path is invalid

___

## Other Functions

### invokeAfter

▸ **invokeAfter**(`machine`, `timeInMilliseconds`, `event`, `payload?`): () => `void`

Invokes an event on the machine after a specified time delay.

**`Example`**

```ts
const cancelTimeout = invokeAfter(myMachine, 5000, 'timeout', { reason: 'network' });

// To cancel before it fires
cancelTimeout();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `machine` | [`Machine`](../interfaces/x_robot.Machine.md) | The machine to invoke |
| `timeInMilliseconds` | `number` | Time to wait before invoking |
| `event` | `string` | The event to invoke |
| `payload?` | `any` | Optional payload for the event |

#### Returns

`fn`

A cancel function to stop the scheduled invocation

▸ (): `void`

##### Returns

`void`

## Type Aliases

### CurrentState

Ƭ **CurrentState**: `string` \| ``null``

#### Defined in

[lib/machine/create.ts:739](https://github.com/Masquerade-Circus/x-robot/blob/dc79239/lib/machine/create.ts#L739)

## Variables

### START\_EVENT

• `Const` **START\_EVENT**: ``"__start__"``

#### Defined in

[lib/machine/interfaces.ts:215](https://github.com/Masquerade-Circus/x-robot/blob/dc79239/lib/machine/interfaces.ts#L215)

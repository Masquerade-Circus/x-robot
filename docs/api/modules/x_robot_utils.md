[x-robot - v0.3.0](../README.md) / [Modules](../modules.md) / x-robot/utils

# Module: x-robot/utils

## Table of contents

### Functions

- [isValidString](x_robot_utils.md#isvalidstring)
- [isValidObject](x_robot_utils.md#isvalidobject)
- [isProducer](x_robot_utils.md#isproducer)
- [isProducerWithTransition](x_robot_utils.md#isproducerwithtransition)
- [isProducerWithoutTransition](x_robot_utils.md#isproducerwithouttransition)
- [isEntry](x_robot_utils.md#isentry)
- [isExit](x_robot_utils.md#isexit)
- [isAction](x_robot_utils.md#isaction)
- [isImmediate](x_robot_utils.md#isimmediate)
- [isGuard](x_robot_utils.md#isguard)
- [isNestedGuard](x_robot_utils.md#isnestedguard)
- [isTransition](x_robot_utils.md#istransition)
- [hasTransition](x_robot_utils.md#hastransition)
- [hasState](x_robot_utils.md#hasstate)
- [isNestedMachineDirective](x_robot_utils.md#isnestedmachinedirective)
- [isNestedMachineWithTransitionDirective](x_robot_utils.md#isnestedmachinewithtransitiondirective)
- [isMachine](x_robot_utils.md#ismachine)
- [isStateDirective](x_robot_utils.md#isstatedirective)
- [isContextDirective](x_robot_utils.md#iscontextdirective)
- [isStatesDirective](x_robot_utils.md#isstatesdirective)
- [isParallelDirective](x_robot_utils.md#isparalleldirective)
- [isShouldFreezeDirective](x_robot_utils.md#isshouldfreezedirective)
- [isInitialDirective](x_robot_utils.md#isinitialdirective)
- [isHistoryDirective](x_robot_utils.md#ishistorydirective)
- [isInitDirective](x_robot_utils.md#isinitdirective)
- [isDescriptionDirective](x_robot_utils.md#isdescriptiondirective)
- [isNestedTransition](x_robot_utils.md#isnestedtransition)
- [isParallelTransition](x_robot_utils.md#isparalleltransition)
- [isNestedImmediateDirective](x_robot_utils.md#isnestedimmediatedirective)
- [isParallelImmediateDirective](x_robot_utils.md#isparallelimmediatedirective)
- [deepFreeze](x_robot_utils.md#deepfreeze)
- [deepCloneUnfreeze](x_robot_utils.md#deepcloneunfreeze)
- [canMakeTransition](x_robot_utils.md#canmaketransition)
- [isPlainObject](x_robot_utils.md#isplainobject)
- [titleToId](x_robot_utils.md#titletoid)

## Functions

### isValidString

▸ **isValidString**(`str?`): str is string

#### Parameters

| Name | Type |
| :------ | :------ |
| `str?` | `any` |

#### Returns

str is string

___

### isValidObject

▸ **isValidObject**(`obj`): obj is object

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `any` |

#### Returns

obj is object

___

### isProducer

▸ **isProducer**(`producer?`): producer is ProducerDirective

#### Parameters

| Name | Type |
| :------ | :------ |
| `producer?` | `any` |

#### Returns

producer is ProducerDirective

___

### isProducerWithTransition

▸ **isProducerWithTransition**(`producer?`): producer is ProducerDirectiveWithTransition

#### Parameters

| Name | Type |
| :------ | :------ |
| `producer?` | `any` |

#### Returns

producer is ProducerDirectiveWithTransition

___

### isProducerWithoutTransition

▸ **isProducerWithoutTransition**(`producer?`): producer is ProducerDirectiveWithoutTransition

#### Parameters

| Name | Type |
| :------ | :------ |
| `producer?` | `any` |

#### Returns

producer is ProducerDirectiveWithoutTransition

___

### isEntry

▸ **isEntry**(`entry?`): entry is PulseDirective

#### Parameters

| Name | Type |
| :------ | :------ |
| `entry?` | `any` |

#### Returns

entry is PulseDirective

___

### isExit

▸ **isExit**(`exit?`): exit is Object

#### Parameters

| Name | Type |
| :------ | :------ |
| `exit?` | `any` |

#### Returns

exit is Object

___

### isAction

▸ **isAction**(`action?`): action is ActionDirective

#### Parameters

| Name | Type |
| :------ | :------ |
| `action?` | `any` |

#### Returns

action is ActionDirective

___

### isImmediate

▸ **isImmediate**(`immediate?`): immediate is ImmediateDirective

#### Parameters

| Name | Type |
| :------ | :------ |
| `immediate?` | `any` |

#### Returns

immediate is ImmediateDirective

___

### isGuard

▸ **isGuard**(`guard?`): guard is GuardDirective

#### Parameters

| Name | Type |
| :------ | :------ |
| `guard?` | `any` |

#### Returns

guard is GuardDirective

___

### isNestedGuard

▸ **isNestedGuard**(`guard?`): guard is NestedGuardDirective

#### Parameters

| Name | Type |
| :------ | :------ |
| `guard?` | `any` |

#### Returns

guard is NestedGuardDirective

___

### isTransition

▸ **isTransition**(`transition?`): transition is TransitionDirective

#### Parameters

| Name | Type |
| :------ | :------ |
| `transition?` | `any` |

#### Returns

transition is TransitionDirective

___

### hasTransition

▸ **hasTransition**(`state`, `transition`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`StateDirective`](../interfaces/x_robot.StateDirective.md) |
| `transition` | `string` |

#### Returns

`boolean`

___

### hasState

▸ **hasState**(`machine`, `state`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `machine` | [`Machine`](../interfaces/x_robot.Machine.md) |
| `state` | `string` |

#### Returns

`boolean`

___

### isNestedMachineDirective

▸ **isNestedMachineDirective**(`machine?`): machine is NestedMachineDirective

#### Parameters

| Name | Type |
| :------ | :------ |
| `machine?` | `any` |

#### Returns

machine is NestedMachineDirective

___

### isNestedMachineWithTransitionDirective

▸ **isNestedMachineWithTransitionDirective**(`machine?`): machine is NestedMachineWithTransitionDirective

#### Parameters

| Name | Type |
| :------ | :------ |
| `machine?` | `any` |

#### Returns

machine is NestedMachineWithTransitionDirective

___

### isMachine

▸ **isMachine**(`machine?`): machine is Machine

#### Parameters

| Name | Type |
| :------ | :------ |
| `machine?` | `any` |

#### Returns

machine is Machine

___

### isStateDirective

▸ **isStateDirective**(`state?`): state is StateDirective

#### Parameters

| Name | Type |
| :------ | :------ |
| `state?` | `any` |

#### Returns

state is StateDirective

___

### isContextDirective

▸ **isContextDirective**(`context?`): context is ContextDirective

#### Parameters

| Name | Type |
| :------ | :------ |
| `context?` | `any` |

#### Returns

context is ContextDirective

___

### isStatesDirective

▸ **isStatesDirective**(`states?`): states is StatesDirective

#### Parameters

| Name | Type |
| :------ | :------ |
| `states?` | `any` |

#### Returns

states is StatesDirective

___

### isParallelDirective

▸ **isParallelDirective**(`parallel?`): parallel is ParallelDirective

#### Parameters

| Name | Type |
| :------ | :------ |
| `parallel?` | `any` |

#### Returns

parallel is ParallelDirective

___

### isShouldFreezeDirective

▸ **isShouldFreezeDirective**(`shouldFreeze?`): shouldFreeze is ShouldFreezeDirective

#### Parameters

| Name | Type |
| :------ | :------ |
| `shouldFreeze?` | `any` |

#### Returns

shouldFreeze is ShouldFreezeDirective

___

### isInitialDirective

▸ **isInitialDirective**(`initial?`): initial is InitialDirective

#### Parameters

| Name | Type |
| :------ | :------ |
| `initial?` | `any` |

#### Returns

initial is InitialDirective

___

### isHistoryDirective

▸ **isHistoryDirective**(`history?`): history is HistoryDirective

#### Parameters

| Name | Type |
| :------ | :------ |
| `history?` | `any` |

#### Returns

history is HistoryDirective

___

### isInitDirective

▸ **isInitDirective**(`init?`): init is InitDirective

#### Parameters

| Name | Type |
| :------ | :------ |
| `init?` | `any` |

#### Returns

init is InitDirective

___

### isDescriptionDirective

▸ **isDescriptionDirective**(`description?`): description is DescriptionDirective

#### Parameters

| Name | Type |
| :------ | :------ |
| `description?` | `any` |

#### Returns

description is DescriptionDirective

___

### isNestedTransition

▸ **isNestedTransition**(`transition?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `transition?` | `any` |

#### Returns

`boolean`

___

### isParallelTransition

▸ **isParallelTransition**(`transition?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `transition?` | `any` |

#### Returns

`boolean`

___

### isNestedImmediateDirective

▸ **isNestedImmediateDirective**(`immediate?`): immediate is NestedImmediateDirective

#### Parameters

| Name | Type |
| :------ | :------ |
| `immediate?` | `any` |

#### Returns

immediate is NestedImmediateDirective

___

### isParallelImmediateDirective

▸ **isParallelImmediateDirective**(`immediate?`): immediate is ParallelImmediateDirective

#### Parameters

| Name | Type |
| :------ | :------ |
| `immediate?` | `any` |

#### Returns

immediate is ParallelImmediateDirective

___

### deepFreeze

▸ **deepFreeze**(`obj`, `freezeClassInstances?`, `seen?`): `any`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `obj` | `any` | `undefined` |
| `freezeClassInstances` | `boolean` | `false` |
| `seen` | [`WeakSet`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet )<`object`\> | `undefined` |

#### Returns

`any`

___

### deepCloneUnfreeze

▸ **deepCloneUnfreeze**<`T`\>(`obj`, `cloneClassInstances?`, `seen?`): `T`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `obj` | `T` | `undefined` |
| `cloneClassInstances` | `boolean` | `false` |
| `seen` | [`WeakMap`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap )<`object`, `any`\> | `undefined` |

#### Returns

`T`

___

### canMakeTransition

▸ **canMakeTransition**(`machine`, `currentStateObject`, `transition`): `boolean`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `machine` | [`Machine`](../interfaces/x_robot.Machine.md) | The machine that is currently running |
| `currentStateObject` | [`StateDirective`](../interfaces/x_robot.StateDirective.md) | The current state of the machine |
| `transition` | `string` | The transition that we want to execute |

#### Returns

`boolean`

boolean true if the transition can be executed, false otherwise

___

### isPlainObject

▸ **isPlainObject**(`value`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `any` |

#### Returns

`boolean`

___

### titleToId

▸ **titleToId**(`str`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `str` | `string` |

#### Returns

`string`

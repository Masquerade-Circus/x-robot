[x-robot - v0.3.0](../README.md) / [Modules](../modules.md) / [x-robot](../modules/x_robot.md) / Machine

# Interface: Machine

[x-robot](../modules/x_robot.md).Machine

## Table of contents

### Properties

- [id](x_robot.Machine.md#id)
- [title](x_robot.Machine.md#title)
- [context](x_robot.Machine.md#context)
- [isAsync](x_robot.Machine.md#isasync)
- [states](x_robot.Machine.md#states)
- [initial](x_robot.Machine.md#initial)
- [current](x_robot.Machine.md#current)
- [frozen](x_robot.Machine.md#frozen)
- [fatal](x_robot.Machine.md#fatal)
- [history](x_robot.Machine.md#history)
- [parallel](x_robot.Machine.md#parallel)

## Properties

### id

• **id**: `string`

#### Defined in

[lib/machine/interfaces.ts:158](https://github.com/Masquerade-Circus/x-robot/blob/3ab8fd4/lib/machine/interfaces.ts#L158)

___

### title

• **title**: ``null`` \| `string`

#### Defined in

[lib/machine/interfaces.ts:159](https://github.com/Masquerade-Circus/x-robot/blob/3ab8fd4/lib/machine/interfaces.ts#L159)

___

### context

• **context**: [`Context`](x_robot.Context.md)

#### Defined in

[lib/machine/interfaces.ts:160](https://github.com/Masquerade-Circus/x-robot/blob/3ab8fd4/lib/machine/interfaces.ts#L160)

___

### isAsync

• **isAsync**: `boolean`

#### Defined in

[lib/machine/interfaces.ts:161](https://github.com/Masquerade-Circus/x-robot/blob/3ab8fd4/lib/machine/interfaces.ts#L161)

___

### states

• **states**: [`StatesDirective`](x_robot.StatesDirective.md)

#### Defined in

[lib/machine/interfaces.ts:162](https://github.com/Masquerade-Circus/x-robot/blob/3ab8fd4/lib/machine/interfaces.ts#L162)

___

### initial

• **initial**: `string`

#### Defined in

[lib/machine/interfaces.ts:163](https://github.com/Masquerade-Circus/x-robot/blob/3ab8fd4/lib/machine/interfaces.ts#L163)

___

### current

• **current**: `string`

#### Defined in

[lib/machine/interfaces.ts:164](https://github.com/Masquerade-Circus/x-robot/blob/3ab8fd4/lib/machine/interfaces.ts#L164)

___

### frozen

• **frozen**: `boolean`

#### Defined in

[lib/machine/interfaces.ts:165](https://github.com/Masquerade-Circus/x-robot/blob/3ab8fd4/lib/machine/interfaces.ts#L165)

___

### fatal

• `Optional` **fatal**: [`Error`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error )

#### Defined in

[lib/machine/interfaces.ts:166](https://github.com/Masquerade-Circus/x-robot/blob/3ab8fd4/lib/machine/interfaces.ts#L166)

___

### history

• **history**: `string`[]

#### Defined in

[lib/machine/interfaces.ts:167](https://github.com/Masquerade-Circus/x-robot/blob/3ab8fd4/lib/machine/interfaces.ts#L167)

___

### parallel

• **parallel**: `Record`<`string`, [`Machine`](x_robot.Machine.md)\>

#### Defined in

[lib/machine/interfaces.ts:168](https://github.com/Masquerade-Circus/x-robot/blob/3ab8fd4/lib/machine/interfaces.ts#L168)

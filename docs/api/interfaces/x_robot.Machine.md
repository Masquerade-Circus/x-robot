[x-robot - v1.0.0](../README.md) / [Modules](../modules.md) / [x-robot](../modules/x_robot.md) / Machine

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
- [historyLimit](x_robot.Machine.md#historylimit)
- [parallel](x_robot.Machine.md#parallel)

## Properties

### id

• **id**: `string`

#### Defined in

[lib/machine/interfaces.ts:138](https://github.com/Masquerade-Circus/x-robot/blob/4451d69/lib/machine/interfaces.ts#L138)

___

### title

• **title**: ``null`` \| `string`

#### Defined in

[lib/machine/interfaces.ts:139](https://github.com/Masquerade-Circus/x-robot/blob/4451d69/lib/machine/interfaces.ts#L139)

___

### context

• **context**: [`Context`](x_robot.Context.md)

#### Defined in

[lib/machine/interfaces.ts:140](https://github.com/Masquerade-Circus/x-robot/blob/4451d69/lib/machine/interfaces.ts#L140)

___

### isAsync

• **isAsync**: `boolean`

#### Defined in

[lib/machine/interfaces.ts:141](https://github.com/Masquerade-Circus/x-robot/blob/4451d69/lib/machine/interfaces.ts#L141)

___

### states

• **states**: [`StatesDirective`](x_robot.StatesDirective.md)

#### Defined in

[lib/machine/interfaces.ts:142](https://github.com/Masquerade-Circus/x-robot/blob/4451d69/lib/machine/interfaces.ts#L142)

___

### initial

• **initial**: `string`

#### Defined in

[lib/machine/interfaces.ts:143](https://github.com/Masquerade-Circus/x-robot/blob/4451d69/lib/machine/interfaces.ts#L143)

___

### current

• **current**: `string`

#### Defined in

[lib/machine/interfaces.ts:144](https://github.com/Masquerade-Circus/x-robot/blob/4451d69/lib/machine/interfaces.ts#L144)

___

### frozen

• **frozen**: `boolean`

#### Defined in

[lib/machine/interfaces.ts:145](https://github.com/Masquerade-Circus/x-robot/blob/4451d69/lib/machine/interfaces.ts#L145)

___

### fatal

• `Optional` **fatal**: [`Error`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error )

#### Defined in

[lib/machine/interfaces.ts:146](https://github.com/Masquerade-Circus/x-robot/blob/4451d69/lib/machine/interfaces.ts#L146)

___

### history

• **history**: `string`[]

#### Defined in

[lib/machine/interfaces.ts:147](https://github.com/Masquerade-Circus/x-robot/blob/4451d69/lib/machine/interfaces.ts#L147)

___

### historyLimit

• `Optional` **historyLimit**: `number`

#### Defined in

[lib/machine/interfaces.ts:148](https://github.com/Masquerade-Circus/x-robot/blob/4451d69/lib/machine/interfaces.ts#L148)

___

### parallel

• **parallel**: `Record`<`string`, [`Machine`](x_robot.Machine.md)\>

#### Defined in

[lib/machine/interfaces.ts:149](https://github.com/Masquerade-Circus/x-robot/blob/4451d69/lib/machine/interfaces.ts#L149)

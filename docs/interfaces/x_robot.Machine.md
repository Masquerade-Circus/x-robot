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
- [historyLimit](x_robot.Machine.md#historylimit)
- [parallel](x_robot.Machine.md#parallel)

## Properties

### id

• **id**: `string`

#### Defined in

[lib/machine/interfaces.ts:165](https://github.com/Masquerade-Circus/x-robot/blob/43ea191/lib/machine/interfaces.ts#L165)

___

### title

• **title**: ``null`` \| `string`

#### Defined in

[lib/machine/interfaces.ts:166](https://github.com/Masquerade-Circus/x-robot/blob/43ea191/lib/machine/interfaces.ts#L166)

___

### context

• **context**: [`Context`](x_robot.Context.md)

#### Defined in

[lib/machine/interfaces.ts:167](https://github.com/Masquerade-Circus/x-robot/blob/43ea191/lib/machine/interfaces.ts#L167)

___

### isAsync

• **isAsync**: `boolean`

#### Defined in

[lib/machine/interfaces.ts:168](https://github.com/Masquerade-Circus/x-robot/blob/43ea191/lib/machine/interfaces.ts#L168)

___

### states

• **states**: [`StatesDirective`](x_robot.StatesDirective.md)

#### Defined in

[lib/machine/interfaces.ts:169](https://github.com/Masquerade-Circus/x-robot/blob/43ea191/lib/machine/interfaces.ts#L169)

___

### initial

• **initial**: `string`

#### Defined in

[lib/machine/interfaces.ts:170](https://github.com/Masquerade-Circus/x-robot/blob/43ea191/lib/machine/interfaces.ts#L170)

___

### current

• **current**: `string`

#### Defined in

[lib/machine/interfaces.ts:171](https://github.com/Masquerade-Circus/x-robot/blob/43ea191/lib/machine/interfaces.ts#L171)

___

### frozen

• **frozen**: `boolean`

#### Defined in

[lib/machine/interfaces.ts:172](https://github.com/Masquerade-Circus/x-robot/blob/43ea191/lib/machine/interfaces.ts#L172)

___

### fatal

• `Optional` **fatal**: [`Error`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error )

#### Defined in

[lib/machine/interfaces.ts:173](https://github.com/Masquerade-Circus/x-robot/blob/43ea191/lib/machine/interfaces.ts#L173)

___

### history

• **history**: `string`[]

#### Defined in

[lib/machine/interfaces.ts:174](https://github.com/Masquerade-Circus/x-robot/blob/43ea191/lib/machine/interfaces.ts#L174)

___

### historyLimit

• `Optional` **historyLimit**: `number`

#### Defined in

[lib/machine/interfaces.ts:175](https://github.com/Masquerade-Circus/x-robot/blob/43ea191/lib/machine/interfaces.ts#L175)

___

### parallel

• **parallel**: `Record`<`string`, [`Machine`](x_robot.Machine.md)\>

#### Defined in

[lib/machine/interfaces.ts:176](https://github.com/Masquerade-Circus/x-robot/blob/43ea191/lib/machine/interfaces.ts#L176)

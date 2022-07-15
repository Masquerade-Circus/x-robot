[Api](../README.md) / [x-robot](../modules/x_robot.md) / Machine

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

[lib/machine/interfaces.ts:145](https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/machine/interfaces.ts#L145)

___

### title

• **title**: ``null`` \| `string`

#### Defined in

[lib/machine/interfaces.ts:146](https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/machine/interfaces.ts#L146)

___

### context

• **context**: [`Context`](x_robot.Context.md)

#### Defined in

[lib/machine/interfaces.ts:147](https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/machine/interfaces.ts#L147)

___

### isAsync

• **isAsync**: `boolean`

#### Defined in

[lib/machine/interfaces.ts:148](https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/machine/interfaces.ts#L148)

___

### states

• **states**: [`StatesDirective`](x_robot.StatesDirective.md)

#### Defined in

[lib/machine/interfaces.ts:149](https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/machine/interfaces.ts#L149)

___

### initial

• **initial**: `string`

#### Defined in

[lib/machine/interfaces.ts:150](https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/machine/interfaces.ts#L150)

___

### current

• **current**: `string`

#### Defined in

[lib/machine/interfaces.ts:151](https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/machine/interfaces.ts#L151)

___

### frozen

• **frozen**: `boolean`

#### Defined in

[lib/machine/interfaces.ts:152](https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/machine/interfaces.ts#L152)

___

### fatal

• `Optional` **fatal**: [`Error`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error )

#### Defined in

[lib/machine/interfaces.ts:153](https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/machine/interfaces.ts#L153)

___

### history

• **history**: `string`[]

#### Defined in

[lib/machine/interfaces.ts:154](https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/machine/interfaces.ts#L154)

___

### parallel

• **parallel**: `Record`<`string`, [`Machine`](x_robot.Machine.md)\>

#### Defined in

[lib/machine/interfaces.ts:155](https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/machine/interfaces.ts#L155)

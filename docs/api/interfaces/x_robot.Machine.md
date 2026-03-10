[x-robot - v1.0.1](../README.md) / [Modules](../modules.md) / [x-robot](../modules/x_robot.md) / Machine

# Interface: Machine

[x-robot](../modules/x_robot.md).Machine

## Table of contents

### Properties

*   [id](x_robot.Machine.md#id)
*   [title](x_robot.Machine.md#title)
*   [context](x_robot.Machine.md#context)
*   [isAsync](x_robot.Machine.md#isasync)
*   [states](x_robot.Machine.md#states)
*   [initial](x_robot.Machine.md#initial)
*   [current](x_robot.Machine.md#current)
*   [frozen](x_robot.Machine.md#frozen)
*   [fatal](x_robot.Machine.md#fatal)
*   [history](x_robot.Machine.md#history)
*   [historyLimit](x_robot.Machine.md#historylimit)
*   [parallel](x_robot.Machine.md#parallel)

## Properties

### id

• **id**: `string`

#### Defined in

[lib/machine/interfaces.ts:138](https://github.com/Masquerade-Circus/x-robot/blob/f19e6ca/lib/machine/interfaces.ts#L138)

***

### title

• **title**: `null` | `string`

#### Defined in

[lib/machine/interfaces.ts:139](https://github.com/Masquerade-Circus/x-robot/blob/f19e6ca/lib/machine/interfaces.ts#L139)

***

### context

• **context**: [`Context`](x_robot.Context.md)

#### Defined in

[lib/machine/interfaces.ts:140](https://github.com/Masquerade-Circus/x-robot/blob/f19e6ca/lib/machine/interfaces.ts#L140)

***

### isAsync

• **isAsync**: `boolean`

#### Defined in

[lib/machine/interfaces.ts:141](https://github.com/Masquerade-Circus/x-robot/blob/f19e6ca/lib/machine/interfaces.ts#L141)

***

### states

• **states**: [`StatesDirective`](x_robot.StatesDirective.md)

#### Defined in

[lib/machine/interfaces.ts:142](https://github.com/Masquerade-Circus/x-robot/blob/f19e6ca/lib/machine/interfaces.ts#L142)

***

### initial

• **initial**: `string`

#### Defined in

[lib/machine/interfaces.ts:143](https://github.com/Masquerade-Circus/x-robot/blob/f19e6ca/lib/machine/interfaces.ts#L143)

***

### current

• **current**: `string`

#### Defined in

[lib/machine/interfaces.ts:144](https://github.com/Masquerade-Circus/x-robot/blob/f19e6ca/lib/machine/interfaces.ts#L144)

***

### frozen

• **frozen**: `boolean`

#### Defined in

[lib/machine/interfaces.ts:145](https://github.com/Masquerade-Circus/x-robot/blob/f19e6ca/lib/machine/interfaces.ts#L145)

***

### fatal

• `Optional` **fatal**: [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)

#### Defined in

[lib/machine/interfaces.ts:146](https://github.com/Masquerade-Circus/x-robot/blob/f19e6ca/lib/machine/interfaces.ts#L146)

***

### history

• **history**: `string`\[]

#### Defined in

[lib/machine/interfaces.ts:147](https://github.com/Masquerade-Circus/x-robot/blob/f19e6ca/lib/machine/interfaces.ts#L147)

***

### historyLimit

• `Optional` **historyLimit**: `number`

#### Defined in

[lib/machine/interfaces.ts:148](https://github.com/Masquerade-Circus/x-robot/blob/f19e6ca/lib/machine/interfaces.ts#L148)

***

### parallel

• **parallel**: `Record`<`string`, [`Machine`](x_robot.Machine.md)>

#### Defined in

[lib/machine/interfaces.ts:149](https://github.com/Masquerade-Circus/x-robot/blob/f19e6ca/lib/machine/interfaces.ts#L149)

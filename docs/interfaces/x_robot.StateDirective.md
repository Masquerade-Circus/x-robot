[x-robot - v0.2.0](../README.md) / [Modules](../modules.md) / [x-robot](../modules/x_robot.md) / StateDirective

# Interface: StateDirective

[x-robot](../modules/x_robot.md).StateDirective

## Hierarchy

- **`StateDirective`**

  ↳ [`InfoStateDirective`](x_robot.InfoStateDirective.md)

  ↳ [`WarningStateDirective`](x_robot.WarningStateDirective.md)

  ↳ [`DangerStateDirective`](x_robot.DangerStateDirective.md)

  ↳ [`PrimaryStateDirective`](x_robot.PrimaryStateDirective.md)

  ↳ [`SuccessStateDirective`](x_robot.SuccessStateDirective.md)

## Table of contents

### Properties

- [name](x_robot.StateDirective.md#name)
- [run](x_robot.StateDirective.md#run)
- [on](x_robot.StateDirective.md#on)
- [immediate](x_robot.StateDirective.md#immediate)
- [args](x_robot.StateDirective.md#args)
- [type](x_robot.StateDirective.md#type)
- [nested](x_robot.StateDirective.md#nested)
- [description](x_robot.StateDirective.md#description)

## Properties

### name

• **name**: `string`

#### Defined in

[lib/machine/interfaces.ts:99](https://github.com/Masquerade-Circus/x-robot/blob/0346b56/lib/machine/interfaces.ts#L99)

___

### run

• **run**: ([`ProducerDirective`](x_robot.ProducerDirective.md) \| [`ActionDirective`](x_robot.ActionDirective.md))[]

#### Defined in

[lib/machine/interfaces.ts:100](https://github.com/Masquerade-Circus/x-robot/blob/0346b56/lib/machine/interfaces.ts#L100)

___

### on

• **on**: [`TransitionsDirective`](x_robot.TransitionsDirective.md)

#### Defined in

[lib/machine/interfaces.ts:101](https://github.com/Masquerade-Circus/x-robot/blob/0346b56/lib/machine/interfaces.ts#L101)

___

### immediate

• **immediate**: [`ImmediateDirective`](x_robot.ImmediateDirective.md)[]

#### Defined in

[lib/machine/interfaces.ts:102](https://github.com/Masquerade-Circus/x-robot/blob/0346b56/lib/machine/interfaces.ts#L102)

___

### args

• **args**: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirective`](x_robot.ProducerDirective.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]

#### Defined in

[lib/machine/interfaces.ts:103](https://github.com/Masquerade-Circus/x-robot/blob/0346b56/lib/machine/interfaces.ts#L103)

___

### type

• **type**: `string`

#### Defined in

[lib/machine/interfaces.ts:111](https://github.com/Masquerade-Circus/x-robot/blob/0346b56/lib/machine/interfaces.ts#L111)

___

### nested

• **nested**: [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)[]

#### Defined in

[lib/machine/interfaces.ts:112](https://github.com/Masquerade-Circus/x-robot/blob/0346b56/lib/machine/interfaces.ts#L112)

___

### description

• `Optional` **description**: `string`

#### Defined in

[lib/machine/interfaces.ts:113](https://github.com/Masquerade-Circus/x-robot/blob/0346b56/lib/machine/interfaces.ts#L113)

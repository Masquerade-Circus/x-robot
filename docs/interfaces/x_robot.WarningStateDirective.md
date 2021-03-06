[x-robot - v0.2.0](../README.md) / [Modules](../modules.md) / [x-robot](../modules/x_robot.md) / WarningStateDirective

# Interface: WarningStateDirective

[x-robot](../modules/x_robot.md).WarningStateDirective

## Hierarchy

- [`StateDirective`](x_robot.StateDirective.md)

  ↳ **`WarningStateDirective`**

## Table of contents

### Properties

- [type](x_robot.WarningStateDirective.md#type)
- [name](x_robot.WarningStateDirective.md#name)
- [run](x_robot.WarningStateDirective.md#run)
- [on](x_robot.WarningStateDirective.md#on)
- [immediate](x_robot.WarningStateDirective.md#immediate)
- [args](x_robot.WarningStateDirective.md#args)
- [nested](x_robot.WarningStateDirective.md#nested)
- [description](x_robot.WarningStateDirective.md#description)

## Properties

### type

• **type**: ``"warning"``

#### Overrides

[StateDirective](x_robot.StateDirective.md).[type](x_robot.StateDirective.md#type)

#### Defined in

[lib/machine/interfaces.ts:121](https://github.com/Masquerade-Circus/x-robot/blob/0346b56/lib/machine/interfaces.ts#L121)

___

### name

• **name**: `string`

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[name](x_robot.StateDirective.md#name)

#### Defined in

[lib/machine/interfaces.ts:99](https://github.com/Masquerade-Circus/x-robot/blob/0346b56/lib/machine/interfaces.ts#L99)

___

### run

• **run**: ([`ProducerDirective`](x_robot.ProducerDirective.md) \| [`ActionDirective`](x_robot.ActionDirective.md))[]

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[run](x_robot.StateDirective.md#run)

#### Defined in

[lib/machine/interfaces.ts:100](https://github.com/Masquerade-Circus/x-robot/blob/0346b56/lib/machine/interfaces.ts#L100)

___

### on

• **on**: [`TransitionsDirective`](x_robot.TransitionsDirective.md)

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[on](x_robot.StateDirective.md#on)

#### Defined in

[lib/machine/interfaces.ts:101](https://github.com/Masquerade-Circus/x-robot/blob/0346b56/lib/machine/interfaces.ts#L101)

___

### immediate

• **immediate**: [`ImmediateDirective`](x_robot.ImmediateDirective.md)[]

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[immediate](x_robot.StateDirective.md#immediate)

#### Defined in

[lib/machine/interfaces.ts:102](https://github.com/Masquerade-Circus/x-robot/blob/0346b56/lib/machine/interfaces.ts#L102)

___

### args

• **args**: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`ProducerDirective`](x_robot.ProducerDirective.md) \| [`ActionDirective`](x_robot.ActionDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[args](x_robot.StateDirective.md#args)

#### Defined in

[lib/machine/interfaces.ts:103](https://github.com/Masquerade-Circus/x-robot/blob/0346b56/lib/machine/interfaces.ts#L103)

___

### nested

• **nested**: [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)[]

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[nested](x_robot.StateDirective.md#nested)

#### Defined in

[lib/machine/interfaces.ts:112](https://github.com/Masquerade-Circus/x-robot/blob/0346b56/lib/machine/interfaces.ts#L112)

___

### description

• `Optional` **description**: `string`

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[description](x_robot.StateDirective.md#description)

#### Defined in

[lib/machine/interfaces.ts:113](https://github.com/Masquerade-Circus/x-robot/blob/0346b56/lib/machine/interfaces.ts#L113)

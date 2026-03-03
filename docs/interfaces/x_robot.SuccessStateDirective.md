[x-robot - v0.3.0](../README.md) / [Modules](../modules.md) / [x-robot](../modules/x_robot.md) / SuccessStateDirective

# Interface: SuccessStateDirective

[x-robot](../modules/x_robot.md).SuccessStateDirective

## Hierarchy

- [`StateDirective`](x_robot.StateDirective.md)

  ↳ **`SuccessStateDirective`**

## Table of contents

### Properties

- [type](x_robot.SuccessStateDirective.md#type)
- [name](x_robot.SuccessStateDirective.md#name)
- [run](x_robot.SuccessStateDirective.md#run)
- [on](x_robot.SuccessStateDirective.md#on)
- [immediate](x_robot.SuccessStateDirective.md#immediate)
- [args](x_robot.SuccessStateDirective.md#args)
- [nested](x_robot.SuccessStateDirective.md#nested)
- [description](x_robot.SuccessStateDirective.md#description)

## Properties

### type

• **type**: ``"success"``

#### Overrides

[StateDirective](x_robot.StateDirective.md).[type](x_robot.StateDirective.md#type)

#### Defined in

[lib/machine/interfaces.ts:153](https://github.com/Masquerade-Circus/x-robot/blob/6561229/lib/machine/interfaces.ts#L153)

___

### name

• **name**: `string`

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[name](x_robot.StateDirective.md#name)

#### Defined in

[lib/machine/interfaces.ts:120](https://github.com/Masquerade-Circus/x-robot/blob/6561229/lib/machine/interfaces.ts#L120)

___

### run

• **run**: [`PulseDirective`](x_robot.PulseDirective.md)[]

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[run](x_robot.StateDirective.md#run)

#### Defined in

[lib/machine/interfaces.ts:121](https://github.com/Masquerade-Circus/x-robot/blob/6561229/lib/machine/interfaces.ts#L121)

___

### on

• **on**: [`TransitionsDirective`](x_robot.TransitionsDirective.md)

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[on](x_robot.StateDirective.md#on)

#### Defined in

[lib/machine/interfaces.ts:122](https://github.com/Masquerade-Circus/x-robot/blob/6561229/lib/machine/interfaces.ts#L122)

___

### immediate

• **immediate**: [`ImmediateDirective`](x_robot.ImmediateDirective.md)[]

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[immediate](x_robot.StateDirective.md#immediate)

#### Defined in

[lib/machine/interfaces.ts:123](https://github.com/Masquerade-Circus/x-robot/blob/6561229/lib/machine/interfaces.ts#L123)

___

### args

• **args**: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`PulseDirective`](x_robot.PulseDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[args](x_robot.StateDirective.md#args)

#### Defined in

[lib/machine/interfaces.ts:124](https://github.com/Masquerade-Circus/x-robot/blob/6561229/lib/machine/interfaces.ts#L124)

___

### nested

• **nested**: [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)[]

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[nested](x_robot.StateDirective.md#nested)

#### Defined in

[lib/machine/interfaces.ts:132](https://github.com/Masquerade-Circus/x-robot/blob/6561229/lib/machine/interfaces.ts#L132)

___

### description

• `Optional` **description**: `string`

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[description](x_robot.StateDirective.md#description)

#### Defined in

[lib/machine/interfaces.ts:133](https://github.com/Masquerade-Circus/x-robot/blob/6561229/lib/machine/interfaces.ts#L133)

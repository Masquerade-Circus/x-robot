[x-robot - v0.3.0](../README.md) / [Modules](../modules.md) / [x-robot](../modules/x_robot.md) / PrimaryStateDirective

# Interface: PrimaryStateDirective

[x-robot](../modules/x_robot.md).PrimaryStateDirective

## Hierarchy

- [`StateDirective`](x_robot.StateDirective.md)

  ↳ **`PrimaryStateDirective`**

## Table of contents

### Properties

- [type](x_robot.PrimaryStateDirective.md#type)
- [name](x_robot.PrimaryStateDirective.md#name)
- [run](x_robot.PrimaryStateDirective.md#run)
- [on](x_robot.PrimaryStateDirective.md#on)
- [immediate](x_robot.PrimaryStateDirective.md#immediate)
- [args](x_robot.PrimaryStateDirective.md#args)
- [nested](x_robot.PrimaryStateDirective.md#nested)
- [description](x_robot.PrimaryStateDirective.md#description)

## Properties

### type

• **type**: ``"primary"``

#### Overrides

[StateDirective](x_robot.StateDirective.md).[type](x_robot.StateDirective.md#type)

#### Defined in

[lib/machine/interfaces.ts:143](https://github.com/Masquerade-Circus/x-robot/blob/5737eb3/lib/machine/interfaces.ts#L143)

___

### name

• **name**: `string`

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[name](x_robot.StateDirective.md#name)

#### Defined in

[lib/machine/interfaces.ts:114](https://github.com/Masquerade-Circus/x-robot/blob/5737eb3/lib/machine/interfaces.ts#L114)

___

### run

• **run**: [`PulseDirective`](x_robot.PulseDirective.md)[]

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[run](x_robot.StateDirective.md#run)

#### Defined in

[lib/machine/interfaces.ts:115](https://github.com/Masquerade-Circus/x-robot/blob/5737eb3/lib/machine/interfaces.ts#L115)

___

### on

• **on**: [`TransitionsDirective`](x_robot.TransitionsDirective.md)

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[on](x_robot.StateDirective.md#on)

#### Defined in

[lib/machine/interfaces.ts:116](https://github.com/Masquerade-Circus/x-robot/blob/5737eb3/lib/machine/interfaces.ts#L116)

___

### immediate

• **immediate**: [`ImmediateDirective`](x_robot.ImmediateDirective.md)[]

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[immediate](x_robot.StateDirective.md#immediate)

#### Defined in

[lib/machine/interfaces.ts:117](https://github.com/Masquerade-Circus/x-robot/blob/5737eb3/lib/machine/interfaces.ts#L117)

___

### args

• **args**: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`PulseDirective`](x_robot.PulseDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[args](x_robot.StateDirective.md#args)

#### Defined in

[lib/machine/interfaces.ts:118](https://github.com/Masquerade-Circus/x-robot/blob/5737eb3/lib/machine/interfaces.ts#L118)

___

### nested

• **nested**: [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)[]

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[nested](x_robot.StateDirective.md#nested)

#### Defined in

[lib/machine/interfaces.ts:126](https://github.com/Masquerade-Circus/x-robot/blob/5737eb3/lib/machine/interfaces.ts#L126)

___

### description

• `Optional` **description**: `string`

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[description](x_robot.StateDirective.md#description)

#### Defined in

[lib/machine/interfaces.ts:127](https://github.com/Masquerade-Circus/x-robot/blob/5737eb3/lib/machine/interfaces.ts#L127)

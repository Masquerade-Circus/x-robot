[x-robot - v1.1.0](../README.md) / [Modules](../modules.md) / [x-robot](../modules/x_robot.md) / InfoStateDirective

# Interface: InfoStateDirective

[x-robot](../modules/x_robot.md).InfoStateDirective

## Hierarchy

*   [`StateDirective`](x_robot.StateDirective.md)

    ↳ **`InfoStateDirective`**

## Table of contents

### Properties

*   [type](x_robot.InfoStateDirective.md#type)
*   [name](x_robot.InfoStateDirective.md#name)
*   [run](x_robot.InfoStateDirective.md#run)
*   [on](x_robot.InfoStateDirective.md#on)
*   [immediate](x_robot.InfoStateDirective.md#immediate)
*   [args](x_robot.InfoStateDirective.md#args)
*   [nested](x_robot.InfoStateDirective.md#nested)
*   [description](x_robot.InfoStateDirective.md#description)

## Properties

### type

• **type**: `"info"`

#### Overrides

[StateDirective](x_robot.StateDirective.md).[type](x_robot.StateDirective.md#type)

#### Defined in

[lib/machine/interfaces.ts:110](https://github.com/Masquerade-Circus/x-robot/blob/f8aa666/lib/machine/interfaces.ts#L110)

***

### name

• **name**: `string`

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[name](x_robot.StateDirective.md#name)

#### Defined in

[lib/machine/interfaces.ts:93](https://github.com/Masquerade-Circus/x-robot/blob/f8aa666/lib/machine/interfaces.ts#L93)

***

### run

• **run**: [`PulseDirective`](x_robot.PulseDirective.md)\[]

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[run](x_robot.StateDirective.md#run)

#### Defined in

[lib/machine/interfaces.ts:94](https://github.com/Masquerade-Circus/x-robot/blob/f8aa666/lib/machine/interfaces.ts#L94)

***

### on

• **on**: [`TransitionsDirective`](x_robot.TransitionsDirective.md)

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[on](x_robot.StateDirective.md#on)

#### Defined in

[lib/machine/interfaces.ts:95](https://github.com/Masquerade-Circus/x-robot/blob/f8aa666/lib/machine/interfaces.ts#L95)

***

### immediate

• **immediate**: [`ImmediateDirective`](x_robot.ImmediateDirective.md)\[]

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[immediate](x_robot.StateDirective.md#immediate)

#### Defined in

[lib/machine/interfaces.ts:96](https://github.com/Masquerade-Circus/x-robot/blob/f8aa666/lib/machine/interfaces.ts#L96)

***

### args

• **args**: ([`TransitionDirective`](x_robot.TransitionDirective.md) | [`ImmediateDirective`](x_robot.ImmediateDirective.md) | [`PulseDirective`](x_robot.PulseDirective.md) | [`DescriptionDirective`](x_robot.DescriptionDirective.md) | [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))\[]

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[args](x_robot.StateDirective.md#args)

#### Defined in

[lib/machine/interfaces.ts:97](https://github.com/Masquerade-Circus/x-robot/blob/f8aa666/lib/machine/interfaces.ts#L97)

***

### nested

• **nested**: [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)\[]

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[nested](x_robot.StateDirective.md#nested)

#### Defined in

[lib/machine/interfaces.ts:105](https://github.com/Masquerade-Circus/x-robot/blob/f8aa666/lib/machine/interfaces.ts#L105)

***

### description

• `Optional` **description**: `string`

#### Inherited from

[StateDirective](x_robot.StateDirective.md).[description](x_robot.StateDirective.md#description)

#### Defined in

[lib/machine/interfaces.ts:106](https://github.com/Masquerade-Circus/x-robot/blob/f8aa666/lib/machine/interfaces.ts#L106)

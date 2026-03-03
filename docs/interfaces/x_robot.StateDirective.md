[x-robot - v0.3.0](../README.md) / [Modules](../modules.md) / [x-robot](../modules/x_robot.md) / StateDirective

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

[lib/machine/interfaces.ts:120](https://github.com/Masquerade-Circus/x-robot/blob/5a7fcfa/lib/machine/interfaces.ts#L120)

___

### run

• **run**: [`PulseDirective`](x_robot.PulseDirective.md)[]

#### Defined in

[lib/machine/interfaces.ts:121](https://github.com/Masquerade-Circus/x-robot/blob/5a7fcfa/lib/machine/interfaces.ts#L121)

___

### on

• **on**: [`TransitionsDirective`](x_robot.TransitionsDirective.md)

#### Defined in

[lib/machine/interfaces.ts:122](https://github.com/Masquerade-Circus/x-robot/blob/5a7fcfa/lib/machine/interfaces.ts#L122)

___

### immediate

• **immediate**: [`ImmediateDirective`](x_robot.ImmediateDirective.md)[]

#### Defined in

[lib/machine/interfaces.ts:123](https://github.com/Masquerade-Circus/x-robot/blob/5a7fcfa/lib/machine/interfaces.ts#L123)

___

### args

• **args**: ([`TransitionDirective`](x_robot.TransitionDirective.md) \| [`ImmediateDirective`](x_robot.ImmediateDirective.md) \| [`PulseDirective`](x_robot.PulseDirective.md) \| [`DescriptionDirective`](x_robot.DescriptionDirective.md) \| [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))[]

#### Defined in

[lib/machine/interfaces.ts:124](https://github.com/Masquerade-Circus/x-robot/blob/5a7fcfa/lib/machine/interfaces.ts#L124)

___

### type

• **type**: `string`

#### Defined in

[lib/machine/interfaces.ts:131](https://github.com/Masquerade-Circus/x-robot/blob/5a7fcfa/lib/machine/interfaces.ts#L131)

___

### nested

• **nested**: [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)[]

#### Defined in

[lib/machine/interfaces.ts:132](https://github.com/Masquerade-Circus/x-robot/blob/5a7fcfa/lib/machine/interfaces.ts#L132)

___

### description

• `Optional` **description**: `string`

#### Defined in

[lib/machine/interfaces.ts:133](https://github.com/Masquerade-Circus/x-robot/blob/5a7fcfa/lib/machine/interfaces.ts#L133)

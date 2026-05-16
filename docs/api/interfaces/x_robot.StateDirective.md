[x-robot - v1.3.0](../README.md) / [Modules](../modules.md) / [x-robot](../modules/x_robot.md) / StateDirective

# Interface: StateDirective

[x-robot](../modules/x_robot.md).StateDirective

## Hierarchy

*   **`StateDirective`**

    ↳ [`InfoStateDirective`](x_robot.InfoStateDirective.md)

    ↳ [`WarningStateDirective`](x_robot.WarningStateDirective.md)

    ↳ [`DangerStateDirective`](x_robot.DangerStateDirective.md)

    ↳ [`PrimaryStateDirective`](x_robot.PrimaryStateDirective.md)

    ↳ [`SuccessStateDirective`](x_robot.SuccessStateDirective.md)

## Table of contents

### Properties

*   [name](x_robot.StateDirective.md#name)
*   [run](x_robot.StateDirective.md#run)
*   [on](x_robot.StateDirective.md#on)
*   [immediate](x_robot.StateDirective.md#immediate)
*   [args](x_robot.StateDirective.md#args)
*   [type](x_robot.StateDirective.md#type)
*   [nested](x_robot.StateDirective.md#nested)
*   [description](x_robot.StateDirective.md#description)

## Properties

### name

• **name**: `string`

#### Defined in

[lib/machine/interfaces.ts:93](https://github.com/Masquerade-Circus/x-robot/blob/c68ac33/lib/machine/interfaces.ts#L93)

***

### run

• **run**: [`PulseDirective`](x_robot.PulseDirective.md)\[]

#### Defined in

[lib/machine/interfaces.ts:94](https://github.com/Masquerade-Circus/x-robot/blob/c68ac33/lib/machine/interfaces.ts#L94)

***

### on

• **on**: [`TransitionsDirective`](x_robot.TransitionsDirective.md)

#### Defined in

[lib/machine/interfaces.ts:95](https://github.com/Masquerade-Circus/x-robot/blob/c68ac33/lib/machine/interfaces.ts#L95)

***

### immediate

• **immediate**: [`ImmediateDirective`](x_robot.ImmediateDirective.md)\[]

#### Defined in

[lib/machine/interfaces.ts:96](https://github.com/Masquerade-Circus/x-robot/blob/c68ac33/lib/machine/interfaces.ts#L96)

***

### args

• **args**: ([`TransitionDirective`](x_robot.TransitionDirective.md) | [`ImmediateDirective`](x_robot.ImmediateDirective.md) | [`PulseDirective`](x_robot.PulseDirective.md) | [`DescriptionDirective`](x_robot.DescriptionDirective.md) | [`NestedMachineDirective`](x_robot.NestedMachineDirective.md))\[]

#### Defined in

[lib/machine/interfaces.ts:97](https://github.com/Masquerade-Circus/x-robot/blob/c68ac33/lib/machine/interfaces.ts#L97)

***

### type

• **type**: `string`

#### Defined in

[lib/machine/interfaces.ts:104](https://github.com/Masquerade-Circus/x-robot/blob/c68ac33/lib/machine/interfaces.ts#L104)

***

### nested

• **nested**: [`NestedMachineDirective`](x_robot.NestedMachineDirective.md)\[]

#### Defined in

[lib/machine/interfaces.ts:105](https://github.com/Masquerade-Circus/x-robot/blob/c68ac33/lib/machine/interfaces.ts#L105)

***

### description

• `Optional` **description**: `string`

#### Defined in

[lib/machine/interfaces.ts:106](https://github.com/Masquerade-Circus/x-robot/blob/c68ac33/lib/machine/interfaces.ts#L106)

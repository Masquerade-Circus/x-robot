[x-robot - v0.3.0](../README.md) / [Modules](../modules.md) / [x-robot](../modules/x_robot.md) / NestedGuardDirective

# Interface: NestedGuardDirective

[x-robot](../modules/x_robot.md).NestedGuardDirective

## Hierarchy

- [`GuardDirective`](x_robot.GuardDirective.md)

  ↳ **`NestedGuardDirective`**

## Table of contents

### Properties

- [machine](x_robot.NestedGuardDirective.md#machine)
- [failure](x_robot.NestedGuardDirective.md#failure)
- [guard](x_robot.NestedGuardDirective.md#guard)

## Properties

### machine

• **machine**: [`Machine`](x_robot.Machine.md)

#### Defined in

[lib/machine/interfaces.ts:99](https://github.com/Masquerade-Circus/x-robot/blob/5a7fcfa/lib/machine/interfaces.ts#L99)

___

### failure

• `Optional` **failure**: `string` \| [`PulseDirective`](x_robot.PulseDirective.md)

#### Overrides

[GuardDirective](x_robot.GuardDirective.md).[failure](x_robot.GuardDirective.md#failure)

#### Defined in

[lib/machine/interfaces.ts:100](https://github.com/Masquerade-Circus/x-robot/blob/5a7fcfa/lib/machine/interfaces.ts#L100)

___

### guard

• **guard**: [`Guard`](x_robot.Guard.md)

#### Inherited from

[GuardDirective](x_robot.GuardDirective.md).[guard](x_robot.GuardDirective.md#guard)

#### Defined in

[lib/machine/interfaces.ts:94](https://github.com/Masquerade-Circus/x-robot/blob/5a7fcfa/lib/machine/interfaces.ts#L94)

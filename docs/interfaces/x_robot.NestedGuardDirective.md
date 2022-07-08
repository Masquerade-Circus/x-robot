[x-robot - v0.2.0](../README.md) / [Modules](../modules.md) / [x-robot](../modules/x_robot.md) / NestedGuardDirective

# Interface: NestedGuardDirective

[x-robot](../modules/x_robot.md).NestedGuardDirective

## Hierarchy

- [`GuardDirective`](x_robot.GuardDirective.md)

  ↳ **`NestedGuardDirective`**

## Table of contents

### Properties

- [machine](x_robot.NestedGuardDirective.md#machine)
- [guard](x_robot.NestedGuardDirective.md#guard)
- [failure](x_robot.NestedGuardDirective.md#failure)

## Properties

### machine

• **machine**: [`Machine`](x_robot.Machine.md)

#### Defined in

[lib/machine/interfaces.ts:78](https://github.com/Masquerade-Circus/x-robot/blob/0346b56/lib/machine/interfaces.ts#L78)

___

### guard

• **guard**: [`Guard`](x_robot.Guard.md)

#### Inherited from

[GuardDirective](x_robot.GuardDirective.md).[guard](x_robot.GuardDirective.md#guard)

#### Defined in

[lib/machine/interfaces.ts:73](https://github.com/Masquerade-Circus/x-robot/blob/0346b56/lib/machine/interfaces.ts#L73)

___

### failure

• `Optional` **failure**: [`ProducerDirectiveWithoutTransition`](x_robot.ProducerDirectiveWithoutTransition.md)

#### Inherited from

[GuardDirective](x_robot.GuardDirective.md).[failure](x_robot.GuardDirective.md#failure)

#### Defined in

[lib/machine/interfaces.ts:74](https://github.com/Masquerade-Circus/x-robot/blob/0346b56/lib/machine/interfaces.ts#L74)

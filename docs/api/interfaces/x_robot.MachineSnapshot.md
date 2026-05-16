[x-robot - v1.3.0](../README.md) / [Modules](../modules.md) / [x-robot](../modules/x_robot.md) / MachineSnapshot

# Interface: MachineSnapshot

[x-robot](../modules/x_robot.md).MachineSnapshot

## Hierarchy

*   **`MachineSnapshot`**

    ↳ [`XRobotDevtoolsState`](x_robot_devtools.XRobotDevtoolsState.md)

## Table of contents

### Properties

*   [current](x_robot.MachineSnapshot.md#current)
*   [context](x_robot.MachineSnapshot.md#context)
*   [history](x_robot.MachineSnapshot.md#history)
*   [parallel](x_robot.MachineSnapshot.md#parallel)
*   [nested](x_robot.MachineSnapshot.md#nested)

## Properties

### current

• **current**: `string`

#### Defined in

[lib/machine/invoke.ts:1113](https://github.com/Masquerade-Circus/x-robot/blob/c68ac33/lib/machine/invoke.ts#L1113)

***

### context

• **context**: `any`

#### Defined in

[lib/machine/invoke.ts:1114](https://github.com/Masquerade-Circus/x-robot/blob/c68ac33/lib/machine/invoke.ts#L1114)

***

### history

• **history**: `string`\[]

#### Defined in

[lib/machine/invoke.ts:1115](https://github.com/Masquerade-Circus/x-robot/blob/c68ac33/lib/machine/invoke.ts#L1115)

***

### parallel

• `Optional` **parallel**: `Record`<`string`, [`MachineSnapshot`](x_robot.MachineSnapshot.md)>

#### Defined in

[lib/machine/invoke.ts:1116](https://github.com/Masquerade-Circus/x-robot/blob/c68ac33/lib/machine/invoke.ts#L1116)

***

### nested

• `Optional` **nested**: `Record`<`string`, `Record`<`string`, [`MachineSnapshot`](x_robot.MachineSnapshot.md)>>

#### Defined in

[lib/machine/invoke.ts:1117](https://github.com/Masquerade-Circus/x-robot/blob/c68ac33/lib/machine/invoke.ts#L1117)

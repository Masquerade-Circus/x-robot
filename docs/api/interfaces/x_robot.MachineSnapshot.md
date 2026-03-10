[x-robot - v1.1.0](../README.md) / [Modules](../modules.md) / [x-robot](../modules/x_robot.md) / MachineSnapshot

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

[lib/machine/invoke.ts:888](https://github.com/Masquerade-Circus/x-robot/blob/1f61467/lib/machine/invoke.ts#L888)

***

### context

• **context**: `any`

#### Defined in

[lib/machine/invoke.ts:889](https://github.com/Masquerade-Circus/x-robot/blob/1f61467/lib/machine/invoke.ts#L889)

***

### history

• **history**: `string`\[]

#### Defined in

[lib/machine/invoke.ts:890](https://github.com/Masquerade-Circus/x-robot/blob/1f61467/lib/machine/invoke.ts#L890)

***

### parallel

• `Optional` **parallel**: `Record`<`string`, [`MachineSnapshot`](x_robot.MachineSnapshot.md)>

#### Defined in

[lib/machine/invoke.ts:891](https://github.com/Masquerade-Circus/x-robot/blob/1f61467/lib/machine/invoke.ts#L891)

***

### nested

• `Optional` **nested**: `Record`<`string`, `Record`<`string`, [`MachineSnapshot`](x_robot.MachineSnapshot.md)>>

#### Defined in

[lib/machine/invoke.ts:892](https://github.com/Masquerade-Circus/x-robot/blob/1f61467/lib/machine/invoke.ts#L892)

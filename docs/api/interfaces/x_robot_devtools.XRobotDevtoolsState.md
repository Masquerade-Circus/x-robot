[x-robot - v1.0.1](../README.md) / [Modules](../modules.md) / [x-robot/devtools](../modules/x_robot_devtools.md) / XRobotDevtoolsState

# Interface: XRobotDevtoolsState

[x-robot/devtools](../modules/x_robot_devtools.md).XRobotDevtoolsState

Machine snapshot sent to and restored from Redux DevTools.

## Hierarchy

*   [`MachineSnapshot`](x_robot.MachineSnapshot.md)

    ↳ **`XRobotDevtoolsState`**

## Table of contents

### Properties

*   [id](x_robot_devtools.XRobotDevtoolsState.md#id)
*   [title](x_robot_devtools.XRobotDevtoolsState.md#title)
*   [isAsync](x_robot_devtools.XRobotDevtoolsState.md#isasync)
*   [fatal](x_robot_devtools.XRobotDevtoolsState.md#fatal)
*   [current](x_robot_devtools.XRobotDevtoolsState.md#current)
*   [context](x_robot_devtools.XRobotDevtoolsState.md#context)
*   [history](x_robot_devtools.XRobotDevtoolsState.md#history)
*   [parallel](x_robot_devtools.XRobotDevtoolsState.md#parallel)
*   [nested](x_robot_devtools.XRobotDevtoolsState.md#nested)

## Properties

### id

• **id**: `string`

Stable machine id used by X-Robot internally.

#### Defined in

lib/devtools/index.ts:21

***

### title

• **title**: `null` | `string`

Optional machine title shown in docs and visual tooling.

#### Defined in

lib/devtools/index.ts:23

***

### isAsync

• **isAsync**: `boolean`

Whether the machine currently runs async transitions or pulses.

#### Defined in

lib/devtools/index.ts:25

***

### fatal

• `Optional` **fatal**: [`XRobotDevtoolsFatalState`](x_robot_devtools.XRobotDevtoolsFatalState.md)

Fatal error metadata when the machine is in a fatal condition.

#### Defined in

lib/devtools/index.ts:27

***

### current

• **current**: `string`

#### Inherited from

[MachineSnapshot](x_robot.MachineSnapshot.md).[current](x_robot.MachineSnapshot.md#current)

#### Defined in

[lib/machine/invoke.ts:888](https://github.com/Masquerade-Circus/x-robot/blob/f19e6ca/lib/machine/invoke.ts#L888)

***

### context

• **context**: `any`

#### Inherited from

[MachineSnapshot](x_robot.MachineSnapshot.md).[context](x_robot.MachineSnapshot.md#context)

#### Defined in

[lib/machine/invoke.ts:889](https://github.com/Masquerade-Circus/x-robot/blob/f19e6ca/lib/machine/invoke.ts#L889)

***

### history

• **history**: `string`\[]

#### Inherited from

[MachineSnapshot](x_robot.MachineSnapshot.md).[history](x_robot.MachineSnapshot.md#history)

#### Defined in

[lib/machine/invoke.ts:890](https://github.com/Masquerade-Circus/x-robot/blob/f19e6ca/lib/machine/invoke.ts#L890)

***

### parallel

• `Optional` **parallel**: `Record`<`string`, [`MachineSnapshot`](x_robot.MachineSnapshot.md)>

#### Inherited from

[MachineSnapshot](x_robot.MachineSnapshot.md).[parallel](x_robot.MachineSnapshot.md#parallel)

#### Defined in

[lib/machine/invoke.ts:891](https://github.com/Masquerade-Circus/x-robot/blob/f19e6ca/lib/machine/invoke.ts#L891)

***

### nested

• `Optional` **nested**: `Record`<`string`, `Record`<`string`, [`MachineSnapshot`](x_robot.MachineSnapshot.md)>>

#### Inherited from

[MachineSnapshot](x_robot.MachineSnapshot.md).[nested](x_robot.MachineSnapshot.md#nested)

#### Defined in

[lib/machine/invoke.ts:892](https://github.com/Masquerade-Circus/x-robot/blob/f19e6ca/lib/machine/invoke.ts#L892)

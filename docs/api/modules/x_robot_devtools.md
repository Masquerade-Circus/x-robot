[x-robot - v1.2.0](../README.md) / [Modules](../modules.md) / x-robot/devtools

# Module: x-robot/devtools

## Table of contents

### Functions

*   [getXRobotDevtoolsState](x_robot_devtools.md#getxrobotdevtoolsstate)
*   [connectXRobot](x_robot_devtools.md#connectxrobot)

### Interfaces

*   [XRobotDevtoolsOptions](../interfaces/x_robot_devtools.XRobotDevtoolsOptions.md)
*   [XRobotDevtoolsFatalState](../interfaces/x_robot_devtools.XRobotDevtoolsFatalState.md)
*   [XRobotDevtoolsState](../interfaces/x_robot_devtools.XRobotDevtoolsState.md)
*   [XRobotDevtoolsConnection](../interfaces/x_robot_devtools.XRobotDevtoolsConnection.md)

## Functions

### getXRobotDevtoolsState

▸ **getXRobotDevtoolsState**(`machine`): [`XRobotDevtoolsState`](../interfaces/x_robot_devtools.XRobotDevtoolsState.md)

Build the serialized snapshot used by the Redux DevTools monitor.

#### Parameters

| Name | Type |
| :------ | :------ |
| `machine` | [`Machine`](../interfaces/x_robot.Machine.md) |

#### Returns

[`XRobotDevtoolsState`](../interfaces/x_robot_devtools.XRobotDevtoolsState.md)

***

### connectXRobot

▸ **connectXRobot**(`machine`, `options?`): [`XRobotDevtoolsConnection`](../interfaces/x_robot_devtools.XRobotDevtoolsConnection.md)

Connect a machine to the Redux DevTools Extension with tracked wrappers.

#### Parameters

| Name | Type |
| :------ | :------ |
| `machine` | [`Machine`](../interfaces/x_robot.Machine.md) |
| `options` | [`XRobotDevtoolsOptions`](../interfaces/x_robot_devtools.XRobotDevtoolsOptions.md) |

#### Returns

[`XRobotDevtoolsConnection`](../interfaces/x_robot_devtools.XRobotDevtoolsConnection.md)

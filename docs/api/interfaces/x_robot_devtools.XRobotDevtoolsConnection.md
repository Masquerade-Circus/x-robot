[x-robot - v1.1.0](../README.md) / [Modules](../modules.md) / [x-robot/devtools](../modules/x_robot_devtools.md) / XRobotDevtoolsConnection

# Interface: XRobotDevtoolsConnection

[x-robot/devtools](../modules/x_robot_devtools.md).XRobotDevtoolsConnection

Wrapped machine controls that keep Redux DevTools in sync.

## Table of contents

### Properties

*   [machine](x_robot_devtools.XRobotDevtoolsConnection.md#machine)

### Methods

*   [start](x_robot_devtools.XRobotDevtoolsConnection.md#start)
*   [invoke](x_robot_devtools.XRobotDevtoolsConnection.md#invoke)
*   [invokeAfter](x_robot_devtools.XRobotDevtoolsConnection.md#invokeafter)
*   [snapshot](x_robot_devtools.XRobotDevtoolsConnection.md#snapshot)
*   [disconnect](x_robot_devtools.XRobotDevtoolsConnection.md#disconnect)
*   [cleanup](x_robot_devtools.XRobotDevtoolsConnection.md#cleanup)

## Properties

### machine

• **machine**: [`Machine`](x_robot.Machine.md)

The original machine instance bound to this devtools connection.

#### Defined in

[lib/devtools/index.ts:33](https://github.com/Masquerade-Circus/x-robot/blob/fa0ba1b/lib/devtools/index.ts#L33)

## Methods

### start

▸ **start**(`snapshotOrPayload?`): `void` | [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`void`>

Starts the machine or restores it from a snapshot.

#### Parameters

| Name | Type |
| :------ | :------ |
| `snapshotOrPayload?` | `any` |

#### Returns

`void` | [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`void`>

***

### invoke

▸ **invoke**(`transition`, `payload?`): `void` | [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`void`>

Invokes a transition through the tracked devtools wrapper.

#### Parameters

| Name | Type |
| :------ | :------ |
| `transition` | `string` |
| `payload?` | `any` |

#### Returns

`void` | [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`void`>

***

### invokeAfter

▸ **invokeAfter**(`timeInMilliseconds`, `transition`, `payload?`): () => `void`

Schedules a tracked delayed invocation and returns a cancel function.

#### Parameters

| Name | Type |
| :------ | :------ |
| `timeInMilliseconds` | `number` |
| `transition` | `string` |
| `payload?` | `any` |

#### Returns

`fn`

▸ (): `void`

Schedules a tracked delayed invocation and returns a cancel function.

##### Returns

`void`

***

### snapshot

▸ **snapshot**(): [`XRobotDevtoolsState`](x_robot_devtools.XRobotDevtoolsState.md)

Returns the current serialized devtools snapshot for the machine.

#### Returns

[`XRobotDevtoolsState`](x_robot_devtools.XRobotDevtoolsState.md)

***

### disconnect

▸ **disconnect**(): `void`

Unsubscribes the adapter from Redux DevTools messages.

#### Returns

`void`

***

### cleanup

▸ **cleanup**(): `void`

Alias of `disconnect()` for host cleanup lifecycles.

#### Returns

`void`

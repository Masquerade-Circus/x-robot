[x-robot - v0.2.0](../README.md) / [Modules](../modules.md) / x-robot/serialize

# Module: x-robot/serialize

**`Description`**

Serializes a machine to a JSON object

## Table of contents

### Serialization Functions

- [serialize](x_robot_serialize.md#serialize)

### Interfaces

- [SerializedProducer](../interfaces/x_robot_serialize.SerializedProducer.md)
- [SerializedAction](../interfaces/x_robot_serialize.SerializedAction.md)
- [SerializedGuard](../interfaces/x_robot_serialize.SerializedGuard.md)
- [SerializedCollection](../interfaces/x_robot_serialize.SerializedCollection.md)
- [SerializedTransition](../interfaces/x_robot_serialize.SerializedTransition.md)
- [SerializedTransitions](../interfaces/x_robot_serialize.SerializedTransitions.md)
- [SerializedImmediate](../interfaces/x_robot_serialize.SerializedImmediate.md)
- [SerializedState](../interfaces/x_robot_serialize.SerializedState.md)
- [SerializedStates](../interfaces/x_robot_serialize.SerializedStates.md)
- [SerializedMachine](../interfaces/x_robot_serialize.SerializedMachine.md)
- [SerializedNestedMachine](../interfaces/x_robot_serialize.SerializedNestedMachine.md)

## Serialization Functions

### serialize

▸ **serialize**(`machine`): [`SerializedMachine`](../interfaces/x_robot_serialize.SerializedMachine.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `machine` | [`Machine`](../interfaces/x_robot.Machine.md) | The machine to serialize |

#### Returns

[`SerializedMachine`](../interfaces/x_robot_serialize.SerializedMachine.md)

SerializedMachine

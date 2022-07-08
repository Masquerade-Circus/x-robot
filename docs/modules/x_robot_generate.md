[x-robot - v0.2.0](../README.md) / [Modules](../modules.md) / x-robot/generate

# Module: x-robot/generate

**`Description`**

Generate code from a serialized machine

## Table of contents

### Functions

- [generateFromSerializedMachine](x_robot_generate.md#generatefromserializedmachine)

### Enumerations

- [Format](../enums/x_robot_generate.Format.md)

## Functions

### generateFromSerializedMachine

▸ **generateFromSerializedMachine**(`serializedMachine`, `format`): `string`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `serializedMachine` | [`SerializedMachine`](../interfaces/x_robot_serialize.SerializedMachine.md) | The machine to generate code for |
| `format` | [`Format`](../enums/x_robot_generate.Format.md) | The format to generate code for, either esm or cjs |

#### Returns

`string`

The generated code as a string

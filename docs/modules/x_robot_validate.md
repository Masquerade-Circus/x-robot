[x-robot - v0.2.0](../README.md) / [Modules](../modules.md) / x-robot/validate

# Module: x-robot/validate

**`Description`**

Validates the machine prior to its use.

## Table of contents

### Validation Functions

- [validate](x_robot_validate.md#validate)

### Other Functions

- [ok](x_robot_validate.md#ok)
- [err](x_robot_validate.md#err)
- [combine](x_robot_validate.md#combine)

### Type Aliases

- [Result](x_robot_validate.md#result)
- [Results](x_robot_validate.md#results)

### Classes

- [Ok](../classes/x_robot_validate.Ok.md)
- [Err](../classes/x_robot_validate.Err.md)

## Validation Functions

### validate

▸ **validate**(`machine`): `void`

This function validates a machine and all its nested and parallel machines if any.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `machine` | [`Machine`](../interfaces/x_robot.Machine.md) | The machine to validate |

#### Returns

`void`

Void if the machine is valid, throws an error otherwise

___

## Other Functions

### ok

▸ **ok**<`T`\>(`value`): [`Ok`](../classes/x_robot_validate.Ok.md)<`T`, `never`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `T` |

#### Returns

[`Ok`](../classes/x_robot_validate.Ok.md)<`T`, `never`\>

___

### err

▸ **err**<`E`\>(`err`): [`Err`](../classes/x_robot_validate.Err.md)<`never`, `E`\>

#### Type parameters

| Name |
| :------ |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `err` | `E` |

#### Returns

[`Err`](../classes/x_robot_validate.Err.md)<`never`, `E`\>

___

### combine

▸ **combine**<`T`, `E`\>(`results`): [`Result`](x_robot_validate.md#result)<`T`, `E`\> \| [`Results`](x_robot_validate.md#results)<`T`, `E`\>

#### Type parameters

| Name |
| :------ |
| `T` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `results` | [`Results`](x_robot_validate.md#results)<`T`, `E`\> |

#### Returns

[`Result`](x_robot_validate.md#result)<`T`, `E`\> \| [`Results`](x_robot_validate.md#results)<`T`, `E`\>

## Type Aliases

### Result

Ƭ **Result**<`T`, `E`\>: [`Ok`](../classes/x_robot_validate.Ok.md)<`T`, `never`\> \| [`Err`](../classes/x_robot_validate.Err.md)<`never`, `E`\>

#### Type parameters

| Name |
| :------ |
| `T` |
| `E` |

#### Defined in

[lib/validate/result.ts:5](https://github.com/Masquerade-Circus/x-robot/blob/0346b56/lib/validate/result.ts#L5)

___

### Results

Ƭ **Results**<`T`, `E`\>: [`Result`](x_robot_validate.md#result)<`T`, `E`\>[]

#### Type parameters

| Name |
| :------ |
| `T` |
| `E` |

#### Defined in

[lib/validate/result.ts:7](https://github.com/Masquerade-Circus/x-robot/blob/0346b56/lib/validate/result.ts#L7)

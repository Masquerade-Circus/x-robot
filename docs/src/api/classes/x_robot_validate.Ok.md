[Api](../README.md) / [x-robot/validate](../modules/x_robot_validate.md) / Ok

# Class: Ok<T, E\>

[x-robot/validate](../modules/x_robot_validate.md).Ok

## Type parameters

| Name |
| :------ |
| `T` |
| `E` |

## Table of contents

### Constructors

- [constructor](x_robot_validate.Ok.md#constructor)

### Properties

- [value](x_robot_validate.Ok.md#value)

### Methods

- [isOk](x_robot_validate.Ok.md#isok)
- [isErr](x_robot_validate.Ok.md#iserr)
- [unwrap](x_robot_validate.Ok.md#unwrap)
- [unwrapErr](x_robot_validate.Ok.md#unwraperr)

## Constructors

### constructor

• **new Ok**<`T`, `E`\>(`value`)

#### Type parameters

| Name |
| :------ |
| `T` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `T` |

## Properties

### value

• **value**: `T`

#### Defined in

[lib/validate/result.ts:10](https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/validate/result.ts#L10)

## Methods

### isOk

▸ **isOk**(): this is Ok<T, never\>

#### Returns

this is Ok<T, never\>

___

### isErr

▸ **isErr**(): this is Err<never, E\>

#### Returns

this is Err<never, E\>

___

### unwrap

▸ **unwrap**(): `T`

#### Returns

`T`

___

### unwrapErr

▸ **unwrapErr**(): `never`

#### Returns

`never`

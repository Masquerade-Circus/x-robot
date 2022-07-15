[Api](../README.md) / [x-robot/validate](../modules/x_robot_validate.md) / Err

# Class: Err<T, E\>

[x-robot/validate](../modules/x_robot_validate.md).Err

## Type parameters

| Name |
| :------ |
| `T` |
| `E` |

## Table of contents

### Constructors

- [constructor](x_robot_validate.Err.md#constructor)

### Properties

- [error](x_robot_validate.Err.md#error)

### Methods

- [isOk](x_robot_validate.Err.md#isok)
- [isErr](x_robot_validate.Err.md#iserr)
- [unwrap](x_robot_validate.Err.md#unwrap)
- [unwrapErr](x_robot_validate.Err.md#unwraperr)

## Constructors

### constructor

• **new Err**<`T`, `E`\>(`error`)

#### Type parameters

| Name |
| :------ |
| `T` |
| `E` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `E` |

## Properties

### error

• **error**: `E`

#### Defined in

[lib/validate/result.ts:29](https://github.com/Masquerade-Circus/x-robot/blob/5edbfcd/lib/validate/result.ts#L29)

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

▸ **unwrap**(): `never`

#### Returns

`never`

___

### unwrapErr

▸ **unwrapErr**(): `E`

#### Returns

`E`

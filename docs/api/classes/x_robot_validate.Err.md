# Class: Err<T, E\>

[x-robot/validate](../modules/x_robot_validate.md).Err

## Type parameters

| Name |
| :------ |
| `T` |
| `E` |

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

[lib/validate/result.ts:29](https://github.com/Masquerade-Circus/x-robot/blob/a0ed060/lib/validate/result.ts#L29)

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

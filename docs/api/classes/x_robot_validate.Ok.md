# Class: Ok<T, E\>

[x-robot/validate](../modules/x_robot_validate.md).Ok

## Type parameters

| Name |
| :------ |
| `T` |
| `E` |

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

[lib/validate/result.ts:10](https://github.com/Masquerade-Circus/x-robot/blob/a0ed060/lib/validate/result.ts#L10)

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

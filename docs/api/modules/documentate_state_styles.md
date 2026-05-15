[x-robot - v1.2.0](../README.md) / [Modules](../modules.md) / documentate/state-styles

# Module: documentate/state-styles

## Table of contents

### Functions

*   [resolveStateStyleRole](documentate_state_styles.md#resolvestatestylerole)
*   [getMermaidStateClassName](documentate_state_styles.md#getmermaidstateclassname)
*   [getPlantUmlStateStereotype](documentate_state_styles.md#getplantumlstatestereotype)
*   [getMermaidClassDefinitions](documentate_state_styles.md#getmermaidclassdefinitions)
*   [getPlantUmlStateSkinparamLines](documentate_state_styles.md#getplantumlstateskinparamlines)

### Variables

*   [BUILT\_IN\_STATE\_STYLE\_ORDER](documentate_state_styles.md#built_in_state_style_order)

### Type Aliases

*   [BuiltInStateStyleRole](documentate_state_styles.md#builtinstatestylerole)

## Functions

### resolveStateStyleRole

▸ **resolveStateStyleRole**(`type?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type?` | `string` |

#### Returns

`string`

***

### getMermaidStateClassName

▸ **getMermaidStateClassName**(`type?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type?` | `string` |

#### Returns

`string`

***

### getPlantUmlStateStereotype

▸ **getPlantUmlStateStereotype**(`type?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type?` | `string` |

#### Returns

`string`

***

### getMermaidClassDefinitions

▸ **getMermaidClassDefinitions**(): `string`\[]

#### Returns

`string`\[]

***

### getPlantUmlStateSkinparamLines

▸ **getPlantUmlStateSkinparamLines**(): `string`\[]

#### Returns

`string`\[]

## Variables

### BUILT\_IN\_STATE\_STYLE\_ORDER

• `Const` **BUILT\_IN\_STATE\_STYLE\_ORDER**: readonly \[`"danger"`, `"info"`, `"warning"`, `"success"`, `"primary"`, `"default"`]

#### Defined in

[lib/documentate/state-styles.ts:1](https://github.com/Masquerade-Circus/x-robot/blob/bfae059/lib/documentate/state-styles.ts#L1)

## Type Aliases

### BuiltInStateStyleRole

Ƭ **BuiltInStateStyleRole**: typeof [`BUILT_IN_STATE_STYLE_ORDER`](documentate_state_styles.md#built_in_state_style_order)\[`number`]

#### Defined in

[lib/documentate/state-styles.ts:10](https://github.com/Masquerade-Circus/x-robot/blob/bfae059/lib/documentate/state-styles.ts#L10)

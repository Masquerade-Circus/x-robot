[x-robot - v0.3.0](../README.md) / [Modules](../modules.md) / x-robot/documentate

# Module: x-robot/documentate

**`Description`**

Generate documentation and convert between formats for X-Robot machines

## Table of contents

### Functions

- [documentate](x_robot_documentate.md#documentate)

### Type Aliases

- [OutputFormat](x_robot_documentate.md#outputformat)
- [DocumentateInput](x_robot_documentate.md#documentateinput)

### Interfaces

- [DocumentateOptions](../interfaces/x_robot_documentate.DocumentateOptions.md)
- [DocumentateResult](../interfaces/x_robot_documentate.DocumentateResult.md)
- [SerializedMachine](../interfaces/x_robot_documentate.SerializedMachine.md)
- [SerializedStates](../interfaces/x_robot_documentate.SerializedStates.md)
- [SerializedState](../interfaces/x_robot_documentate.SerializedState.md)
- [SerializedTransitions](../interfaces/x_robot_documentate.SerializedTransitions.md)
- [SerializedTransition](../interfaces/x_robot_documentate.SerializedTransition.md)
- [SerializedPulse](../interfaces/x_robot_documentate.SerializedPulse.md)
- [SerializedCollection](../interfaces/x_robot_documentate.SerializedCollection.md)
- [SerializedGuard](../interfaces/x_robot_documentate.SerializedGuard.md)
- [SerializedImmediate](../interfaces/x_robot_documentate.SerializedImmediate.md)
- [SerializedNestedMachine](../interfaces/x_robot_documentate.SerializedNestedMachine.md)

## Functions

### documentate

▸ **documentate**(`input`, `options`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<[`DocumentateResult`](../interfaces/x_robot_documentate.DocumentateResult.md)\>

Generate documentation and convert between formats for X-Robot machines.

This function accepts various input types and generates different output formats,
enabling full interoperability between Machine, SerializedMachine, SCXML, and PlantUML.

**`Example`**

```ts
// Generate all formats from a machine
const result = await documentate(myMachine, { format: 'all' });
```

**`Example`**

```ts
// Generate TypeScript code from SCXML
const result = await documentate(scxmlString, { format: 'ts' });
```

**`Example`**

```ts
// Generate SVG from PlantUML code
const result = await documentate(plantUmlCode, { format: 'svg' });
```

**`Example`**

```ts
// Generate serialized machine from any input
const result = await documentate(scxmlString, { format: 'serialized' });
```

**`Example`**

```ts
// Generate diagram with custom options
const result = await documentate(myMachine, { format: 'svg', level: 'high', skinparam: 'skinparam backgroundColor white' });
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | [`DocumentateInput`](x_robot_documentate.md#documentateinput) | A Machine, SerializedMachine, SCXML string, or PlantUML string |
| `options` | [`DocumentateOptions`](../interfaces/x_robot_documentate.DocumentateOptions.md) | Options specifying the output format |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<[`DocumentateResult`](../interfaces/x_robot_documentate.DocumentateResult.md)\>

Promise with the generated documentation/converted output

## Type Aliases

### OutputFormat

Ƭ **OutputFormat**: ``"ts"`` \| ``"mjs"`` \| ``"cjs"`` \| ``"json"`` \| ``"scxml"`` \| ``"plantuml"`` \| ``"svg"`` \| ``"png"`` \| ``"serialized"`` \| ``"all"``

Output format options for documentate function

#### Defined in

[lib/documentate/types.ts:11](https://github.com/Masquerade-Circus/x-robot/blob/59af0ee/lib/documentate/types.ts#L11)

___

### DocumentateInput

Ƭ **DocumentateInput**: [`Machine`](../interfaces/x_robot.Machine.md) \| [`SerializedMachine`](../interfaces/x_robot_documentate.SerializedMachine.md) \| `string`

Input types accepted by the documentate function

#### Defined in

[lib/documentate/types.ts:68](https://github.com/Masquerade-Circus/x-robot/blob/59af0ee/lib/documentate/types.ts#L68)

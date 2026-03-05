[x-robot - v0.3.0](../README.md) / [Modules](../modules.md) / [x-robot/documentate](../modules/x_robot_documentate.md) / DocumentateResult

# Interface: DocumentateResult

[x-robot/documentate](../modules/x_robot_documentate.md).DocumentateResult

Result returned by the documentate function

## Table of contents

### Properties

- [ts](x_robot_documentate.DocumentateResult.md#ts)
- [mjs](x_robot_documentate.DocumentateResult.md#mjs)
- [cjs](x_robot_documentate.DocumentateResult.md#cjs)
- [json](x_robot_documentate.DocumentateResult.md#json)
- [scxml](x_robot_documentate.DocumentateResult.md#scxml)
- [plantuml](x_robot_documentate.DocumentateResult.md#plantuml)
- [svg](x_robot_documentate.DocumentateResult.md#svg)
- [png](x_robot_documentate.DocumentateResult.md#png)
- [serialized](x_robot_documentate.DocumentateResult.md#serialized)
- [files](x_robot_documentate.DocumentateResult.md#files)

## Properties

### ts

• `Optional` **ts**: `string`

Generated TypeScript code

#### Defined in

[lib/documentate/types.ts:44](https://github.com/Masquerade-Circus/x-robot/blob/59af0ee/lib/documentate/types.ts#L44)

___

### mjs

• `Optional` **mjs**: `string`

Generated JavaScript ESM code

#### Defined in

[lib/documentate/types.ts:46](https://github.com/Masquerade-Circus/x-robot/blob/59af0ee/lib/documentate/types.ts#L46)

___

### cjs

• `Optional` **cjs**: `string`

Generated JavaScript CommonJS code

#### Defined in

[lib/documentate/types.ts:48](https://github.com/Masquerade-Circus/x-robot/blob/59af0ee/lib/documentate/types.ts#L48)

___

### json

• `Optional` **json**: `string`

JSON representation of the machine

#### Defined in

[lib/documentate/types.ts:50](https://github.com/Masquerade-Circus/x-robot/blob/59af0ee/lib/documentate/types.ts#L50)

___

### scxml

• `Optional` **scxml**: `string`

SCXML document

#### Defined in

[lib/documentate/types.ts:52](https://github.com/Masquerade-Circus/x-robot/blob/59af0ee/lib/documentate/types.ts#L52)

___

### plantuml

• `Optional` **plantuml**: `string`

PlantUML code

#### Defined in

[lib/documentate/types.ts:54](https://github.com/Masquerade-Circus/x-robot/blob/59af0ee/lib/documentate/types.ts#L54)

___

### svg

• `Optional` **svg**: `string`

SVG image path

#### Defined in

[lib/documentate/types.ts:56](https://github.com/Masquerade-Circus/x-robot/blob/59af0ee/lib/documentate/types.ts#L56)

___

### png

• `Optional` **png**: `string`

PNG image path

#### Defined in

[lib/documentate/types.ts:58](https://github.com/Masquerade-Circus/x-robot/blob/59af0ee/lib/documentate/types.ts#L58)

___

### serialized

• `Optional` **serialized**: [`SerializedMachine`](x_robot_documentate.SerializedMachine.md)

SerializedMachine object

#### Defined in

[lib/documentate/types.ts:60](https://github.com/Masquerade-Circus/x-robot/blob/59af0ee/lib/documentate/types.ts#L60)

___

### files

• `Optional` **files**: `string`[]

Generated file paths

#### Defined in

[lib/documentate/types.ts:62](https://github.com/Masquerade-Circus/x-robot/blob/59af0ee/lib/documentate/types.ts#L62)

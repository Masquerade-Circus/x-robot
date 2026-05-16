[x-robot - v1.2.0](../README.md) / [Modules](../modules.md) / [x-robot/documentate](../modules/x_robot_documentate.md) / DocumentateResult

# Interface: DocumentateResult

[x-robot/documentate](../modules/x_robot_documentate.md).DocumentateResult

Result returned by the documentate function

## Table of contents

### Properties

*   [ts](x_robot_documentate.DocumentateResult.md#ts)
*   [mjs](x_robot_documentate.DocumentateResult.md#mjs)
*   [cjs](x_robot_documentate.DocumentateResult.md#cjs)
*   [json](x_robot_documentate.DocumentateResult.md#json)
*   [scxml](x_robot_documentate.DocumentateResult.md#scxml)
*   [plantuml](x_robot_documentate.DocumentateResult.md#plantuml)
*   [mermaid](x_robot_documentate.DocumentateResult.md#mermaid)
*   [svg](x_robot_documentate.DocumentateResult.md#svg)
*   [png](x_robot_documentate.DocumentateResult.md#png)
*   [serialized](x_robot_documentate.DocumentateResult.md#serialized)
*   [files](x_robot_documentate.DocumentateResult.md#files)

## Properties

### ts

• `Optional` **ts**: `string`

Generated TypeScript code

#### Defined in

[lib/documentate/types.ts:79](https://github.com/Masquerade-Circus/x-robot/blob/483dc91/lib/documentate/types.ts#L79)

***

### mjs

• `Optional` **mjs**: `string`

Generated JavaScript ESM code

#### Defined in

[lib/documentate/types.ts:81](https://github.com/Masquerade-Circus/x-robot/blob/483dc91/lib/documentate/types.ts#L81)

***

### cjs

• `Optional` **cjs**: `string`

Generated JavaScript CommonJS code

#### Defined in

[lib/documentate/types.ts:83](https://github.com/Masquerade-Circus/x-robot/blob/483dc91/lib/documentate/types.ts#L83)

***

### json

• `Optional` **json**: `string`

JSON representation of the machine

#### Defined in

[lib/documentate/types.ts:85](https://github.com/Masquerade-Circus/x-robot/blob/483dc91/lib/documentate/types.ts#L85)

***

### scxml

• `Optional` **scxml**: `string`

SCXML document

#### Defined in

[lib/documentate/types.ts:87](https://github.com/Masquerade-Circus/x-robot/blob/483dc91/lib/documentate/types.ts#L87)

***

### plantuml

• `Optional` **plantuml**: `string`

PlantUML code

#### Defined in

[lib/documentate/types.ts:89](https://github.com/Masquerade-Circus/x-robot/blob/483dc91/lib/documentate/types.ts#L89)

***

### mermaid

• `Optional` **mermaid**: `string`

Mermaid code

#### Defined in

[lib/documentate/types.ts:91](https://github.com/Masquerade-Circus/x-robot/blob/483dc91/lib/documentate/types.ts#L91)

***

### svg

• `Optional` **svg**: `string`

SVG image path

#### Defined in

[lib/documentate/types.ts:93](https://github.com/Masquerade-Circus/x-robot/blob/483dc91/lib/documentate/types.ts#L93)

***

### png

• `Optional` **png**: `string`

PNG image path

#### Defined in

[lib/documentate/types.ts:95](https://github.com/Masquerade-Circus/x-robot/blob/483dc91/lib/documentate/types.ts#L95)

***

### serialized

• `Optional` **serialized**: [`SerializedMachine`](x_robot_documentate.SerializedMachine.md)

SerializedMachine object

#### Defined in

[lib/documentate/types.ts:97](https://github.com/Masquerade-Circus/x-robot/blob/483dc91/lib/documentate/types.ts#L97)

***

### files

• `Optional` **files**: `string`\[]

Generated file paths

#### Defined in

[lib/documentate/types.ts:99](https://github.com/Masquerade-Circus/x-robot/blob/483dc91/lib/documentate/types.ts#L99)

[x-robot - v1.0.1](../README.md) / [Modules](../modules.md) / [x-robot/documentate](../modules/x_robot_documentate.md) / DocumentateResult

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

[lib/documentate/types.ts:47](https://github.com/Masquerade-Circus/x-robot/blob/84ba808/lib/documentate/types.ts#L47)

***

### mjs

• `Optional` **mjs**: `string`

Generated JavaScript ESM code

#### Defined in

[lib/documentate/types.ts:49](https://github.com/Masquerade-Circus/x-robot/blob/84ba808/lib/documentate/types.ts#L49)

***

### cjs

• `Optional` **cjs**: `string`

Generated JavaScript CommonJS code

#### Defined in

[lib/documentate/types.ts:51](https://github.com/Masquerade-Circus/x-robot/blob/84ba808/lib/documentate/types.ts#L51)

***

### json

• `Optional` **json**: `string`

JSON representation of the machine

#### Defined in

[lib/documentate/types.ts:53](https://github.com/Masquerade-Circus/x-robot/blob/84ba808/lib/documentate/types.ts#L53)

***

### scxml

• `Optional` **scxml**: `string`

SCXML document

#### Defined in

[lib/documentate/types.ts:55](https://github.com/Masquerade-Circus/x-robot/blob/84ba808/lib/documentate/types.ts#L55)

***

### plantuml

• `Optional` **plantuml**: `string`

PlantUML code

#### Defined in

[lib/documentate/types.ts:57](https://github.com/Masquerade-Circus/x-robot/blob/84ba808/lib/documentate/types.ts#L57)

***

### mermaid

• `Optional` **mermaid**: `string`

Mermaid code

#### Defined in

[lib/documentate/types.ts:59](https://github.com/Masquerade-Circus/x-robot/blob/84ba808/lib/documentate/types.ts#L59)

***

### svg

• `Optional` **svg**: `string`

SVG image path

#### Defined in

[lib/documentate/types.ts:61](https://github.com/Masquerade-Circus/x-robot/blob/84ba808/lib/documentate/types.ts#L61)

***

### png

• `Optional` **png**: `string`

PNG image path

#### Defined in

[lib/documentate/types.ts:63](https://github.com/Masquerade-Circus/x-robot/blob/84ba808/lib/documentate/types.ts#L63)

***

### serialized

• `Optional` **serialized**: [`SerializedMachine`](x_robot_documentate.SerializedMachine.md)

SerializedMachine object

#### Defined in

[lib/documentate/types.ts:65](https://github.com/Masquerade-Circus/x-robot/blob/84ba808/lib/documentate/types.ts#L65)

***

### files

• `Optional` **files**: `string`\[]

Generated file paths

#### Defined in

[lib/documentate/types.ts:67](https://github.com/Masquerade-Circus/x-robot/blob/84ba808/lib/documentate/types.ts#L67)

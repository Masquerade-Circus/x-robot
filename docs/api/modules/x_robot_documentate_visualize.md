[x-robot - v1.0.1](../README.md) / [Modules](../modules.md) / x-robot/documentate/visualize

# Module: x-robot/documentate/visualize

**`Description`**

Generate a visual representation of a machine in plant uml format or get a png/svg image of the diagram.

## Table of contents

### Visualization Functions

*   [getPlantUmlCode](x_robot_documentate_visualize.md#getplantumlcode)
*   [createPngFromPlantUmlCode](x_robot_documentate_visualize.md#createpngfromplantumlcode)
*   [createSvgFromPlantUmlCode](x_robot_documentate_visualize.md#createsvgfromplantumlcode)
*   [createPngFromMachine](x_robot_documentate_visualize.md#createpngfrommachine)
*   [createSvgFromSerializedMachine](x_robot_documentate_visualize.md#createsvgfromserializedmachine)
*   [createPngFromSerializedMachine](x_robot_documentate_visualize.md#createpngfromserializedmachine)
*   [createSvgFromMachine](x_robot_documentate_visualize.md#createsvgfrommachine)

### Other Functions

*   [getMermaidCode](x_robot_documentate_visualize.md#getmermaidcode)
*   [getMermaidCodeFromMachine](x_robot_documentate_visualize.md#getmermaidcodefrommachine)
*   [getPlantUmlCodeFromMachine](x_robot_documentate_visualize.md#getplantumlcodefrommachine)

### Interfaces

*   [SerializedCollectionWithGuards](../interfaces/x_robot_documentate_visualize.SerializedCollectionWithGuards.md)
*   [mermaidOptions](../interfaces/x_robot_documentate_visualize.mermaidOptions.md)
*   [options](../interfaces/x_robot_documentate_visualize.options.md)
*   [imageFromPlantUmlCodeOptions](../interfaces/x_robot_documentate_visualize.imageFromPlantUmlCodeOptions.md)
*   [imageFromMachineOptions](../interfaces/x_robot_documentate_visualize.imageFromMachineOptions.md)

### Variables

*   [VISUALIZATION\_LEVEL](x_robot_documentate_visualize.md#visualization_level)
*   [MERMAID\_THEME](x_robot_documentate_visualize.md#mermaid_theme)

## Visualization Functions

### getPlantUmlCode

▸ **getPlantUmlCode**(`serializedMachine`, `optionsOrLevel?`): `string`

This function will get a serialized machine and will return plantuml code representation of it.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `serializedMachine` | [`SerializedMachine`](../interfaces/x_robot_documentate.SerializedMachine.md) | `undefined` | The serialized machine to be visualized. |
| `optionsOrLevel` | `string` | [`options`](../interfaces/x_robot_documentate_visualize.options.md) | `VISUALIZATION_LEVEL.LOW` | - |

#### Returns

`string`

The plantuml code for the visualization.

***

### createPngFromPlantUmlCode

▸ **createPngFromPlantUmlCode**(`plantUmlCode`, `options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`string`>

Create a png file from a plant uml code

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `plantUmlCode` | `string` | The plant uml code |
| `options` | [`imageFromMachineOptions`](../interfaces/x_robot_documentate_visualize.imageFromMachineOptions.md) | Options for the image |

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`string`>

The path to the png file

***

### createSvgFromPlantUmlCode

▸ **createSvgFromPlantUmlCode**(`plantUmlCode`, `options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`string`>

Create a svg file from a plant uml code

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `plantUmlCode` | `string` | The plant uml code |
| `options` | [`imageFromMachineOptions`](../interfaces/x_robot_documentate_visualize.imageFromMachineOptions.md) | Options for the image |

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`string`>

The path to the svg file

***

### createPngFromMachine

▸ **createPngFromMachine**(`machine`, `optionsOrLevel?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`string`>

Create a png file from a machine

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `machine` | [`Machine`](../interfaces/x_robot.Machine.md) | `undefined` | The machine to get the plant uml code from |
| `optionsOrLevel` | `string` | [`imageFromMachineOptions`](../interfaces/x_robot_documentate_visualize.imageFromMachineOptions.md) | `VISUALIZATION_LEVEL.LOW` | The level of the machine to get the plant uml code from or options for the image |

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`string`>

The path to the png file

***

### createSvgFromSerializedMachine

▸ **createSvgFromSerializedMachine**(`serialized`, `optionsOrLevel?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`string`>

Create a svg file from a SerializedMachine

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `serialized` | [`SerializedMachine`](../interfaces/x_robot_documentate.SerializedMachine.md) | `undefined` | The serialized machine to get the plant uml code from |
| `optionsOrLevel` | `string` | [`imageFromMachineOptions`](../interfaces/x_robot_documentate_visualize.imageFromMachineOptions.md) | `VISUALIZATION_LEVEL.LOW` | The level of the machine to get the plant uml code from or options for the image |

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`string`>

The path to the svg file

***

### createPngFromSerializedMachine

▸ **createPngFromSerializedMachine**(`serialized`, `optionsOrLevel?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`string`>

Create a png file from a SerializedMachine

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `serialized` | [`SerializedMachine`](../interfaces/x_robot_documentate.SerializedMachine.md) | `undefined` | The serialized machine to get the plant uml code from |
| `optionsOrLevel` | `string` | [`imageFromMachineOptions`](../interfaces/x_robot_documentate_visualize.imageFromMachineOptions.md) | `VISUALIZATION_LEVEL.LOW` | The level of the machine to get the plant uml code from or options for the image |

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`string`>

The path to the png file

***

### createSvgFromMachine

▸ **createSvgFromMachine**(`machine`, `optionsOrLevel?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`string`>

Create a svg file from a machine

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `machine` | [`Machine`](../interfaces/x_robot.Machine.md) | `undefined` | The machine to get the plant uml code from |
| `optionsOrLevel` | `string` | [`imageFromMachineOptions`](../interfaces/x_robot_documentate_visualize.imageFromMachineOptions.md) | `VISUALIZATION_LEVEL.LOW` | The level of the machine to get the plant uml code from or options for the image |

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`string`>

The path to the svg file

***

## Other Functions

### getMermaidCode

▸ **getMermaidCode**(`serializedMachine`, `optionsOrLevel?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `serializedMachine` | [`SerializedMachine`](../interfaces/x_robot_documentate.SerializedMachine.md) | `undefined` |
| `optionsOrLevel` | `string` | [`mermaidOptions`](../interfaces/x_robot_documentate_visualize.mermaidOptions.md) | `MERMAID_THEME.DEFAULT` |

#### Returns

`string`

***

### getMermaidCodeFromMachine

▸ **getMermaidCodeFromMachine**(`machine`, `optionsOrLevel?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `machine` | [`Machine`](../interfaces/x_robot.Machine.md) | `undefined` |
| `optionsOrLevel` | `string` | [`mermaidOptions`](../interfaces/x_robot_documentate_visualize.mermaidOptions.md) | `MERMAID_THEME.DEFAULT` |

#### Returns

`string`

***

### getPlantUmlCodeFromMachine

▸ **getPlantUmlCodeFromMachine**(`machine`, `optionsOrLevel?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `machine` | [`Machine`](../interfaces/x_robot.Machine.md) | `undefined` |
| `optionsOrLevel` | `string` | [`options`](../interfaces/x_robot_documentate_visualize.options.md) | `VISUALIZATION_LEVEL.LOW` |

#### Returns

`string`

## Variables

### VISUALIZATION\_LEVEL

• `Const` **VISUALIZATION\_LEVEL**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `LOW` | `string` |
| `HIGH` | `string` |

#### Defined in

[lib/documentate/visualize.ts:44](https://github.com/Masquerade-Circus/x-robot/blob/84ba808/lib/documentate/visualize.ts#L44)

***

### MERMAID\_THEME

• `Const` **MERMAID\_THEME**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `DEFAULT` | `string` |
| `NEUTRAL` | `string` |
| `DARK` | `string` |

#### Defined in

[lib/documentate/visualize.ts:49](https://github.com/Masquerade-Circus/x-robot/blob/84ba808/lib/documentate/visualize.ts#L49)

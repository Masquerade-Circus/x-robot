# Module: x-robot/visualize

**`Description`**

Generate a visual representation of a machine in plant uml format or get a png/svg image of the diagram.

## Visualization Functions

- [getPlantUmlCode](x_robot_visualize.md#getplantumlcode)
- [getPlantUmlCodeFromMachine](x_robot_visualize.md#getplantumlcodefrommachine)
- [createPngFromPlantUmlCode](x_robot_visualize.md#createpngfromplantumlcode)
- [createSvgFromPlantUmlCode](x_robot_visualize.md#createsvgfromplantumlcode)
- [createPngFromMachine](x_robot_visualize.md#createpngfrommachine)
- [createSvgFromMachine](x_robot_visualize.md#createsvgfrommachine)

## Interfaces

- [SerializedCollectionWithGuards](../interfaces/x_robot_visualize.SerializedCollectionWithGuards.md)
- [options](../interfaces/x_robot_visualize.options.md)
- [imageFromPlantUmlCodeOptions](../interfaces/x_robot_visualize.imageFromPlantUmlCodeOptions.md)
- [imageFromMachineOptions](../interfaces/x_robot_visualize.imageFromMachineOptions.md)

## Visualization Functions

### getPlantUmlCode

▸ **getPlantUmlCode**(`serializedMachine`, `optionsOrLevel?`): `string`

This function will get a serialized machine and will return plantuml code representation of it.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `serializedMachine` | [`SerializedMachine`](../interfaces/x_robot_serialize.SerializedMachine.md) | `undefined` | The serialized machine to be visualized. |
| `optionsOrLevel` | `string` \| [`options`](../interfaces/x_robot_visualize.options.md) | `VISUALIZATION_LEVEL.LOW` | - |

#### Returns

`string`

The plantuml code for the visualization.

___

### getPlantUmlCodeFromMachine

▸ **getPlantUmlCodeFromMachine**(`machine`, `optionsOrLevel?`): `string`

This function will get a machine and will return a plant uml code representation of it.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `machine` | [`Machine`](../interfaces/x_robot.Machine.md) | `undefined` | The machine to get the plant uml code from |
| `optionsOrLevel` | `string` \| [`options`](../interfaces/x_robot_visualize.options.md) | `VISUALIZATION_LEVEL.LOW` | The level of the machine to get the plant uml code from or options for the image |

#### Returns

`string`

The plant uml code

___

### createPngFromPlantUmlCode

▸ **createPngFromPlantUmlCode**(`plantUmlCode`, `options?`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`string`\>

Create a png file from a plant uml code

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `plantUmlCode` | `string` | The plant uml code |
| `options` | [`imageFromMachineOptions`](../interfaces/x_robot_visualize.imageFromMachineOptions.md) | Options for the image |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`string`\>

The path to the png file

___

### createSvgFromPlantUmlCode

▸ **createSvgFromPlantUmlCode**(`plantUmlCode`, `options?`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`string`\>

Create a svg file from a plant uml code

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `plantUmlCode` | `string` | The plant uml code |
| `options` | [`imageFromMachineOptions`](../interfaces/x_robot_visualize.imageFromMachineOptions.md) | Options for the image |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`string`\>

The path to the svg file

___

### createPngFromMachine

▸ **createPngFromMachine**(`machine`, `optionsOrLevel?`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`string`\>

Create a png file from a machine

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `machine` | [`Machine`](../interfaces/x_robot.Machine.md) | `undefined` | The machine to get the plant uml code from |
| `optionsOrLevel` | `string` \| [`imageFromMachineOptions`](../interfaces/x_robot_visualize.imageFromMachineOptions.md) | `VISUALIZATION_LEVEL.LOW` | The level of the machine to get the plant uml code from or options for the image |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`string`\>

The path to the png file

___

### createSvgFromMachine

▸ **createSvgFromMachine**(`machine`, `optionsOrLevel?`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`string`\>

Create a svg file from a machine

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `machine` | [`Machine`](../interfaces/x_robot.Machine.md) | `undefined` | The machine to get the plant uml code from |
| `optionsOrLevel` | `string` \| [`imageFromMachineOptions`](../interfaces/x_robot_visualize.imageFromMachineOptions.md) | `VISUALIZATION_LEVEL.LOW` | The level of the machine to get the plant uml code from or options for the image |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`string`\>

The path to the svg file

## Variables

### VISUALIZATION\_LEVEL

• `Const` **VISUALIZATION\_LEVEL**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `LOW` | `string` |
| `HIGH` | `string` |

#### Defined in

[lib/visualize/index.ts:39](https://github.com/Masquerade-Circus/x-robot/blob/a0ed060/lib/visualize/index.ts#L39)

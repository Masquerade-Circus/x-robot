[x-robot - v1.3.0](../README.md) / [Modules](../modules.md) / documentate/diagram-model

# Module: documentate/diagram-model

## Table of contents

### Functions

*   [toDiagramAlias](documentate_diagram_model.md#todiagramalias)
*   [escapeDiagramLabel](documentate_diagram_model.md#escapediagramlabel)
*   [collectAdditionalDiagramModel](documentate_diagram_model.md#collectadditionaldiagrammodel)

### Interfaces

*   [DiagramMachine](../interfaces/documentate_diagram_model.DiagramMachine.md)
*   [DiagramEvent](../interfaces/documentate_diagram_model.DiagramEvent.md)
*   [DiagramState](../interfaces/documentate_diagram_model.DiagramState.md)
*   [DiagramEdge](../interfaces/documentate_diagram_model.DiagramEdge.md)
*   [EventEdge](../interfaces/documentate_diagram_model.EventEdge.md)
*   [GuardDecision](../interfaces/documentate_diagram_model.GuardDecision.md)
*   [ComplexityPoint](../interfaces/documentate_diagram_model.ComplexityPoint.md)
*   [AdditionalDiagramModel](../interfaces/documentate_diagram_model.AdditionalDiagramModel.md)

## Functions

### toDiagramAlias

▸ **toDiagramAlias**(`id`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`string`

***

### escapeDiagramLabel

▸ **escapeDiagramLabel**(`value`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

#### Returns

`string`

***

### collectAdditionalDiagramModel

▸ **collectAdditionalDiagramModel**(`serializedMachine`): [`AdditionalDiagramModel`](../interfaces/documentate_diagram_model.AdditionalDiagramModel.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `serializedMachine` | [`SerializedMachine`](../interfaces/x_robot_documentate.SerializedMachine.md) |

#### Returns

[`AdditionalDiagramModel`](../interfaces/documentate_diagram_model.AdditionalDiagramModel.md)

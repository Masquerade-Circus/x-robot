# Serialization

Generate a serialized representation of your machine using the `documentate()` function. This representation can be used to generate code, diagrams, or convert between formats.

## Getting Serialized Output

```javascript
import { documentate } from "x-robot/documentate";

const { serialized } = await documentate(myMachine, { format: "serialized" });

console.log(serialized);
// {
//   title: "MyMachine",
//   initial: "idle",
//   context: { ... },
//   states: { ... }
// }
```

The serialized output contains the complete machine definition including states, transitions, context structure, and nested/parallel machines.

## Using Serialized as Input

The serialized format can be used as input to generate other formats:

```javascript
// Generate TypeScript from serialized
const { ts } = await documentate(serialized, { format: "ts" });

// Generate JSON definition
const { json } = await documentate(serialized, { format: "json" });

// Generate SCXML
const { scxml } = await documentate(serialized, { format: "scxml" });

// Generate PlantUML diagram
const { plantuml } = await documentate(serialized, { format: "plantuml" });

// Generate Mermaid sequence diagram
const { mermaid } = await documentate(serialized, { format: "mermaid-sequence" });

// Generate PlantUML sequence diagram
const { plantuml: sequencePlantuml } = await documentate(serialized, { format: "plantuml-sequence" });

// Generate a structural guard-decision map
const { mermaid: guardMap } = await documentate(serialized, { format: "mermaid-guards" });

// Generate a structural complexity map
const { plantuml: complexityMap } = await documentate(serialized, { format: "plantuml-complexity" });

// Generate a PlantUML-backed image for a structural map
const { svg: guardMapSvg } = await documentate(serialized, { format: "svg-guards" });
```

## Format Interoperability

| Input \ Output | ts | mjs | cjs | json | scxml | plantuml | mermaid | plantuml-sequence | mermaid-sequence | svg | png | serialized |
|----------------|----|-----|-----|------|-------|----------|---------|-------------------|------------------|-----|-----|------------|
| Machine | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| SerializedMachine | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| SCXML | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| PlantUML | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |

`mermaid` and `plantuml` generate state diagrams. `mermaid-sequence` and `plantuml-sequence` generate sequence diagrams for the same machine structure, which is especially useful when the serialized machine includes nested or parallel machines. Dashed return arrows for `nestedGuard(...)` reactions require machine identity captured from a `Machine` input; plain serialized data still shows nested and parallel calls, but omits those return arrows when identity cannot be proven.

Additional structural diagram formats are available for serialized metadata audits: `mermaid-pulses`/`plantuml-pulses`, `mermaid-events`/`plantuml-events`, `mermaid-outcomes`/`plantuml-outcomes`, `mermaid-immediate`/`plantuml-immediate`, `mermaid-guards`/`plantuml-guards`, `mermaid-composition`/`plantuml-composition`, and `mermaid-complexity`/`plantuml-complexity`. PlantUML-backed image formats are also available as `svg-*` and `png-*` for `sequence`, `pulses`, `events`, `outcomes`, `immediate`, `guards`, `composition`, and `complexity`; for example, `svg-sequence`, `png-guards`, and `svg-complexity`. These diagrams use safe serialized metadata only; they do not serialize callback bodies, payloads, context values, or runtime traces.

`format: "all"` generates the existing state-diagram outputs, but it does not include `mermaid-sequence`, `plantuml-sequence`, the additional structural diagram maps, or the explicit `svg-*`/`png-*` structural image formats. Request those formats directly when you need them.

## Use Cases

### Share Machine Definitions

Export a machine definition to share with other developers:

```javascript
// Generate JSON for sharing
const { json } = await documentate(myMachine, { format: "json" });
fs.writeFileSync("machine-definition.json", json);
```

### Version Control

Store machine definitions in version control:

```javascript
// Generate TypeScript and commit
const { ts } = await documentate(myMachine, { format: "ts" });
fs.writeFileSync("src/machines/myMachine.ts", ts);
```

### Documentation

Generate code examples for documentation:

```javascript
// Include in docs
const { ts } = await documentate(exampleMachine, { format: "ts" });
```

## Next Steps

*   [Code Generation](./code-generation.md) — Generate TypeScript, ESM, CJS
*   [SCXML Import/Export](./scxml.md) — W3C standard format
*   [Saving and Restoring](./saving-and-restoring.md) — Persist runtime state
*   [API: documentate()](../api/modules/x_robot_documentate.md) — Full reference

# Serialization

Generate a serialized representation of your machine using the `documentate()` function. This representation can be used to generate code, diagrams, or convert between formats.

## Getting Serialized Output

```javascript
import { documentate } from "x-robot";

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
```

## Format Interoperability

| Input \ Output | ts | mjs | cjs | json | scxml | plantuml | svg | png | serialized |
|----------------|----|-----|-----|------|-------|----------|-----|-----|------------|
| Machine | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| SerializedMachine | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| SCXML | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| PlantUML | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |

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

- [Code Generation](./code-generation.md) — Generate TypeScript, ESM, CJS
- [SCXML Import/Export](./scxml.md) — W3C standard format
- [Saving and Restoring](./saving-and-restoring.md) — Persist runtime state
- [API: documentate()](../api/modules/x_robot_documentate.md) — Full reference

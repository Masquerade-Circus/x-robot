# Visualization

Generate visual diagrams from your machines using the `documentate()` function. X-Robot supports generating SVG and PNG images from machine definitions.

## Basic Usage

```javascript
import { documentate } from "x-robot";

// Generate SVG
const { svg } = await documentate(myMachine, { format: "svg" });

// Generate PNG
const { png } = await documentate(myMachine, { format: "png" });
```

## With Options

Customize the output with level and skinparam:

```javascript
// High detail diagram
const { svg } = await documentate(myMachine, { 
  format: "svg", 
  level: "high" 
});

// With custom styling
const { png } = await documentate(myMachine, { 
  format: "png", 
  level: "high",
  skinparam: "skinparam backgroundColor white\nskinparam arrowColor #333"
});
```

## Options

### level

- `"low"` (default): Basic state diagram
- `"high"`: Detailed diagram with all transitions, guards, and actions

### skinparam

Customize PlantUML styling. Common options:

```javascript
skinparam: `
  skinparam backgroundColor white
  skinparam state {
    BackgroundColor white
    BorderColor black
    ArrowColor black
  }
  skinparam note {
    BackgroundColor #ffffcc
  }
`
```

## From Different Inputs

You can generate diagrams from various input types:

```javascript
// From a Machine
const { svg } = await documentate(myMachine, { format: "svg" });

// From SerializedMachine
const { svg } = await documentate(serialized, { format: "svg" });

// From SCXML
const { svg } = await documentate(scxmlString, { format: "svg" });

// From PlantUML (to convert to image)
const { svg } = await documentate(plantUmlCode, { format: "svg" });
```

## Use Cases

### Documentation

Generate diagrams automatically for documentation:

```javascript
// In your build process
const { svg } = await documentate(myMachine, { format: "svg" });
fs.writeFileSync("docs/diagram.svg", svg);
```

### Debugging

Visualize machine state during development:

```javascript
function debugDiagram(machine) {
  const { svg } = documentate(machine, { format: "svg" });
  // Open in browser or save to file
  console.log(svg);
}
```

### Export

Save diagrams for external use:

```javascript
// Export as PNG
const { png } = await documentate(myMachine, { format: "png" });
fs.writeFileSync("machine.png", Buffer.from(png, "base64"));
```

## PlantUML Generation

For more control, generate PlantUML code first:

```javascript
const { plantuml } = await documentate(myMachine, { format: "plantuml" });

// Customize
const { svg } = await documentate(myMachine, { 
  format: "svg",
  skinparam: "skinparam stateFontSize 14"
});
```

## Next Steps

- [Serialization](./serialization.md) — Machine definition format
- [Code Generation](./code-generation.md) — Generate code
- [SCXML Import/Export](./scxml.md) — Standard format
- [API: documentate()](../api/modules/x_robot_documentate.md) — Full reference

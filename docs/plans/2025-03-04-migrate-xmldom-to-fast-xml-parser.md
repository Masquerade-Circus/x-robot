# Migración de @xmldom/xmldom a fast-xml-parser

> **Para Claude:** REQUIRED SUB-SKILL: Usa superpowers:executing-plans para implementar este plan tarea por tarea.

**Meta:** Eliminar dependencia de @xmldom/xmldom (~110KB) y reemplazarla por fast-xml-parser (~20KB) en el módulo documentate para reducir bundle y eliminar superficie de ataque.

**Arquitectura:** Reemplazar el uso de DOMParser de @xmldom/xmldom en la función `fromSCXML()` con XMLParser de fast-xml-parser. La función `toSCXML()` no requiere cambios (solo genera strings).

**Stack:**
- fast-xml-parser v5.x
- TypeScript
- Mocha (tests existentes)

---

## Tareas

### Tarea 1: Actualizar package.json

**Archivos:**
- Modificar: `package.json:186`

**Paso 1: Reemplazar dependencia**

Ejecutar:
```bash
npm uninstall @xmldom/xmldom
npm install fast-xml-parser@^5.0.0
```

**Paso 2: Verificar package.json**

Verificar que package.json ahora tenga:
```json
"dependencies": {
  "fast-xml-parser": "^5.0.0"
}
```

(en lugar de @xmldom/xmldom)

**Paso 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "refactor: replace @xmldom/xmldom with fast-xml-parser"
```

---

### Tarea 2: Reescribir fromSCXML para usar fast-xml-parser

**Archivos:**
- Modificar: `lib/documentate/scxml.ts:1-389` (especialmente líneas 181-222 y funciones parse)

**Paso 1: Agregar import de fast-xml-parser**

Cambiar línea 5 de:
```typescript
import { DOMParser } from "@xmldom/xmldom";
```

a:
```typescript
import { XMLParser } from "fast-xml-parser";
```

**Paso 2: Reescribir función fromSCXML**

Reemplazar la función `fromSCXML` completa (líneas 181-222) con esta versión:

```typescript
export function fromSCXML(scxmlString: string): SerializedMachine {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    preserveOrder: false,
    parseAttributeValue: false,
    parseTagValue: false
  });
  
  const result = parser.parse(scxmlString);
  
  // Extraer el elemento raíz (puede ser con namespace o sin él)
  const root = result.scxml || result;
  
  if (!root || (!root['@_xmlns'] && !root['@_version'] && !root['@_initial'] && !root['@_name'])) {
    throw new Error("Invalid SCXML document: root element must be <scxml>");
  }
  
  const machine: SerializedMachine = {
    title: root['@_name'] || undefined,
    initial: root['@_initial'] || "",
    states: {},
    parallel: {},
    context: {},
  };
  
  // Procesar hijos del root (states y parallel)
  const children = root.state || root.parallel || [];
  const childrenArray = Array.isArray(children) ? children : [children].filter(Boolean);
  
  for (const child of childrenArray) {
    if (child['@_id']) {
      // Es un parallel
      if (root.parallel && root.parallel.parallel) {
        const parallelMachines = Array.isArray(root.parallel) ? root.parallel : [root.parallel];
        for (const pm of parallelMachines) {
          if (pm['@_id'] === child['@_id']) {
            machine.parallel[pm['@_id']] = parseParallelElementFromObject(pm);
          }
        }
      } else if (root.parallel && root.parallel['@_id'] === child['@_id']) {
        machine.parallel[root.parallel['@_id']] = parseParallelElementFromObject(root.parallel);
      }
    } else {
      // Es un state regular
      const state = parseStateElementFromObject(child);
      if (state.name) {
        machine.states[state.name] = state;
      }
    }
  }
  
  return machine;
}

function parseStateElementFromObject(stateEl: any): SerializedState {
  const state: SerializedState = {
    name: stateEl['@_id'] || "",
  };
  
  // Parse datamodel (description)
  if (stateEl.datamodel && stateEl.datamodel.data) {
    const data = Array.isArray(stateEl.datamodel.data) 
      ? stateEl.datamodel.data[0] 
      : stateEl.datamodel.data;
    state.description = data['#text'] || data;
  }
  
  // Parse onentry
  if (stateEl.onentry && stateEl.onentry.script) {
    state.run = parseScriptElements(stateEl.onentry.script);
  }
  
  // Parse transitions
  const transitions = stateEl.transition;
  if (transitions) {
    state.on = {};
    const transArray = Array.isArray(transitions) ? transitions : [transitions];
    
    for (const trans of transArray) {
      const event = trans['@_event'];
      const target = trans['@_target'];
      const cond = trans['@_cond'];
      const type = trans['@_type'];
      
      if (!event) continue;
      
      // Immediate transitions (type="internal")
      if (type === "internal" && target) {
        if (!state.immediate) state.immediate = [];
        state.immediate.push({
          immediate: target,
          guards: cond ? [{ guard: cond }] : undefined,
        });
        continue;
      }
      
      const transitionObj: any = {
        target: target || "",
      };
      
      if (cond) {
        transitionObj.guards = [{ guard: cond }];
      }
      
      // Parse onexit inside transition
      if (trans.onexit && trans.onexit.script) {
        transitionObj.exit = parseScriptElements(trans.onexit.script);
      }
      
      state.on[event] = transitionObj;
    }
  }
  
  // Parse nested states (child state elements)
  const nestedStates = stateEl.state;
  if (nestedStates) {
    const nestedArray = Array.isArray(nestedStates) ? nestedStates : [nestedStates];
    if (nestedArray.length > 0) {
      state.nested = [];
      for (const nestedEl of nestedArray) {
        if (nestedEl['@_id']) {
          const nestedMachine = parseNestedMachineFromObject(nestedEl);
          state.nested.push(nestedMachine);
        }
      }
    }
  }
  
  return state;
}

function parseScriptElements(scripts: any): SerializedPulse[] {
  const pulses: SerializedPulse[] = [];
  const scriptArray = Array.isArray(scripts) ? scripts : [scripts];
  
  for (const script of scriptArray) {
    const content = script['#text'] || script;
    if (content && typeof content === 'string') {
      const fnMatch = content.match(/^([\w.]+)\(/);
      if (fnMatch) {
        pulses.push({ pulse: fnMatch[1] });
      }
    }
  }
  
  return pulses;
}

function parseParallelElementFromObject(element: any): SerializedMachine {
  const machine: SerializedMachine = {
    states: {},
    parallel: {},
    context: {},
    initial: "",
  };
  
  // Get initial from <initial> child
  if (element.initial) {
    const initialEl = Array.isArray(element.initial) 
      ? element.initial[0] 
      : element.initial;
    if (initialEl && initialEl.transition) {
      const trans = Array.isArray(initialEl.transition) 
        ? initialEl.transition[0] 
        : initialEl.transition;
      machine.initial = trans['@_target'] || "";
    }
  }
  
  // Parse child states
  if (element.state) {
    const statesArray = Array.isArray(element.state) ? element.state : [element.state];
    for (const stateEl of statesArray) {
      if (stateEl['@_id']) {
        const state = parseStateElementFromObject(stateEl);
        if (state.name) {
          machine.states[state.name] = state;
        }
      }
    }
  }
  
  return machine;
}

function parseNestedMachineFromObject(element: any): SerializedNestedMachine {
  const machine: SerializedMachine = {
    states: {},
    parallel: {},
    context: {},
    initial: "",
  };
  
  // Get initial
  if (element.initial) {
    const initialEl = Array.isArray(element.initial) 
      ? element.initial[0] 
      : element.initial;
    if (initialEl && initialEl.transition) {
      const trans = Array.isArray(initialEl.transition) 
        ? initialEl.transition[0] 
        : initialEl.transition;
      machine.initial = trans['@_target'] || "";
    }
  }
  
  // Parse states
  if (element.state) {
    const statesArray = Array.isArray(element.state) ? element.state : [element.state];
    for (const stateEl of statesArray) {
      if (stateEl['@_id']) {
        const state = parseStateElementFromObject(stateEl);
        if (state.name) {
          machine.states[state.name] = state;
        }
      }
    }
  }
  
  return {
    machine,
    transition: machine.initial,
  };
}
```

**Paso 3: Commit**

```bash
git add lib/documentate/scxml.ts
git commit -m "refactor: use fast-xml-parser instead of @xmldom/xmldom"
```

---

### Tarea 3: Ejecutar tests de SCXML

**Archivos:**
- Test: `tests/scxml.test.ts`

**Paso 1: Ejecutar tests**

```bash
npm run test -- --grep "SCXML"
```

**Esperado:** Todos los tests deben pasar (22 tests en total)

**Paso 2: Si fallan, depurar**

Si algún test falla:
1. Revisar la estructura del objeto que genera fast-xml-parser
2. Ajustar las funciones de parseo (`parseStateElementFromObject`, etc.)
3. Volver a ejecutar tests

**Paso 3: Commit**

```bash
git add tests/
git commit -m "test: SCXML tests pass with fast-xml-parser"
```

---

### Tarea 4: Rebuild y verificar bundle

**Archivos:**
- Build: `build.js`
- Output: `dist/documentate/`

**Paso 1: Rebuild**

```bash
npm run build
```

**Paso 2: Verificar tamaño del bundle**

```bash
ls -lh dist/documentate/index.min.js
```

**Esperado:** El bundle debe ser significativamente más pequeño (antes ~110KB con xmldom, después ~30-40KB con fast-xml-parser)

**Paso 3: Commit**

```bash
git add dist/
git commit -m "build: reduced bundle size from xmldom to fast-xml-parser"
```

---

### Tarea 5: Tests completos

**Paso 1: Ejecutar todos los tests**

```bash
npm run test-all
```

**Esperado:** Todos los tests deben pasar sin errores.

**Paso 2: Commit**

```bash
git add .
git commit -m "chore: all tests pass after xmldom migration"
```

---

## Notas de la migración

### Diferencias principales entre parsers

| @xmldom/xmldom | fast-xml-parser |
|----------------|-----------------|
| `element.getAttribute('id')` | `element['@_id']` |
| `element.tagName` | Detección por existencia de `state`, `transition`, etc. |
| `element.childNodes` | Objeto anidado directo |
| `element.textContent` | `element['#text']` |
| `getElementsByTagName('state')` | `element.state` (array o objeto) |

### Configuración de fast-xml-parser usada

```typescript
{
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  preserveOrder: false
}
```

Esta configuración:
- Mantiene atributos con prefijo `@_` (ej: `@_id`, `@_event`)
- Mantiene texto con nombre `#text`
- Facilita el mapeo a la estructura existente

---

## Criterios de éxito

- [ ] @xmldom/xmldom eliminado de package.json
- [ ] fast-xml-parser añadido como dependencia
- [ ] Todos los 22 tests de SCXML pasan
- [ ] Bundle de documentate reducido en ~70-80KB
- [ ] No hay regressions en otros tests
- [ ] CHANGELOG actualizado

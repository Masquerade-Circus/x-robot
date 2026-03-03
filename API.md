# Nueva API de x-robot

## Función principal: `machine`

```typescript
machine(title, init?, state*, parallel*)
```

---

## 1. `machine(title, ...args)`

Crea la máquina de estados. Los argumentos pueden ser:
- `init(...)` - configuración inicial (opcional, solo uno)
- `state(...)` - estados (al menos uno)
- `parallel(...)` - máquinas paralelas

**Comportamiento:**
- Si no hay `init()` con `initial()`, el primer estado definido se convierte en initial
- Por defecto `frozen: true` (el context es inmutable)

---

## 2. `init(initial?, context?, shouldFreeze?, history?)`

Configuración inicial de la máquina.

```typescript
// Ejemplos:
init(initial("idle"))
init(initial("idle"), context({ count: 0 }))
init(initial("idle"), context({ count: 0 }), shouldFreeze(false))
init(initial("idle"), history(5))           // limitar historial a 5 entradas
init(initial("idle"), history(0))            // desactivar historial
init(context({ count: 0 }))
```

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `initial` | `InitialDirective` | Estado inicial |
| `context` | `ContextDirective` | Estado inicial del context |
| `shouldFreeze` | `ShouldFreezeDirective` | Si el context es inmutable |

---

## 3. `initial(name)`

Define el estado inicial.

```typescript
initial("idle")
initial("loading")
```

---

## 4. `context(value)`

Define el context inicial.

```typescript
// Objeto
context({ count: 0, name: "test" })

// Función que retorna objeto
context(() => ({ count: 0, name: "test" }))
```

---

## 5. `shouldFreeze(boolean)`

Controla si el context es inmutable.

```typescript
shouldFreeze(true)   // default - context inmutable
shouldFreeze(false)  // context mutable
```

---

## 6. `history(limit)`

Controla el número máximo de entradas en el historial de la máquina. Por defecto es 10. Establecer en 0 para desactivar.

```typescript
history(10)   // default - mantener últimas 10 entradas
history(5)    // mantener últimas 5 entradas
history(0)    // desactivar historial
```

**Esta es una característica que XState NO tiene.**

---

## 7. `state(name, ...args)`

Define un estado.

```typescript
state("idle")
state("loading", transition("done", "success"))
state("error", entry(handleError), transition("retry", "loading"))
```

**Argumentos posibles:**
- `entry(...)` - ejecuta lógica
- `transition(...)` - define transiciones
- `immediate(...)` - transiciones inmediatas
- `nested(...)` - máquina anidada
- `description(...)` - documentación

---

## 8. `entry(fn, [success], [failure])`

Ejecuta lógica cuando la máquina entra al estado.

```typescript
// Solo ejecutar
entry(fn)

// Ejecutar y transicionar en éxito
entry(fn, "done")

// Ejecutar y transicionar en éxito o error
entry(fn, "done", "error")

// Solo ejecutar en error (sin success)
entry(fn, ,"error")
```

**Comportamiento detallado:**

| Sintaxis | Éxito | Error |
|----------|-------|-------|
| `entry(fn)` | Queda en el estado, pasa al siguiente entry | Busca estado "error", si existe transiciona; si no, throw |
| `entry(fn, "done")` | Transiciona a "done" | Busca estado "error", si existe transiciona; si no, throw |
| `entry(fn, ,"error")` | Queda en el estado | Transiciona a "error" |
| `entry(fn, "done", "error")` | Transiciona a "done" | Transiciona a "error" |

**NO válido (usar múltiples entry):**
```typescript
// INVÁLIDO:
entry(fn, entry(handler)) 
entry(fn, "done", entry(handler))

// VÁLIDO - separar en múltiples entry:
entry(fn)
entry(handler)
```

---

## 9. `transition(name, target, ...guards)`

## 10. `guard(fn, [failure])`

## 10.1. `exit(handler, [failure])`

## 11. `immediate(target, ...guards)`

## 12. `nested(machine, [transition])`

## 13. `nestedGuard(machine, guard, [failure])`

## 14. `parallel(...machines)`

## 15. `description(text)`

## 16. Helpers de estado

Aliases para estados con tipos visuales:

```typescript
infoState("loading", ...)
warningState("error", ...)
dangerState("fatal", ...)
successState("done", ...)
primaryState("active", ...)
```

---

## Resumen de combinaciones válidas

```typescript
// Machine
machine("MyApp", init(initial("idle")), state("idle"), state("loading"))

// State con múltiples entry
state("saving",
  entry(validateInput),
  entry(saveData, "saved"),
  entry(notify)
)

// Transitions con guards
state("form",
  transition("submit", "submitting", guard(isValid), guard(isAuthorized))
)

// Con error handling
state("processing",
  entry(apiCall, "success", "error")
)

state("error",
  entry(logError)
)

state("success",
  entry(showMessage)
)
```

---

## Reglas de comportamiento

### Estados finales
Un estado sin transiciones se considera estado final.

### Manejo de errores en entry actions
1. Si el entry tiene `failure` definido → usa esa transición
2. Si no tiene `failure` pero existe estado "error" → transiciona automáticamente
3. Si no tiene "error" → lanza el error

### Manejo de errores en guards
1. Si el guard retorna `true` → permite la transición
2. Si retorna otro valor:
   - Tiene `failure` → ejecuta/transiciona según failure
   - No tiene `failure` → almacena el valor en `context.error`

---

## invokeAfter(machine, timeInMilliseconds, event, [payload])

Programa una invocación de evento después de un tiempo específico.

```typescript
// Timeout cancelable
const cancelTimeout = invokeAfter(myMachine, 5000, 'timeout', { reason: 'network' });

// Para cancelar antes de que ocurra
cancelTimeout();
```

**Parámetros:**
- `machine`: La máquina a invocar
- `timeInMilliseconds`: Tiempo de espera en milisegundos
- `event`: El nombre del evento a invocar
- `payload` (opcional): Datos a pasar al evento

**Retorna:**
- Función `() => void` para cancelar la invocación programada

---

## snapshot(machine)

Crea un snapshot del estado actual de la máquina.

```typescript
// Guardar snapshot
const savedSnapshot = snapshot(myMachine);

// Restaurar máquina desde snapshot
const newMachine = machine('MyMachine', ...definicion);
start(newMachine, savedSnapshot);
```

**Parámetros:**
- `machine`: La máquina de la cual obtener el snapshot

**Retorna:**
- Objeto con: `current`, `context`, `history`, `parallel`, `nested`

**Nota:** El snapshot incluye el estado de todas las máquinas paralelas y anidadas.

---

## serialize(machine)

Serializa la máquina a un objeto JSON que puede ser almacenado o enviado por la red.

```typescript
import { serialize } from "x-robot";

const myMachine = machine(
  "Test",
  init(initial("idle")),
  state("idle", transition("next", "active")),
  state("active")
);

const serialized = serialize(myMachine);
console.log(serialized);
// {
//   "states": { "idle": {...}, "active": {...} },
//   "parallel": {},
//   "context": {},
//   "initial": "idle",
//   "title": "Test"
// }
```

**Parámetros:**
- `machine`: La máquina a serializar

**Retorna:**
- Objeto `SerializedMachine` con: `states`, `parallel`, `context`, `initial`, `title`

---

## generateFromSerializedMachine(serializedMachine, format)

Genera código fuente a partir de una máquina serializada. Útil para crear implementacionesbases o documentación.

```typescript
import { generateFromSerializedMachine, Format, serialize } from "x-robot";

const myMachine = machine(
  "Test",
  init(initial("idle"), { context: { count: 0 } }),
  state("idle", transition("next", "active")),
  state("active")
);

const serialized = serialize(myMachine);

// Generar TypeScript
const tsCode = generateFromSerializedMachine(serialized, Format.TS);

// Generar ESM
const esmCode = generateFromSerializedMachine(serialized, Format.ESM);

// Generar CJS
const cjsCode = generateFromSerializedMachine(serialized, Format.CJS);
```

### Format enum

```typescript
enum Format {
  ESM = "esm",  // ES Modules (import/export)
  CJS = "cjs",  // CommonJS (require/module.exports)
  TS = "ts",    // TypeScript con tipos
}
```

**Parámetros:**
- `serializedMachine`: Máquina serializada (resultado de `serialize()`)
- `format`: Formato de salida (`Format.ESM`, `Format.CJS`, `Format.TS`)

**Retorna:**
- String con el código generado

**Ejemplo de salida TypeScript:**

```typescript
export interface TestStates {
  idle: {};
  active: {};
}

export interface TestContext {
  count: number;
}

import { machine, states, initial, context, transition } from "x-robot";

const getContext = () => ({
  "count": 0
});

export const TestMachine = machine(
  "Test",
  states(
    state(
      "idle",
      transition("next", "active")
    ),
    state(
      "active"
    )
  ),
  context(getContext),
  initial("idle")
);

export default { TestMachine };
```

---

## toSCXML(machine)

Exporta una máquina a formato SCXML (State Chart XML). SCXML es un estándar W3C para máquinas de estados.

```typescript
import { toSCXML, serialize } from "x-robot";

const myMachine = machine(
  "Test",
  init(initial("idle")),
  state("idle", transition("start", "running")),
  state("running", transition("stop", "idle"))
);

const serialized = serialize(myMachine);
const scxml = toSCXML(serialized);

console.log(scxml);
// <?xml version="1.0" encoding="UTF-8"?>
// <scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0" initial="idle" name="Test">
//   <state id="idle">
//     <transition event="start" target="running"/>
//   </state>
//   <state id="running">
//     <transition event="stop" target="idle"/>
//   </state>
// </scxml>
```

**Parámetros:**
- `machine`: Máquina serializada (resultado de `serialize()`)

**Retorna:**
- String con el documento SCXML

**Características soportadas:**
- Estados simples y anidados
- Estados paralelos
- Transiciones con eventos
- Guards (condiciones)
- Acciones de entrada (onentry)
- Acciones de salida (onexit)
- Transiciones inmediatas

---

## fromSCXML(scxmlString)

Importa una máquina desde formato SCXML.

```typescript
import { fromSCXML } from "x-robot";

const scxml = `<?xml version="1.0" encoding="UTF-8"?>
<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0" initial="idle" name="Test">
  <state id="idle">
    <transition event="start" target="running"/>
  </state>
  <state id="running">
    <transition event="stop" target="idle"/>
  </state>
</scxml>`;

const machine = fromSCXML(scxml);
```

**Parámetros:**
- `scxmlString`: String con el documento SCXML

**Retorna:**
- Objeto `SerializedMachine` que puede usarse con `serialize()` o pasarse a otras funciones

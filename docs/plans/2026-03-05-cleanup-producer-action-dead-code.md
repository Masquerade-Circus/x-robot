# Limpieza de código muerto: Producers y Actions

> **Para Claude:** Este plan puede ejecutarse directamente en el directorio actual (no requiere worktree).

**Meta:** Eliminar código muerto relacionado con Producers y Actions que ya no existen en la API. La API actual solo usa Entry Pulses (`entry()`) que acepta funciones síncronas o asíncronas.

**Arquitectura:** 
- Eliminar funciones `runAction()`, `runProducer()`, `runActionsAndProducers()`, `runProducers()` de invoke.ts
- Eliminar tipos `Producer`, `ProducerDirective`, `Action`, `ActionDirective` y funciones `isAction`, `isProducer` de utils.ts e interfaces.ts
- Limpiar y renombrar tests duplicados en index.test.ts

**Stack:**
- TypeScript
- Mocha (tests)

---

## Criterios de éxito

- [ ] Código muerto eliminado de lib/
- [ ] Tests principales pasando (210 tests)
- [ ] No hay referencias a "producer" o "action" en código funcional
- [ ] API pública sin cambios (solo entry/exit pulses)

---

## Tareas

### Tarea 1: Eliminar código muerto de lib/machine/invoke.ts

**Archivos:**
- Modificar: `lib/machine/invoke.ts`

**Contexto:** Las funciones `runAction`, `runProducer`, `runActionsAndProducers`, `runProducers` ya no se usan. Solo debe existir `runPulse`.

**Cambios:**

1. **Eliminar función `runProducer()` completa (líneas 46-89)**

2. **Eliminar función `runAction()` completa (líneas 204-223)**

3. **Eliminar función `runActionsAndProducers()` (líneas 280-299)** - Esta debe ser reemplazada por una función que solo ejecute pulses

4. **Eliminar función `runProducers()` (líneas 308-313)**

5. **Simplificar el código que llama a estas funciones:**

   En la línea ~793 donde dice:
   ```typescript
   runActionsAndProducers(machine, targetStateObject, payload)
   ```
   Cambiar a:
   ```typescript
   runPulses(machine, targetStateObject, payload)
   ```

   En la línea ~809 donde dice:
   ```typescript
   runProducers(machine, targetStateObject, payload);
   ```
   Cambiar a:
   ```typescript
   runPulses(machine, targetStateObject, payload);
   ```

6. **Renombrar `runPulse` a `runPulses` (plural)** y hacer que itere sobre el array de pulses

7. **Eliminar imports no usados:**
   - `ProducerDirective` del import de interfaces
   - `isProducer`, `isProducerWithTransition` del import de utils

**Verificación:**
```bash
npm run test 2>&1 | grep -E "passing|failing"
```

---

### Tarea 2: Eliminar código muerto de lib/utils.ts

**Archivos:**
- Modificar: `lib/utils.ts`

**Cambios:**

1. **Eliminar función `isProducer()` (líneas 38-40)**

2. **Eliminar función `isProducerWithTransition()` (líneas 42-46)**

3. **Eliminar función `isProducerWithoutTransition()` (líneas 48-52)**

4. **Eliminar función `isAction()` (líneas 62-64)**

**Verificación:**
```bash
npm run test 2>&1 | grep -E "passing|failing"
```

---

### Tarea 3: Eliminar tipos muertos de lib/machine/interfaces.ts

**Archivos:**
- Modificar: `lib/machine/interfaces.ts`

**Cambios:**

1. **Eliminar interfaz `Producer` (líneas 46-48)**

2. **Eliminar interfaz `ProducerDirective` (líneas 50-53)**

3. **Eliminar interfaz `ProducerDirectiveWithTransition` (líneas 55-57)**

4. **Eliminar interfaz `ProducerDirectiveWithoutTransition` (líneas 59-61)**

5. **Eliminar interfaz `Action` (líneas 79-81)**

6. **Eliminar interfaz `ActionDirective` (líneas 83-87)**

7. **Actualizar `PulseDirective` para quitar referencias a ProducerDirective:**
   
   La línea 85 currently dice:
   ```typescript
   success?: ProducerDirective | string | null;
   failure?: ProducerDirective | string | null;
   ```
   
   Cambiar a:
   ```typescript
   success?: string | PulseDirective;
   failure?: string | PulseDirective;
   ```

8. **Actualizar `ActionDirective` en línea 83-87** - Eliminar completamente, o cambiar a solo mantener si es necesario para retrocompatibilidad

**Verificación:**
```bash
npm run test 2>&1 | grep -E "passing|failing"
```

---

### Tarea 4: Limpiar lib/machine/create.ts

**Archivos:**
- Modificar: `lib/machine/create.ts`

**Cambios:**

1. **Eliminar comentarios que mencionan "producers"** (líneas 357, 603, 654, 671, 688, 705, 722)

   Cambiar por "pulses":
   ```typescript
   // De: @param args nested machines, actions, producers, transitions, etc.
   // A:   @param args nested machines, entry/exit pulses, transitions, etc.
   ```

2. **Eliminar parámetro `onFailureProducer`** (línea 603)

   Cambiar nombre a `onFailurePulse`:
   ```typescript
   // De: @param onFailureProducer The producer to be run on failure
   // A:   @param onFailurePulse The pulse to be run on failure
   ```

**Verificación:**
```bash
npm run test 2>&1 | grep -E "passing|failing"
```

---

### Tarea 5: Limpiar lib/documentate/visualize.ts

**Archivos:**
- Modificar: `lib/documentate/visualize.ts`

**Cambios:**

1. **Línea 175:** Eliminar mención a "producers"
   ```typescript
   // De: // If visualization level is high, add the actions, producers and transitions
   // A:   // If visualization level is high, add the pulses and transitions
   ```

2. **Línea 178:** Eliminar mención a "producers"
   ```typescript
   // De: // Add the actions, producers and transitions
   // A:   // Add the pulses and transitions
   ```

3. **Línea 441:** Actualizar comentario
   ```typescript
   // De: This function will get a collection of guards, producers and actions...
   // A:   This function will get a collection of guards and pulses...
   ```

4. **Eliminar objeto de ejemplo con "producer" (líneas 448, 455)**
   ```typescript
   // Cambiar:
   { producer: "updateError" }
   // Por:
   { pulse: "updateError" }
   ```

**Verificación:**
```bash
npm run test 2>&1 | grep -E "passing|failing"
```

---

### Tarea 6: Limpiar tests en tests/index.test.ts

**Archivos:**
- Modificar: `tests/index.test.ts`

**Análisis de tests actuales:**

| Sección | Tests | Acción |
|--------|-------|--------|
| Producers (líneas 339-488) | ~10 | Renombrar a "Entry Pulses (Sync)" |
| Actions (líneas 491-790) | ~15 | Renombrar a "Entry Pulses (Async)" |

**Cambios:**

1. **Renombrar describe "Producers"** (línea 339) → "Entry Pulses (Synchronous)"

2. **Renombrar describe "Actions"** (línea 491) → "Entry Pulses (Asynchronous)"

3. **Eliminar test duplicado de validación:**
   - "should validate that the producer has a valid function" (línea 370)
   - "should validate that the action has a valid function" (línea 523)
   
   Mantener solo uno y renombrar a:
   - "should validate that the pulse has a valid function"

4. **Unificar tests de error handling** que son idénticos entre sync y async:
   - Error handling sync: líneas 412, 427, 443, 458
   - Error handling async: líneas 615, 633, 654, 675
   
   Mantener solo la versión async (más completa) y eliminar las sync

5. **Eliminar tests de "producers" que están vacíos:**
   - Línea 475: "should validate that producers are created before any transitions"
   Este test tiene sentido para pulses, así que renombrar a "should validate that pulses are created before any transitions"

6. **Renombrar menciones de "producer" a "pulse"** en todos los tests

**Verificación:**
```bash
npm run test 2>&1 | grep -E "passing|failing"
```

Esperado: 210 passing (o menos si se eliminaron tests duplicados)

---

### Tarea 7: Limpiar otros archivos de tests

**Archivos:**
- Modificar: `tests/generate.test.ts`
- Modificar: `tests/high-complexity-machine.test.ts`

**Cambios:**

1. **En tests/generate.test.ts:**
   - Eliminar todos los TODO comments sobre producers (líneas 37, 41, 45, 49, 108, 112, 116, 175, 179, 243, 247, 251, 255, 259, 361, 365, 369, 373, 432, 436, 440, 499, 503, 567, 571, 575, 579, 583)

2. **En tests/high-complexity-machine.test.ts:**
   - Eliminar TODO comment sobre producer (línea 546)

**Verificación:**
```bash
npm run test 2>&1 | grep -E "passing|failing"
```

---

### Tarea 8: Verificación final

**Pasos:**

1. **Ejecutar todos los tests:**
```bash
npm run test
```

2. **Buscar referencias a "producer" o "action" en código:**
```bash
grep -r "producer" lib/ --include="*.ts" | grep -v "pulse" | grep -v "//" 
grep -r "ActionDirective" lib/ --include="*.ts"
```

3. **Buscar en exports:**
```bash
grep -E "producer|Action" lib/index.ts
```

4. **Rebuild y verificar:**
```bash
npm run build
```

5. **Ejecutar benchmarks (opcional):**
```bash
npm run bench:report
```

---

## Notas

### Sobre los tipos ProducerDirective en PulseDirective

El tipo `PulseDirective` actualmente tiene:
```typescript
success?: ProducerDirective | string | PulseDirective;
failure?: ProducerDirective | string | PulseDirective;
```

Esto debe cambiar a:
```typescript
success?: string | PulseDirective;
failure?: string | PulseDirective;
```

Porque:
- `success` y `failure` pueden ser un string (nombre de transición)
- o un `PulseDirective` anidado (para ejecutar un pulse y luego hacer transición)
- Ya no tiene sentido `ProducerDirective` aquí

### Sobre la función runPulse

Actualmente `runPulse` procesa un solo pulse. Debe renombrarse a `runPulses` (plural) y procesar el array `state.run`.

---

## Resumen de archivos a modificar

| Archivo | Acción |
|---------|--------|
| lib/machine/invoke.ts | Eliminar funciones muertas, simplificar |
| lib/utils.ts | Eliminar isProducer, isAction |
| lib/machine/interfaces.ts | Eliminar tipos Producer, Action |
| lib/machine/create.ts | Limpiar comentarios |
| lib/documentate/visualize.ts | Limpiar comentarios |
| tests/index.test.ts | Renombrar y eliminar duplicados |
| tests/generate.test.ts | Eliminar TODOs |
| tests/high-complexity-machine.test.ts | Eliminar TODOs |

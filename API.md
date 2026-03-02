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

## 2. `init(initial?, context?, shouldFreeze?)`

Configuración inicial de la máquina.

```typescript
// Ejemplos:
init(initial("idle"))
init(initial("idle"), context({ count: 0 }))
init(initial("idle"), context({ count: 0 }), shouldFreeze(false))
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

## 6. `state(name, ...args)`

Define un estado.

```typescript
state("idle")
state("loading", transition("done", "success"))
state("error", pulse(handleError), transition("retry", "loading"))
```

**Argumentos posibles:**
- `pulse(...)` - ejecuta lógica
- `transition(...)` - define transiciones
- `immediate(...)` - transiciones inmediatas
- `nested(...)` - máquina anidada
- `description(...)` - documentación

---

## 7. `pulse(fn, [success], [failure])`

Ejecuta lógica cuando la máquina entra al estado.

```typescript
// Solo ejecutar
pulse(fn)

// Ejecutar y transicionar en éxito
pulse(fn, "done")

// Ejecutar y transicionar en éxito o error
pulse(fn, "done", "error")

// Solo ejecutar en error (sin success)
pulse(fn, ,"error")
```

**Comportamiento detallado:**

| Sintaxis | Éxito | Error |
|----------|-------|-------|
| `pulse(fn)` | Queda en el estado, pasa al siguiente pulse | Busca estado "error", si existe transiciona; si no, throw |
| `pulse(fn, "done")` | Transiciona a "done" | Busca estado "error", si existe transiciona; si no, throw |
| `pulse(fn, ,"error")` | Queda en el estado | Transiciona a "error" |
| `pulse(fn, "done", "error")` | Transiciona a "done" | Transiciona a "error" |

**NO válido (usar múltiples pulses):**
```typescript
// INVÁLIDO:
pulse(fn, pulse(handler)) 
pulse(fn, "done", pulse(handler))

// VÁLIDO - separar en múltiples pulses:
pulse(fn)
pulse(handler)
```

---

## 8. `transition(name, target, ...guards)`

Define una transición.

```typescript
transition("submit", "submitting")
transition("submit", "submitting", guard(isValid))
transition("update", "updated", guard(canUpdate), guard(isAuthorized))
```

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `name` | `string` | Nombre del evento |
| `target` | `string` | Estado destino |
| `guards` | `GuardDirective[]` | Condiciones (opcional) |

---

## 9. `guard(fn, [failure])`

Define una condición para una transición.

```typescript
guard(isValid)
guard(isValid, "invalid")

// En transición:
transition("submit", "submitting", guard(isFormValid))
```

**Reglas:**
- El `failure` SOLO acepta strings (no pulses)
- El guard debe estar dentro de una transición, no directamente en el estado

```typescript
// VÁLIDO:
guard(isValid)           // solo validar
guard(isValid, "error") // transicionar en failure

// INVÁLIDO:
guard(isValid, pulse(handleError)) // NO válido - failure debe ser string
```

**Comportamiento:**
- Retorna `true` → permite la transición
- Retorna otro valor → no permite la transición
  - Si hay `failure` (string) → transiciona según failure
  - Si no hay `failure` → almacena el valor en `context.error`

---

## 10. `immediate(target, ...guards)`

Transición inmediata (sin esperar evento).

```typescript
immediate("loading")
immediate("success", guard(isReady))
```

---

## 11. `nested(machine, [transition])`

Incrusta otra máquina como submáquina.

```typescript
nested(leftWingMachine)
nested(leftWingMachine, "open")  // transiciona al estado "open" al entrar
```

---

## 12. `nestedGuard(machine, guard, [failure])`

Guard que evalúa contra el context de una máquina anidada.

```typescript
nestedGuard(leftWingMachine, isWingOpen)
nestedGuard(leftWingMachine, isWingOpen, "invalid")
```

---

## 13. `parallel(...machines)`

Define máquinas paralelas que se ejecutan simultáneamente.

```typescript
parallel(timerMachine, counterMachine)
```

---

## 14. `description(text)`

Documentación para el estado.

```typescript
state("loading", description("Cargando datos"))
```

---

## 15. Helpers de estado

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

// State con múltiples pulses
state("saving",
  pulse(validateInput),
  pulse(saveData, "saved"),
  pulse(notify)
)

// Transitions con guards
state("form",
  transition("submit", "submitting", guard(isValid), guard(isAuthorized))
)

// Con error handling
state("processing",
  pulse(apiCall, "success", "error")
)

state("error",
  pulse(logError)
)

state("success",
  pulse(showMessage)
)
```

---

## Reglas de comportamiento

### Estados finales
Un estado sin transiciones se considera estado final.

### Manejo de errores en pulses
1. Si el pulse tiene `failure` definido → usa esa transición
2. Si no tiene `failure` pero existe estado "error" → transiciona automáticamente
3. Si no tiene "error" → lanza el error

### Manejo de errores en guards
1. Si el guard retorna `true` → permite la transición
2. Si retorna otro valor:
   - Tiene `failure` → ejecuta/transiciona según failure
   - No tiene `failure` → almacena el valor en `context.error`

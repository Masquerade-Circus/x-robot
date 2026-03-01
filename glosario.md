# Glosario: Métodos de Estado

## Reducers

Los reducers son métodos síncronos que reciben el estado actual y una acción (o nombre de evento). Deben:

1. **Discriminar** qué hacer según el tipo de acción/evento
2. **Clonar** el estado para evitar mutación
3. **Modificar** el estado clonado
4. **Retornar** el nuevo estado

```typescript
type Reducer<State, Action> = (state: State, action: Action) => State;
```

**Ventajas:**
- Control total sobre el estado
- Predictible y testable
- Historial de cambios fácil de implementar

**Desventajas:**
- Mucho boilerplate
- El desarrollador debe manejar la discriminación, clonación y retorno

---

## Mutations

Las mutations son métodos síncronos que reciben el estado y lo mutan directamente. Deben:

1. **Clonar** el estado para evitar mutación del estado original
2. **Modificar** el estado clonado
3. **Retornar** el nuevo estado

```typescript
type Mutation<State> = (state: State) => State;
```

**Ventajas:**
- Menos boilerplate que los reducers
- No necesitan discriminar acciones
- Lógica más directa

**Desventajas:**
- El desarrollador sigue siendo responsable de clonar y retornar

---

## Producers

Los producers son métodos síncronos que reciben un estado **ya clonado**. Solo deben:

1. **Modificar** directamente el estado clonado
2. **No necesitan retornar** nada

```typescript
type Producer<State> = (state: State) => void;
```

**Ventajas:**
- Mínimo boilerplate
- El desarrollador solo modifica el estado
- Inmutabilidad garantizada por el framework

**Desventajas:**
- Menos flexibilidad para lógica compleja

---

## Actions

Las actions son métodos asíncronos que realizan operaciones asíncronas (llamadas API, timers, etc.) y pueden invocar reducers, mutations o producers. Son el único lugar donde se permite llamar a estos métodos.

```typescript
type Action<State, Args, Return> = (state: State, ...args: Args[]) => Promise<Return> | Return;
```

**Ventajas:**
- Manejan lógica asíncrona
- Separan efectos secundarios de la lógica de estado
- Permiten encadenar operaciones

**Desventajas:**
- Añaden complejidad adicional
- Deben manejar errores y estados de carga

---

## Signals

Los signals son métodos que pueden o no mutar el estado. Si el estado es mutado, se dispatchea un efecto (generalmente una actualización de UI).

```typescript
type Signal<State> = (state: State) => void | boolean;
```

**Ventajas:**
- Flexibilidad total
- Notificación automática de cambios
- Útiles para actualizaciones condicionales

**Desventajas:**
- Puede ser difícil rastrear qué mutó exactamente
- Dependencia del framework para detectar cambios

---

## Pulses

Los pulses son métodos que pueden ser síncronos o asíncronos. Reciben un estado ya clonado, lo mutan, y no necesitan retornar un nuevo estado. Si el estado cambió, se dispatchea un efecto automáticamente.

Características clave:

1. **Pueden ser sync o async**: Se determina por el keyword `async`
2. **Reciben estado clonado**: No necesitan clonar
3. **Mutan directamente**: No necesitan retornar
4. **Notificación automática**: Si el estado cambió, se dispatchea efecto
5. **$flush**: Permite dispatchear efectos intermedios dentro de un pulso

```typescript
type Pulse<State, Args, Return> = (state: State, ...args: Args[]) => Return | Promise<Return>;
```

**Ventajas:**

- Unifica reducers, mutations, producers, actions y signals en un solo concepto
- Mínimo boilerplate
- DX mejorado: el desarrollador solo escribe lógica de negocio
- El framework maneja la detección de cambios y notificación

**Desventajas:**

- Deep equal para detectar cambios tiene costo computacional
- Menos granularidad/control comparado con tener métodos separados
- "Magia" puede dificultar el debug en casos complejos

---

## Comparación Summary

| Característica | Reducers | Mutations | Producers | Actions | Signals | Pulses |
|----------------|----------|-----------|-----------|---------|---------|--------|
| Sync/Async ambos | ❌ | ❌ | ❌ | ✅ | ⚠️ | ✅ |
| Clona estado | ✅ | ✅ | ❌ | - | ⚠️ | ❌ |
| Retorna estado | ✅ | ✅ | ❌ | ❌ | ⚠️ | ❌ |
| Notificación auto | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| $flush intermedio | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Boilerplate | Alto | Medio | Bajo | Variable | Bajo | Mínimo |

---

## Conclusión

Los pulses representan una evolución que prioriza la experiencia del desarrollador (DX) sobre la pureza arquitectónica. Unifican cinco conceptos en uno, reduciendo la carga cognitiva necesaria para manejar el estado de una aplicación.

El trade-off es aceptable para la mayoría de proyectos donde la productividad del equipo prima sobre el control granular de cada aspecto del estado.

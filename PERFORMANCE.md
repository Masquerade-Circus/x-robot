# X-Robot Performance Report

Generated: 2026-03-05

---

## Bundle Size

### Core (x-robot only)

| Library                 | Size     | vs X-Robot Core |
| ----------------------- | -------- | --------------- |
| X-Robot Core (minified) | **15.63KB** | 1x              |
| XState interpreter      | 30.09KB  | 1.9x            |
| XState web              | 46.64KB  | 3.0x            |
| XState full             | 58.80KB   | 3.8x            |

### With Modules (x-robot + documentate + validate)

| Module                                                   | Size      |
| -------------------------------------------------------- | --------- |
| X-Robot Core                                             | 15.63KB   |
| + documentate (code gen, diagrams, serialization, SCXML) | +48.03KB     |
| + validate (machine validation)                          | +13.66KB     |
| **Total**                                                | **77.33KB** |

---

## Features Comparison

| Feature             | X-Robot Core (15.63KB) | X-Robot + Modules (77.33KB) | XState Interpreter (30.09KB) | XState Web (46.64KB) | XState Full (58.80KB) |
| ------------------- | ------------------- | ------------------------- | ------------------------- | ----------------- | ------------------ |
| Nested states       | ✅                  | ✅                        | ❌                        | ✅                | ✅                 |
| Parallel states     | ✅                  | ✅                        | ❌                        | ✅                | ✅                 |
| Guards              | ✅                  | ✅                        | ✅                        | ✅                | ✅                 |
| Async guards        | ✅                  | ✅                        | ❌                        | ❌                | ❌                 |
| Entry/Exit actions  | ✅                  | ✅                        | ✅                        | ✅                | ✅                 |
| Context             | ✅                  | ✅                        | ✅                        | ✅                | ✅                 |
| Final states        | ✅                  | ✅                        | ✅                        | ✅                | ✅                 |
| invoke()            | ✅                  | ✅                        | ✅                        | ✅                | ✅                 |
| Delayed transitions | ✅                  | ✅                        | ❌                        | ✅                | ✅                 |
| History tracking    | ✅                  | ✅                        | ❌                        | ❌                | ❌                 |
| Machine validation  | ❌                  | ✅ validate()             | ❌                        | ❌                | ❌                 |
| Code generation     | ❌                  | ✅ documentate()          | ❌                        | ❌                | ❌                 |
| Diagram generation  | ❌                  | ✅ documentate()          | ❌                        | ❌                | ❌                 |
| JSON serialization  | ❌                  | ✅ documentate()          | ❌                        | ❌                | ❌                 |
| SCXML import/export | ❌                  | ✅ documentate()          | ❌                        | ❌                | ✅                 |
| Actor model         | ❌                  | ❌                        | ❌                        | ❌                | ✅                 |

---

## Performance

| Test                   | X-Robot | XState   | Advantage        |
| ---------------------- | ------- | -------- | ---------------- |
| 5k transitions         | 4.49ms  | 94.10ms | **21.0x faster** |
| 3k with guards         | 6.02ms  | 42.06ms  | **7.0x faster**  |
| 10k transitions        | 6.42ms  | 294.57ms | **45.9x faster** |
| 10k context updates    | 22.54ms | 251.47ms  | **11.2x faster**  |
| invokeAfter scheduling | 4.72ms  | 13.70ms  | **2.9x faster**  |
| Delayed transitions    | 55.40ms | 61.14ms  | **1.1x faster**  |

---

## Developer Experience (Lines of Code)

| Example             | X-Robot | XState | Advantage     |
| ------------------- | ------- | ------ | ------------- |
| Simple machine      | 9       | 11     | **1.2x less** |
| Async machine       | 15      | 25     | **1.7x less** |
| Guards machine      | 14      | 25     | **1.8x less** |
| Delayed transitions | 12 | 16     | **1.3x less** |

---

## Why X-Robot?

1. **1.9-3.8x smaller** bundle size (core only)
2. **1.1-45.9x faster** performance
3. **1.2-1.8x less code** to write
4. **More features** - History, validate(), documentate() (code gen, diagrams, serialization, SCXML)
5. **Simpler API** - Declarative, functional approach
6. **Native async guards** - No workarounds needed
7. **invokeAfter()** - Built-in with cancel functionality
8. **Better DX** - documentate() for code & diagram generation, validate() for machine validation
9. **SCXML support** - Import/export machines in standard SCXML format (via documentate())
10. **Machine validation** - Built-in validation to catch errors before runtime (via validate())

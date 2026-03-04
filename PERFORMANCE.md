# X-Robot Performance Report

Generated: 2026-03-04

---

## Bundle Size

### Core (x-robot only)

| Library                 | Size     | vs X-Robot Core |
| ----------------------- | -------- | --------------- |
| X-Robot Core (minified) | **15.57KB** | 1x              |
| XState interpreter      | 30.09KB  | 1.9x            |
| XState web              | 46.64KB  | 3.0x            |
| XState full             | 58.80KB   | 3.8x            |

### With Modules (x-robot + documentate + validate)

| Module                                                   | Size      |
| -------------------------------------------------------- | --------- |
| X-Robot Core                                             | 15.57KB   |
| + documentate (code gen, diagrams, serialization, SCXML) | +80.95KB     |
| + validate (machine validation)                          | +13.66KB     |
| **Total**                                                | **110.19KB** |

---

## Features Comparison

| Feature             | X-Robot Core (15.57KB) | X-Robot + Modules (110.19KB) | XState Interpreter (30.09KB) | XState Web (46.64KB) | XState Full (58.80KB) |
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
| 5k transitions         | 4.36ms  | 86.49ms | **19.8x faster** |
| 3k with guards         | 3.77ms  | 31.56ms  | **8.4x faster**  |
| 10k transitions        | 5.01ms  | 112.13ms | **22.4x faster** |
| 10k context updates    | 15.70ms | 104.06ms  | **6.6x faster**  |
| invokeAfter scheduling | 4.54ms  | 14.65ms  | **3.2x faster**  |
| Delayed transitions    | 56.15ms | 60.06ms  | **1.1x faster**  |

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
2. **1.1-22.4x faster** performance
3. **1.2-1.8x less code** to write
4. **More features** - History, validate(), documentate() (code gen, diagrams, serialization, SCXML)
5. **Simpler API** - Declarative, functional approach
6. **Native async guards** - No workarounds needed
7. **invokeAfter()** - Built-in with cancel functionality
8. **Better DX** - documentate() for code & diagram generation, validate() for machine validation
9. **SCXML support** - Import/export machines in standard SCXML format (via documentate())
10. **Machine validation** - Built-in validation to catch errors before runtime (via validate())

# X-Robot Performance Report

Generated: 2026-03-08

***

## How to Run

To regenerate this report, run:

```bash
bun bench:report
```

This will execute all benchmarks in `tests-benchmark/` and generate this file.

**Requirements:**

*   [bun](https://bun.sh) must be installed
*   Dependencies must be installed: `npm install` or `bun install`

**Benchmark files:**

*   `tests-benchmark/performance.test.ts` - Performance benchmarks
*   `tests-benchmark/bundle-size.test.ts` - Bundle size analysis
*   `tests-benchmark/developer-experience.test.ts` - Lines of code comparison
*   `tests-benchmark/memory-usage.test.ts` - Memory usage tests
*   `tests-benchmark/scxml-performance.test.ts` - SCXML import/export performance

***

## Bundle Size

### Core (x-robot only)

| Library                 | Size     | vs X-Robot Core |
| ----------------------- | -------- | --------------- |
| X-Robot Core (minified) | **15.06KB** | 1x              |
| XState interpreter      | 30.09KB  | 2.0x            |
| XState web              | 46.64KB  | 3.1x            |
| XState full             | 58.80KB   | 3.9x            |

### With Modules (x-robot + documentate + validate)

| Module                                                   | Size      |
| -------------------------------------------------------- | --------- |
| X-Robot Core                                             | 15.06KB   |
| + documentate (code gen, diagrams, serialization, SCXML) | +29.11KB     |
| + validate (machine validation)                          | +13.67KB     |
| **Total**                                                | **57.84KB** |

***

## Features Comparison

| Feature             | X-Robot Core (15.06KB) | X-Robot + Modules (57.84KB) | XState Interpreter (30.09KB) | XState Web (46.64KB) | XState Full (58.80KB) |
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
| Immediate transitions | ✅                  | ✅                        | ❌                        | ❌                | ❌                 |
| History tracking    | ✅                  | ✅                        | ❌                        | ❌                | ❌                 |
| Machine validation  | ❌                  | ✅ validate()             | ❌                        | ❌                | ❌                 |
| Code generation     | ❌                  | ✅ documentate()          | ❌                        | ❌                | ❌                 |
| Diagram generation  | ❌                  | ✅ documentate()          | ❌                        | ❌                | ❌                 |
| JSON serialization  | ❌                  | ✅ documentate()          | ❌                        | ❌                | ❌                 |
| SCXML import/export | ❌                  | ✅ documentate()          | ❌                        | ❌                | ✅                 |
| Actor model         | ❌                  | ❌                        | ❌                        | ❌                | ✅                 |

***

## Performance

| Test                   | X-Robot | XState   | Advantage        |
| ---------------------- | ------- | -------- | ---------------- |
| 5k transitions         | 4.59ms  | 111.89ms | **24.4x faster** |
| 3k with guards         | 3.91ms  | 42.77ms  | **10.9x faster**  |
| 10k transitions        | 5.41ms  | 135.85ms | **25.1x faster** |
| 10k context updates    | 20.03ms | 130.10ms  | **6.5x faster**  |
| invokeAfter scheduling | 4.39ms  | 16.36ms  | **3.7x faster**  |
| Delayed transitions    | 56.19ms | 60.94ms  | **1.1x faster**  |

***

## Developer Experience (Lines of Code)

| Example             | X-Robot | XState | Advantage     |
| ------------------- | ------- | ------ | ------------- |
| Simple machine      | 9       | 11     | **1.2x less** |
| Async machine       | 15      | 25     | **1.7x less** |
| Guards machine      | 14      | 25     | **1.8x less** |
| Delayed transitions | 12 | 16     | **1.3x less** |

***

## Why X-Robot?

1.  **2.0-3.9x smaller** bundle size (core only)
2.  **1.1-25.1x faster** performance
3.  **1.2-1.8x less code** to write
4.  **More features** - History, validate(), documentate() (code gen, diagrams, serialization, SCXML)
5.  **Simpler API** - Declarative, functional approach
6.  **Native async guards** - No workarounds needed
7.  **invokeAfter()** - Built-in with cancel functionality
8.  **Better DX** - documentate() for code & diagram generation, validate() for machine validation
9.  **SCXML support** - Import/export machines in standard SCXML format (via documentate())
10. **Machine validation** - Built-in validation to catch errors before runtime (via validate())

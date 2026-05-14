# X-Robot Vue Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship `@x-robot/vue` as the next official framework adapter, reusing the React package structure while keeping the public package publishable without exposing private monorepo helpers.

**Architecture:** Mirror the proven `@x-robot/react` package layout and publication strategy, but adapt the runtime surface to Vue 3 Composition API. Keep the same top-level entrypoint and machine verbs (`useMachine`, `start`, `invoke`, `invokeAfter`, `snapshot`, `cleanup`), while exposing machine state through Vue refs so templates stay ergonomic and the wrapper-based reactivity contract remains honest.

**Tech Stack:** npm workspaces, TypeScript, Vue 3 Composition API, Mocha, `@vue/test-utils`, `jsdom`, existing `x-robot` core runtime, existing `x-robot/devtools`, package-local `esbuild` + `tsc-prog` build flow.

---

### Task 1: Lock the v1 Vue adapter contract before touching package code

**Files:**
- Create: `docs/plans/2026-03-10-x-robot-vue.md`
- Reference: `packages/react/src/useMachine.ts`
- Reference: `packages/react/src/types.ts`
- Reference: `docs/guides/publishing-adapters.md`

**Step 1: Write the contract note into this plan**

V1 API target:

```ts
const {
  machine,
  current,
  context,
  fatal,
  isAsync,
  start,
  invoke,
  invokeAfter,
  snapshot,
  cleanup
} = useMachine(machineInstance, options);
```

Assumptions for v1:

- `current` and `isAsync` are Vue `ref()` values, while `context` and `fatal` are Vue `shallowRef()` values
- `snapshot()` stays a function and returns a plain serializable snapshot object, not a ref
- `autostart`, `devtools`, and `startSnapshot` match the React option names
- updates are guaranteed only through returned wrappers, not direct external `invoke(machine, ...)`
- `cleanup()` stays public even though Vue lifecycle cleanup will also be wired internally
- `shallowRef()` is intentional for `context` so the adapter does not imply deep Vue observation or mutation tracking of arbitrary machine context

**Step 2: Record the intentional non-goals**

Do not add any of the following to v1:

- provider/inject abstractions
- global runtime observation beyond wrapper tracking
- SSR-only APIs
- plugin installation APIs
- public dependency on `@x-robot/shared`
- alias methods like `send()` or `schedule()`
- a reactive `snapshot` ref that diverges from the React mental model

### Task 2: Scaffold the `@x-robot/vue` package using the React package as the template

**Files:**
- Create: `packages/vue/package.json`
- Create: `packages/vue/tsconfig.json`
- Create: `packages/vue/tsconfig.build.json`
- Create: `packages/vue/build.mjs`
- Create: `packages/vue/README.md`
- Create: `packages/vue/src/index.ts`
- Create: `packages/vue/src/types.ts`
- Modify: `package.json`
- Test: `tests/workspaces.test.ts`

**Step 1: Write the failing workspace/package assertions**

Extend `tests/workspaces.test.ts` to assert:

- `packages/vue/package.json` exists
- the package name is `@x-robot/vue`
- root scripts include `build:vue`, `test:vue`, and `test:vue:smoke`

**Step 2: Run the targeted workspace verification**

Run: `mocha --no-timeouts --exit --require ts-node/register --enable-source-maps tests/workspaces.test.ts`
Expected: FAIL because the Vue package does not exist yet.

**Step 3: Add the minimal package scaffold**

Package manifest requirements:

- `name: "@x-robot/vue"`
- `version` aligned with root `x-robot`
- `main`, `module`, `types`, and `exports` pointed at `dist/`
- `publishConfig.access: "public"`
- `files` limited to `dist` and `README.md`
- `peerDependencies` limited to public runtime peers: `vue` and `x-robot`
- `devDependencies` only for local package test/build tooling

**Step 4: Add root scripts without disturbing the current core flow**

Add only the scripts needed to parallel the React package:

- `build:vue`
- `test:vue`
- `test:vue:smoke`
- `verify:vue:publish`
- update aggregate scripts such as `build:packages` and `test:packages`

### Task 3: Internalize the shared tracked adapter logic for Vue

**Files:**
- Create: `packages/vue/src/internal/index.ts`
- Create: `packages/vue/src/internal/snapshot.ts`
- Create: `packages/vue/src/internal/tracked.ts`
- Create: `packages/vue/src/internal/types.ts`
- Reference: `packages/react/src/internal/index.ts`
- Reference: `packages/react/src/internal/snapshot.ts`
- Reference: `packages/react/src/internal/tracked.ts`
- Reference: `packages/shared/src/types.ts`

**Step 1: Write the failing package-local adapter tests**

Create tests that exercise the internal contract indirectly through package-local imports or a small public harness:

- reading machine state into a stable adapter snapshot
- tracked `start()` updates
- tracked `invoke()` updates
- tracked `invokeAfter()` cancellation
- fatal normalization and async completion behavior

**Step 2: Run the package test command to confirm failure**

Run: `npm test --workspace @x-robot/vue`
Expected: FAIL because no package code or tests exist yet.

**Step 3: Copy only the private logic the Vue adapter actually needs**

Keep this code private to `packages/vue/src/internal/*`:

- adapter snapshot typing
- tracked operation helpers
- timer cleanup handling
- fatal state serialization

Do not import `@x-robot/shared` from public runtime or peer dependencies.

### Task 4: Implement the Vue composable API around refs and wrapper tracking

**Files:**
- Create: `packages/vue/src/useMachine.ts`
- Modify: `packages/vue/src/index.ts`
- Modify: `packages/vue/src/types.ts`
- Reference: `packages/react/src/useMachine.ts`
- Reference: `lib/devtools/index.ts`

**Step 1: Write the failing public API tests**

Test the public Vue contract, not implementation details:

- `useMachine(machine, options?)` returns the full expected shape
- `current`, `context`, `fatal`, and `isAsync` are refs exposed for Vue consumption
- `autostart` starts on mount
- wrapped `invoke()` updates the refs
- async transitions update after resolution
- `cleanup()` is called on unmount
- direct external runtime calls are documented as untracked in v1

**Step 2: Choose the Vue ref strategy explicitly**

Implementation recommendation:

- use `ref()` for primitive fields like `current` and `isAsync`
- use `shallowRef()` for `context` and `fatal` so the adapter does not imply deep Vue ownership of arbitrary machine data
- keep `machine` as the original raw machine instance
- keep `snapshot()` as an imperative escape hatch that returns the current plain adapter snapshot
- do not expose `snapshot` as a Vue ref in v1; keep parity with React docs and examples
- treat `shallowRef(context)` as the committed v1 decision, not a provisional option

**Step 3: Implement the composable lifecycle**

Implementation rules:

- initialize refs from `readMachineState(machine)`
- choose tracked adapter vs devtools adapter based on `options.devtools`
- sync refs after wrapper calls complete
- register internal cleanup with Vue unmount lifecycle when used inside a component
- keep `cleanup()` idempotent for tests and manual teardown

**Step 4: Preserve the existing X-Robot semantics**

Do not rename the core verbs for v1:

- keep `start()`
- keep `invoke()`
- keep `invokeAfter()`
- do not add `send()` aliases

### Task 5: Add a stable Vue test harness that works with the current repo conventions

**Files:**
- Create: `packages/vue/tests/setup.ts`
- Create: `packages/vue/tests/use-machine.test.ts`
- Modify: `packages/vue/package.json`

**Step 1: Add the minimum package test dependencies**

Recommended dev dependencies:

- `vue`
- `@vue/test-utils`
- `jsdom`
- `@types/jsdom` if needed for TypeScript clarity

Avoid SFC compilation for v1 tests. Use `defineComponent()` or equivalent plain TypeScript components so the package stays aligned with the current Mocha + `ts-node` workflow.

**Step 2: Build a simple DOM setup file**

`packages/vue/tests/setup.ts` should initialize a small `jsdom` environment and attach the globals Vue Test Utils needs.

**Step 3: Cover the same behavioral matrix as React where it matters**

At minimum, the tests should cover:

- public contract shape
- mount + autostart
- wrapped synchronous transition
- wrapped asynchronous transition
- delayed transition cancellation
- unmount cleanup
- devtools-enabled branch
- switching to a new machine instance

**Step 4: Run the package-local test command**

Run: `npm test --workspace @x-robot/vue`
Expected: PASS

### Task 6: Add examples and package docs that are honest about Vue semantics

**Files:**
- Create: `packages/vue/examples/basic.ts`
- Create: `packages/vue/examples/fetch.ts`
- Modify: `packages/vue/README.md`
- Modify: `README.md`
- Optional: Modify: `docs/guides/publishing-adapters.md`

**Step 1: Add one tiny example and one async example**

Examples should show:

- a tiny two-state machine
- a realistic async flow
- template-friendly use of refs

**Step 2: Document the Vue-specific usage rules**

README requirements:

- install command: `npm install x-robot @x-robot/vue vue`
- peer dependency list
- note that returned state is exposed through refs
- note that templates unwrap refs automatically, but script code reads `.value`
- note that only wrapper-triggered updates are guaranteed reactive in v1
- note that direct external `invoke(machine, ...)` is not tracked
- note that `cleanup()` exists even though component unmount will also clean up

**Step 3: Link the adapter from the root docs**

Add a short root README mention so `@x-robot/vue` is discoverable beside `@x-robot/react`.

### Task 7: Add smoke and publishability coverage for the Vue package

**Files:**
- Create: `packages/vue/smoke/package.json`
- Create: `packages/vue/smoke/tsconfig.json`
- Create: `packages/vue/smoke/index.ts`
- Create: `packages/vue/scripts/smoke.mjs`
- Create: `tests/vue-publishability.test.ts`
- Modify: `package.json`

**Step 1: Build a smoke fixture that validates public consumption**

The smoke fixture must import from package names, not repo internals:

```ts
import { useMachine } from "@x-robot/vue";
import { machine, state, init, initial } from "x-robot";
import { defineComponent } from "vue";
```

Keep it to compile-time and basic consumption checks. Do not depend on unpublished private paths.

**Step 2: Add package-local smoke execution**

Follow the React package pattern:

- clean `smoke/node_modules`
- run `npm install` inside the fixture
- run `tsc --noEmit -p tsconfig.json`

**Step 3: Add publishability assertions**

`tests/vue-publishability.test.ts` should assert:

- no `private: true`
- `main`, `module`, `types`, and `exports` target `dist/`
- no `file:` dependencies
- no dependency on `@x-robot/shared`
- public peers include `vue` and `x-robot`
- output metadata fields exist

**Step 4: Add the repo-level verification script**

Add `verify:vue:publish` to run:

1. core build if needed
2. Vue package build
3. Vue package tests
4. Vue smoke test
5. `tests/vue-publishability.test.ts`

### Task 8: Build the package output in the same shape as React

**Files:**
- Modify: `packages/vue/build.mjs`
- Modify: `packages/vue/tsconfig.build.json`
- Optional: Modify: `packages/vue/package.json`

**Step 1: Match the output contract exactly**

The package must emit at least:

- `packages/vue/dist/index.js`
- `packages/vue/dist/index.mjs`
- `packages/vue/dist/index.d.ts`

**Step 2: Externalize only public runtime peers**

Build externals should include only what the published package expects to resolve at runtime, such as:

- `vue`
- `x-robot`
- `x-robot/devtools`

**Step 3: Run the package build**

Run: `npm run build --workspace @x-robot/vue`
Expected: PASS

### Task 9: Run end-to-end verification and record residual risks

**Files:**
- Modify only what previous tasks require

**Step 1: Run workspace and package checks**

Run:

```bash
mocha --no-timeouts --exit --require ts-node/register --enable-source-maps tests/workspaces.test.ts
npm run build --workspace @x-robot/vue
npm test --workspace @x-robot/vue
npm run test:smoke --workspace @x-robot/vue
mocha --no-timeouts --exit --require ts-node/register --enable-source-maps tests/vue-publishability.test.ts
```

Expected: PASS

**Step 2: Run aggregate verification**

Run:

```bash
bun run build
bun run test
npm run test:packages
npm run verify:vue:publish
```

Expected: PASS, with any existing known repo warnings documented if they remain unchanged.

**Step 3: Inspect the tarball manually before any publish flow**

Run: `npm pack --workspace @x-robot/vue`
Expected: a tarball containing only the intended publishable files.

**Step 4: Record residual risks in the implementation handoff**

Capture any remaining gaps explicitly, especially:

- Vue test harness fragility under Mocha + `ts-node`
- any divergence between Vue refs and React plain-value docs
- any module-type warnings inherited from the repo
- any unresolved question about future SSR behavior

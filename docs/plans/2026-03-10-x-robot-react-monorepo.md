# X-Robot React Monorepo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend the current repository into a light monorepo shape and ship the first official framework adapter as `@x-robot/react`, with a shared integration contract that preserves the current core runtime design.

**Architecture:** Keep `x-robot` at the repository root and add a `packages/` workspace around it instead of moving the core. Implement a small shared integration layer for snapshot reading and tracked operations, then build `@x-robot/react` on top of it with wrapper-based reactivity for v1. The React adapter should only guarantee updates for transitions triggered through the returned hook methods, matching the current `devtools` model.

**Tech Stack:** Bun/npm workspaces, TypeScript, existing `x-robot` runtime, React 18+, Mocha or framework-specific tests depending on the chosen harness, shared docs in the current repo.

***

### Task 1: Introduce monorepo/workspace scaffolding without moving the core

**Files:**

*   Modify: `package.json`
*   Modify: `tsconfig.json`
*   Modify: `build.js`
*   Create: `packages/react/package.json`
*   Create: `packages/react/tsconfig.json`
*   Create: `packages/react/README.md`
*   Create: `packages/shared/package.json`
*   Create: `packages/shared/tsconfig.json`
*   Create: `packages/shared/README.md`

**Step 1: Write the failing test / verification target**

Define the expected workspace shape in a minimal assertion or verification note:

*   root `package.json` declares workspaces for `packages/*`
*   root scripts still build/test/docs the core package successfully
*   package manifests exist for `packages/react` and `packages/shared`

**Step 2: Run verification to confirm the current repo does not satisfy it yet**

Run: `npm test -- --grep "react workspace|packages/shared"`
Expected: FAIL or no matching tests because the workspace structure does not exist yet.

**Step 3: Add minimal workspace scaffolding**

Keep this intentionally small:

*   do not move `lib/`, `tests/`, or current exports
*   do not rewrite the current build pipeline yet
*   only prepare the structure so package-local implementation can begin safely

**Step 4: Verify the core repo still behaves normally**

Run: `bun run build`
Expected: PASS for the existing core artifacts.

### Task 2: Add the internal shared integration contract

**Files:**

*   Create: `packages/shared/src/index.ts`
*   Create: `packages/shared/src/snapshot.ts`
*   Create: `packages/shared/src/tracked.ts`
*   Create: `packages/shared/src/types.ts`
*   Create: `packages/shared/tests/shared.test.ts`

**Step 1: Write the failing test**

Test the shared contract, not React yet. Cover:

*   reading a machine snapshot into a stable adapter state object
*   running tracked `start` / `invoke` wrappers
*   preserving sync/async behavior
*   manual cleanup contract shape

**Step 2: Run the test to verify it fails**

Run: `npx mocha --no-timeouts --exit --require ts-node/register --enable-source-maps packages/shared/tests/**/*.test.ts`
Expected: FAIL because the shared adapter does not exist yet.

**Step 3: Implement the minimal shared layer**

The shared layer should expose only what framework adapters need:

*   `readMachineState(machine)` or equivalent
*   tracked operation helpers for `start`, `invoke`, `invokeAfter`
*   a small type contract for adapter snapshots and cleanup

Do **not** make this public API of the main package yet.

**Step 4: Re-run tests**

Run: `npx mocha --no-timeouts --exit --require ts-node/register --enable-source-maps packages/shared/tests/**/*.test.ts`
Expected: PASS

### Task 3: Implement `@x-robot/react` v1 hook API

**Files:**

*   Create: `packages/react/src/index.ts`
*   Create: `packages/react/src/useMachine.ts`
*   Create: `packages/react/src/types.ts`
*   Create: `packages/react/tests/use-machine.test.tsx`
*   Modify: `packages/react/package.json`

**Step 1: Write the failing test**

Test the public React contract:

*   `useMachine(machine, options?)` returns `machine`, `current`, `context`, `fatal`, `isAsync`, `start`, `invoke`, `invokeAfter`, `snapshot`, `cleanup`
*   `autostart` starts on mount
*   wrapped `invoke()` updates rendered state
*   async transitions update after resolution
*   `cleanup()` is called on unmount
*   direct external `invoke(machine, ...)` is documented as unsupported and should not be relied on in tests

**Step 2: Run the test to verify it fails**

Run: a package-local React test command such as `npm test --workspace @x-robot/react`
Expected: FAIL because the hook does not exist yet.

**Step 3: Implement the minimal React adapter**

API target:

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
} = useMachine(myMachine, options)
```

Options for v1:

*   `autostart?: boolean`
*   `devtools?: boolean | { name?: string }`
*   `startSnapshot?: MachineSnapshot`

Rules:

*   preserve sync/async wrapper behavior
*   only wrapper-triggered changes are guaranteed reactive
*   cleanup on unmount
*   optional `devtools` should use the existing root `x-robot/devtools` adapter, not duplicate the logic

**Step 4: Re-run package tests**

Run: `npm test --workspace @x-robot/react`
Expected: PASS

### Task 4: Add examples and docs for the React package

**Files:**

*   Create: `packages/react/examples/basic.tsx`
*   Create: `packages/react/examples/fetch.tsx`
*   Modify: `packages/react/README.md`
*   Modify: `README.md`
*   Optional: Create `docs/guides/react.md`

**Step 1: Add one tiny and one realistic example**

Examples should demonstrate:

*   a simple toggle-like machine
*   a form/fetch/checkout style machine with async behavior

**Step 2: Document the v1 reactivity contract honestly**

Explicitly state:

*   use the returned `start` / `invoke` wrappers for guaranteed rerenders
*   direct `invoke(machine, ...)` from outside the hook is not tracked in v1

**Step 3: Link from top-level docs**

Add a short mention in the root README or docs index so the first integration is discoverable.

### Task 5: Wire root tooling to understand workspace packages

**Files:**

*   Modify: `package.json`
*   Modify: `build.js`
*   Optional: Create package-local build script(s)

**Step 1: Decide the minimal build strategy**

For v1, pick the simplest path:

*   either keep root build focused on core and add separate package build commands
*   or extend root build to also build `packages/react`

Recommended: separate package build scripts first, then aggregate from root with explicit scripts.

**Step 2: Add root scripts**

Suggested scripts:

*   `build:core`
*   `build:react`
*   `build:packages`
*   `test:react`
*   maybe `test:packages`

Avoid rewriting the existing `build` and `test` commands until the package-local flow is stable.

**Step 3: Verify script ergonomics**

Run the package build and test commands individually first.

### Task 6: Add verification coverage for the monorepo contract

**Files:**

*   Create: `tests/workspaces.test.ts`
*   Optional: add package-manifest assertions elsewhere

**Step 1: Verify the workspace layout**

Assert at minimum:

*   root workspaces include `packages/*`
*   `packages/react/package.json` has the intended package name
*   `packages/shared/package.json` exists

Keep these tests lightweight; they should prevent accidental regression of the repo shape, not snapshot every manifest.

### Task 7: Run end-to-end verification

**Files:**

*   Modify only what previous tasks require

**Step 1: Run core verification**

Run: `bun run build`
Expected: PASS

**Step 2: Run root core tests**

Run: `bun run test`
Expected: PASS

**Step 3: Run shared package tests**

Run: `npx mocha --no-timeouts --exit --require ts-node/register --enable-source-maps packages/shared/tests/**/*.test.ts`
Expected: PASS

**Step 4: Run React package tests**

Run: `npm test --workspace @x-robot/react`
Expected: PASS

**Step 5: Run docs/build verification if top-level docs changed**

Run: `bun run docs`
Expected: PASS if docs were updated.

### Task 8: Prepare the rollout path for the next adapters

**Files:**

*   Modify: `packages/shared/README.md`
*   Optional: create `docs/plans/` follow-up references

**Step 1: Document the adapter template**

Write down the rules future adapters must follow:

*   same conceptual return shape
*   wrapper-based reactivity contract
*   cleanup requirement
*   optional `devtools` integration path

**Step 2: Keep v1 intentionally narrow**

Explicitly defer these until after React stabilizes:

*   Vue implementation
*   Svelte implementation
*   Solid implementation
*   Valyrian integration
*   provider/context APIs
*   SSR-specific enhancements
*   deeper core runtime hooks for global observation

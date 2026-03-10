# Publishable @x-robot/react Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the current internal workspace implementation of `@x-robot/react` into a publishable package without publishing `@x-robot/shared`.

**Architecture:** Keep `@x-robot/shared` as a private development-only workspace package and stop exposing it as a published dependency of `@x-robot/react`. The React package should build to self-contained runtime artifacts that depend only on public peers (`react`, `react-dom`, `x-robot`) while preserving the current wrapper-based reactivity contract. Publishing readiness requires proper package exports, generated declaration files, smoke-tested external consumption, and removal of workspace-only coupling from the public package manifest.

**Tech Stack:** Bun/npm workspaces, TypeScript declaration output, esbuild packaging, React 18+, existing `x-robot` core and `x-robot/devtools`, Mocha tests, external smoke-test fixture.

---

### Task 1: Remove published dependency on `@x-robot/shared`

**Files:**
- Modify: `packages/react/package.json`
- Modify: `packages/react/src/useMachine.ts`
- Modify: `packages/react/src/types.ts`
- Optional: Create `packages/react/src/internal/*.ts`

**Step 1: Write the failing verification target**

Define the desired publication rule:
- `@x-robot/react` package manifest must not list `@x-robot/shared` in `dependencies`, `peerDependencies`, or `optionalDependencies`
- React runtime build must still succeed

**Step 2: Run verification to confirm current state fails that rule**

Check `packages/react/package.json` and verify that it still contains `@x-robot/shared`.

**Step 3: Move or inline shared logic into React’s published build boundary**

Recommended path:
- move the minimal shared logic used by React into `packages/react/src/internal/`
- keep `packages/shared` only as monorepo source of truth if you still want it for future adapters, but do not make the published React package depend on it

Alternative path:
- keep authoring against `@x-robot/shared` during development, but bundle it fully into `@x-robot/react` and remove it from the package manifest

**Step 4: Verify runtime still works**

Run: `npm test --workspace @x-robot/react`
Expected: PASS

### Task 2: Define a publishable package manifest for `@x-robot/react`

**Files:**
- Modify: `packages/react/package.json`

**Step 1: Replace workspace-internal manifest settings**

Required fields for publishable state:
- remove `private: true`
- set real `version`
- `main`, `module`, `types`, and `exports`
- `files` only for published artifacts and docs
- peer dependencies limited to:
  - `react`
  - `react-dom`
  - `x-robot`

Example target shape:

```json
{
  "name": "@x-robot/react",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

**Step 2: Keep package metadata honest**

Update:
- description
- keywords
- repository/homepage if appropriate
- publish strategy fields only if you really plan to publish to npm soon

### Task 3: Generate declaration files and dual output cleanly

**Files:**
- Modify: `packages/react/package.json`
- Modify: `packages/react/tsconfig.json`
- Optional: Create `packages/react/tsconfig.build.json`
- Optional: Create `packages/react/build.mjs`

**Step 1: Write the failing verification target**

The package should emit:
- `dist/index.js`
- `dist/index.mjs`
- `dist/index.d.ts`

**Step 2: Separate runtime build from declaration build**

Recommended approach:
- use esbuild for CJS + ESM runtime output
- use `tsc --emitDeclarationOnly` for `.d.ts`
- use a package-local build script (preferably `build.mjs`) instead of long inline shell one-liners

**Step 3: Make tsconfig build-safe**

Use a package-local build config that only includes `src/**/*`, excludes tests/examples, and produces declaration files into `dist/`.

**Step 4: Verify build output**

Run: `npm run build --workspace @x-robot/react`
Expected: PASS and emit all three artifact types.

### Task 4: Add external-consumption smoke test

**Files:**
- Create: `packages/react/smoke/package.json`
- Create: `packages/react/smoke/tsconfig.json`
- Create: `packages/react/smoke/index.tsx`
- Optional: Create test helper script under `packages/react/scripts/`

**Step 1: Create a fixture that consumes the built package like a user would**

The smoke fixture should import from:

```ts
import { useMachine } from "@x-robot/react";
```

and from:

```ts
import { machine, state, init, initial } from "x-robot";
```

**Step 2: Verify the public surface, not internal paths**

The smoke test should fail if the published entrypoints/types/externals are wrong.

**Step 3: Run the smoke build/test**

Run a package-local smoke command after `npm run build --workspace @x-robot/react`.
Expected: PASS

### Task 5: Tighten API documentation for public consumers

**Files:**
- Modify: `packages/react/README.md`
- Optional: Modify root `README.md`
- Optional: Add `docs/guides/react.md`

**Step 1: Rewrite the package README as an external package README**

It should answer quickly:
- what the package is
- how to install it
- peer dependencies
- basic usage
- what reactivity is guaranteed in v1
- how `devtools` works
- cleanup expectations

**Step 2: Remove workspace-only language**

Replace wording like:
- `workspace scaffold`
- `private workspace package`

with publishable wording.

**Step 3: Add a public install example**

```bash
npm install x-robot @x-robot/react react react-dom
```

### Task 6: Harden CI verification for publishability

**Files:**
- Modify: root `package.json`
- Optional: add new tests/scripts

**Step 1: Add an explicit publishability check script**

Example aggregate script:
- `build:react:publish`
- `test:react:smoke`
- `verify:react:publish`

**Step 2: Verify package shape automatically**

At minimum, assert:
- no `file:` dependencies remain in `packages/react/package.json`
- no dependency on `@x-robot/shared` remains in the published manifest
- `exports` exists and points to `dist`
- `types` points to `dist/index.d.ts`

Add these as lightweight assertions in a workspace test rather than relying on manual inspection.

### Task 7: Decide what remains internal vs public

**Files:**
- Modify: `packages/shared/README.md`
- Modify: `docs/plans/2026-03-10-publishable-x-robot-react.md`

**Step 1: Freeze the boundary**

Document clearly:
- `@x-robot/shared` remains private and unpublished
- `@x-robot/react` is the only public React adapter package
- shared code may still exist in the monorepo, but is not part of the semver contract

This prevents accidental ecosystem drift later.

### Task 8: Final verification for publication readiness

**Files:**
- Modify only what the previous tasks require

**Step 1: Build the root core package**

Run: `bun run build`
Expected: PASS

**Step 2: Build the React package in publish mode**

Run: `npm run build --workspace @x-robot/react`
Expected: PASS with `dist/index.js`, `dist/index.mjs`, `dist/index.d.ts`

**Step 3: Run React tests**

Run: `npm test --workspace @x-robot/react`
Expected: PASS

**Step 4: Run smoke test**

Run: package-local smoke command
Expected: PASS

**Step 5: Verify manifest shape**

Run lightweight assertions ensuring:
- no `private: true`
- no `file:` dependencies
- no published dependency on `@x-robot/shared`
- correct `exports`

**Step 6: Optional pack verification**

Run: `npm pack --workspace @x-robot/react`
Expected: package tarball contains only intended files

### Task 9: Explicitly defer non-goals

**Files:**
- Modify: plan doc only if needed

Do not expand scope during publication hardening. Explicitly defer:
- Vue adapter
- Svelte adapter
- Solid adapter
- Valyrian adapter
- provider/context APIs
- SSR enhancements
- core runtime hooks for global observation
- publishing `@x-robot/shared`

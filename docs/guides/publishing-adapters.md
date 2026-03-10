# Publishing Adapters

This guide describes how to publish, update, and maintain official framework adapters for X-Robot.

It applies to `@x-robot/react` today and should be the template for future adapters such as `@x-robot/vue`, `@x-robot/svelte`, `@x-robot/solid`, and `@x-robot/valyrian`.

## Goal

Each official adapter should be publishable as its own package while still fitting the X-Robot ecosystem.

For users, the rule should stay simple:

- install the core package: `x-robot`
- install the framework adapter they need
- do not install private monorepo helpers

## Package Boundary

The public adapter package should expose only its own framework-facing API.

For example, `@x-robot/react` publishes `useMachine()` and depends on these public peers:

- `react`
- `react-dom`
- `x-robot`

Do not publish monorepo-internal helpers such as `@x-robot/shared` unless you intentionally want to support them as public semver contracts.

Current policy:

- `@x-robot/shared` stays private
- each published adapter may reuse shared code internally during development
- the published package must not require users to install private helpers

## Publish Checklist

Before publishing any adapter, verify all of the following:

### Package Manifest

- no `private: true`
- `main`, `module`, `types`, and `exports` point to `dist/`
- no `file:` dependencies
- no workspace-only dependency on private packages
- `peerDependencies` list only public runtime peers
- package metadata exists: `license`, `repository`, `homepage`, `bugs`, `keywords`

### Build Output

Each package should emit at least:

- `dist/index.js`
- `dist/index.mjs`
- `dist/index.d.ts`

If the package has internal declaration files needed by the public entrypoint, they may live under `dist/internal/`.

### Runtime Verification

Run these checks before publish:

```bash
npm run build --workspace <adapter-package>
npm test --workspace <adapter-package>
npm run test:smoke --workspace <adapter-package>
```

Then run the repo-level verification for publication:

```bash
npm run verify:react:publish
```

Replace the script name with the equivalent for other adapters once those exist.

### Tarball Verification

Always inspect the packed artifact:

```bash
npm pack --workspace <adapter-package>
```

Confirm that the tarball contains only the intended files and does not leak source-only workspace details.

## Smoke Tests

Every publishable adapter should have a smoke fixture under its package directory.

Example structure:

```text
packages/react/
  smoke/
    package.json
    tsconfig.json
    index.tsx
```

The smoke test must validate the public consumption path, not monorepo internals.

That means the smoke fixture should import from the installed package names, for example:

```tsx
import { useMachine } from "@x-robot/react";
import { machine, state, init, initial } from "x-robot";
```

Avoid smoke tests that only pass because they remap everything to source files inside the repo.

## Update Workflow

When the core package changes, evaluate every official adapter with this checklist:

### Safe Update

Use this path when the core change does not affect the adapter contract:

1. Run the adapter build
2. Run adapter tests
3. Run smoke test
4. Update docs only if behavior changed

### Contract Update

Use this path when the core change affects adapter behavior or types:

1. update the adapter implementation
2. update package tests
3. update smoke test
4. update package README
5. update publishability checks if manifest/build shape changed

Examples of contract-affecting changes:

- new machine snapshot shape
- changed `start()` / `invoke()` behavior
- new devtools integration path
- changed cleanup or lifecycle expectations

## Maintenance Rules for Future Adapters

Every official adapter should follow the same baseline rules:

### API Shape

- keep the framework API small
- preserve the X-Robot mental model
- expose cleanup explicitly
- document the exact reactivity contract

### Reactivity Contract

If an adapter only guarantees updates through returned wrappers, say that clearly.

Do not imply global observation unless the runtime truly supports it.

### Internal Shared Logic

Use shared code carefully:

- private monorepo sharing is fine
- public dependency surface should stay minimal
- if a helper is not meant to be versioned publicly, do not make users install it

### Testing

Each adapter should have:

- package-local unit/integration tests
- at least one realistic example
- one smoke fixture that exercises the published entrypoint
- one manifest/publishability assertion test

## Versioning

At the beginning, keep adapter versions aligned with the core package unless there is a strong reason not to.

That makes support simpler:

- `x-robot@1.1.0`
- `@x-robot/react@1.1.0`

If adapters eventually evolve at different speeds, you can split versioning later, but aligned versioning is easier while the ecosystem is still taking shape.

## Documentation Requirements

Every published adapter should ship with:

- package README for external users
- install command
- peer dependency list
- basic example
- clear reactivity limitations
- cleanup guidance
- devtools note if applicable

The root docs should also link to the adapter once it is official.

## Recommended Release Flow

For an adapter release, use this order:

1. build core if needed
2. build adapter
3. run adapter tests
4. run smoke test
5. run publishability assertions
6. pack the tarball
7. only then publish

In command form:

```bash
bun run build
npm run build --workspace <adapter-package>
npm test --workspace <adapter-package>
npm run test:smoke --workspace <adapter-package>
npx mocha --no-timeouts --exit --require ts-node/register --enable-source-maps tests/<publishability-test>.ts
npm pack --workspace <adapter-package>
```

## Non-Goals

This guide does not require:

- publishing private helper packages
- solving global runtime observation first
- making all framework adapters at once
- SSR-specific behavior before the basic package is stable

Ship one adapter well, then repeat the pattern.

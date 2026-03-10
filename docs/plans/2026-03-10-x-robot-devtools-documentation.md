# X-Robot Devtools Documentation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Publish complete user-facing documentation for `x-robot/devtools`, covering setup, API, Redux DevTools behavior, production exclusion strategies, and practical usage patterns.

**Architecture:** Document `x-robot/devtools` as an opt-in adapter module, not part of the core runtime. The docs should connect four layers cleanly: package discovery in `README.md`, a dedicated guide under `docs/guides/`, auto-generated API reference via TypeDoc, and one practical recipe/example showing real usage and teardown.

**Tech Stack:** Markdown docs, README, TypeDoc configuration, existing docs build pipeline (`typedoc`, `remark`, `llms-full` generation), existing `x-robot/devtools` module and tests.

***

### Task 1: Audit the current documentation surface

**Files:**

*   Read: `README.md`
*   Read: `docs/guides/getting-started.md`
*   Read: `docs/guides/code-generation.md`
*   Read: `lib/devtools/index.ts`
*   Modify: `docs/plans/2026-03-10-x-robot-devtools-documentation.md`

**Step 1: Confirm the public surface to document**

Capture these documented facts from the repo:

*   public entrypoint is `x-robot/devtools`
*   main API is `connectXRobot(machine, options)`
*   returned methods are `start`, `invoke`, `invokeAfter`, `snapshot`, `disconnect`, `cleanup`, and `machine`
*   supported monitor actions are `JUMP_TO_STATE`, `JUMP_TO_ACTION`, `IMPORT_STATE`, `COMMIT`, `RESET`, `ROLLBACK`, `PAUSE_RECORDING`, and `LOCK_CHANGES`
*   important limitation: direct `invoke(machine, ...)` outside wrappers is not observed

**Step 2: Verify the package discovery gap**

Check where `README.md` currently references `documentate` and `validate`, and note that `devtools` is still missing from the install/discoverability path.

**Step 3: Validate doc generation path**

Confirm whether TypeDoc is configured to include `lib/devtools/index.ts`; if not, add this as a required doc task.

### Task 2: Add README-level discoverability

**Files:**

*   Modify: `README.md`

**Step 1: Add `devtools` to the module discovery surface**

Update the README in these exact areas:

*   `Key Features` list: mention Redux DevTools integration
*   `API Overview` table: add a row for `connectXRobot()` via `x-robot/devtools`
*   `Documentation` links: add a direct link to a new `Devtools` guide

**Step 2: Add a minimal quick example**

Insert one compact example showing:

```ts
import { connectXRobot } from "x-robot/devtools";

const { start, invoke, disconnect } = connectXRobot(machine, {
  name: "Checkout"
});

start();
invoke("submit", { orderId: 1 });
disconnect();
```

**Step 3: Keep README concise**

Do not duplicate the full guide there; the README should only answer:

*   what this module is
*   how to import it
*   why someone would use it
*   where to read more

### Task 3: Write the dedicated Devtools guide

**Files:**

*   Create: `docs/guides/devtools.md`

**Step 1: Open with the purpose and scope**

The guide intro should state:

*   `x-robot/devtools` integrates X-Robot with Redux DevTools Extension
*   it is optional and development-focused
*   it works by wrapping machine operations
*   it does not observe direct calls to `invoke(machine, ...)` unless those go through the connected wrappers

**Step 2: Document installation and import**

Cover:

*   install command remains `npm install x-robot`
*   import path is `x-robot/devtools`
*   browser requirement: Redux DevTools Extension present for monitor features
*   graceful no-op behavior when the extension is missing

**Step 3: Document the primary API**

Create sections for:

*   `connectXRobot(machine, options)`
*   `options.name`
*   returned methods: `start`, `invoke`, `invokeAfter`, `snapshot`, `disconnect`, `cleanup`, `machine`
*   sync/async behavior preservation

Include one short example for each of these:

*   basic connect-and-use
*   async transition tracking
*   teardown on unmount / cleanup

**Step 4: Document Redux DevTools monitor behavior**

Add a behavior matrix showing what incoming monitor actions do:

| DevTools action | Effect in x-robot/devtools |
| --- | --- |
| `JUMP_TO_STATE` | restores snapshot |
| `JUMP_TO_ACTION` | restores snapshot |
| `IMPORT_STATE` | restores selected imported state |
| `COMMIT` | re-initializes current snapshot |
| `RESET` | restores initial connected snapshot |
| `ROLLBACK` | restores rollback snapshot |
| `PAUSE_RECORDING` | suppresses outgoing `send(...)` calls |
| `LOCK_CHANGES` | blocks wrapped mutations |

Also explain the practical consequence of each behavior in plain language.

**Step 5: Document production bundling guidance**

Add a dedicated section titled something like `Exclude Devtools from Production` covering:

*   dynamic import in dev only (recommended)
*   bundler-defined constants such as `__DEV__`
*   alias/no-op substitution depending on bundler
*   explicit warning that a top-level static import may still include the module in the production bundle

Use concrete examples like:

```ts
if (import.meta.env.DEV) {
  const { connectXRobot } = await import("x-robot/devtools");
  connectXRobot(machine, { name: "Checkout" });
}
```

and

```ts
if (__DEV__) {
  const { connectXRobot } = await import("x-robot/devtools");
  connectXRobot(machine, { name: "Checkout" });
}
```

**Step 6: Document limitations explicitly**

Include a short `Limitations` section covering:

*   wrapper-based observation only
*   no direct core hooks yet
*   monitor features depend on the browser extension
*   teardown is manual unless the host framework calls `disconnect()` / `cleanup()`

### Task 4: Add a recipe or practical integration example

**Files:**

*   Create: `docs/recipes/devtools-checkout.md`

**Step 1: Provide a real example**

Use a compact machine like checkout or form submission and show:

*   machine definition
*   `connectXRobot()` usage
*   destructured methods
*   `disconnect()` in teardown

**Step 2: Show framework-agnostic cleanup**

Include a small section for host integration patterns, for example:

*   vanilla JS setup/teardown
*   pseudo `onMount` / `onCleanup`
*   pseudo `useEffect` cleanup

Keep this recipe focused on lifecycle and debugging, not on introducing FSM basics.

### Task 5: Add API reference generation support

**Files:**

*   Modify: `tsconfig.json`

**Step 1: Include the devtools entrypoint in TypeDoc**

Add `lib/devtools/index.ts` to `typedocOptions.entryPoints` so the generated API docs include the new module.

**Step 2: Verify exported symbols are doc-friendly**

Review `lib/devtools/index.ts` for concise API descriptions where necessary. If TypeDoc output would be too bare, add minimal doc comments only to public exports:

*   `connectXRobot`
*   `XRobotDevtoolsOptions`
*   `XRobotDevtoolsConnection`
*   `XRobotDevtoolsState`

### Task 6: Add documentation verification coverage

**Files:**

*   Modify: `tests/devtools.test.ts`
*   Optional: create `tests/docs-devtools.test.ts`

**Step 1: Add minimal docs presence assertions**

At minimum, assert that after documentation work:

*   `README.md` mentions `x-robot/devtools`
*   `README.md` links to `docs/guides/devtools.md`
*   `docs/guides/devtools.md` mentions production exclusion guidance

If that feels too brittle, keep these checks manual and document them in the verification section instead.

**Step 2: Prefer evidence-based verification over heavy doc snapshotting**

Do not snapshot full markdown files. Verify only the key anchors and critical strings.

### Task 7: Run documentation verification and rebuild generated docs

**Files:**

*   Modify as needed from previous tasks only

**Step 1: Run focused tests**

Run: `npm test -- --grep "connectXRobot|devtools"`
Expected: PASS

**Step 2: Regenerate docs**

Run: `bun run docs`
Expected: PASS, including TypeDoc output and regenerated `llms-full.txt`

**Step 3: Inspect resulting surfaces**

Manually verify these artifacts:

*   `README.md`
*   `docs/guides/devtools.md`
*   `docs/recipes/devtools-checkout.md`
*   generated API output under `docs/api/`
*   `llms-full.txt` still excludes `docs/api/` and `docs/plans/`

### Task 8: Final editorial pass

**Files:**

*   Modify: `README.md`
*   Modify: `docs/guides/devtools.md`
*   Modify: `docs/recipes/devtools-checkout.md`

**Step 1: Tighten wording**

Check that the documentation answers these user questions quickly:

*   What is this module?
*   How do I import it?
*   What methods does it return?
*   What DevTools features are supported?
*   How do I keep it out of production bundles?
*   What are the current limitations?

**Step 2: Keep the docs non-redundant**

Use this split:

*   `README.md` = discovery
*   `docs/guides/devtools.md` = full guide
*   `docs/recipes/devtools-checkout.md` = practical integration example
*   `docs/api/` = exact reference

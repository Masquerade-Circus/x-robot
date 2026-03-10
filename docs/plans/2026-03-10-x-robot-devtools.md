# X-Robot Devtools Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an in-repo `x-robot/devtools` module exposing `connectXRobot(machine, options)` with destructurable wrappers for `start`, `invoke`, `invokeAfter`, `snapshot`, and `machine`.

**Architecture:** Keep the core runtime untouched for v1 and implement DevTools as an opt-in adapter around existing `start`, `invoke`, `invokeAfter`, and `snapshot`. The adapter should connect to Redux DevTools when available, initialize with an enriched snapshot, and send actions after wrapped operations complete while preserving sync/async behavior.

**Tech Stack:** TypeScript, existing `x-robot` runtime APIs, Mocha + Expect, package subpath exports.

***

### Task 1: Add failing tests for the adapter contract

**Files:**

*   Create: `tests/devtools.test.ts`
*   Modify: `package.json`

**Step 1: Write the failing test**

Cover these behaviors:

*   `connectXRobot()` returns destructurable `start`, `invoke`, `invokeAfter`, `snapshot`, and `machine`
*   it initializes Redux DevTools with an enriched snapshot
*   it sends actions after `start()` and `invoke()`
*   it works without the browser extension

**Step 2: Run test to verify it fails**

Run: `npm test -- --grep "connectXRobot"`
Expected: FAIL because module/functions do not exist yet.

### Task 2: Implement the devtools adapter

**Files:**

*   Create: `lib/devtools/index.ts`
*   Modify: `lib/index.ts`
*   Modify: `package.json`

**Step 1: Write minimal implementation**

Add:

*   Redux DevTools detection helper
*   enriched snapshot helper
*   `connectXRobot(machine, options)` returning wrapper methods
*   sync and async-safe action sending

**Step 2: Run focused test to verify it passes**

Run: `npm test -- --grep "connectXRobot"`
Expected: PASS

### Task 3: Verify public packaging and regression safety

**Files:**

*   Modify: `package.json`

**Step 1: Verify subpath export is present**

Add export for `x-robot/devtools` pointing to built files.

**Step 2: Run broader verification**

Run: `npx mocha --no-timeouts --exit --require ts-node/register --enable-source-maps tests/devtools.test.ts tests/mermaid-export.test.ts`
Expected: PASS

# X-Robot Devtools Commit Reset Rollback Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add incoming Redux DevTools support for `COMMIT`, `RESET`, and `ROLLBACK` in `x-robot/devtools`.

**Architecture:** Extend the existing `subscribe()`-based message handling in `connectXRobot()` with three additional dispatch handlers. Keep a stored baseline snapshot for resets, use current runtime restoration for rollback, and reinitialize the Redux DevTools monitor with `init(...)` whenever the monitor expects history to be cleared.

**Tech Stack:** TypeScript, existing `x-robot` runtime APIs, Redux DevTools extension messaging API, Mocha + Expect.

***

### Task 1: Add failing tests for COMMIT / RESET / ROLLBACK

**Files:**

*   Modify: `tests/devtools.test.ts`

**Step 1: Write the failing test**

Cover these behaviors:

*   `COMMIT` re-initializes DevTools with the current snapshot
*   `RESET` restores the original connected snapshot and re-initializes DevTools
*   `ROLLBACK` restores the incoming snapshot and re-initializes DevTools

**Step 2: Run test to verify it fails**

Run: `npm test -- --grep "connectXRobot"`
Expected: FAIL because these incoming dispatch types are not handled yet.

### Task 2: Implement incoming dispatch handlers

**Files:**

*   Modify: `lib/devtools/index.ts`

**Step 1: Write minimal implementation**

Add:

*   stored baseline snapshot for reset
*   handler branches for `COMMIT`, `RESET`, and `ROLLBACK`
*   `init(...)` sync after commit/reset/rollback restoration

**Step 2: Run focused test to verify it passes**

Run: `npm test -- --grep "connectXRobot"`
Expected: PASS

### Task 3: Run broader verification

**Files:**

*   No additional files expected

**Step 1: Run broader regression checks**

Run: `npx mocha --no-timeouts --exit --require ts-node/register --enable-source-maps tests/devtools.test.ts tests/index.test.ts`
Expected: PASS

**Step 2: Rebuild package**

Run: `bun run build`
Expected: PASS and regenerated `dist/devtools/index.*`

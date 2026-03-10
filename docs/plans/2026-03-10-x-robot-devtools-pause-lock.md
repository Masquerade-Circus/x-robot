# X-Robot Devtools Pause Lock Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add incoming Redux DevTools support for `PAUSE_RECORDING` and `LOCK_CHANGES` in `x-robot/devtools`.

**Architecture:** Extend the existing incoming message handler in `connectXRobot()` with two runtime flags: one to suppress outbound DevTools updates while recording is paused, and one to block wrapped machine operations while changes are locked. Keep the implementation adapter-local so the core machine runtime remains unchanged.

**Tech Stack:** TypeScript, existing `x-robot` runtime APIs, Redux DevTools extension messaging API, Mocha + Expect.

***

### Task 1: Add failing tests for pause and lock behavior

**Files:**

*   Modify: `tests/devtools.test.ts`

**Step 1: Write the failing test**

Cover these behaviors:

*   `PAUSE_RECORDING` suppresses outbound `send(...)` calls while paused
*   unpausing allows outbound `send(...)` calls again
*   `LOCK_CHANGES` blocks wrapped `invoke()` calls
*   unlocking allows wrapped `invoke()` calls again

**Step 2: Run test to verify it fails**

Run: `npm test -- --grep "connectXRobot"`
Expected: FAIL because pause/lock flags are not handled yet.

### Task 2: Implement pause and lock flags

**Files:**

*   Modify: `lib/devtools/index.ts`

**Step 1: Write minimal implementation**

Add:

*   `isRecordingPaused` adapter flag
*   `isChangesLocked` adapter flag
*   guarded `send(...)` for normal outbound action updates
*   guarded wrappers for `start`, `invoke`, and `invokeAfter`

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

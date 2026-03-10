# X-Robot Devtools Disconnect Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `disconnect()` and `cleanup()` to `x-robot/devtools` so connected adapters can unmount Redux DevTools listeners cleanly.

**Architecture:** Extend the returned `connectXRobot()` object with teardown methods that close over the Redux DevTools subscription established during `connect()`. Keep cleanup adapter-local and idempotent so repeated calls are safe even if the extension is absent.

**Tech Stack:** TypeScript, existing `x-robot` runtime APIs, Redux DevTools extension messaging API, Mocha + Expect.

***

### Task 1: Add failing tests for cleanup behavior

**Files:**

*   Modify: `tests/devtools.test.ts`

**Step 1: Write the failing test**

Cover these behaviors:

*   `disconnect()` unsubscribes the message listener
*   `cleanup()` is an alias of `disconnect()`
*   repeated teardown calls are safe and do not throw

**Step 2: Run test to verify it fails**

Run: `npm test -- --grep "connectXRobot"`
Expected: FAIL because the returned object does not expose teardown methods yet.

### Task 2: Implement teardown support

**Files:**

*   Modify: `lib/devtools/index.ts`

**Step 1: Write minimal implementation**

Add:

*   `disconnect()` and `cleanup()` in the returned connection type
*   stored unsubscribe callback from `subscribe()`
*   idempotent cleanup function

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

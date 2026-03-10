# X-Robot Devtools Time Travel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Redux DevTools incoming message support to `x-robot/devtools` so time-travel and imported lifted state can restore a machine snapshot.

**Architecture:** Extend the existing `connectXRobot()` adapter with a `subscribe()` listener on the Redux DevTools connection. Handle the minimal incoming `DISPATCH` messages needed for v1: `JUMP_TO_STATE`, `JUMP_TO_ACTION`, and `IMPORT_STATE`, restoring snapshots through the current runtime restore path and syncing lifted state back when importing.

**Tech Stack:** TypeScript, existing `x-robot` runtime APIs, Redux DevTools extension messaging API, Mocha + Expect.

***

### Task 1: Add failing tests for incoming DevTools messages

**Files:**

*   Modify: `tests/devtools.test.ts`

**Step 1: Write the failing test**

Cover these behaviors:

*   `JUMP_TO_STATE` restores the machine snapshot
*   `JUMP_TO_ACTION` restores the machine snapshot
*   `IMPORT_STATE` restores the latest computed state and resends lifted state with `send(null, nextLiftedState)`

**Step 2: Run test to verify it fails**

Run: `npm test -- --grep "connectXRobot"`
Expected: FAIL because the adapter does not subscribe to incoming messages yet.

### Task 2: Implement message subscription and restoration

**Files:**

*   Modify: `lib/devtools/index.ts`

**Step 1: Write minimal implementation**

Add:

*   Redux DevTools `subscribe(listener)` support in the connection type
*   parsing helper for incoming state payloads
*   restore helper for machine snapshots
*   `DISPATCH` handling for jump/import message types

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
Expected: PASS and `dist/devtools/index.*` regenerated

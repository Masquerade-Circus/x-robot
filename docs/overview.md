# X-Robot Overview

## What X-Robot is

X-Robot is a finite state machine library for JavaScript and TypeScript. It helps teams model product flows as named machines with explicit states, events, transitions, guards, pulses, and context.

Use X-Robot when a workflow needs clear allowed states, predictable transitions, async behavior inside the machine, and documentation that stays close to the implementation.

## The mental model

Think in one machine at a time:

*   `machine()` defines the system.
*   `state()` names valid states.
*   `transition()` defines allowed events and target states.
*   `guard()` decides whether an event advances.
*   `entry()` and `exit()` run pulses when the machine enters or leaves a state.
*   `context()` stores machine data with frozen state by default.

A machine accepts events through `invoke()`. Each event follows the allowed transition map, runs guards at the transition boundary, executes pulses at entry or exit, and updates the current state and context.

## Core runtime and optional modules

The core `x-robot` package defines and runs machines. Optional modules add focused capabilities when a project needs them:

*   `x-robot/documentate` generates diagrams, serialized machines, code output, and documentation artifacts.
*   `x-robot/validate` checks machine structure before shipping or generating artifacts. See [Validation](./guides/validation.md).
*   `x-robot/devtools` connects wrapped operations to Redux DevTools during development.
*   `@x-robot/react` and `@x-robot/vue` adapt machines to official framework packages. See [Framework Adapters](./guides/framework-adapters.md).

See [Public API and Stability](./guides/public-api.md) for stable import paths, SemVer expectations, and generated API reference boundaries.

## Why teams adopt it

Teams adopt X-Robot to reduce invalid UI states, keep async workflows inside the machine, and turn machine definitions into living documentation. The same model can drive runtime behavior, validation, visual diagrams, and generated output.

For the adoption case, read [Why Finite State Machines?](./why.md). For measured runtime and tooling claims, read [Performance](./performance.md). For a direct library comparison, read [XState vs X-Robot](./comparison/xstate.md).

## Where to go next

*   [Getting Started](./guides/getting-started.md) — Build your first machine.
*   [Framework Adapters](./guides/framework-adapters.md) — Use machines from React and Vue.
*   [Public API and Stability](./guides/public-api.md) — Choose stable imports and optional modules.
*   [Validation](./guides/validation.md) — Check machine structure before shipping.
*   [Why Finite State Machines?](./why.md) — Understand the adoption value.
*   [Performance](./performance.md) — Review benchmark and bundle context.
*   [XState vs X-Robot](./comparison/xstate.md) — Compare the mental model and capabilities.

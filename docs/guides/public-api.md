# Public API and Stability

## Stable import paths

X-Robot treats the package exports in `package.json` as the stable public import contract:

*   `x-robot`
*   `x-robot/documentate`
*   `x-robot/validate`
*   `x-robot/devtools`
*   `x-robot/utils`

Official framework adapters publish their own package manifests:

*   `@x-robot/react`
*   `@x-robot/vue`

See [Framework Adapters](./framework-adapters.md) for short React and Vue usage examples.

## Core runtime

Import the core runtime from `x-robot` when you define and run machines. The core path covers the primary machine API: machines, states, transitions, guards, pulses, context, startup, invocation, history, snapshots, and cancellation.

## Optional modules

Add optional modules when a workflow needs tooling around the core model:

*   `x-robot/documentate` for generated diagrams, serialized machines, SCXML, and code output.
*   `x-robot/validate` for [structural validation](./validation.md) before release or generation.
*   `x-robot/devtools` for Redux DevTools integration during development.
*   `x-robot/utils` for published utility helpers.

## Generated API reference

The generated [API reference](../api/) reflects TypeDoc output from source modules. It can list modules derived from source routes as technical reference material, while the guides in `docs/guides/` define the recommended consumption path.

## SemVer expectations

SemVer applies to the published import paths listed above. Patch and minor releases may improve behavior, documentation, validation, and generated artifacts while keeping the public import contract stable for compatible usage.

## Internal and generated documentation modules

Use guides for adoption decisions and public imports. Use generated API pages for detailed signatures and technical lookup when you need to inspect a specific exported function, type, or module surface.

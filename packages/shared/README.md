# @x-robot/shared

Internal workspace package for adapter-facing helpers shared across framework integrations.

*   Internal only: not exported from the root `x-robot` package
*   Purpose: snapshot reading, tracked runtime wrappers, cleanup contracts
*   Publication boundary: React consumes equivalent logic internally when preparing a publishable package
*   Tracking model: only wrapper-triggered machine operations are guaranteed to produce adapter updates
*   Cleanup model: `disconnect()` / `cleanup()` are idempotent and stop future wrapper notifications
*   Publish status: private workspace package, not intended for direct application imports

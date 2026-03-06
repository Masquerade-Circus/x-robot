# API Data Fetch

Common pattern for server data fetching.

## Problem

Track API call states: idle, loading, success, error with data and error handling.

## Solution

```javascript
import { machine, state, transition, initial, init, context, invoke, entry } from "x-robot";

async function fetchData(ctx) {
  const { params } = ctx;
  const url = params ? `/api/data?${new URLSearchParams(params)}` : "/api/data";
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  ctx.data = await res.json();
}

const fetchMachine = machine(
  "Fetch",
  init(
    initial("idle"),
    context({ data: null, error: null, params: null })
  ),
  state("idle", 
    transition("fetch", "loading")
  ),
  state("loading", 
    entry(fetchData, "success", "error")
  ),
  state("success", 
    transition("refetch", "loading"),
    transition("clear", "idle")
  ),
  state("error", 
    transition("retry", "loading"),
    transition("clear", "idle")
  )
);

// Usage
await invoke(fetchMachine, "fetch", { page: 1 });

if (fetchMachine.current === "success") {
  console.log(fetchMachine.context.data);
}
```

## With Parameters

```javascript
invoke(fetchMachine, "fetch", { category: "books", page: 1 });
```

## Diagram

```mermaid
---
title: Fetch
---

stateDiagram-v2

classDef danger fill:#f8d7da,stroke:#721c24,stroke-width:2px,text-align:left,color:#721c24
classDef warning fill:#fff3cd,stroke:#856404,stroke-width:2px,text-align:left,color:#856404
classDef success fill:#d4edda,stroke:#155724,stroke-width:2px,text-align:left,color:#155724
classDef primary fill:#cce5ff,stroke:#004085,stroke-width:2px,text-align:left,color:#004085
classDef info fill:#d1ecf1,stroke:#0c5460,stroke-width:2px,text-align:left,color:#0c5460
classDef def fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,text-align:left,color:#6c757d

state idle
state loading
state success
state error

[*] --> idle
idle --> loading: fetch
loading --> success: done
loading --> error: done
success --> loading: refetch
success --> idle: clear
error --> loading: retry
error --> idle: clear
```

## With Caching

```javascript
function checkCache(ctx) {
  const key = JSON.stringify(ctx.params);
  if (ctx.cache.has(key)) {
    ctx.data = ctx.cache.get(key);
    return; 
  }
}

async function fetchAndCache(ctx) {
  const res = await fetch(`/api/data?${new URLSearchParams(ctx.params)}`);
  ctx.data = await res.json();
  ctx.cache.set(JSON.stringify(ctx.params), ctx.data);
}

const fetchMachine = machine(
  "Fetch",
  init(initial("idle"), context({ data: null, cache: new Map() })),
  state("idle", transition("fetch", "loading")),
  state("loading", 
    entry(checkCache, "success", "error"),
    entry(fetchAndCache, "success", "error")
  ),
  state("success", transition("clear", "idle")),
  state("error", transition("retry", "loading"))
);
```

## With Pagination

```javascript
async function loadPage(ctx) {
  const res = await fetch(`/api/items?page=${ctx.page}`);
  const newItems = await res.json();
  ctx.items = [...ctx.items, ...newItems];
  ctx.hasMore = newItems.length > 0;
  if (ctx.hasMore) ctx.page++;
}

const listMachine = machine(
  "List",
  init(initial("idle"), context({ items: [], page: 1, hasMore: true })),
  state("idle", transition("load", "loading")),
  state("loading", 
    entry(loadPage, "success", "error")
  ),
  state("success", transition("loadMore", "loading")),
  state("error", transition("retry", "loading"))
);
```

## Next Steps

- [Login Flow](./login-flow.md) — Authentication
- [Modal Dialog](./modal-dialog.md) — UI states

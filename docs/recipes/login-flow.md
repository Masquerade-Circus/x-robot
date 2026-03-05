# Login Flow

A common pattern for authentication.

## Problem

Track login states: idle, authenticating, authenticated, error.

## Solution

```javascript
import { machine, state, transition, initial, init, context, invoke, entry } from "x-robot";

const loginMachine = machine(
  "Login",
  init(
    initial("idle"),
    context({ user: null, error: null })
  ),
  state("idle", 
    transition("login", "authenticating")
  ),
  state("authenticating", 
    entry(async (ctx) => {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify(ctx.credentials)
      });
      if (!res.ok) {
        throw new Error("Invalid credentials");
      }
      ctx.user = await res.json();
    }, "authenticated", "error")
  ),
  state("authenticated", 
    transition("logout", "idle")
  ),
  state("error", 
    transition("retry", "idle"),
    transition("login", "authenticating")
  )
);

// Usage
await invoke(loginMachine, "login", { 
  username: "user", 
  password: "pass" 
});

if (loginMachine.current === "authenticated") {
  console.log("Logged in as:", loginMachine.context.user);
}
```

## State Diagram

```
idle → authenticating → authenticated
  ↑         |                |
  |         ↓                |
  └────── error ←───────────┘
```

## Key Points

- Pulse handles async login
- Success/error transitions automatic
- Error state allows retry

## Variations

### With Remember Me

```javascript
state("authenticating", 
  entry(async (ctx) => {
    const res = await fetch("/api/login", {
      headers: ctx.remember ? { "X-Remember": "true" } : {}
    });
    ctx.user = await res.json();
  }, "authenticated", "error")
)
```

### With Token Refresh

```javascript
state("authenticated", 
  transition("refresh", "refreshing")
),
state("refreshing", 
  entry(async (ctx) => {
    ctx.token = await refreshToken(ctx.token);
  }, "authenticated", "idle")
)
```

## Next Steps

- [Form Validation](./form-validation.md) — Input handling
- [API Fetch](./api-fetch.md) — Data fetching patterns

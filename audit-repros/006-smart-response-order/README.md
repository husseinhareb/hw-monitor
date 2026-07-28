# Out-of-order SMART response

## What this demonstrates

`useSmartData.fetchSmart` has no request identity or cancellation. When a user
selects disk A and then disk B, a slower response for A can overwrite B's data.

## Run

```bash
node audit-repros/006-smart-response-order/repro.mjs
```

## Expected

After selecting B, the displayed data should remain B's result.

## Actual

B resolves first, then the old A request resolves and overwrites the shared
state.

## Status

Confirmed with a deterministic promise schedule matching the hook.

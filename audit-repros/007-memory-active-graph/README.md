# Active memory used as usage history

## What this demonstrates

The memory graph appends `/proc/meminfo`'s `Active` field, while the
application's composition and common used-memory definition are
`MemTotal - MemAvailable`.

## Run

```bash
node audit-repros/007-memory-active-graph/repro.mjs
```

## Expected

The fixture's used memory is 60% (600 of 1,000).

## Actual

The graph receives `Active=200`, displaying 20% for the same sample.

## Status

Confirmed with a deterministic `/proc/meminfo`-equivalent fixture.

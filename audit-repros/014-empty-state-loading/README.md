# Empty hardware lists stay in loading state

## What this demonstrates

The disk and battery components use `array.length === 0` to render a loading
message without tracking whether the first request has completed. A successful
empty response therefore never becomes an empty-state message.

## Run

```bash
node audit-repros/014-empty-state-loading/repro.mjs
```

## Expected

A completed empty response displays "No disks" or "No battery".

## Actual

Both components continue to display their loading translation.

## Status

Confirmed by evaluating the components' branch conditions.

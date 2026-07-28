# Unknown battery health becomes 100%

## What this demonstrates

When `energy_full_design`/`charge_full_design` is unavailable or zero, the
backend assigns `state_of_health = 100` and the frontend renders it as a known
percentage.

## Run

```bash
node audit-repros/011-battery-unknown-health/repro.mjs
```

## Expected

Health is unknown (`null`/`N/A`) when design capacity is missing.

## Actual

Health is reported as 100%.

## Status

Confirmed with the backend branch condition and frontend display behavior.

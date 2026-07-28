# systemd failed-unit marker

## What this demonstrates

Without `systemctl --plain`, failed units can be prefixed with the Unicode
failure marker `●`. The parser assumes the first token is always the unit name,
so it discards that runtime row. The merge then fabricates an
`inactive/dead` state from the unit-file list.

## Run

```bash
node audit-repros/010-systemd-failed-unit-marker/repro.mjs
```

## Expected

`broken.service` is `failed/failed`.

## Actual

Its runtime row is discarded and it is reported as `inactive/dead`.

## Status

Confirmed against a deterministic fixture matching `systemctl list-units`
failure-marker output.

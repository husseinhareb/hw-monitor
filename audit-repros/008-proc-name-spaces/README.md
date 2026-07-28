# Process names containing spaces

## What this demonstrates

The `/proc/<pid>/status` parser extracts `Name:` with
`split_whitespace().nth(1)`, truncating valid process names at their first
space.

## Run

```bash
bash audit-repros/008-proc-name-spaces/repro.sh
```

## Expected

`worker test` remains `worker test`.

## Actual

The application expression returns `worker`.

## Status

Confirmed with a deterministic status fixture.

# Multi-socket CPU totals

## What this demonstrates

The CPU parser keeps the first socket's `cpu cores` and `siblings` values while
separately counting physical IDs. It displays those per-socket values as the
system's core/thread counts.

## Run

```bash
node audit-repros/015-multi-socket-cpu-counts/repro.mjs
```

## Expected

Two sockets with 14 cores and 28 siblings each display 28 cores and 56
threads.

## Actual

The parser output displayed by `get_cpu_info` is 14 cores and 28 threads.

## Status

Confirmed from the same fixture shape used by the existing multi-socket Rust
test.

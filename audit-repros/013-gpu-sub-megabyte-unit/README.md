# Sub-megabyte GPU values labeled as MB

## What this demonstrates

`gpu::add_memory_unit` labels every byte value below 1 MiB as an equal number
of megabytes. The existing test suite explicitly expects the erroneous
`500 bytes -> 500 MB` result.

## Run

```bash
RUSTUP_HOME=/tmp/hw-monitor-audit-rustup \
CARGO_HOME=/tmp/hw-monitor-audit-cargo \
PATH=/tmp/hw-monitor-audit-cargo/bin:$PATH \
cargo test --manifest-path src-tauri/Cargo.toml add_memory_unit_bytes -- --nocapture
```

## Expected

500 bytes should display as `500 B` (or a rounded sub-megabyte value).

## Actual

The function and its test produce `500 MB`.

## Status

Confirmed by the existing test `tests/gpu_tests.rs::add_memory_unit_bytes`.

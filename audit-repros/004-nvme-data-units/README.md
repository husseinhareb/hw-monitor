# NVMe data-unit conversion

## What this demonstrates

An NVMe SMART data unit is 1,000 blocks of 512 bytes. The implementation
multiplies the unit counter by 512 and divides by 2,000,000, halving the
decimal-GB result.

## Run

```bash
node audit-repros/004-nvme-data-units/repro.mjs
```

## Expected

2,000,000 data units equal 1,024 GB.

## Actual

The implementation reports 512 GB.

## Status

Confirmed with a deterministic fixture.

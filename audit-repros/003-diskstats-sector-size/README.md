# `/proc/diskstats` sector-size multiplier

## What this demonstrates

Linux defines `/proc/diskstats` sector counters in 512-byte units. The
application multiplies them by `hw_sector_size`, producing an 8x error on a
4 KiB-native disk.

## Run

```bash
node audit-repros/003-diskstats-sector-size/repro.mjs
```

## Expected

100 sectors equal 51,200 bytes.

## Actual

The application formula reports 409,600 bytes with `hw_sector_size=4096`.

## Status

Confirmed with a deterministic fixture.

# Mount source and escaping assumptions

## What this demonstrates

Mount lookup uses the literal first `/proc/mounts` field as a map key and only
queries exact `/dev/<partition-name>` keys. It also passes escaped mount points
such as `\040` directly to `statvfs`.

## Run

```bash
bash audit-repros/009-mount-source-matching/repro.sh
```

## Expected

Aliases such as `/dev/mapper/vg-root` should resolve to `dm-0`, and escaped
mount points should be decoded.

## Actual

The exact `/dev/dm-0` lookup misses the mapper source, and the mount point
remains `/media/My\040Disk`.

## Status

Confirmed with a deterministic mount fixture.

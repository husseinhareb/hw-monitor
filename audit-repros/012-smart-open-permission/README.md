# NVMe open-permission early return

## What this demonstrates

`read_nvme_smart` maps a permission error from opening the block device
directly to `Err` via `?`. The generic-device and sysfs-limited fallbacks begin
only after that open succeeds and the ioctl itself returns permission denied.
The UI offers "Fix permissions" only for a successful `limited` response.

## Run

```bash
bash audit-repros/012-smart-open-permission/repro.sh
```

## Expected

A block-device open denial should attempt the generic/sysfs fallback and
return limited data when possible.

## Actual

The function exits before the fallback, and the frontend renders only the
error branch.

## Status

Confirmed by static control-flow proof. Actual NVMe ioctl behavior was not
tested because this environment exposes no NVMe device.

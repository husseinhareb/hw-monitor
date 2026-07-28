# PID reuse identity check

## What this demonstrates

The process record exposed to the UI has no Linux process start time and the
termination command calls `kill(2)` using only the numeric PID. Therefore the
backend cannot distinguish a stale row from a later process that reused that
PID.

## Run

```bash
bash audit-repros/002-pid-reuse/repro.sh
```

## Expected

The UI and backend should carry `/proc/<pid>/stat` start time (or a pidfd), and
the backend should reject a changed identity.

## Actual

The `Process` type has only `pid`; `kill_process` passes it straight to
`libc::kill`.

## Status

Confirmed by static proof of the missing identity invariant. No process is
terminated.

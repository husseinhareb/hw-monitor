# Audit reproductions

These are non-destructive, deterministic demonstrations for findings in
`BUG_AUDIT.md`. Run all portable reproductions from the repository root with:

```bash
bash audit-repros/run-all.sh
```

The privilege reproduction only inspects source and capability metadata. It
does not invoke `sudo`, `setcap`, `kill`, `systemctl`, or any device ioctl.

The JavaScript fixtures retain the original failing calculations as historical
proof. Source-based scripts were converted to post-fix regression checks so
they remain runnable after remediation. The authoritative executable
regressions are the Rust and Vitest test suites.

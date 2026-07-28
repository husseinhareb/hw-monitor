# Whole-GUI `CAP_SYS_ADMIN`

## What this demonstrates

`fix_nvme_permissions` asks `sudo setcap` to attach `cap_sys_admin+eip` to the
currently running desktop executable, rather than granting narrowly scoped
access to an isolated helper.

## Run

```bash
bash audit-repros/001-whole-gui-cap-sys-admin/repro.sh
```

## Expected

SMART access should be delegated to a narrowly scoped helper or authorized
device access; the GUI executable should not receive `CAP_SYS_ADMIN`.

## Actual

The source constructs `setcap cap_sys_admin+eip <current_exe>`.

## Status

Confirmed by static, unavoidable control-flow evidence. The reproduction never
grants a capability.

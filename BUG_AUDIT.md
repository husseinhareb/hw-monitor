# hw-monitor Bug and Security Audit

> This report records the state at commit
> `19806cf53d7f1f6e70a7e9fe3d753535e4cf3472`. The findings were remediated
> after the audit; the evidence and original observations below are preserved
> as a historical record.

## Remediation status

| Finding | Status | Fix |
|---|---|---|
| BUG-001, BUG-005, BUG-006 | Fixed | `fb342f6` — safe SMART fallback and ordered refreshes |
| BUG-002 | Fixed | `f4197ca` — start-time validation and pidfd signaling |
| BUG-003 | Fixed | `8ae31c6` — fixed 512-byte diskstat units |
| BUG-004 | Fixed | `51d43f8` — correct NVMe data-unit conversion |
| BUG-007 | Fixed | `8dee422` — raw-byte network chart history |
| BUG-008 | Fixed | `50e80b4` — used-memory graph semantics |
| BUG-009 | Fixed | `71d261d` — mountinfo major:minor matching |
| BUG-010 | Fixed | `88979c1` — multi-socket totals |
| BUG-011 | Fixed | `72890f8` — complete process names |
| BUG-012 | Fixed | `0359710` — systemd marker handling |
| BUG-013 | Fixed | `fd3726d` — optional battery health |
| BUG-014 | Fixed | `e9813c4` — correct small GPU-memory units |
| BUG-015 | Fixed | `3381dbf` — explicit loading and empty states |
| BUG-017 | Fixed | `dd75eec` — native polkit authorization |
| BUG-016, BUG-018, BUG-019 | Fixed | Dependency, test, CI, and release hardening in the final remediation change |

## Executive summary

- Repository commit audited: `19806cf53d7f1f6e70a7e9fe3d753535e4cf3472`
- Audit date: 2026-07-28
- Environment: Ubuntu 24.04.4 LTS container, Linux 6.8.0-1052-azure x86_64, Rust 1.97.1, Cargo 1.97.1, Node 24.14.0, npm 11.9.0; no display server, systemd, block device nodes, battery, hwmon sensor, or NVMe hardware
- Build result: Rust check/Clippy and frontend/release builds passed; `.deb` and `.rpm` bundles were produced
- Tests result: 157 Rust test executions passed; no frontend test, lint, or named typecheck script exists; `npx tsc --noEmit` passed
- Number of confirmed findings: 15 (19 findings/recommendations total)
- Critical: 0
- High: 1
- Medium: 9
- Low: 6
- Informational: 3

The most important result is not a parser crash: the SMART repair path grants
`CAP_SYS_ADMIN` to the complete Tauri/WebKit desktop executable. That is an
unnecessarily broad privilege boundary for one NVMe ioctl and materially
amplifies any future native or webview compromise. The audit also confirmed a
wrong-process termination race, multiple materially incorrect hardware
calculations, stale cross-disk SMART display, and common storage layouts whose
mount usage is silently omitted.

No production source was changed. All audit additions are under
`audit-repros/` plus this report.

## System and data-flow model

- `/proc/stat`, `/proc/meminfo`, `/proc/net/dev`, `/proc/partitions`,
  `/proc/diskstats`, `/proc/<pid>/{stat,status,io}`, `/sys/block`,
  `/sys/class/{hwmon,power_supply,net,drm,nvme}`, DMI/udev data, and NVML feed
  synchronous Rust collectors.
- Tauri commands in `src-tauri/src/main.rs:142-176` serialize collector results
  to React. CPU, network, disk, and process commands retain the previous sample
  in application-managed `Mutex` state to derive rates.
- Frontend polling is generally serialized by
  `src/hooks/useSerialPolling.ts:42-94`. It uses a request generation and
  `setTimeout`, preventing overlapping periodic calls and discarding responses
  after dependency changes or unmount.
- SMART reads are modal-driven and bypass the serial polling hook. Their hook
  has no request identity, which creates BUG-006.
- Configuration writes are queued by
  `src/services/configStore.ts:103-117,159-222`, then written through a
  same-directory temporary file and rename.
- OS-modifying operations are process termination, systemd
  start/stop/restart/enable/disable, configuration writes, and the permanent
  file-capability mutation used by the NVMe repair command.
- External programs are `systemctl`, `journalctl`, `sudo`, and `setcap`. SMART
  access uses direct SG_IO/NVMe ioctls; there is no `smartctl` shell call.
- README/package targets cover Arch, Debian/Ubuntu, and RPM-based Linux, with
  dependency notes for Fedora/RHEL, Gentoo, and Void. GTK3/WebKitGTK implies
  X11/Wayland desktop sessions. GPU collection covers NVIDIA through NVML and
  DRM/sysfs devices such as AMD/Intel. ATA/SATA and NVMe SMART are intended.

## Severity overview

| ID | Severity | Confidence | Component | Title | Reproduced |
|----|----------|------------|-----------|-------|------------|
| BUG-001 | High | Confirmed | SMART/privileges | Whole GUI receives `CAP_SYS_ADMIN` | Yes, safe static proof |
| BUG-002 | Medium | Confirmed | Processes | PID reuse can terminate a different process | Yes, static invariant proof |
| BUG-003 | Medium | Confirmed | Disk statistics | 4Kn disk traffic is reported 8x too high | Yes |
| BUG-004 | Medium | Confirmed | NVMe SMART | Data-read/written totals are halved | Yes |
| BUG-005 | Medium | Confirmed | NVMe permissions/UI | Initial open denial bypasses all fallbacks and repair UI | Yes, control-flow proof |
| BUG-006 | Medium | Confirmed | SMART frontend | Stale disk response overwrites the selected disk | Yes |
| BUG-007 | Medium | Confirmed | Network frontend | Chart mixes B/KB/MB numeric scales | Yes |
| BUG-008 | Medium | Confirmed | Memory frontend | Usage graph plots `Active`, not used RAM | Yes |
| BUG-009 | Medium | Confirmed | Disk mounts | Aliased, escaped, whole-disk, and multi-mount usage is lost | Yes |
| BUG-010 | Medium | Confirmed | CPU parsing | Multi-socket core/thread totals use one socket | Yes |
| BUG-011 | Low | Confirmed | Process parsing | Names containing spaces are truncated | Yes |
| BUG-012 | Low | Confirmed | systemd parsing | Failed units can become inactive/dead | Yes |
| BUG-013 | Low | Confirmed | Battery parsing | Unknown battery health is shown as 100% | Yes |
| BUG-014 | Low | Confirmed | GPU formatting/tests | Bytes below 1 MiB are labeled as MB | Yes |
| BUG-015 | Low | Confirmed | Empty states | No disk/battery is displayed as perpetual loading | Yes |
| BUG-016 | Low | Potential | Rust dependencies | Runtime channel dependency has a double-free advisory | Audit only |
| BUG-017 | Informational | Design review | Privileged IPC | Password handling and service authorization need isolation | No exploit claimed |
| BUG-018 | Informational | Confirmed gap | Tests/CI/dependencies | No frontend behavioral tests or automated audits | Commands/static review |
| BUG-019 | Informational | Confirmed gap | Release supply chain | Mutable action tags and unsigned artifacts | Static/package review |

## Critical findings

No Critical issue was confirmed.

## High findings

## BUG-001: NVMe repair grants `CAP_SYS_ADMIN` to the entire desktop application

**Severity:** High
**Confidence:** Confirmed
**Component:** `src-tauri/src/smart/commands.rs:581-627` (`fix_nvme_permissions`)
**Affected versions:** 0.4.0 and audited commit; introduced with NVMe SMART support
**Reproduced:** Yes
**Regression:** Unknown

### Summary

The repair command runs `sudo setcap cap_sys_admin+eip <current_exe>`.
Consequently, every subsequent launch gives a large Tauri/WebKit/NVML GUI
process one of Linux's broadest capabilities merely to issue a SMART ioctl.

### Impact

A native memory-safety flaw, malicious replacement, or code execution in the
capability-bearing process gains a much more powerful platform for mounting,
namespace, device, and other administration operations. The capability
persists on that executable inode until replacement or explicit removal.

### Preconditions

- The user enters a sudo password into the in-app repair flow.
- The application is relaunched.
- Exploitation additionally requires control of, or code execution in, the
  capability-bearing native process; this audit did not find a direct
  JavaScript-to-arbitrary-syscall command.

### Root cause

`fix_nvme_permissions` resolves the full GUI via `current_exe` and passes it
directly to `setcap` at `src-tauri/src/smart/commands.rs:587-592`. The same
binary initializes the webview and all collectors at
`src-tauri/src/main.rs:124-180`.

### Reproduction environment

- Distribution: Ubuntu 24.04.4 LTS
- Kernel: 6.8.0-1052-azure x86_64
- Rust version: 1.97.1
- Node version: 24.14.0
- Desktop environment: None (static proof does not require one)
- Relevant hardware: No NVMe required

### Steps to reproduce

1. Run the safe source inspection.
2. Observe that the argument is `cap_sys_admin+eip`.
3. Observe that its target is `std::env::current_exe()`.
4. Confirm that no capability was modified.

### Reproduction command

```bash
bash audit-repros/001-whole-gui-cap-sys-admin/repro.sh
```

### Expected behavior

The GUI remains unprivileged. A narrowly scoped helper, polkit action, or
device-specific access rule performs only the necessary read operation.

### Actual behavior

The command permanently attaches `CAP_SYS_ADMIN` to the complete executable.

### Evidence

The reproduction prints both source expressions and:

```text
CONFIRMED: CAP_SYS_ADMIN is assigned to current_exe; no capability was changed.
```

### Suggested fix

Remove the setcap flow. Put the minimal validated ioctl operation in a small,
auditable helper with a polkit policy, strict device-major/minor validation,
closed inherited descriptors, a fixed environment, and no webview. Prefer a
targeted udev rule for the generic NVMe device if the kernel permits the
required read without `CAP_SYS_ADMIN`.

### Regression test

Add a packaging/security test that rejects any `security.capability` xattr on
the GUI and a unit/integration test proving the helper accepts only discovered
whole-disk device identities and only the read-only SMART operation.

### Severity reasoning

Impact is high because `CAP_SYS_ADMIN` is far broader than SMART access and is
attached to a large native GUI attack surface. Likelihood requires user
authorization plus a separate process compromise, so this is High rather than
Critical.

## Medium findings

## BUG-002: A stale PID selection can terminate a different process after PID reuse

**Severity:** Medium
**Confidence:** Confirmed
**Component:** `src-tauri/src/proc/commands.rs:8-21,389-401` (`Process`, `kill_process`)
**Affected versions:** 0.4.0 and audited commit
**Reproduced:** Yes
**Regression:** Unknown

### Summary

The UI/backend process identity contains a PID but no start time or pidfd.
`kill_process` validates the numeric range and immediately calls
`kill(pid, SIGTERM)`, so it cannot detect PID reuse.

### Impact

The user can terminate a newly created, unrelated same-user process when a
displayed process exits and its PID is reused before the action reaches the
backend. A custom/compromised frontend can also submit any permitted PID.

### Preconditions

- A process row becomes stale.
- Linux reuses its PID.
- The user acts before the next selection-clearing refresh, or a frontend
  invokes the command directly.
- Normal Unix signal permissions still apply.

### Root cause

`Process` omits field 22 (`starttime`) from `/proc/<pid>/stat`, and
`kill_process` uses only `process.pid`. The frontend re-resolves selection only
by PID at `src/components/Processes/Proc.tsx:244-279`.

### Reproduction environment

- Distribution: Ubuntu 24.04.4 LTS
- Kernel: 6.8.0-1052-azure
- Rust version: 1.97.1
- Node version: 24.14.0
- Desktop environment: None
- Relevant hardware: None

### Steps to reproduce

1. Inspect the IPC `Process` shape.
2. Verify there is no start-time identity.
3. Inspect the termination syscall.
4. Verify it receives only the numeric PID.

### Reproduction command

```bash
bash audit-repros/002-pid-reuse/repro.sh
```

### Expected behavior

Termination is bound to a stable identity, preferably a pidfd, or the backend
re-reads and compares `/proc/<pid>/stat` start time immediately before
signaling.

### Actual behavior

Any process occupying the submitted PID receives `SIGTERM`.

### Evidence

```text
let ret = unsafe { libc::kill(pid, libc::SIGTERM) };
CONFIRMED: a reused PID cannot be distinguished; no signal was sent.
```

### Suggested fix

Expose process start time and require it in the command, then re-read it before
signaling. On supported kernels, use `pidfd_open` followed by
`pidfd_send_signal` to remove the lookup race entirely.

### Regression test

Abstract process identity lookup and assert that a matching PID with a changed
start time is rejected without calling the signal function.

### Severity reasoning

The impact is a wrong-process action, but practical likelihood depends on a
short PID-reuse window and signal permissions. It is therefore Medium, not
High.

## BUG-003: `/proc/diskstats` sectors are multiplied by hardware sector size

**Severity:** Medium
**Confidence:** Confirmed
**Component:** `src-tauri/src/disk/commands.rs:55-61,506-563` (`get_sector_size`, `get_disks`)
**Affected versions:** 0.4.0 and audited commit
**Reproduced:** Yes
**Regression:** Unknown

### Summary

Linux diskstats sector counters are defined in 512-byte units. The application
multiplies them by `queue/hw_sector_size`, making all byte totals and transfer
rates eight times too large on 4096-byte-native media.

### Impact

Users receive materially false disk throughput, total read/write, and discard
figures on 4Kn disks. This can mislead performance and hardware diagnosis.

### Preconditions

- A disk reports `hw_sector_size=4096`.
- Diskstats counters are displayed or differenced.

### Root cause

`get_sector_size` reads hardware sector size, and `get_disks` multiplies
`sectors_read`, `sectors_written`, and `sectors_discarded` by it at lines
508-511 and again in the previous-sample snapshot at lines 555-560.

### Reproduction environment

- Distribution: Portable arithmetic fixture on Ubuntu 24.04.4
- Kernel: 6.8.0-1052-azure
- Rust version: 1.97.1
- Node version: 24.14.0
- Desktop environment: None
- Relevant hardware: Simulated 4Kn disk

### Steps to reproduce

1. Supply a counter of 100 sectors.
2. Supply hardware sector size 4096.
3. Compare the application formula with the kernel's 512-byte unit.

### Reproduction command

```bash
node audit-repros/003-diskstats-sector-size/repro.mjs
```

### Expected behavior

100 diskstats sectors are 51,200 bytes.

### Actual behavior

The application formula yields 409,600 bytes.

### Evidence

```text
expectedBytes: 51200
applicationBytes: 409600
```

### Suggested fix

Use a constant 512 multiplier for `/proc/diskstats`; retain logical/physical
block sizes only as descriptive device metadata.

### Regression test

Extract byte conversion into a pure function and test 512-, 4096-, and
unexpected sysfs block sizes against a 512-byte diskstats unit.

### Severity reasoning

The issue is deterministic and significantly corrupts central monitoring data
on a real class of storage, but it does not modify the system.

## BUG-004: NVMe data-read and data-written lifetime totals are divided by two

**Severity:** Medium
**Confidence:** Confirmed
**Component:** `src-tauri/src/smart/commands.rs:540-545` (`read_nvme_smart`)
**Affected versions:** 0.4.0 and audited commit
**Reproduced:** Yes
**Regression:** Unknown

### Summary

NVMe defines one data unit as 1,000 × 512 bytes. The code multiplies the raw
counter by 512 but divides by 2,000,000, exactly halving decimal gigabytes.

### Impact

Drive lifetime writes/reads are systematically underreported, misleading
endurance and workload assessment.

### Preconditions

- Full NVMe SMART data can be read.
- The user views Data Read or Data Written.

### Root cause

The comment states the correct 1,000 × 512-byte unit, but lines 544-545 omit
the factor of 1,000 and compensate with an incorrect divisor.

### Reproduction environment

- Distribution: Portable fixture on Ubuntu 24.04.4
- Kernel: 6.8.0-1052-azure
- Rust version: 1.97.1
- Node version: 24.14.0
- Desktop environment: None
- Relevant hardware: Synthetic NVMe SMART counter

### Steps to reproduce

1. Use 2,000,000 data units.
2. Apply the NVMe definition.
3. Apply the application formula.

### Reproduction command

```bash
node audit-repros/004-nvme-data-units/repro.mjs
```

### Expected behavior

The result is 1,024 GB.

### Actual behavior

The result is 512 GB.

### Evidence

```text
expectedGb: '1024'
applicationGb: '512'
```

### Suggested fix

Calculate `units * 1000 * 512 / 1_000_000_000`, retaining `u128` until a
checked/saturating conversion to the serialized display type.

### Regression test

Parse a 512-byte SMART fixture with known read/write counters and assert exact
decimal GB values.

### Severity reasoning

The bug always produces materially wrong drive-health context when the feature
works, but causes no direct system damage.

## BUG-005: NVMe device-open denial exits before generic-device and sysfs fallbacks

**Severity:** Medium
**Confidence:** Confirmed
**Component:** `src-tauri/src/smart/commands.rs:468-525`; `src/components/Disks/Disks.tsx:141-235`
**Affected versions:** 0.4.0 and audited commit
**Reproduced:** Yes (control flow); no physical NVMe test
**Regression:** Unknown

### Summary

An EACCES opening `/dev/nvme…` is converted to `Err` with `?`. The generic
`/dev/ng…` and sysfs-limited fallback runs only when the block-device open
succeeds and the later ioctl returns EACCES. The UI exposes “Fix permissions”
only for a successful limited response.

### Impact

For the common case where an ordinary desktop user cannot open the NVMe block
device, SMART fails as an error and the recovery UI is unreachable. Users may
instead follow the dangerous suggestion to join the raw-disk group.

### Preconditions

- The NVMe node denies read/write open to the user.
- Sysfs or generic-device data could otherwise be available.

### Root cause

The early-return operator is at `smart/commands.rs:473-479`; fallback begins at
485. `Disks.tsx:151-157` returns the error view before the limited branch at
187-235.

### Reproduction environment

- Distribution: Ubuntu 24.04.4
- Kernel: 6.8.0-1052-azure
- Rust version: 1.97.1
- Node version: 24.14.0
- Desktop environment: None
- Relevant hardware: No exposed NVMe device; static branch-order proof

### Steps to reproduce

1. Locate the block-device open.
2. Locate its `?` early return.
3. Compare it with the later ioctl fallback.
4. Compare frontend error and limited branches.

### Reproduction command

```bash
bash audit-repros/012-smart-open-permission/repro.sh
```

### Expected behavior

Open denial attempts the safe generic/sysfs fallback and returns explicitly
unknown/limited fields.

### Actual behavior

The function returns an error before any fallback and the repair UI is absent.

### Evidence

```text
open_early_return_line=479
ioctl_fallback_line=485
ui_error_line=151
ui_limited_line=187
```

### Suggested fix

Handle open EACCES in the same fallback routine as ioctl EACCES. Do not
recommend membership in the `disk` group; it grants raw-disk access far beyond
SMART.

### Regression test

Inject an opener/ioctl abstraction and verify that block-open EACCES attempts
the generic device, then returns limited sysfs data if it also fails.

### Severity reasoning

The path is definitely unreachable in code and likely breaks a headline
feature for normal unprivileged users. Hardware execution was unavailable, so
the environment-specific frequency was not measured.

## BUG-006: Out-of-order SMART responses can display health for the wrong disk

**Severity:** Medium
**Confidence:** Confirmed
**Component:** `src/hooks/Disks/useSmartData.ts:7-25`; `src/components/Disks/Disks.tsx:51-64`
**Affected versions:** 0.4.0 and audited commit
**Reproduced:** Yes
**Regression:** Unknown

### Summary

Each selection starts `fetchSmart`, but the hook has neither an abort mechanism
nor a request ID. A slow request for disk A can resolve after a newer disk B
request and overwrite the shared state while the modal identifies disk B.

### Impact

The UI can attribute temperature, wear, failures, or lifetime data to the
wrong physical disk, potentially leading to a wrong maintenance decision.

### Preconditions

- The user selects two disks quickly.
- The older request completes last, which is plausible across different ioctl
  timeouts or disappearing devices.

### Root cause

Every completion calls `setData(result)` at `useSmartData.ts:18-23` without
checking which `devPath` is still selected.

### Reproduction environment

- Distribution: Portable promise fixture on Ubuntu 24.04.4
- Kernel: 6.8.0-1052-azure
- Rust version: 1.97.1
- Node version: 24.14.0
- Desktop environment: None
- Relevant hardware: Synthetic disks A/B

### Steps to reproduce

1. Start request A.
2. Start request B.
3. Resolve B and observe B.
4. Resolve A and observe stale A replacing it.

### Reproduction command

```bash
node audit-repros/006-smart-response-order/repro.mjs
```

### Expected behavior

Only the newest selection may update SMART state.

### Actual behavior

The stale A result replaces B.

### Evidence

```text
selectedDisk: 'B'
displayed: { disk: 'A', health: 'stale' }
```

### Suggested fix

Store a monotonically increasing request ID or selected path ref, clear it on
close/unmount, and apply `data`, `error`, and `loading` only to the current
request.

### Regression test

Use deferred promises in a hook/component test and resolve A after B.

### Severity reasoning

This is deterministic logic with a realistic interaction and displays
health-critical data for the wrong device. It does not alter the device.

## BUG-007: Network chart history discards per-sample units

**Severity:** Medium
**Confidence:** Confirmed
**Component:** `src/hooks/Performance/useNetworkData.ts:35-50`; `src/services/store.ts:125-145`; `src/components/Performance/Network.tsx:85-86`
**Affected versions:** 0.4.0 and audited commit
**Reproduced:** Yes
**Regression:** Unknown

### Summary

Every sample is independently converted to B, KB, MB, or GB, then the chart
maps each object to its bare numeric value. A tiny increase across a unit
boundary becomes an apparent near-total collapse.

### Impact

Normal network activity graphs are discontinuous and can invert trends,
materially misleading performance diagnosis.

### Preconditions

- Throughput crosses 1,000 B/s, 1 MB/s, or 1 GB/s while history spans both
  units.

### Root cause

`convertData` stores heterogeneous units; both component and Zustand-derived
chart arrays discard `.unit`.

### Reproduction environment

- Distribution: Portable frontend fixture on Ubuntu 24.04.4
- Kernel: 6.8.0-1052-azure
- Rust version: 1.97.1
- Node version: 24.14.0
- Desktop environment: None
- Relevant hardware: Synthetic network samples

### Steps to reproduce

1. Append 999 B/s.
2. Append 1,000 B/s.
3. Convert each sample.
4. Plot only numeric values.

### Reproduction command

```bash
node audit-repros/005-network-chart-units/repro.mjs
```

### Expected behavior

The second point is slightly higher.

### Actual behavior

The graph drops from 999 to 1.

### Evidence

```text
stored: [{ value: 999, unit: 'B' }, { value: 1, unit: 'KB' }]
plotted: [999, 1]
```

### Suggested fix

Store and plot raw bytes per second. Apply unit conversion only to textual
labels/tooltips, or normalize the complete displayed series to one shared
unit.

### Regression test

Assert monotonic plot points for raw rates spanning every unit boundary.

### Severity reasoning

The failure is common and central to monitoring accuracy, but it has no direct
security or system-modification impact.

## BUG-008: Memory usage history plots `Active` instead of used memory

**Severity:** Medium
**Confidence:** Confirmed
**Component:** `src/components/Performance/Sidebar.tsx:89-99`; `src/components/Performance/Memory.tsx:61-105`
**Affected versions:** 0.4.0 and audited commit
**Reproduced:** Yes
**Regression:** Unknown

### Summary

The memory graph appends `/proc/meminfo`'s `Active` value. Elsewhere, the same
screen defines in-use memory as `MemTotal - MemAvailable`; these are different
kernel concepts and can diverge substantially.

### Impact

The headline live graph can significantly understate actual in-use memory and
contradict the composition bar.

### Preconditions

- Inactive non-reclaimable memory or other used memory differs from `Active`,
  which is normal.

### Root cause

`Sidebar.tsx:94-97` scales and appends `memoryRaw.active`, while
`Memory.tsx:68-72` correctly computes in-use from total and available.

### Reproduction environment

- Distribution: Ubuntu 24.04.4 / synthetic meminfo fixture
- Kernel: 6.8.0-1052-azure
- Rust version: 1.97.1
- Node version: 24.14.0
- Desktop environment: None
- Relevant hardware: None

### Steps to reproduce

1. Set total to 1,000 and available to 400.
2. Set Active to 200.
3. Compare used percentage with the value sent to the graph.

### Reproduction command

```bash
node audit-repros/007-memory-active-graph/repro.mjs
```

### Expected behavior

The graph shows 60% used.

### Actual behavior

The graph shows 20%.

### Evidence

```text
expectedUsed: 600
applicationGraphValue: 200
```

### Suggested fix

Append `max(0, total - available)` in the same byte/unit scale used as the
graph maximum.

### Regression test

Test a meminfo sample where Active differs from total-minus-available and
assert the graph agrees with the composition.

### Severity reasoning

The error is always reachable and substantially misrepresents a primary
hardware metric.

## BUG-009: Mount usage matching fails for common Linux storage layouts

**Severity:** Medium
**Confidence:** Confirmed
**Component:** `src-tauri/src/disk/commands.rs:63-100,572-587` (`read_mount_info`, `get_disks`)
**Affected versions:** 0.4.0 and audited commit
**Reproduced:** Yes
**Regression:** Unknown

### Summary

Mount data is keyed by the literal `/proc/mounts` source and queried only as
`/dev/<partition-name>`. It neither decodes mount escapes nor resolves aliases,
stores only one mount per source, and populates usage only on partitions.

### Impact

LVM/device-mapper, `/dev/disk/by-*`, `/dev/root`, mounted whole disks, paths
containing spaces, and multiply mounted filesystems can silently lack or show
wrong mount/space information.

### Preconditions

Any listed mount-source alias, escaped path, whole-disk filesystem, or multiple
mount of the same source.

### Root cause

`read_mount_info` uses a single `HashMap<String, MountInfo>` and raw fields at
lines 68-87. Lines 574-586 only inspect `d.partitions` and require exact
`/dev/{part.name}` equality.

### Reproduction environment

- Distribution: Portable `/proc/mounts` fixture on Ubuntu 24.04.4
- Kernel: 6.8.0-1052-azure
- Rust version: 1.97.1
- Node version: 24.14.0
- Desktop environment: None
- Relevant hardware: Synthetic LVM mapper source

### Steps to reproduce

1. Store `/dev/mapper/vg-root /media/My\040Disk ext4 ...`.
2. Query `/dev/dm-0`.
3. Inspect the stored mount point.

### Reproduction command

```bash
bash audit-repros/009-mount-source-matching/repro.sh
```

### Expected behavior

Major/minor identity links aliases to the block device; mount escapes are
decoded; every mount is represented.

### Actual behavior

The lookup misses and the escaped path is passed literally to `statvfs`.

### Evidence

```text
stored_key=/dev/mapper/vg-root
lookup_key=/dev/dm-0
mount_point=/media/My\040Disk
```

### Suggested fix

Parse `/proc/self/mountinfo`, unescape fields, and join mount records to block
devices by major:minor. Store a vector per device and support usage on base
disks as well as partitions.

### Regression test

Fixtures should cover mapper aliases, by-UUID sources, escaped paths, bind
mounts, whole-disk filesystems, and multiple mounts.

### Severity reasoning

This removes a major feature on common supported storage configurations but
does not damage data.

## BUG-010: Multi-socket systems display per-socket core and thread counts as totals

**Severity:** Medium
**Confidence:** Confirmed
**Component:** `src-tauri/src/cpu/commands.rs:184-263,318-349` (`parse_static_fields`, `get_cpu_info`)
**Affected versions:** 0.4.0 and audited commit
**Reproduced:** Yes
**Regression:** Unknown

### Summary

The parser retains the first `cpu cores` and `siblings` values but separately
counts physical IDs. On a two-socket 14-core/28-thread-per-socket machine, it
displays 14 cores and 28 threads rather than 28 and 56.

### Impact

Workstations and servers receive materially incorrect topology information.

### Preconditions

- More than one physical CPU socket.
- `/proc/cpuinfo` uses the standard per-package fields.

### Root cause

`cores` and `threads` are assigned only when `None` at lines 200-207. Socket
count grows independently at lines 222-227, and `get_cpu_info` exposes the
unmultiplied strings.

### Reproduction environment

- Distribution: Portable cpuinfo-equivalent fixture on Ubuntu 24.04.4
- Kernel: 6.8.0-1052-azure
- Rust version: 1.97.1
- Node version: 24.14.0
- Desktop environment: None
- Relevant hardware: Synthetic dual-socket Xeon

### Steps to reproduce

1. Define two physical IDs.
2. Give each 14 cores and 28 siblings.
3. Apply the parser's first-value behavior.

### Reproduction command

```bash
node audit-repros/015-multi-socket-cpu-counts/repro.mjs
```

### Expected behavior

28 cores, 56 threads, 2 sockets.

### Actual behavior

14 cores, 28 threads, 2 sockets.

### Evidence

The existing fixture at `src-tauri/tests/cpu_tests.rs:68-88` checks only that
two sockets are found and does not assert totals. The repro prints both sets.

### Suggested fix

Derive total logical CPUs from processor records/sysfs topology and total
unique `(physical id, core id)` pairs, with safe fallbacks when fields are
absent.

### Regression test

Extend the existing multi-socket test to assert total cores and threads.

### Severity reasoning

The affected hardware is less common on desktops, but the displayed topology
is central and wrong by a large factor.

## Low findings

## BUG-011: `/proc/<pid>/status` names containing spaces are truncated

**Severity:** Low
**Confidence:** Confirmed
**Component:** `src-tauri/src/proc/commands.rs:61-107` (`read_proc_status_file`)
**Affected versions:** 0.4.0 and audited commit
**Reproduced:** Yes
**Regression:** Unknown

### Summary

`Name:` is parsed with `split_whitespace().nth(1)`. Valid `comm` values
containing spaces lose everything after the first word.

### Impact

Process names, searching, icons, and monitoring labels are wrong for unusual
but valid process names. Termination still uses PID.

### Preconditions

A process `comm` contains whitespace.

### Root cause

`src-tauri/src/proc/commands.rs:72-74` tokenizes rather than stripping the
`Name:` prefix. The separate stat parser correctly handles parentheses but
does not provide the displayed name.

### Reproduction environment

- Distribution: Portable status fixture on Ubuntu 24.04.4
- Kernel: 6.8.0-1052-azure
- Rust version: 1.97.1
- Node version: 24.14.0
- Desktop environment: None
- Relevant hardware: None

### Steps to reproduce

1. Parse `Name:\tworker test`.
2. Select the second whitespace token.

### Reproduction command

```bash
bash audit-repros/008-proc-name-spaces/repro.sh
```

### Expected behavior

`worker test`.

### Actual behavior

`worker`.

### Evidence

```text
application_name=worker
```

### Suggested fix

Strip `Name:`, then trim only leading/trailing whitespace.

### Regression test

Add status fixtures containing spaces, tabs, parentheses, and non-ASCII text.

### Severity reasoning

The impact is limited to identity/display behavior for unusual names.

## BUG-012: systemd's failed-unit marker can hide failure state

**Severity:** Low
**Confidence:** Confirmed parser behavior; systemd unavailable in audit container
**Component:** `src-tauri/src/services/commands.rs:56-92,118-166,208-223`
**Affected versions:** 0.4.0 and audited commit
**Reproduced:** Yes with fixture
**Regression:** Unknown

### Summary

`systemctl list-units` can prefix failed rows with `●` unless `--plain` is
used. The parser treats that marker as the unit, drops the row, and the merge
fabricates `inactive/dead` from the unit-file entry.

### Impact

A failed service can be shown as merely inactive, hiding the state the service
page is intended to diagnose.

### Preconditions

- systemctl emits the failure marker in non-plain output.
- The service also appears in `list-unit-files`.

### Root cause

The command uses `--no-legend` but not `--plain`; parser line 66 assumes the
first token has a `.service` suffix.

### Reproduction environment

- Distribution: Ubuntu 24.04.4 container
- Kernel: 6.8.0-1052-azure
- Rust version: 1.97.1
- Node version: 24.14.0
- Desktop environment: None
- Relevant hardware: systemd fixture; PID 1 is not systemd here

### Steps to reproduce

1. Parse `● broken.service loaded failed failed ...`.
2. Merge with an enabled `broken.service` unit-file record.

### Reproduction command

```bash
node audit-repros/010-systemd-failed-unit-marker/repro.mjs
```

### Expected behavior

`failed/failed`.

### Actual behavior

`inactive/dead`.

### Evidence

```text
parsedRuntimeCount: 0
displayed: { loadState: 'loaded', activeState: 'inactive', subState: 'dead' }
```

### Suggested fix

Pass `--plain` and optionally defensively strip a leading `●` token.

### Regression test

Add marked failed, unmarked failed, activating, and Unicode-description rows.

### Severity reasoning

The UI is misleading but does not itself alter a service.

## BUG-013: Missing battery design capacity is presented as perfect health

**Severity:** Low
**Confidence:** Confirmed
**Component:** `src-tauri/src/battery/sysfs.rs:64-85,107-118`; `src/components/Sensors/Battery.tsx:38-47`
**Affected versions:** 0.4.0 and audited commit
**Reproduced:** Yes
**Regression:** Unknown

### Summary

When design capacity is absent or zero, the backend assigns health `100`.
Because the type is not optional, the frontend renders “State of health:
100%” instead of unknown.

### Impact

Users can be falsely reassured about a battery whose health cannot be
calculated.

### Preconditions

The battery driver does not expose a usable full-design energy/charge value.

### Root cause

The `else` branch at `battery/sysfs.rs:83-85` uses 100 as an unknown sentinel,
but the UI treats every number as measured.

### Reproduction environment

- Distribution: Portable sysfs-equivalent fixture on Ubuntu 24.04.4
- Kernel: 6.8.0-1052-azure
- Rust version: 1.97.1
- Node version: 24.14.0
- Desktop environment: None
- Relevant hardware: Synthetic battery with missing design capacity

### Steps to reproduce

1. Set energy full to 35,000,000.
2. Set design energy to zero/missing.
3. Evaluate the branch.

### Reproduction command

```bash
node audit-repros/011-battery-unknown-health/repro.mjs
```

### Expected behavior

Unknown/N/A.

### Actual behavior

100%.

### Evidence

```text
energyFullDesign: 0
displayedHealthPercent: 100
```

### Suggested fix

Make health `Option<u32>` and return `None` when either capacity is unavailable
or invalid; optionally clamp implausible percentages only after validation.

### Regression test

Test missing, zero, degraded, and greater-than-design capacity fixtures.

### Severity reasoning

This is incorrect health reporting, but it is limited to drivers omitting
design capacity.

## BUG-014: Sub-megabyte GPU byte values are labeled as megabytes

**Severity:** Low
**Confidence:** Confirmed
**Component:** `src-tauri/src/gpu/commands.rs:119-128`; `src-tauri/tests/gpu_tests.rs:5-9`
**Affected versions:** 0.4.0 and audited commit
**Reproduced:** Yes
**Regression:** Existing test codifies the bug

### Summary

For every byte value below 1 MiB, `add_memory_unit` formats the raw byte count
with an `MB` suffix. The test explicitly expects 500 bytes to become 500 MB.

### Impact

Very low/free GPU memory or small values can be exaggerated by roughly one
million times.

### Preconditions

A GPU memory value passed to this formatter is below 1 MiB.

### Root cause

The fallback at `gpu/commands.rs:125-127` changes the label without converting
the value.

### Reproduction environment

- Distribution: Ubuntu 24.04.4
- Kernel: 6.8.0-1052-azure
- Rust version: 1.97.1
- Node version: 24.14.0
- Desktop environment: None
- Relevant hardware: None; pure formatter test

### Steps to reproduce

1. Run the existing `add_memory_unit_bytes` test.
2. Observe that it asserts `"500 MB"` for input 500.

### Reproduction command

```bash
RUSTUP_HOME=/tmp/hw-monitor-audit-rustup CARGO_HOME=/tmp/hw-monitor-audit-cargo PATH=/tmp/hw-monitor-audit-cargo/bin:$PATH cargo test --manifest-path src-tauri/Cargo.toml add_memory_unit_bytes -- --nocapture
```

### Expected behavior

`500 B` or a correctly converted fractional MiB.

### Actual behavior

`500 MB`.

### Evidence

The targeted test passes, demonstrating that passing tests are not sufficient:
`src-tauri/tests/gpu_tests.rs:7-8` documents the bad fallback as intended.

### Suggested fix

Add B/KiB branches or always convert bytes to a consistent display unit.

### Regression test

Replace the incorrect expectation and test boundaries around 1 KiB, 1 MiB,
and 1 GiB.

### Severity reasoning

The magnitude is large, but the triggering range for displayed GPU memory is
an edge case.

## BUG-015: Successful empty disk and battery results remain “Loading”

**Severity:** Low
**Confidence:** Confirmed
**Component:** `src/components/Disks/Disks.tsx:323-337`; `src/components/Sensors/Battery.tsx:20-54`
**Affected versions:** 0.4.0 and audited commit
**Reproduced:** Yes
**Regression:** Unknown

### Summary

Both components infer loading solely from an empty array. They cannot
distinguish an outstanding request from a completed system with no exposed
disk or battery.

### Impact

Desktop systems without batteries and containers/VMs without visible block
devices show a permanent, misleading loading message.

### Preconditions

The backend successfully returns an empty array.

### Root cause

`diskData.length === 0` renders `loading.generic`; battery's final empty branch
renders `loading.battery`. Neither receives a completed/loading flag.

### Reproduction environment

- Distribution: Portable component-branch fixture on Ubuntu 24.04.4
- Kernel: 6.8.0-1052-azure
- Rust version: 1.97.1
- Node version: 24.14.0
- Desktop environment: None
- Relevant hardware: Environment has no battery or `/dev` block nodes

### Steps to reproduce

1. Complete a request successfully with `[]`.
2. Evaluate each render branch.

### Reproduction command

```bash
node audit-repros/014-empty-state-loading/repro.mjs
```

### Expected behavior

Explicit “No disks detected” / “No battery detected” empty states.

### Actual behavior

Loading messages persist forever.

### Evidence

```text
disksAfterSuccessfulEmptyResponse: 'loading.generic'
batteryAfterSuccessfulEmptyResponse: 'loading.battery'
```

### Suggested fix

Expose explicit initial-loading/completed state from the hooks and add
translated empty states.

### Regression test

Component tests for loading, error, successful empty, and populated results.

### Severity reasoning

This is a non-crashing UI failure on common battery-less hardware.

## BUG-016: Locked runtime event-loop dependency has a double-free advisory

**Severity:** Low
**Confidence:** Potential application impact; advisory confirmed
**Component:** `src-tauri/Cargo.lock:410-419` (`crossbeam-channel` 0.5.12), transitively via Tauri `muda`, `tao`, and `tray-icon`
**Affected versions:** Audited lockfile
**Reproduced:** No
**Regression:** Dependency issue

### Summary

`cargo audit` reports RUSTSEC-2025-0024: `crossbeam-channel` 0.5.12 can
double-free during a `Channel::drop` race. Linux dependency inversion confirms
that the vulnerable crate is in the runtime menu/window/tray graph.

### Impact

If the precise channel-drop race occurs, the GUI may crash or suffer native
memory corruption, especially around teardown. No attacker-controlled trigger
was established.

### Preconditions

- Tauri's transitive users instantiate the affected channel form.
- Channel destruction races with the advisory's internal state transition.

### Root cause

The lockfile pins the one version in which upstream introduced the race;
patched versions are 0.5.15 or newer.

### Reproduction environment

- Distribution: Ubuntu 24.04.4
- Kernel: 6.8.0-1052-azure
- Rust version: 1.97.1
- Node version: 24.14.0
- Desktop environment: None
- Relevant hardware: None

### Steps to reproduce

1. Run `cargo audit`.
2. Run `cargo tree -i crossbeam-channel@0.5.12`.
3. Observe runtime paths through `muda`, `tao`, and `tray-icon`.

### Reproduction command

```bash
RUSTUP_HOME=/tmp/hw-monitor-audit-rustup CARGO_HOME=/tmp/hw-monitor-audit-cargo PATH=/tmp/hw-monitor-audit-cargo/bin:$PATH cargo audit
```

### Expected behavior

The locked graph contains a patched channel implementation.

### Actual behavior

RustSec exits nonzero with RUSTSEC-2025-0024 among six advisories.

### Evidence

```text
Crate: crossbeam-channel
Version: 0.5.12
Title: crossbeam-channel: double free on Drop
Solution: Upgrade to >=0.5.15
```

### Suggested fix

Update Tauri/transitive dependencies or minimally update the compatible
lockfile package, then rerun full UI/tray shutdown testing.

### Regression test

Add `cargo audit` to CI with reviewed ignores only for demonstrably
target-unreachable advisories.

### Severity reasoning

Memory corruption is serious, but reachability and external triggerability in
this app are unproven; Low accurately reflects a dependency risk requiring
prompt maintenance rather than a confirmed exploit.

## Informational findings

## BUG-017: Privileged service and password handling should move out of the webview trust domain

**Severity:** Informational
**Confidence:** Design review
**Component:** `src-tauri/src/services/commands.rs:278-376`; `src-tauri/src/smart/commands.rs:581-627`; `src-tauri/src/main.rs:142-176`
**Affected versions:** 0.4.0 and audited commit
**Reproduced:** No exploit claimed
**Regression:** Not applicable

### Summary

The frontend collects an administrator password and sends it over Tauri IPC.
Rust clones it into multiple `String`s, resolves `sudo` through inherited
`PATH`, and pipes it to `sudo -S`; all service action commands are exposed to
the webview.

### Impact

A future frontend compromise can present a deceptive password prompt and, once
authorized, start/stop/enable/disable any currently enumerated service. The
password remains in JavaScript and Rust-managed memory until ordinary
deallocation. This is defense-in-depth risk, not a demonstrated credential
leak.

### Preconditions

- Frontend compromise or malicious local modification.
- User enters a valid password.
- Sudo policy authorizes the action.

### Root cause

Authentication and privileged policy are implemented inside the main
application rather than by a system broker. Commands use unqualified
`Command::new("sudo")`.

### Reproduction environment

- Distribution: Ubuntu 24.04.4 container
- Kernel: 6.8.0-1052-azure
- Rust version: 1.97.1
- Node version: 24.14.0
- Desktop environment: None
- Relevant hardware: systemd unavailable

### Steps to reproduce

1. Inspect the registered Tauri privileged commands.
2. Trace `password: String` through clone and stdin.
3. Inspect service enumeration/validation.

### Reproduction command

```bash
sed -n '278,376p' src-tauri/src/services/commands.rs
```

### Expected behavior

A small fixed-path helper/polkit action authenticates through the desktop's
native broker and authorizes each explicit operation.

### Actual behavior

The large GUI owns both password collection and privileged command initiation.

### Evidence

Service-name syntax validation and known-service checks prevent shell/argument
injection, and the password is not placed on the command line. Those are
positive controls; this finding concerns isolation and secret lifetime.

### Suggested fix

Use polkit/D-Bus authorization or a narrow helper with fixed executable paths,
sanitized environment, per-action policy, and zeroized sensitive buffers.

### Regression test

Test that the GUI API accepts no password and that the helper rejects unknown
actions/units and unsafe environments.

### Severity reasoning

No bypass or injection was reproduced and user authentication is still
required, so this is an architectural hardening recommendation.

## BUG-018: Frontend behavior and dependency audits are absent from CI

**Severity:** Informational
**Confidence:** Confirmed gap
**Component:** `package.json:6-15`; `.github/workflows/ci.yml:45-67`; `.github/workflows/release.yml:45-64`
**Affected versions:** Audited repository
**Reproduced:** Yes (missing scripts)
**Regression:** Not applicable

### Summary

There are no frontend `test`, `lint`, or named `typecheck` scripts. CI builds
TypeScript but has no component/hook timing tests and runs neither `npm audit`
nor `cargo audit`; CI Clippy/test also omit `--all-features`.

### Impact

BUG-006, BUG-007, BUG-008, and BUG-015 pass CI because no behavioral frontend
tests exist. Current dependency drift is also invisible: npm reports five
advisory entries and RustSec reports six vulnerabilities plus warnings.

### Preconditions

Normal development/release flow.

### Root cause

The workflow gates bindings, themes, Rust formatting/tests/Clippy, and the
frontend build only.

### Reproduction environment

- Distribution: Ubuntu 24.04.4
- Kernel: 6.8.0-1052-azure
- Rust version: 1.97.1
- Node version: 24.14.0
- Desktop environment: None
- Relevant hardware: None

### Steps to reproduce

1. Run the three requested npm scripts.
2. Run npm and Cargo audits.
3. Inspect CI.

### Reproduction command

```bash
npm test
npm run lint
npm run typecheck
npm audit
RUSTUP_HOME=/tmp/hw-monitor-audit-rustup CARGO_HOME=/tmp/hw-monitor-audit-cargo PATH=/tmp/hw-monitor-audit-cargo/bin:$PATH cargo audit --manifest-path src-tauri/Cargo.toml
```

### Expected behavior

CI exercises hooks/components, lint/type checks explicitly, and reviews
dependency advisories.

### Actual behavior

All three npm scripts are missing. The audits exit nonzero.

### Evidence

`npm audit` found 1 low, 2 moderate, and 2 high dependency entries. The
PostCSS/Vite/Babel/esbuild issues primarily require attacker-controlled build
inputs, a development server, or Windows paths; the packaged app does not
process arbitrary CSS or run Vite, so they are not classified as direct app
vulnerabilities. RustSec's quick-xml advisories are absent from the audited
Linux target graph; bytes requires an implausible near-`usize::MAX` reserve;
idna needs hostile domain comparison; and time needs hostile RFC2822 parsing.

### Suggested fix

Add Vitest/Testing Library tests, ESLint, explicit `tsc --noEmit`, strict
all-feature Rust commands, and reviewed audit gates. Upgrade dependencies
rather than blanket-ignore advisories.

### Regression test

Make the reproduction scenarios part of CI, especially delayed promises, unit
boundaries, empty arrays, parser fixtures, and SMART conversion fixtures.

### Severity reasoning

This finding is about prevention/detection quality. The actual functional and
dependency risks are classified separately.

## BUG-019: Release artifacts lack integrity metadata and actions are tag-pinned

**Severity:** Informational
**Confidence:** Confirmed gap
**Component:** `.github/workflows/release.yml:14-77`; `src-tauri/tauri.conf.json:25-35`; `src-tauri/Cargo.toml:1-7`
**Affected versions:** Current release workflow
**Reproduced:** Package/static inspection
**Regression:** Not applicable

### Summary

The release job grants `contents: write` and runs third-party actions by
mutable major tags. It uploads a raw binary and packages without checksums,
signatures, provenance/attestations, or SBOM; Cargo metadata also omits the MIT
license, leaving the generated RPM License field blank.

### Impact

Consumers cannot independently verify artifact provenance from published
metadata, and a compromised/moved action tag has release-token impact.

### Preconditions

Compromise of an action/tag or release distribution channel; no such
compromise was observed.

### Root cause

Release steps use `actions/checkout@v4`, `setup-node@v4`,
`actions/cache@v4`, and `softprops/action-gh-release@v2`, then upload only the
artifacts listed at lines 74-77.

### Reproduction environment

- Distribution: Ubuntu 24.04.4
- Kernel: 6.8.0-1052-azure
- Rust version: 1.97.1
- Node version: 24.14.0
- Desktop environment: None
- Relevant hardware: None

### Steps to reproduce

1. Build `.deb` and `.rpm`.
2. Inspect metadata and release workflow.
3. Inspect the published v0.4.0 RPM as a control.

### Reproduction command

```bash
npx tauri build --bundles deb,rpm
dpkg-deb --info src-tauri/target/release/bundle/deb/hw-monitor_0.4.0_amd64.deb
rpm -qip src-tauri/target/release/bundle/rpm/hw-monitor-0.4.0-1.x86_64.rpm
```

### Expected behavior

Actions are commit-SHA pinned; release assets include SHA-256 checksums,
attestations/signatures, SBOM, and complete license/category metadata.

### Actual behavior

No integrity artifacts are generated and the RPM License field is empty.

### Evidence

The locally generated packages contained the expected binary, desktop file,
and icons, with correct Debian dependency declarations. This workspace exposes
unusual writable modes, so the published v0.4.0 RPM was downloaded and
verified separately: it correctly installs `/usr/bin/hw-monitor` as 0755 and
metadata as 0644. No package-permission vulnerability is reported.

### Suggested fix

Pin actions to reviewed SHAs, generate checksums/SBOM/attestations, sign
packages where practical, and add `license = "MIT"` plus desktop categories.

### Regression test

CI should extract every package, assert owner/mode/dependencies/desktop fields,
verify no GUI file capability, and validate generated integrity artifacts.

### Severity reasoning

These are supply-chain hardening and metadata gaps, not evidence of a
compromised artifact.

## Tests and commands executed

### Repository and history

| Command | Result |
|---|---|
| `git status --short --branch` | Initially clean; final changes are only `BUG_AUDIT.md` and `audit-repros/` |
| `git rev-parse HEAD` | `19806cf53d7f1f6e70a7e9fe3d753535e4cf3472` |
| `git log --oneline -20` | Inspected; current commit follows v0.4.0 release commit `0ee2557` |
| `git submodule status` | No submodules |
| TODO/FIXME/HACK/XXX scan | No source TODO markers found |
| GitHub releases/issues | v0.4.0 is latest; one open NVIDIA/Wayland protocol-error report remains without confirmation on audited hardware |

### Rust

| Command | Result |
|---|---|
| `cargo fmt --all -- --check` | Pass |
| `cargo check --all-targets` | Pass |
| `cargo clippy --all-targets --all-features -- -D warnings` | Pass |
| `cargo test --all-targets --all-features` | Pass: 157 executions, 0 failed/ignored |
| Targeted `add_memory_unit_bytes` test | Passes while asserting the incorrect `500 MB` result |
| `cargo audit` | Nonzero: 6 vulnerability advisories; 27 allowed warnings |
| `cargo tree -i ...` | Confirmed Linux runtime paths for crossbeam; quick-xml not in Linux target graph |
| `cargo deny check` | Not run: `cargo-deny` is not installed and no `deny.toml` exists |

The first Cargo attempt was blocked by sandbox DNS and the base image lacked
GTK/WebKit/AppIndicator development libraries. A temporary Rust toolchain and
the same Ubuntu packages used by CI were installed; the commands then passed.

### Frontend

| Command | Result |
|---|---|
| `npm install` | Pass; 5 advisory entries reported |
| `npm ci` | First sandbox run failed executing esbuild with EPERM; approved rerun passed |
| `npm run check:bindings` | Pass |
| `npm run check:themes` | Pass: 3 themes, 68 color keys |
| `npm run build` | Pass: TypeScript and Vite production bundle |
| `npx tsc --noEmit` | Pass |
| `npm test` | Missing script |
| `npm run lint` | Missing script |
| `npm run typecheck` | Missing script |
| `npm audit --json` | Nonzero: 1 low, 2 moderate, 2 high dependency entries |

The npm severity labels are advisory severities, not the severity assigned to
this application. No audited flow supplies attacker-controlled CSS/source maps
to PostCSS/Babel, Vite is not in the packaged runtime, and the cited Vite
Windows path advisories do not affect this Linux package.

### Packaging/runtime/reproductions

| Command | Result |
|---|---|
| `npx tauri build --bundles deb,rpm` | Pass; both bundles created |
| `dpkg-deb --info/--contents` | Expected binary/desktop/icons; WebKitGTK, GTK, AppIndicator dependencies |
| `rpm -qip/-qplv/-qpR` | Expected files/dependencies; blank License metadata |
| Published v0.4.0 RPM inspection | Binary 0755, metadata 0644 |
| `ldd target/release/hw-monitor` | All libraries resolved |
| Headless release launch with temporary config | Config created, then GTK initialization panic because no display server |
| `systemctl`/`journalctl` probes | systemd is not PID 1 in container; service integration unavailable |
| `bash audit-repros/run-all.sh` | Pass; all portable repros confirmed expected failures |

## Post-remediation validation

The historical command results above describe the audited commit. After
remediating all 19 findings, the following gates passed on the resulting
source:

| Command | Result |
|---|---|
| `bash audit-repros/run-all.sh` | Pass; source checks confirm the fixes and historical fixtures remain reproducible |
| `cargo fmt --all -- --check` | Pass |
| `cargo check --all-targets --all-features` | Pass |
| `cargo clippy --all-targets --all-features -- -D warnings` | Pass |
| `cargo test --all-targets --all-features` | Pass: 179 executions, 0 failed/ignored |
| `npm run lint` | Pass with zero warnings |
| `npm test` | Pass: 6 regression tests |
| `npm run typecheck` | Pass |
| `npm run build` | Pass |
| `npm run check:bindings` | Pass |
| `npm run check:themes` | Pass: 3 themes, 68 color keys |
| `npm audit --audit-level=high` | Pass: 0 vulnerabilities |
| `cargo audit --no-fetch` | Pass: 0 vulnerabilities; 17 allowed maintenance/unsoundness warnings in transitive GTK3-era crates |
| Workflow YAML parse and action-pin inspection | Pass |
| `npx tauri build --bundles deb,rpm` | Pass; both packages rebuilt with aligned Tauri 2.11 packages, MIT RPM metadata, and Utility desktop category |

## Areas not fully tested

- No X11/Wayland compositor or desktop shell: window resizing, tray behavior,
  accessibility, theme visuals, rapid navigation rendering, and the open
  Wayland/NVIDIA issue could not be exercised.
- No systemd as PID 1: real service listing/actions, polkit/sudo dialog
  interaction, journal permissions, and service timeouts were not run. No
  essential service was stopped.
- No `/dev` block nodes or NVMe/SATA hardware: SG_IO/NVMe ioctl ABI behavior,
  USB bridges, RAID, hot-plug, real permission modes, SMART timeouts, and
  suspend/resume were fixture/static tested only.
- No battery or hwmon entries and no supported NVIDIA/AMD compute device:
  sensor hot-plug, driver-specific units, NVML failures, and battery driver
  diversity were not hardware-tested.
- No multi-socket host, 4Kn disk, LVM/RAID, or removable media; their pure
  parsing/arithmetic paths were tested with deterministic fixtures.
- The environment's workspace permission presentation is atypical. Published
  RPM permissions were checked to avoid a false packaging finding.
- `cargo deny` was unavailable. No destructive commands, process signals,
  service changes, password entry, `setcap`, or persistent capabilities were
  used.

## Recommended fix order

| Order | Findings | Security risk | User impact | Complexity | Regression risk | Release |
|---|---|---|---|---|---|---|
| 1 | BUG-001, BUG-017 | High | Removes broad privilege from GUI and improves auth isolation | Large | High | Hotfix design immediately; ship next patch |
| 2 | BUG-002 | Medium | Prevents wrong-process termination | Medium | Medium | Next patch |
| 3 | BUG-005, BUG-006 | Medium | Restores safe NVMe fallback and prevents wrong-disk health | Medium | Medium | Next patch |
| 4 | BUG-003, BUG-004 | Low security / high accuracy | Corrects disk throughput and NVMe lifetime totals | Small | Low | Next patch |
| 5 | BUG-007, BUG-008 | None / high accuracy | Corrects primary network and memory graphs | Small | Low | Next patch |
| 6 | BUG-009 | None / high compatibility | Restores filesystem usage for LVM, aliases, spaces, whole disks | Medium | Medium | Next minor |
| 7 | BUG-010, BUG-011, BUG-012, BUG-013, BUG-014 | None / moderate accuracy | Corrects topology, names, service state, battery and GPU edge values | Small-Medium | Low | Next patch |
| 8 | BUG-016 | Low, potential native memory safety | Removes an advisory-bearing runtime dependency | Small-Medium | Medium | Next patch |
| 9 | BUG-015 | None / low UI | Adds truthful empty states | Small | Low | Next patch |
| 10 | BUG-018, BUG-019 | Supply-chain hardening | Prevents recurrence and improves release trust | Medium | Low | Next minor |

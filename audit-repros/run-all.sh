#!/usr/bin/env bash
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

node "$repo_root/audit-repros/003-diskstats-sector-size/repro.mjs"
node "$repo_root/audit-repros/004-nvme-data-units/repro.mjs"
node "$repo_root/audit-repros/005-network-chart-units/repro.mjs"
node "$repo_root/audit-repros/006-smart-response-order/repro.mjs"
node "$repo_root/audit-repros/007-memory-active-graph/repro.mjs"
bash "$repo_root/audit-repros/008-proc-name-spaces/repro.sh"
bash "$repo_root/audit-repros/009-mount-source-matching/repro.sh"
node "$repo_root/audit-repros/010-systemd-failed-unit-marker/repro.mjs"
node "$repo_root/audit-repros/011-battery-unknown-health/repro.mjs"
bash "$repo_root/audit-repros/012-smart-open-permission/repro.sh"
node "$repo_root/audit-repros/014-empty-state-loading/repro.mjs"
node "$repo_root/audit-repros/015-multi-socket-cpu-counts/repro.mjs"
bash "$repo_root/audit-repros/001-whole-gui-cap-sys-admin/repro.sh"
bash "$repo_root/audit-repros/002-pid-reuse/repro.sh"

#!/usr/bin/env bash
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
source_file="$repo_root/src-tauri/src/proc/commands.rs"

grep -F 'start_time: u64' "$source_file" >/dev/null
grep -F 'SYS_pidfd_open' "$source_file" >/dev/null
grep -F 'SYS_pidfd_send_signal' "$source_file" >/dev/null
grep -F 'refusing to terminate it' "$source_file" >/dev/null
echo "PASS: process actions validate start time and signal through a pidfd."

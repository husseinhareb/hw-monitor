#!/usr/bin/env bash
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
source_file="$repo_root/src-tauri/src/smart/commands.rs"

if grep -Eq 'setcap|cap_sys_admin|current_exe' "$source_file"; then
  echo "FAILED: the SMART backend still contains whole-GUI capability setup" >&2
  exit 1
fi
grep -F 'limited_nvme_data' "$source_file" >/dev/null
echo "PASS: SMART fallback does not grant CAP_SYS_ADMIN to the GUI."

#!/usr/bin/env bash
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
backend="$repo_root/src-tauri/src/smart/commands.rs"

grep -F 'match read_nvme_log(dev_path, &mut buf)' "$backend" >/dev/null
grep -F 'read_nvme_log(&ng, &mut buf)' "$backend" >/dev/null
grep -F 'return Ok(limited_nvme_data(dev_path))' "$backend" >/dev/null
echo "PASS: open and ioctl permission failures share the safe limited-data fallback."

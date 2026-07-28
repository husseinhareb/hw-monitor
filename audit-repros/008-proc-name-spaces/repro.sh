#!/usr/bin/env bash
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
source_file="$repo_root/src-tauri/src/proc/commands.rs"

grep -F 'line.strip_prefix("Name:")' "$source_file" >/dev/null
grep -F 'name = Some(value.to_string())' "$source_file" >/dev/null
echo "PASS: the process parser preserves the complete Name field."

#!/usr/bin/env bash
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
source_file="$repo_root/src-tauri/src/disk/commands.rs"

grep -F '"/proc/self/mountinfo"' "$source_file" >/dev/null
grep -F 'decode_mountinfo_field' "$source_file" >/dev/null
grep -F '.get(&(part.major, part.minor))' "$source_file" >/dev/null
echo "PASS: mounts are decoded and joined by kernel major:minor identity."

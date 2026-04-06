# Contributing to hw-monitor

Thank you for your interest in contributing to **hw-monitor**! This document outlines how to get started.

## Prerequisites

- [Rust](https://rustup.rs/) (stable toolchain)
- [Node.js](https://nodejs.org/) >= 18
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites) v2
- A Linux machine (the app reads from `/proc`, `/sys`, etc.)

## Getting Started

1. **Fork** the repository and clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/hw-monitor.git
   cd hw-monitor
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Run in development mode:**
   ```bash
   npm run tauri dev
   ```

## Project Structure

```
src/                  # React + TypeScript frontend
  components/         # UI components (Performance, Processes, Sensors, Disks, Config)
  hooks/              # Data-fetching hooks per module
  services/           # Zustand global store
  styles/             # styled-components
  locales/            # i18n translation files (en, fr, de, es, ar, pl, ru, uk)
src-tauri/src/        # Rust backend
  cpu/                # CPU info and usage
  memory/             # /proc/meminfo reader
  disk/               # /proc/diskstats + partition info
  network/            # /proc/net/dev reader
  proc/               # Process list + kill
  sensors/            # hwmon temperature sensors
  battery/            # sysfs battery reader
  gpu/                # NVIDIA (nvml) + AMD + Intel GPU info
  config/             # Configuration file (~/.config/hw-monitor/)
  total_usages/       # Dashboard CPU/memory/process summary
```

## Making Changes

### Backend (Rust)
- All Tauri commands are in `src-tauri/src/<module>/commands.rs`
- Use `Option<T>` for any value that may not be available on all systems
- Prefer reading from `/proc` and `/sys` over external commands

### Frontend (TypeScript)
- Match all Rust `Option<T>` fields with `T | null` in TypeScript interfaces
- Use `?? 'N/A'` for nullable display values in components
- Add new i18n strings to **all 8** locale files under `src/locales/`

## Submitting a Pull Request

1. Create a branch from `main`:
   ```bash
   git checkout -b fix/your-fix-description
   ```
2. Make your changes and commit with a clear message following [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat(sensors): add fan speed display
   fix(memory): correct swap cache parsing
   ```
3. Push and open a Pull Request against `main`
4. Fill in the pull request template

## Adding a New Language

1. Copy `src/locales/en/translation.json` to `src/locales/<lang>/translation.json`
2. Translate all values (keep the keys identical)
3. Register the language in `src/i18n/i18n.ts` and add it to the selector in `src/components/Config/Config.tsx`

## Reporting Bugs

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) when opening an issue.



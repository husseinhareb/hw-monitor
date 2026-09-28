# Contributing to hw-monitor

Thank you for your interest in contributing to **hw-monitor**! This document outlines how to get started.

## Prerequisites

- [Rust](https://rustup.rs/) (stable toolchain)
- [Node.js](https://nodejs.org/) 20.19, or 22.12 and newer (required by Vite)
- The [Tauri v2 system dependencies](https://v2.tauri.app/start/prerequisites/) (the Tauri CLI itself comes with `npm install`)
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
  components/         # One folder per page: Processes, Performance, Sensors, Disks,
                      # Services, Connections, SystemInfo, Config, plus Graph, Navbar, Misc
  hooks/              # Data-fetching hooks per page
  helpers/            # Pure formatting and table helpers (with tests)
  services/           # Zustand stores
  styles/             # styled-components
  locales/            # i18n translation files (en, fr, de, es, ar, pl, ru, uk)
  bindings.ts         # Generated from the Rust command types, do not edit
src-tauri/src/        # Rust backend, one module per area
  cpu/ memory/ gpu/   # CPU, memory and GPU (NVML for NVIDIA, sysfs for AMD and Intel)
  disk/ smart/        # Disks, partitions and SMART data
  network/            # Interfaces and throughput
  connections/        # Sockets from /proc/net with owners and GeoIP countries
  proc/ proc_icon.rs  # Processes, priority, affinity, kill, and app icons
  sensors/ battery/   # hwmon sensors and batteries
  services/ startup/  # systemd services (actions via polkit) and startup apps
  system_info/        # System Info page
  config/             # Configuration file (~/.config/hw-monitor/)
  total_usages/       # CPU, memory and process totals
src-tauri/tests/      # Backend integration tests
scripts/              # Bindings generator, theme checker, screenshot tool
```

## Making Changes

### Backend (Rust)
- All Tauri commands are in `src-tauri/src/<module>/commands.rs`
- Use `Option<T>` for any value that may not be available on all systems
- Prefer reading from `/proc` and `/sys` over external commands

### Frontend (TypeScript)
- Types for command results come from `src/bindings.ts`, which `npm run dev` and `npm run build` regenerate from the Rust models; never edit it by hand
- Use `?? 'N/A'` for nullable display values in components
- Add new i18n strings to **all 8** locale files under `src/locales/`

### Checks
CI runs these on every push; run them before opening a pull request:

```bash
npm run check:bindings && npm run check:themes && npm run typecheck && npm run lint && npm test
cd src-tauri && cargo fmt --check && cargo clippy --all-targets --all-features -- -D warnings && cargo test
```

`npm run screenshots` captures every page with real data from your machine, which helps when reviewing UI changes.

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



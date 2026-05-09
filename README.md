# hw-monitor

hw-monitor is a Linux desktop application designed to monitor various aspects of your computer's hardware. Built with the Tauri framework, it pairs a Rust backend with a TypeScript / React frontend.

## Description

The app is organised around five main sections:

### Processes

Detailed information about each process running on the machine. Processes can be sorted, searched, and viewed as a flat list or a hierarchical tree. Each process displays its own icon fetched from installed `.desktop` files. The columns shown:

- User
- PID
- PPID
- Name
- State
- Memory Usage
- CPU Usage
- Total Disk Read
- Total Disk Write
- Disk Read Speed
- Disk Write Speed

![Processes](https://github.com/user-attachments/assets/19b84674-fcce-4d42-9e9f-eb39136df9f7)

### Performance

Live graphs of key hardware components — CPU, RAM, GPU, disks, and network interfaces — with full detail panels next to each graph.

#### CPU

Name, socket, core / thread / live-thread counts, base / current / maximum speed, virtualisation flag, VM / hypervisor detection, uptime, temperature, and per-level cache sizes (L1d, L1i, L2, L3).

![CPU](https://github.com/user-attachments/assets/88d6b300-c4bf-4af5-96f9-2706ba08fc40)

#### Memory

Live totals (total, free, available, cached, active, swap) plus hardware information read via `udevadm` — no root required:

- **Speed** — configured transfer speed in MT/s
- **Slots Used** — populated vs total memory slots
- **Form Factor** — e.g. SODIMM, DIMM
- **Type** — e.g. DDR4, DDR5

![Memory](https://github.com/user-attachments/assets/e923d001-1cd7-4735-9ce2-cfc1b96e93cb)

#### GPU

NVIDIA cards via NVML and AMD cards via sysfs: name, driver version, memory totals, temperature, utilisation, clock speed, wattage, fan speed, performance state.

![GPU](https://github.com/user-attachments/assets/e13d7ee5-ad4b-45c9-8a52-b065f4d64bd4)

#### Network

Per-interface upload / download speeds, totals transferred, MAC, IPv4 / IPv6 addresses, link speed, connection state, interface type, WiFi signal strength, and RX / TX errors and drops. Virtual interfaces are hidden by default and can be toggled from the config panel.

![Network](https://github.com/user-attachments/assets/3431f04a-3697-4332-8d01-23019aa2dba3)

### Sensors

Every sensor exposed under `/sys/class/hwmon` is auto-detected and grouped by chip. Each sensor row shows its current reading, an optional heat bar relative to its critical threshold, and a status badge (normal / warning / critical).

For each individual sensor you can:

- open a **live graph modal** plotting recent history;
- override the displayed **label**;
- set custom **warning** and **critical** thresholds;
- **hide** the sensor (toggle "Show hidden" in the toolbar to see hidden ones again).

On laptops, a battery box surfaces cycle count, technology, energy, time-to-full / time-to-empty, temperature, state-of-health, and current charge.

![Sensors](https://github.com/user-attachments/assets/6892ef7f-2343-4882-86dc-6ec7a67df6a8)

### Disks

A `lsblk`-style tree of disks and partitions, with a usage bar for each mounted partition. Live per-disk read / write speeds and IOPS update alongside the layout.

Selecting a disk opens a **details modal** with the full picture pulled from `/sys/block`:

- model, vendor, serial, firmware revision, WWID, transport;
- queue parameters (depth, schedulers, read-ahead, max sectors, write cache, FUA, DAX, zoned);
- discard / TRIM behaviour;
- aggregate I/O counters and queue stats;
- **SMART data** for both ATA and NVMe drives — overall health, attribute table, power-on hours, temperature, reallocated / pending / uncorrectable sectors (ATA) and critical warnings, available spare, percentage used, power cycles, unsafe shutdowns, media errors, data units read / written (NVMe).

![Disks](https://github.com/user-attachments/assets/5dcc2261-2e00-4eb3-89bd-c73a63d8c819)

### Services

Lists all systemd services on the system with their load state, active state, sub-state, and unit-file state. Services can be searched and sorted by any column.

Selecting a service reveals an action bar with **Start**, **Stop**, and **Restart**. Performing any action opens an in-app password dialog — no terminal required. The password is passed only to `sudo -S systemctl` for the requested action, is not stored by hw-monitor, and errors (including a wrong password) surface directly in the UI.

## Multilingual Support

The application ships with eight languages: Arabic, German, English, Spanish, French, Polish, Russian, and Ukrainian. Switch from the configuration panel.

![Languages](https://github.com/user-attachments/assets/e7b1fae4-9929-43e5-87d5-157ac4c36094)

## Themes

Three presets bundle with the app and can be switched from the config panel:

- **Default** — neutral dark slate
- **Catppuccin** — Mocha palette
- **Gruvbox** — classic warm dark

![Catppuccin](https://github.com/user-attachments/assets/035d8c1c-1dbb-46b9-a1b9-60927b05ef61)
![Catppuccin – performance](https://github.com/user-attachments/assets/5e55ce4e-804d-481f-a5f8-4f6abaf19476)
![Gruvbox](https://github.com/user-attachments/assets/cfdb6f44-2470-49da-88fe-add741904988)
![Gruvbox – performance](https://github.com/user-attachments/assets/87e0bbce-d9dc-492f-aaeb-7301115366d0)

Every individual colour, update interval, and visible table column is editable from the config panel — the in-app picker is the source of truth, and edits persist to `~/.config/hw-monitor/hw-monitor.conf`. The bundled presets live in `src/components/Config/themes.ts`; new presets added there are validated automatically by `npm run check:themes` (palette completeness, valid hex values, monotonic heatbar gradient, foreground / background contrast).

## Configuration

The app creates a configuration file at startup at `~/.config/hw-monitor/hw-monitor.conf`. It can be managed via the built-in GUI or edited by hand. The config persists:

- every section's colour palette;
- per-section update intervals;
- the visible Processes columns;
- the selected language;
- per-sensor preferences — hidden IDs, custom labels, custom warning / critical thresholds;
- the "show virtual network interfaces" toggle.

![Config panel](https://github.com/user-attachments/assets/37c15497-36bc-4d23-bf83-0811780e7cc7)
![Config panel – colours](https://github.com/user-attachments/assets/aec3639a-c2e9-4b22-ba21-48f2c6799bd6)

## Installation

### Arch Linux (AUR)

```bash
git clone https://aur.archlinux.org/hw-monitor.git
cd hw-monitor
makepkg -si
```

Or with an AUR helper:

```bash
yay -S hw-monitor
```

### Debian / Ubuntu

Download the `.deb` package from the [releases page](https://github.com/husseinhareb/hw-monitor/releases) and install it:

```bash
sudo dpkg -i hw-monitor_<version>_amd64.deb
sudo apt-get install -f   # resolve any missing dependencies
```

### Resolving Dependency Errors

If the app fails to start with a missing shared-library error such as:

```
error while loading shared libraries: libjavascriptcoregtk-4.1.so
```

install the WebKit2GTK 4.1 package for your distribution:

| Distribution | Command |
|---|---|
| Arch Linux | `sudo pacman -S webkit2gtk-4.1` |
| Debian / Ubuntu | `sudo apt install libwebkit2gtk-4.1-dev` |
| Fedora / RHEL | `sudo dnf install webkit2gtk4.1-devel` |
| Gentoo | `sudo emerge --ask net-libs/webkit-gtk:4.1` |
| Void Linux | `sudo xbps-install -S webkit2gtk-devel` |

### Fixing NVIDIA GPU Errors

If you use an NVIDIA GPU and encounter errors like:

```
GBM-DRV error (nv_gbm_create_device_native): nv_common_gbm_create_device failed
Failed to create GBM buffer of size 800x600: Permission denied
```

add these environment variables to your shell config (`.bashrc`, `.zshrc`, or `config.fish`):

```bash
export WEBKIT_DISABLE_DMABUF_RENDERER=1
export LIBGL_ALWAYS_SOFTWARE=1
export QT_XCB_FORCE_SOFTWARE_OPENGL=1
```

For fish:

```fish
set -Ux WEBKIT_DISABLE_DMABUF_RENDERER 1
set -Ux LIBGL_ALWAYS_SOFTWARE 1
set -Ux QT_XCB_FORCE_SOFTWARE_OPENGL 1
```

## Building from Source

1. **Clone the repository**:

    ```bash
    git clone https://github.com/husseinhareb/hw-monitor
    cd hw-monitor
    ```

2. **Install frontend dependencies**:

    ```bash
    npm install
    ```

3. **Run in development mode** (auto-regenerates the Rust → TS bindings):

    ```bash
    npm run tauri dev
    ```

4. **Build a release binary**:

    ```bash
    npm run tauri build
    ```

### Developer scripts

- `npm run check:bindings` — verify `src/bindings.ts` is in sync with the Rust command models.
- `npm run check:themes` — validate the bundled theme presets (palette completeness, valid hex, monotonic heatbar gradient, foreground / background contrast).

## Changelog

### Unreleased

- **feat**: per-sensor live graph modal with recent-history plotting
- **feat**: per-sensor controls — hide / show, custom label, custom warning / critical thresholds
- **feat**: disk details modal with full `/sys/block` metadata, queue parameters, and live I/O counters
- **feat**: SMART data for ATA and NVMe drives (health, attributes, power-on hours, temperature, wear)
- **feat**: theme-integrity validator (`npm run check:themes`) wired into CI
- **fix**: re-tuned Catppuccin and Gruvbox heatbars to be strictly monotonic and palette-correct
- **fix**: Gruvbox contrast bumped on title / value / disk-name colours
- **fix**: sensor graph modal now follows the configured foreground / title colours
- **fix**: disk details modal width widened for readability

### v0.3.1
- **fix**: memory hardware info (speed, slots, form factor, type) now reads via `udevadm info` — no root required
- **fix**: services start / stop / restart errors are now properly surfaced in the UI
- **fix**: process icons now visible in production builds (CSP `data:` URI fix)
- **feat**: GUI password dialog for service management — no terminal prompt needed

### v0.0.3
- **feat**: Services section — list, search, sort, start / stop / restart systemd services
- **feat**: memory hardware info panel (speed, slots used, form factor, type)
- **feat**: CPU details — live thread count, VM / hypervisor detection, cache sizes
- **feat**: theme selector in config panel (Default, Catppuccin, Gruvbox)
- **fix**: unknown config keys are skipped instead of crashing
- **fix**: i18n fully awaited before first render
- **fix**: responsive graph height and config dropdown layout

### v0.0.2
- **feat**: multilingual support (Arabic, German, English, Spanish, French, Polish, Russian, Ukrainian)
- **feat**: process tree view
- **feat**: per-core CPU graphs
- **feat**: GPU monitoring (NVIDIA via NVML, AMD via sysfs)
- **feat**: disk performance graphs

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Submit a pull request.

Please run `npm run check:bindings` and `npm run check:themes` before opening a PR — both are enforced in CI alongside `cargo fmt --check`, `cargo clippy -D warnings`, and `cargo test`.

## Licence

This project is licensed under the [MIT License](https://github.com/husseinhareb/hw-monitor/blob/main/LICENSE).

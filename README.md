# hw-monitor

hw-monitor is a Linux desktop application designed to monitor various aspects of your computer's hardware. Built using the Tauri framework, it features a Rust backend and a TypeScript frontend utilizing the React library.

## Description

The software covers six main sections of monitoring:

### Processes

The Processes section provides detailed information about each process running on your Linux machine. Processes can be sorted, searched, and viewed as a flat list or a hierarchical tree. Each process displays its own icon fetched from installed `.desktop` files. The information monitored includes:

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

![2024-08-28-124434_1295x902_scrot](https://github.com/user-attachments/assets/19b84674-fcce-4d42-9e9f-eb39136df9f7)

### Performance

The Performance page displays live graphs of key hardware component usage: CPU, RAM, GPU, disks, and network cards. In addition to graphs, it provides detailed information for each hardware component including CPU speed, core/thread/socket counts, uptime, RAM and swap usage, and more.

#### CPU
![2024-08-28-124603_1226x956_scrot](https://github.com/user-attachments/assets/88d6b300-c4bf-4af5-96f9-2706ba08fc40)

#### Memory

The Memory section now includes hardware information read directly from the system without requiring root access:

- **Speed** — configured transfer speed in MT/s
- **Slots Used** — populated vs total memory slots
- **Form Factor** — e.g. SODIMM, DIMM
- **Type** — e.g. DDR4, DDR5

![2024-08-28-124630_1225x955_scrot](https://github.com/user-attachments/assets/e923d001-1cd7-4735-9ce2-cfc1b96e93cb)

#### GPU
![2024-08-28-124643_1223x953_scrot](https://github.com/user-attachments/assets/e13d7ee5-ad4b-45c9-8a52-b065f4d64bd4)

#### Network
![2024-08-28-143706_1190x913_scrot](https://github.com/user-attachments/assets/3431f04a-3697-4332-8d01-23019aa2dba3)

### Sensors

The Sensors page displays all sensors detected by the software. For laptops, it includes a battery box with comprehensive information. It also shows all detected temperature sensors with a heat bar.

![sensors](https://github.com/user-attachments/assets/6892ef7f-2343-4882-86dc-6ec7a67df6a8)

### Disks

The Disks page shows the disks and partitions detected by the Linux kernel, similar to the output of `lsblk`. Additionally, it displays the usage of mounted partitions.

![disks](https://github.com/user-attachments/assets/5dcc2261-2e00-4eb3-89bd-c73a63d8c819)

### Services

The Services section lists all systemd services on the system with their current state (load, active, sub-state, and enabled status). Services can be searched and sorted by any column.

Selecting a service reveals a bottom action bar with **Start**, **Stop**, and **Restart** buttons. Performing any action opens an in-app password dialog — no terminal required. The password is passed to `sudo -S systemctl` and errors (including wrong password) are reported directly in the UI.

### Performance — CPU details

The CPU section now also shows:
- Live thread count
- VM/hypervisor detection
- Per-level cache sizes (L1d, L1i, L2, L3)


## Multilingual Support

The application supports eight languages: Arabic, German, English, Spanish, French, Polish, Russian, and Ukrainian. The language can be changed from the configuration panel.

![2024-08-28-144327_1189x913_scrot](https://github.com/user-attachments/assets/e7b1fae4-9929-43e5-87d5-157ac4c36094)

## Configuration

The software creates a configuration file at startup in `~/.config/hw-monitor/hw-monitor.conf`. It can be managed via the built-in GUI or edited manually with a text editor. The config stores color values, update intervals, visible table columns, and the selected language.

![swappy-20240712_184821](https://github.com/user-attachments/assets/37c15497-36bc-4d23-bf83-0811780e7cc7)
![swappy-20240712_184728](https://github.com/user-attachments/assets/aec3639a-c2e9-4b22-ba21-48f2c6799bd6)

### Catppuccin Theme

![swappy-20240712_192709](https://github.com/user-attachments/assets/035d8c1c-1dbb-46b9-a1b9-60927b05ef61)
![2024-08-28-144604_1187x913_scrot](https://github.com/user-attachments/assets/5e55ce4e-804d-481f-a5f8-4f6abaf19476)

```shell
##################
### processes ###
#################
processes_update_time=2000
processes_body_background_color=#1E1E2E
processes_body_color=#CDD6F4
processes_head_background_color=#313244
processes_head_color=#CDD6F4
processes_table_values=user,pid,ppid,name,state,cpu_usage,memory
processes_border_color=#313244
processes_tree_toggle_color=#6C7086
processes_monitor_border_color=#585B70

####################
### performance ###
###################
performance_update_time=1000
performance_sidebar_background_color=#313244
performance_sidebar_color=#CDD6F4
performance_sidebar_selected_color=#74C7EC
performance_background_color=#1E1E2E
performance_title_color=#F38BA8
performance_label_color=#A6E3A1
performance_value_color=#89B4FA
performance_graph_color=#A6E3A1
performance_sec_graph_color=#FAB387
performance_scrollbar_color=#6C7086

################
### sensors ###
###############
sensors_update_time=5000
sensors_background_color=#1E1E2E
sensors_foreground_color=#CDD6F4
sensors_boxes_background_color=#313244
sensors_boxes_foreground_color=#A6ADC8
sensors_battery_background_color=#7dcfff
sensors_battery_frame_color=#45475A
sensors_battery_case_color=#11111B
sensors_boxes_title_foreground_color=#BAC2DE

##############
### disks ###
#############
disks_update_time=5000
disks_background_color=#1E1E2E
disks_boxes_background_color=#313244
disks_name_foreground_color=#89B4FA
disks_size_foreground_color=#89DCEB
disks_partition_background_color=#181825
disks_partition_usage_background_color=#3b3b52
disks_partition_name_foreground_color=#A6ADC8
disks_partition_type_foreground_color=#A6ADC8
disks_partition_usage_foreground_color=#A6E3A1

###############
### navbar ###
##############
navbar_background_color=#1E1E2E
navbar_buttons_background_color=#313244
navbar_buttons_foreground_color=#CDD6F4
navbar_search_background_color=#313244
navbar_search_foreground_color=#CDD6F4

################
### heatbar ###
###############
heatbar_color_one=#7aa2f7
heatbar_color_two=#7dcfff
heatbar_color_three=#9ece6a
heatbar_color_four=#ff9e64
heatbar_color_five=#f7768e
heatbar_color_six=#e0af68
heatbar_color_seven=#bb9af7
heatbar_color_eight=#7aa2f7
heatbar_color_nine=#2ac3de
heatbar_color_ten=#a9b1d6
heatbar_background_color=#313244

#####################
### config panel ###
####################
config_background_color=#1E1E2E
config_container_background_color=#313244
config_input_background_color=#45475A
config_input_border_color=#585B70
config_button_background_color=#F38BA8
config_button_foreground_color=#1E1E2E
config_text_color=#CDD6F4
language=en
```

### Gruvbox Theme

![2024-08-28-144813_1188x913_scrot](https://github.com/user-attachments/assets/cfdb6f44-2470-49da-88fe-add741904988)
![2024-08-28-144754_1188x914_scrot](https://github.com/user-attachments/assets/87e0bbce-d9dc-492f-aaeb-7301115366d0)

```shell
##################
### processes ###
#################
processes_update_time=2000
processes_body_background_color=#282828
processes_body_color=#ebdbb2
processes_head_background_color=#3c3836
processes_head_color=#ebdbb2
processes_table_values=user,pid,ppid,name,state,cpu_usage,memory
processes_border_color=#504945
processes_tree_toggle_color=#928374
processes_monitor_border_color=#665c54

####################
### performance ###
###################
performance_update_time=1000
performance_sidebar_background_color=#3c3836
performance_sidebar_color=#ebdbb2
performance_sidebar_selected_color=#458588
performance_background_color=#282828
performance_title_color=#cc241d
performance_label_color=#98971a
performance_value_color=#458588
performance_graph_color=#98971a
performance_sec_graph_color=#d65d0e
performance_scrollbar_color=#928374

################
### sensors ###
###############
sensors_update_time=5000
sensors_background_color=#282828
sensors_foreground_color=#ebdbb2
sensors_boxes_background_color=#3c3836
sensors_boxes_foreground_color=#928374
sensors_battery_background_color=#689d6a
sensors_battery_frame_color=#45475A
sensors_battery_case_color=#1d2021
sensors_boxes_title_foreground_color=#928374

##############
### disks ###
#############
disks_update_time=5000
disks_background_color=#282828
disks_boxes_background_color=#3c3836
disks_name_foreground_color=#458588
disks_size_foreground_color=#689d6a
disks_partition_background_color=#1d2021
disks_partition_usage_background_color=#504945
disks_partition_name_foreground_color=#928374
disks_partition_type_foreground_color=#928374
disks_partition_usage_foreground_color=#98971a

###############
### navbar ###
##############
navbar_background_color=#282828
navbar_buttons_background_color=#3c3836
navbar_buttons_foreground_color=#ebdbb2
navbar_search_background_color=#3c3836
navbar_search_foreground_color=#ebdbb2

################
### heatbar ###
###############
heatbar_color_one=#cc241d
heatbar_color_two=#d65d0e
heatbar_color_three=#d79921
heatbar_color_four=#689d6a
heatbar_color_five=#458588
heatbar_color_six=#b16286
heatbar_color_seven=#689d6a
heatbar_color_eight=#458588
heatbar_color_nine=#98971a
heatbar_color_ten=#928374
heatbar_background_color=#3c3836

#####################
### config panel ###
####################
config_background_color=#282828
config_container_background_color=#3c3836
config_input_background_color=#504945
config_input_border_color=#665c54
config_button_background_color=#d65d0e
config_button_foreground_color=#282828
config_text_color=#ebdbb2
language=en
```

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

If you encounter a missing shared library error such as:

```
error while loading shared libraries: libjavascriptcoregtk-4.0.so-18
```

Install the appropriate package for your distribution:

| Distribution | Command |
|---|---|
| Arch Linux | `sudo pacman -S webkit2gtk` |
| Debian/Ubuntu | `sudo apt install libwebkit2gtk-4.0-dev` |
| Fedora/RHEL | `sudo dnf install webkit2gtk4.0-devel` |
| Gentoo | `sudo emerge --ask net-libs/webkit-gtk:4` |
| Void Linux | `sudo xbps-install -S webkit2gtk-devel` |

### Fixing Nvidia GPU Errors

If you use an Nvidia GPU and encounter errors like:

```
GBM-DRV error (nv_gbm_create_device_native): nv_common_gbm_create_device failed
Failed to create GBM buffer of size 800x600: Permission denied
```

Add these environment variables to your shell config (`.bashrc`, `.zshrc`, or `config.fish`):

```bash
export WEBKIT_DISABLE_DMABUF_RENDERER=1
export LIBGL_ALWAYS_SOFTWARE=1
export QT_XCB_FORCE_SOFTWARE_OPENGL=1
```

For fish shell:

```bash
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

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Run in development mode**:

    ```bash
    npm run tauri dev
    ```

4. **Build a release binary**:

    ```bash
    npm run tauri build
    ```

## Changelog

### v0.3.1
- **fix**: memory hardware info (speed, slots, form factor, type) now reads via `udevadm info` — no root required
- **fix**: services start/stop/restart errors are now properly surfaced in the UI
- **fix**: process icons now visible in production builds (CSP `data:` URI fix)
- **feat**: GUI password dialog for service management — no terminal prompt needed

### v0.0.3
- **feat**: Services section — list, search, sort, start/stop/restart systemd services
- **feat**: memory hardware info panel (speed, slots used, form factor, type)
- **feat**: CPU details — live thread count, VM/hypervisor detection, cache sizes
- **feat**: theme selector in config panel (Default, Catppuccin, Gruvbox)
- **fix**: unknown config keys are skipped instead of crashing
- **fix**: i18n fully awaited before first render
- **fix**: responsive graph height and config dropdown layout

### v0.0.2
- **feat**: multilingual support (Arabic, German, English, Spanish, French, Polish, Russian, Ukrainian)
- **feat**: process tree view
- **feat**: per-core CPU graphs
- **feat**: GPU monitoring (NVIDIA via nvml, AMD via sysfs)
- **feat**: disk performance graphs

## Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the repository.
2. Create your branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Submit a pull request.

## Licence

This project is licensed under the [MIT License](https://github.com/husseinhareb/hw-monitor/blob/main/LICENSE).


### Processes

The Processes section provides detailed information about each process running on your Linux machine. The processes can be sorted for better readability and usage monitoring, or you can search for them using the search bar. The information monitored includes:

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

![2024-08-28-124434_1295x902_scrot](https://github.com/user-attachments/assets/19b84674-fcce-4d42-9e9f-eb39136df9f7)

### Performance

The Performance page mainly displays graphs of key hardware component usage, such as CPU, RAM,GPU and network cards. In addition to graphs, it provides detailed information for each hardware component, including CPU speed, number of cores, threads, sockets, uptime, RAM and swap information, and more, as shown in the pictures below:

### CPU
![2024-08-28-124603_1226x956_scrot](https://github.com/user-attachments/assets/88d6b300-c4bf-4af5-96f9-2706ba08fc40)

### Memory
![2024-08-28-124630_1225x955_scrot](https://github.com/user-attachments/assets/e923d001-1cd7-4735-9ce2-cfc1b96e93cb)

### GPU
![2024-08-28-124643_1223x953_scrot](https://github.com/user-attachments/assets/e13d7ee5-ad4b-45c9-8a52-b065f4d64bd4)

### Network
![2024-08-28-143706_1190x913_scrot](https://github.com/user-attachments/assets/3431f04a-3697-4332-8d01-23019aa2dba3)


### Sensors

The Sensors page displays all sensors detected by the software. For laptops, it includes a battery box with comprehensive information. Additionally, it shows all detected temperature sensors with a heat bar, as shown below:

![sensors](https://github.com/user-attachments/assets/6892ef7f-2343-4882-86dc-6ec7a67df6a8)

### Disks

The Disks page shows the disks and partitions detected by the Linux kernel, similar to the output of `lsblk`. Additionally, it displays the usage of mounted partitions, as shown below:

![disks](https://github.com/user-attachments/assets/5dcc2261-2e00-4eb3-89bd-c73a63d8c819)


## Multilingual Support

The application now includes comprehensive multilingual support, allowing users to choose from eight different languages: Arabic, German, English, Spanish, French, Polish, Russian, and Ukrainian.

![2024-08-28-144327_1189x913_scrot](https://github.com/user-attachments/assets/e7b1fae4-9929-43e5-87d5-157ac4c36094)

## Configuration

The software also contains a configuration file that is created at startup inside `~/.config/hw-monitor` under the name `hw-monitor.conf`. This file can be managed from the software via a GUI, as shown below, or by editing the file using a text editor. The config file contains a group of color values and other settings such as update times. The software loads its default configuration, but all component colors, buttons, and shapes can be edited for maximum customizability and user-driven experience.

![swappy-20240712_184821](https://github.com/user-attachments/assets/37c15497-36bc-4d23-bf83-0811780e7cc7)
![swappy-20240712_184728](https://github.com/user-attachments/assets/aec3639a-c2e9-4b22-ba21-48f2c6799bd6)

### Catpuccin Alike Theme

Along with the default configuration, there is another beautiful theme that has a palette similar to Catpuccin.
![swappy-20240712_192709](https://github.com/user-attachments/assets/035d8c1c-1dbb-46b9-a1b9-60927b05ef61)
![2024-08-28-144604_1187x913_scrot](https://github.com/user-attachments/assets/5e55ce4e-804d-481f-a5f8-4f6abaf19476)

```shell
# Catpuccin Theme

##################
### processes ###
#################
processes_update_time=2000
processes_body_background_color=#1E1E2E
processes_body_color=#CDD6F4
processes_head_background_color=#313244
processes_head_color=#CDD6F4
processes_table_values=user,pid,ppid,name,state,cpu_usage,memory
processes_border_color=#313244
processes_tree_toggle_color=#6C7086
processes_monitor_border_color=#585B70

####################
### performance ###
###################
performance_update_time=1000
performance_sidebar_background_color=#313244
performance_sidebar_color=#CDD6F4
performance_sidebar_selected_color=#74C7EC
performance_background_color=#1E1E2E
performance_title_color=#F38BA8
performance_label_color=#A6E3A1
performance_value_color=#89B4FA
performance_graph_color=#A6E3A1
performance_sec_graph_color=#FAB387
performance_scrollbar_color=#6C7086

################
### sensors ###
###############
sensors_update_time=5000
sensors_background_color=#1E1E2E
sensors_foreground_color=#CDD6F4
sensors_boxes_background_color=#313244
sensors_boxes_foreground_color=#A6ADC8
sensors_battery_background_color=#7dcfff
sensors_battery_frame_color=#45475A
sensors_battery_case_color=#11111B
sensors_boxes_title_foreground_color=#BAC2DE

##############
### disks ###
#############
disks_update_time=5000
disks_background_color=#1E1E2E
disks_boxes_background_color=#313244
disks_name_foreground_color=#89B4FA
disks_size_foreground_color=#89DCEB
disks_partition_background_color=#181825
disks_partition_usage_background_color=#3b3b52
disks_partition_name_foreground_color=#A6ADC8
disks_partition_type_foreground_color=#A6ADC8
disks_partition_usage_foreground_color=#A6E3A1

###############
### navbar ###
##############
navbar_background_color=#1E1E2E
navbar_buttons_background_color=#313244
navbar_buttons_foreground_color=#CDD6F4
navbar_search_background_color=#313244
navbar_search_foreground_color=#CDD6F4

################
### heatbar ###
###############
heatbar_color_one=#7aa2f7
heatbar_color_two=#7dcfff
heatbar_color_three=#9ece6a
heatbar_color_four=#ff9e64
heatbar_color_five=#f7768e
heatbar_color_six=#e0af68
heatbar_color_seven=#bb9af7
heatbar_color_eight=#7aa2f7
heatbar_color_nine=#2ac3de
heatbar_color_ten=#a9b1d6
heatbar_background_color=#313244

#####################
### config panel ###
####################
config_background_color=#1E1E2E
config_container_background_color=#313244
config_input_background_color=#45475A
config_input_border_color=#585B70
config_button_background_color=#F38BA8
config_button_foreground_color=#1E1E2E
config_text_color=#CDD6F4
language=en
```
### Gruvbox Alike Theme

![2024-08-28-144813_1188x913_scrot](https://github.com/user-attachments/assets/cfdb6f44-2470-49da-88fe-add741904988)
![2024-08-28-144754_1188x914_scrot](https://github.com/user-attachments/assets/87e0bbce-d9dc-492f-aaeb-7301115366d0)


```shell
##################
### processes ###
#################
processes_update_time=2000
processes_body_background_color=#282828
processes_body_color=#ebdbb2
processes_head_background_color=#3c3836
processes_head_color=#ebdbb2
processes_table_values=user,pid,ppid,name,state,cpu_usage,memory
processes_border_color=#504945
processes_tree_toggle_color=#928374
processes_monitor_border_color=#665c54

####################
### performance ###
###################
performance_update_time=1000
performance_sidebar_background_color=#3c3836
performance_sidebar_color=#ebdbb2
performance_sidebar_selected_color=#458588
performance_background_color=#282828
performance_title_color=#cc241d
performance_label_color=#98971a
performance_value_color=#458588
performance_graph_color=#98971a
performance_sec_graph_color=#d65d0e
performance_scrollbar_color=#928374

################
### sensors ###
###############
sensors_update_time=5000
sensors_background_color=#282828
sensors_foreground_color=#ebdbb2
sensors_boxes_background_color=#3c3836
sensors_boxes_foreground_color=#928374
sensors_battery_background_color=#689d6a
sensors_battery_frame_color=#45475A
sensors_battery_case_color=#1d2021
sensors_boxes_title_foreground_color=#928374

##############
### disks ###
#############
disks_update_time=5000
disks_background_color=#282828
disks_boxes_background_color=#3c3836
disks_name_foreground_color=#458588
disks_size_foreground_color=#689d6a
disks_partition_background_color=#1d2021
disks_partition_usage_background_color=#504945
disks_partition_name_foreground_color=#928374
disks_partition_type_foreground_color=#928374
disks_partition_usage_foreground_color=#98971a

###############
### navbar ###
##############
navbar_background_color=#282828
navbar_buttons_background_color=#3c3836
navbar_buttons_foreground_color=#ebdbb2
navbar_search_background_color=#3c3836
navbar_search_foreground_color=#ebdbb2

################
### heatbar ###
###############
heatbar_color_one=#cc241d
heatbar_color_two=#d65d0e
heatbar_color_three=#d79921
heatbar_color_four=#689d6a
heatbar_color_five=#458588
heatbar_color_six=#b16286
heatbar_color_seven=#689d6a
heatbar_color_eight=#458588
heatbar_color_nine=#98971a
heatbar_color_ten=#928374
heatbar_background_color=#3c3836

#####################
### config panel ###
####################
config_background_color=#282828
config_container_background_color=#3c3836
config_input_background_color=#504945
config_input_border_color=#665c54
config_button_background_color=#d65d0e
config_button_foreground_color=#282828
config_text_color=#ebdbb2
language=en
```

## Installation Guide
#### Step 1: Download the App

You can download the app from the release page or build it yourself by following the instructions in the repository.
#### Step 2: Resolving Dependency Errors

While running the app, you might encounter an error related to missing shared libraries, such as:

```
error while loading shared libraries: libjavascriptcoregtk-4.0.so-18
```
To resolve this, install the appropriate package for your Linux distribution:
- Arch Linux
```bash
sudo pacman -S webkit2gtk
```

- Debian/Ubuntu
```bash
sudo apt install libwebkit2gtk-4.0-dev
```
- Fedora/RHEL

```bash
sudo dnf install webkit2gtk4.0-devel
```

- Gentoo
```bash
sudo emerge --ask net-libs/webkit-gtk:4
```
- Void Linux

```bash
sudo xbps-install -S webkit2gtk-devel
```
### Step 3: Fixing Nvidia GPU Errors

If you are using an Nvidia GPU and encounter errors such as:

```bash
src/nv_gbm.c:300: GBM-DRV error (nv_gbm_create_device_native): nv_common_gbm_create_device failed (ret=-1)
KMS: DRM_IOCTL_MODE_CREATE_DUMB failed: Permission denied
Failed to create GBM buffer of size 800x600: Permission denied
```
To fix this, add the following environment variables to your shell configuration file (e.g., .bashrc, .zshrc):

```bash
export WEBKIT_DISABLE_DMABUF_RENDERER=1
export LIBGL_ALWAYS_SOFTWARE=1
export QT_XCB_FORCE_SOFTWARE_OPENGL=1
```
for the fish shell
```bash
set -Ux WEBKIT_DISABLE_DMABUF_RENDERER 1
set -Ux LIBGL_ALWAYS_SOFTWARE 1
set -Ux QT_XCB_FORCE_SOFTWARE_OPENGL 1
```
After adding these lines, save the file and run source ~/.bashrc (or source ~/.zshrc depending on your shell) to apply the changes.


### Building Binaries 
Follow these steps to build the app locally:

1. **Clone the repository**:

    ```
    git clone https://github.com/husseinhareb/hw-monitor
    ```

2. **Install dependencies**:

    ```
    cd hw-monitor/
    npm install
    ```

3. **Run the application**:

    ```
    npm run tauri dev
    ```
4. **Build the application**:
  
    ```
    npm run tauri build
    ```

## Contributing

Contributions are welcome! If you'd like to contribute:

    Fork the repository.
    Create your branch: git checkout -b feature/YourFeature.
    Commit your changes: git commit -m 'Add some feature'.
    Push to the branch: git push origin feature/YourFeature.
    Submit a pull request.

## Licence

This project is licensed under the [MIT License](https://github.com/husseinhareb/hw-monitor/blob/main/LICENSE).

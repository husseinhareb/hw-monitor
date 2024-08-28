# hw-monitor

hw-monitor is a Linux desktop application designed to monitor various aspects of your computer's hardware. Built using the Tauri framework, it features a Rust backend and a TypeScript frontend utilizing the React library.

## Description

The software covers four main parts of monitoring:

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
![swappy-20240712_203241](https://github.com/user-attachments/assets/242d3fae-cfd4-4256-84e4-3a4b6f79f252)

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
```
### Gruvbox Alike Theme

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
```

## Installation 
You can download the app from the release page or build it yourself 
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

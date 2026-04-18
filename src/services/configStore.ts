import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";
import { notify } from "./store";

type ConfigPrimitive = string | number | boolean | string[];

export interface ConfigData {
  processes_update_time: number;
  processes_body_background_color: string;
  processes_body_color: string;
  processes_head_background_color: string;
  processes_head_color: string;
  processes_table_values: string[];
  processes_border_color: string;
  processes_tree_toggle_color: string;
  processes_monitor_border_color: string;
  performance_update_time: number;
  performance_sidebar_background_color: string;
  performance_sidebar_color: string;
  performance_sidebar_selected_color: string;
  performance_background_color: string;
  performance_title_color: string;
  performance_label_color: string;
  performance_value_color: string;
  performance_graph_color: string;
  performance_sec_graph_color: string;
  performance_scrollbar_color: string;
  sensors_update_time: number;
  sensors_background_color: string;
  sensors_foreground_color: string;
  sensors_boxes_background_color: string;
  sensors_boxes_foreground_color: string;
  sensors_battery_background_color: string;
  sensors_battery_frame_color: string;
  sensors_boxes_title_foreground_color: string;
  sensors_battery_case_color: string;
  disks_update_time: number;
  disks_background_color: string;
  disks_boxes_background_color: string;
  disks_name_foreground_color: string;
  disks_size_foreground_color: string;
  disks_partition_background_color: string;
  disks_partition_usage_background_color: string;
  disks_partition_name_foreground_color: string;
  disks_partition_type_foreground_color: string;
  disks_partition_usage_foreground_color: string;
  navbar_background_color: string;
  navbar_buttons_background_color: string;
  navbar_buttons_foreground_color: string;
  navbar_search_background_color: string;
  navbar_search_foreground_color: string;
  heatbar_color_one: string;
  heatbar_color_two: string;
  heatbar_color_three: string;
  heatbar_color_four: string;
  heatbar_color_five: string;
  heatbar_color_six: string;
  heatbar_color_seven: string;
  heatbar_color_eight: string;
  heatbar_color_nine: string;
  heatbar_color_ten: string;
  heatbar_background_color: string;
  config_background_color: string;
  config_container_background_color: string;
  config_input_background_color: string;
  config_input_border_color: string;
  config_button_background_color: string;
  config_button_foreground_color: string;
  config_text_color: string;
  language: string;
  show_virtual_interfaces: boolean;
}

export const defaultConfig: ConfigData = {
  processes_update_time: 2000,
  processes_body_background_color: "#2d2d2d",
  processes_body_color: "#ffffff",
  processes_head_background_color: "#252526",
  processes_head_color: "#ffffff",
  processes_table_values: ["user", "pid", "ppid", "name", "state", "cpu_usage", "memory"],
  processes_border_color: "#333333",
  processes_tree_toggle_color: "#888888",
  processes_monitor_border_color: "#555555",
  performance_update_time: 1000,
  performance_sidebar_background_color: "#333333",
  performance_sidebar_color: "#ffffff",
  performance_sidebar_selected_color: "#ffffff",
  performance_background_color: "#2d2d2d",
  performance_title_color: "#ffffff",
  performance_label_color: "#6d6d6d",
  performance_value_color: "#ffffff",
  performance_graph_color: "#09ffff",
  performance_sec_graph_color: "#ff6384",
  performance_scrollbar_color: "#888888",
  sensors_update_time: 2000,
  sensors_background_color: "#2b2b2b",
  sensors_foreground_color: "#ffffff",
  sensors_boxes_background_color: "#3a3a3a",
  sensors_boxes_foreground_color: "#ffffff",
  sensors_battery_background_color: "#38e740",
  sensors_battery_frame_color: "#ffffff",
  sensors_boxes_title_foreground_color: "#0088dd",
  sensors_battery_case_color: "#060606",
  disks_update_time: 5000,
  disks_background_color: "#2b2b2b",
  disks_boxes_background_color: "#3a3a3a",
  disks_name_foreground_color: "#ffffff",
  disks_size_foreground_color: "#cccccc",
  disks_partition_background_color: "#4a4a4a",
  disks_partition_usage_background_color: "#2b2b2b",
  disks_partition_name_foreground_color: "#61dafb",
  disks_partition_type_foreground_color: "#a3be8c",
  disks_partition_usage_foreground_color: "#ffcb6b",
  navbar_background_color: "#222222",
  navbar_buttons_background_color: "#f3eae8",
  navbar_buttons_foreground_color: "#212830",
  navbar_search_background_color: "#f3eae8",
  navbar_search_foreground_color: "#212830",
  heatbar_color_one: "#00FF00",
  heatbar_color_two: "#33FF00",
  heatbar_color_three: "#66FF00",
  heatbar_color_four: "#99FF00",
  heatbar_color_five: "#CCFF00",
  heatbar_color_six: "#FFFF00",
  heatbar_color_seven: "#FFCC00",
  heatbar_color_eight: "#FF9900",
  heatbar_color_nine: "#FF6600",
  heatbar_color_ten: "#FF0000",
  heatbar_background_color: "#eeeeee",
  config_background_color: "#2b2b2b",
  config_container_background_color: "#3a3a3a",
  config_input_background_color: "#333333",
  config_input_border_color: "#444444",
  config_button_background_color: "#f3eae8",
  config_button_foreground_color: "#212830",
  config_text_color: "#ffffff",
  language: "en",
  show_virtual_interfaces: false,
};

interface ConfigStoreState {
  config: ConfigData;
  hydrated: boolean;
  hydrating: boolean;
  lastLoadError: string | null;
  hydrate: (force?: boolean) => Promise<ConfigData>;
  persistPartial: (partial: Partial<ConfigData>, command: string) => Promise<void>;
  persistAll: (nextConfig: ConfigData, command?: string) => Promise<void>;
  resetToDefault: () => Promise<void>;
}

let hydratePromise: Promise<ConfigData> | null = null;
let persistQueue: Promise<void> = Promise.resolve();

async function fetchConfigFromBackend() {
  return invoke<ConfigData>("get_configs");
}

function enqueuePersist<T>(task: () => Promise<T>) {
  const nextTask = persistQueue.then(task, task);
  persistQueue = nextTask.then(
    () => undefined,
    () => undefined,
  );
  return nextTask;
}

export const useConfigStore = create<ConfigStoreState>((set, get) => ({
  config: defaultConfig,
  hydrated: false,
  hydrating: false,
  lastLoadError: null,

  hydrate: async (force = false) => {
    if (!force && get().hydrated) {
      return get().config;
    }

    if (!force && hydratePromise) {
      return hydratePromise;
    }

    set({ hydrating: true, lastLoadError: null });

    hydratePromise = fetchConfigFromBackend()
      .then((config) => {
        set({
          config,
          hydrated: true,
          hydrating: false,
          lastLoadError: null,
        });
        return config;
      })
      .catch((error) => {
        const message = String(error);
        set({ hydrating: false, lastLoadError: message });
        notify("error.config_failed");
        throw error;
      })
      .finally(() => {
        hydratePromise = null;
      });

    return hydratePromise;
  },

  persistPartial: async (partial, command) => {
    return enqueuePersist(async () => {
      const previousConfig = get().config;
      const nextConfig = { ...previousConfig, ...partial };

      set({
        config: nextConfig,
        hydrated: true,
        lastLoadError: null,
      });

      try {
        await invoke(command, { configs: partial });
      } catch (error) {
        set((state) => (
          state.config === nextConfig
            ? { config: previousConfig }
            : state
        ));
        notify("error.save_config_failed");
        throw error;
      }
    });
  },

  persistAll: async (nextConfig, command = "set_all_configs") => {
    return enqueuePersist(async () => {
      const previousConfig = get().config;

      set({
        config: nextConfig,
        hydrated: true,
        lastLoadError: null,
      });

      try {
        await invoke(command, { configs: nextConfig });
      } catch (error) {
        set((state) => (
          state.config === nextConfig
            ? { config: previousConfig }
            : state
        ));
        notify("error.save_config_failed");
        throw error;
      }
    });
  },

  resetToDefault: async () => {
    return enqueuePersist(async () => {
      const previousConfig = get().config;

      try {
        await invoke("set_default_config");
        const freshConfig = await fetchConfigFromBackend();
        set({
          config: freshConfig,
          hydrated: true,
          hydrating: false,
          lastLoadError: null,
        });
      } catch (error) {
        set((state) => (
          state.config === previousConfig
            ? state
            : { config: previousConfig }
        ));
        notify("error.config_failed");
        throw error;
      }
    });
  },
}));

export type ConfigSlice<T extends Record<string, ConfigPrimitive>> = {
  config: T;
  hydrated: boolean;
  hydrating: boolean;
  lastLoadError: string | null;
  updateConfig: <K extends keyof T>(key: K, value: T[K]) => Promise<void>;
};

export function pickConfig<T extends keyof ConfigData>(
  config: ConfigData,
  keys: readonly T[],
) {
  return keys.reduce((slice, key) => {
    slice[key] = config[key];
    return slice;
  }, {} as Pick<ConfigData, T>);
}

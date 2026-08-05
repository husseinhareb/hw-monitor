import { describe, it, expect, beforeEach } from "vitest";
import { useStore, notify } from "./store";

describe("Zustand store", () => {
  beforeEach(() => {
    // Reset to initial state before each test
    useStore.setState({
      tick: 0,
      cpu: [],
      cpuCores: [],
      memory: [],
      maxMemory: 0,
      gpuUsages: {},
      totalUsages: { memory: null, cpu: null, processes: null },
      networkInterfaces: [],
      networkSpeeds: {},
      networkFullData: {},
      processSearch: "",
      paused: false,
      notifications: [],
    });
  });

  describe("CPU history", () => {
    it("appends values and caps at 20 entries", () => {
      const { appendCpu } = useStore.getState();
      for (let i = 0; i < 25; i++) appendCpu(i);
      const cpu = useStore.getState().cpu;
      expect(cpu).toHaveLength(20);
      expect(cpu[0]).toBe(5); // oldest retained after 25 pushes
      expect(cpu[19]).toBe(24);
    });

    it("increments tick on each append", () => {
      const { appendCpu } = useStore.getState();
      appendCpu(10);
      appendCpu(20);
      expect(useStore.getState().tick).toBe(2);
    });
  });

  describe("CPU cores", () => {
    it("tracks per-core history independently", () => {
      const { appendCpuCores } = useStore.getState();
      appendCpuCores([30, 50, 70]);
      appendCpuCores([35, 55]);
      const cores = useStore.getState().cpuCores;
      expect(cores).toHaveLength(2); // shrunk from 3 to 2 on second call
      expect(cores[0]).toEqual([30, 35]);
      expect(cores[1]).toEqual([50, 55]);
    });

    it("grows core array when new cores appear", () => {
      const { appendCpuCores } = useStore.getState();
      appendCpuCores([10]);
      appendCpuCores([20, 30, 40]);
      const cores = useStore.getState().cpuCores;
      expect(cores).toHaveLength(3);
      expect(cores[2]).toEqual([40]);
    });
  });

  describe("Memory", () => {
    it("appends and caps memory history at 20", () => {
      const { appendMemory } = useStore.getState();
      for (let i = 0; i < 30; i++) appendMemory(i);
      expect(useStore.getState().memory).toHaveLength(20);
    });

    it("tracks max memory", () => {
      const { setMaxMemory } = useStore.getState();
      setMaxMemory(16384);
      expect(useStore.getState().maxMemory).toBe(16384);
    });
  });

  describe("GPU usage", () => {
    it("tracks per-GPU history keyed by id", () => {
      const { appendGpuUsage } = useStore.getState();
      appendGpuUsage("nvidia-0", 45);
      appendGpuUsage("nvidia-0", 50);
      appendGpuUsage("amd-0", 30);
      const gpu = useStore.getState().gpuUsages;
      expect(gpu["nvidia-0"]).toEqual([45, 50]);
      expect(gpu["amd-0"]).toEqual([30]);
      expect(Object.keys(gpu)).toHaveLength(2);
    });

    it("caps per-GPU history at 20", () => {
      const { appendGpuUsage } = useStore.getState();
      for (let i = 0; i < 25; i++) appendGpuUsage("gpu0", i);
      expect(useStore.getState().gpuUsages["gpu0"]).toHaveLength(20);
    });
  });

  describe("Total usages", () => {
    it("stores total usage snapshot", () => {
      const { setTotalUsages } = useStore.getState();
      setTotalUsages({ memory: 45, cpu: 12, processes: 300 });
      expect(useStore.getState().totalUsages).toEqual({
        memory: 45,
        cpu: 12,
        processes: 300,
      });
    });
  });

  describe("Network", () => {
    it("accepts a static snapshot", () => {
      const { setNetworkSnapshot } = useStore.getState();
      setNetworkSnapshot({
        eth0: {
          download: [100],
          upload: [50],
          totalDownload: 1000,
          totalUpload: 500,
          macAddress: "aa:bb:cc:dd:ee:ff",
          ipv4Addresses: ["192.168.1.2/24"],
          ipv6Addresses: [],
          linkSpeedMbps: 1000,
          connectionState: "connected",
          interfaceType: "ethernet",
          wifiSignalPercent: null,
          wifiSignalDbm: null,
          rxErrors: 0,
          txErrors: 0,
          rxDropped: 0,
          txDropped: 0,
        },
      });
      const state = useStore.getState();
      expect(state.networkInterfaces).toEqual(["eth0"]);
      expect(state.networkSpeeds["eth0"]).toEqual({
        download: [100],
        upload: [50],
      });
    });

    it("accepts a functional updater", () => {
      const { setNetworkSnapshot } = useStore.getState();
      setNetworkSnapshot({});
      setNetworkSnapshot((prev) => ({
        ...prev,
        wlan0: {
          download: [200],
          upload: [100],
          totalDownload: 0,
          totalUpload: 0,
          macAddress: null,
          ipv4Addresses: [],
          ipv6Addresses: [],
          linkSpeedMbps: null,
          connectionState: "up",
          interfaceType: "wifi",
          wifiSignalPercent: 75,
          wifiSignalDbm: -55,
          rxErrors: 0,
          txErrors: 0,
          rxDropped: 0,
          txDropped: 0,
        },
      }));
      expect(useStore.getState().networkInterfaces).toEqual(["wlan0"]);
    });
  });

  describe("Notifications", () => {
    it("adds a notification", () => {
      const { addNotification } = useStore.getState();
      addNotification("error.fetch_failed", "error");
      const notifs = useStore.getState().notifications;
      expect(notifs).toHaveLength(1);
      expect(notifs[0].messageKey).toBe("error.fetch_failed");
      expect(notifs[0].type).toBe("error");
    });

    it("deduplicates by message key", () => {
      const { addNotification } = useStore.getState();
      addNotification("error.fetch_failed");
      addNotification("error.fetch_failed");
      expect(useStore.getState().notifications).toHaveLength(1);
    });

    it("dismisses by id", () => {
      const { addNotification, dismissNotification } = useStore.getState();
      addNotification("error.fetch_failed");
      const id = useStore.getState().notifications[0].id;
      dismissNotification(id);
      expect(useStore.getState().notifications).toHaveLength(0);
    });
  });

  describe("Pause & search", () => {
    it("toggles paused state", () => {
      const { setPaused } = useStore.getState();
      expect(useStore.getState().paused).toBe(false);
      setPaused(true);
      expect(useStore.getState().paused).toBe(true);
    });

    it("sets process search filter", () => {
      const { setProcessSearch } = useStore.getState();
      setProcessSearch("chrome");
      expect(useStore.getState().processSearch).toBe("chrome");
    });
  });

  describe("notify helper", () => {
    it("adds a notification via the module-level helper", () => {
      notify("test.message", "warning");
      const notifs = useStore.getState().notifications;
      expect(notifs).toHaveLength(1);
      expect(notifs[0].type).toBe("warning");
    });
  });
});

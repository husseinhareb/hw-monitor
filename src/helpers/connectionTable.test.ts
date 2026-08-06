import { describe, expect, it } from "vitest";
import type { Connection } from "../bindings";
import {
  compareAddresses,
  compareConnections,
  connectionKey,
  formatEndpoint,
  isWildcardEndpoint,
  matchesConnectionQuery,
} from "./connectionTable";

const connection = (overrides: Partial<Connection> = {}): Connection => ({
  protocol: "tcp",
  local_address: "127.0.0.1",
  local_port: 8080,
  remote_address: "0.0.0.0",
  remote_port: 0,
  state: "LISTEN",
  tx_queue: 0,
  rx_queue: 0,
  inode: 49748,
  uid: 1000,
  user: "alice",
  pid: 368,
  process_name: "node",
  remote_country_code: null,
  ...overrides,
});

describe("formatEndpoint", () => {
  it("brackets IPv6 addresses so the port stays readable", () => {
    expect(formatEndpoint("::1", 16635)).toBe("[::1]:16635");
    expect(formatEndpoint("127.0.0.1", 8080)).toBe("127.0.0.1:8080");
  });

  it("collapses an absent peer to a wildcard", () => {
    expect(formatEndpoint("0.0.0.0", 0)).toBe("*");
    expect(formatEndpoint("::", 0)).toBe("*");
    expect(isWildcardEndpoint("0.0.0.0", 443)).toBe(false);
  });
});

describe("compareAddresses", () => {
  it("orders IPv4 addresses numerically rather than lexically", () => {
    expect(compareAddresses("9.0.0.1", "10.0.0.1")).toBeLessThan(0);
    expect(compareAddresses("10.0.2.79", "10.0.2.7")).toBeGreaterThan(0);
    expect(compareAddresses("127.0.0.1", "127.0.0.1")).toBe(0);
  });

  it("groups IPv6 after IPv4 instead of interleaving the families", () => {
    expect(compareAddresses("192.168.1.1", "::1")).toBeLessThan(0);
    expect(compareAddresses("::1", "192.168.1.1")).toBeGreaterThan(0);
    expect(compareAddresses("::1", "::ffff:127.0.0.1")).toBeLessThan(0);
  });

  it("does not mistake malformed dotted strings for addresses", () => {
    expect(compareAddresses("1.2.3.999", "1.2.3.4")).toBeGreaterThan(0);
    expect(compareAddresses("a.b.c.d", "1.2.3.4")).toBeGreaterThan(0);
  });
});

describe("compareConnections", () => {
  it("compares ports as numbers, not as text", () => {
    const low = connection({ local_port: 80 });
    const high = connection({ local_port: 443 });

    expect(compareConnections(low, high, "local_port")).toBeLessThan(0);
    expect(compareConnections(connection({ local_port: 9 }), low, "local_port")).toBeLessThan(0);
  });

  it("sinks unresolved processes below attributed ones", () => {
    const known = connection({ pid: 368 });
    const unknown = connection({ pid: null, process_name: null });

    expect(compareConnections(known, unknown, "pid")).toBeLessThan(0);
    expect(compareConnections(unknown, known, "process_name")).toBeGreaterThan(0);
    expect(compareConnections(unknown, unknown, "pid")).toBe(0);
  });

  it("routes address columns through the octet-aware comparison", () => {
    const nine = connection({ remote_address: "9.9.9.9" });
    const ten = connection({ remote_address: "10.0.0.1" });

    expect(compareConnections(nine, ten, "remote_address")).toBeLessThan(0);
  });
});

describe("connectionKey", () => {
  it("separates two sockets that share a recycled inode", () => {
    const first = connection({ local_port: 8080 });
    const second = connection({ local_port: 9090 });

    expect(connectionKey(first)).not.toBe(connectionKey(second));
  });

  it("is stable for an unchanged socket", () => {
    expect(connectionKey(connection())).toBe(connectionKey(connection()));
  });
});

describe("matchesConnectionQuery", () => {
  it("searches ports, processes, and users alongside addresses", () => {
    const row = connection({ local_port: 8080, process_name: "node", user: "alice" });

    expect(matchesConnectionQuery(row, "8080")).toBe(true);
    expect(matchesConnectionQuery(row, "node")).toBe(true);
    expect(matchesConnectionQuery(row, "alice")).toBe(true);
    expect(matchesConnectionQuery(row, "listen")).toBe(true);
    expect(matchesConnectionQuery(row, "postgres")).toBe(false);
  });

  it("tolerates rows with no resolved owner", () => {
    const row = connection({ pid: null, process_name: null, user: null });

    expect(matchesConnectionQuery(row, "")).toBe(true);
    expect(matchesConnectionQuery(row, "node")).toBe(false);
  });
});

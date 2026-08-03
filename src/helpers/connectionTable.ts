import type { Connection } from "../bindings";

export type ConnectionSortKey = keyof Connection;

/**
 * A listener reports its peer as the unspecified address on port 0. Rendering
 * that as `*` matches how `ss(8)` and `netstat(8)` present an absent peer.
 */
export function isWildcardEndpoint(address: string, port: number): boolean {
  return port === 0 && (address === "0.0.0.0" || address === "::");
}

export function formatEndpoint(address: string, port: number): string {
  if (isWildcardEndpoint(address, port)) return "*";
  return address.includes(":") ? `[${address}]:${port}` : `${address}:${port}`;
}

function ipv4Octets(address: string): number[] | null {
  const parts = address.split(".");
  if (parts.length !== 4) return null;

  const octets = parts.map((part) =>
    /^\d{1,3}$/.test(part) ? Number(part) : Number.NaN,
  );
  return octets.every((octet) => octet >= 0 && octet <= 255) ? octets : null;
}

/**
 * Orders IPv4 addresses by octet so that 9.x sorts before 10.x, which a plain
 * string comparison gets backwards. IPv6 addresses keep lexical order and are
 * grouped after IPv4 rather than interleaved with it.
 */
export function compareAddresses(a: string, b: string): number {
  const left = ipv4Octets(a);
  const right = ipv4Octets(b);

  if (left && right) {
    for (let index = 0; index < 4; index += 1) {
      if (left[index] !== right[index]) return left[index] - right[index];
    }
    return 0;
  }
  if (left) return -1;
  if (right) return 1;
  return a.localeCompare(b);
}

/**
 * Compares one column of two rows. Ports and PIDs are numeric, addresses use
 * the octet order above, and unresolved values group together at one end
 * instead of scattering through the table.
 */
export function compareConnections(
  a: Connection,
  b: Connection,
  key: ConnectionSortKey,
): number {
  const left = a[key];
  const right = b[key];

  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;

  if (key === "local_address" || key === "remote_address") {
    return compareAddresses(String(left), String(right));
  }
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }
  return String(left).localeCompare(String(right));
}

/**
 * Identifies a row across polls. The socket inode is unique while the socket
 * is open, but it is reused after close, so the endpoints are folded in as
 * well to keep React from reusing a row for an unrelated connection.
 */
export function connectionKey(connection: Connection): string {
  return [
    connection.protocol,
    connection.inode,
    connection.local_address,
    connection.local_port,
    connection.remote_address,
    connection.remote_port,
  ].join("-");
}

export function matchesConnectionQuery(
  connection: Connection,
  query: string,
): boolean {
  if (!query) return true;

  return [
    connection.protocol,
    connection.state,
    connection.local_address,
    String(connection.local_port),
    connection.remote_address,
    String(connection.remote_port),
    connection.process_name ?? "",
    connection.pid === null ? "" : String(connection.pid),
    connection.user ?? "",
  ].some((field) => field.toLowerCase().includes(query));
}

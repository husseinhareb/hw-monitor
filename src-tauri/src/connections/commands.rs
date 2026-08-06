use crate::proc::build_uid_map;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::net::{IpAddr, Ipv4Addr, Ipv6Addr};
use std::path::Path;
use std::sync::Mutex;
use std::sync::OnceLock;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub struct Connection {
    pub protocol: String,
    pub local_address: String,
    pub local_port: u16,
    pub remote_address: String,
    pub remote_port: u16,
    pub state: String,
    pub tx_queue: u64,
    pub rx_queue: u64,
    pub inode: u64,
    pub uid: u32,
    pub user: Option<String>,
    pub pid: Option<u32>,
    pub process_name: Option<String>,
    /// ISO 3166-1 alpha-2 country code resolved from the remote IP address via
    /// a local MaxMind GeoLite2 database.  `None` when the database is absent,
    /// the address is private / reserved, or the lookup produces no match.
    pub remote_country_code: Option<String>,
}

// ── GeoIP reader (lazy, reload-safe) ─────────────────────────────────

static GEOIP_READER: OnceLock<Mutex<Option<maxminddb::Reader<Vec<u8>>>>> = OnceLock::new();

/// Returns a shared reference to the GeoIP reader, initialising it on first
/// call.  The reader is opened once and then reused across polls.
fn geoip_reader() -> &'static Mutex<Option<maxminddb::Reader<Vec<u8>>>> {
    GEOIP_READER.get_or_init(|| {
        let reader = init_geoip_reader();
        Mutex::new(reader)
    })
}

fn init_geoip_reader() -> Option<maxminddb::Reader<Vec<u8>>> {
    // Common locations for the GeoLite2 Country database.
    let candidates: &[&str] = &[
        "/usr/share/GeoIP/GeoLite2-Country.mmdb",
        "/var/lib/GeoIP/GeoLite2-Country.mmdb",
        "./GeoLite2-Country.mmdb",
    ];

    // Honour an explicit override through the environment.
    if let Ok(path) = std::env::var("GEOIP_DB_PATH") {
        return maxminddb::Reader::open_readfile(path).ok();
    }

    for path in candidates {
        if let Ok(reader) = maxminddb::Reader::open_readfile(path) {
            return Some(reader);
        }
    }

    None
}

/// Returns `true` when an IP address belongs to a private, loopback,
/// link-local, multicast, or otherwise reserved range whose geographic
/// location is meaningless.
fn is_private_or_reserved(ip: &IpAddr) -> bool {
    match ip {
        IpAddr::V4(v4) => {
            let octets = v4.octets();
            // 0.0.0.0/8, 127.0.0.0/8, 10.0.0.0/8
            if octets[0] == 0 || octets[0] == 127 || octets[0] == 10 {
                return true;
            }
            // 172.16.0.0/12
            if octets[0] == 172 && octets[1] >= 16 && octets[1] <= 31 {
                return true;
            }
            // 192.168.0.0/16
            if octets[0] == 192 && octets[1] == 168 {
                return true;
            }
            // 169.254.0.0/16 (link-local)
            if octets[0] == 169 && octets[1] == 254 {
                return true;
            }
            // 224.0.0.0/4 (multicast), 240.0.0.0/4 (reserved)
            if octets[0] >= 224 {
                return true;
            }
            false
        }
        IpAddr::V6(v6) => {
            // :: (unspecified), ::1 (loopback)
            if v6.is_unspecified() || v6.is_loopback() {
                return true;
            }
            let segments = v6.segments();
            // fe80::/10 (link-local)
            if segments[0] & 0xFFC0 == 0xFE80 {
                return true;
            }
            // fc00::/7 (unique-local)
            if segments[0] & 0xFE00 == 0xFC00 {
                return true;
            }
            // ff00::/8 (multicast)
            if segments[0] & 0xFF00 == 0xFF00 {
                return true;
            }
            false
        }
    }
}

/// Looks up the ISO 3166-1 alpha-2 country code for an IP address string.
/// Returns `None` for private / reserved addresses, unparseable strings,
/// or when the GeoIP database is not available.
fn lookup_country_code(ip_str: &str) -> Option<String> {
    let ip: IpAddr = ip_str.parse().ok()?;
    if is_private_or_reserved(&ip) {
        return None;
    }

    let guard = geoip_reader().lock().ok()?;
    let reader = guard.as_ref()?;

    // Look up the IP and extract the country ISO code.  We decode just the
    // path we need so the lookup stays cheap and we don't allocate the full
    // Country record.
    use maxminddb::PathElement;
    let result: maxminddb::LookupResult<_> = reader.lookup(ip).ok()?;
    let iso_code: Option<&str> = result
        .decode_path(&[PathElement::Key("country"), PathElement::Key("iso_code")])
        .ok()
        .flatten();
    iso_code.map(|s| s.to_string())
}

struct NetTable {
    path: &'static str,
    protocol: &'static str,
    ipv6: bool,
    datagram: bool,
}

const NET_TABLES: [NetTable; 4] = [
    NetTable {
        path: "/proc/net/tcp",
        protocol: "tcp",
        ipv6: false,
        datagram: false,
    },
    NetTable {
        path: "/proc/net/tcp6",
        protocol: "tcp6",
        ipv6: true,
        datagram: false,
    },
    NetTable {
        path: "/proc/net/udp",
        protocol: "udp",
        ipv6: false,
        datagram: true,
    },
    NetTable {
        path: "/proc/net/udp6",
        protocol: "udp6",
        ipv6: true,
        datagram: true,
    },
];

/// Every column up to and including `inode` must be present for a row to be
/// usable; the kernel appends further diagnostic columns that differ between
/// the TCP and UDP tables and that this module ignores.
const MIN_TABLE_COLUMNS: usize = 10;

#[derive(Debug, PartialEq, Eq)]
struct SocketRow {
    local: (IpAddr, u16),
    remote: (IpAddr, u16),
    state: u8,
    tx_queue: u64,
    rx_queue: u64,
    uid: u32,
    inode: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
struct SocketOwner {
    pid: u32,
    name: Option<String>,
}

/// Decodes the `%08X`-per-word addresses used by the `/proc/net` socket
/// tables.
///
/// The kernel prints each 32-bit chunk of a network-order address as a native
/// `u32`, so the textual form depends on the host's endianness: `127.0.0.1`
/// appears as `0100007F` on a little-endian machine and as `7F000001` on a
/// big-endian one. Rebuilding the octets with `to_ne_bytes` inverts exactly
/// that reinterpretation and therefore stays correct on both.
fn parse_hex_address(hex: &str, ipv6: bool) -> Option<IpAddr> {
    let expected_len = if ipv6 { 32 } else { 8 };
    if hex.len() != expected_len || !hex.bytes().all(|byte| byte.is_ascii_hexdigit()) {
        return None;
    }

    let mut octets = [0u8; 16];
    for (index, chunk) in hex.as_bytes().chunks(8).enumerate() {
        let chunk = std::str::from_utf8(chunk).ok()?;
        let word = u32::from_str_radix(chunk, 16).ok()?;
        octets[index * 4..index * 4 + 4].copy_from_slice(&word.to_ne_bytes());
    }

    Some(if ipv6 {
        IpAddr::V6(Ipv6Addr::from(octets))
    } else {
        IpAddr::V4(Ipv4Addr::new(octets[0], octets[1], octets[2], octets[3]))
    })
}

/// Splits an `ADDRESS:PORT` column. Unlike the address, the port is already
/// printed in host order, so it is a plain hexadecimal number.
fn parse_socket_address(field: &str, ipv6: bool) -> Option<(IpAddr, u16)> {
    let (address, port) = field.rsplit_once(':')?;
    if !port.bytes().all(|byte| byte.is_ascii_hexdigit()) {
        return None;
    }

    Some((
        parse_hex_address(address, ipv6)?,
        u16::from_str_radix(port, 16).ok()?,
    ))
}

fn parse_hex_pair(field: &str) -> Option<(u64, u64)> {
    let (first, second) = field.split_once(':')?;
    Some((
        u64::from_str_radix(first, 16).ok()?,
        u64::from_str_radix(second, 16).ok()?,
    ))
}

/// Parses one socket row. The table headers and any malformed row fail the
/// strict address decode above and are reported as `None` so callers can skip
/// them without special-casing the header.
fn parse_socket_row(line: &str, ipv6: bool) -> Option<SocketRow> {
    let fields: Vec<&str> = line.split_whitespace().collect();
    if fields.len() < MIN_TABLE_COLUMNS {
        return None;
    }

    // The kernel prints the send queue before the receive queue.
    let (tx_queue, rx_queue) = parse_hex_pair(fields[4])?;

    Some(SocketRow {
        local: parse_socket_address(fields[1], ipv6)?,
        remote: parse_socket_address(fields[2], ipv6)?,
        state: u8::from_str_radix(fields[3], 16).ok()?,
        tx_queue,
        rx_queue,
        uid: fields[7].parse().ok()?,
        inode: fields[9].parse().ok()?,
    })
}

fn tcp_state(code: u8) -> &'static str {
    match code {
        1 => "ESTABLISHED",
        2 => "SYN_SENT",
        3 => "SYN_RECV",
        4 => "FIN_WAIT1",
        5 => "FIN_WAIT2",
        6 => "TIME_WAIT",
        7 => "CLOSE",
        8 => "CLOSE_WAIT",
        9 => "LAST_ACK",
        10 => "LISTEN",
        11 => "CLOSING",
        12 => "NEW_SYN_RECV",
        _ => "UNKNOWN",
    }
}

/// Datagram sockets reuse the TCP state column but only ever report
/// `TCP_ESTABLISHED` for a connected peer or `TCP_CLOSE` for an unbound one,
/// so the latter is labelled the way `ss(8)` presents it.
fn datagram_state(code: u8) -> &'static str {
    match code {
        7 => "UNCONN",
        _ => tcp_state(code),
    }
}

fn socket_inode(target: &Path) -> Option<u64> {
    target
        .to_str()?
        .strip_prefix("socket:[")?
        .strip_suffix(']')?
        .parse()
        .ok()
}

fn read_process_name(pid: u32) -> Option<String> {
    fs::read_to_string(format!("/proc/{pid}/comm"))
        .ok()
        .map(|name| name.trim().to_string())
        .filter(|name| !name.is_empty())
}

/// Maps socket inodes to the process holding them by walking `/proc/[pid]/fd`.
///
/// Reading another user's descriptor directory requires privileges, so an
/// unprivileged run resolves only the current user's sockets and leaves the
/// rest unattributed. Inaccessible processes are skipped instead of failing
/// the listing, which is how `ss(8)` and `netstat(8)` behave without root.
///
/// A socket shared through `fork(2)` is held by several processes at once.
/// The lowest PID wins so that repeated polls attribute it to the same
/// process instead of flickering with `/proc` iteration order.
fn build_socket_owner_map() -> HashMap<u64, SocketOwner> {
    let mut owners: HashMap<u64, SocketOwner> = HashMap::new();

    let Ok(entries) = fs::read_dir("/proc") else {
        return owners;
    };

    for entry in entries.flatten() {
        let Some(pid) = entry
            .file_name()
            .to_str()
            .and_then(|name| name.parse::<u32>().ok())
        else {
            continue;
        };

        let Ok(descriptors) = fs::read_dir(entry.path().join("fd")) else {
            continue;
        };

        let mut name = None;
        let mut name_resolved = false;

        for descriptor in descriptors.flatten() {
            let Ok(target) = fs::read_link(descriptor.path()) else {
                continue;
            };
            let Some(inode) = socket_inode(&target) else {
                continue;
            };

            if !name_resolved {
                name = read_process_name(pid);
                name_resolved = true;
            }

            owners
                .entry(inode)
                .and_modify(|owner| {
                    if pid < owner.pid {
                        *owner = SocketOwner {
                            pid,
                            name: name.clone(),
                        };
                    }
                })
                .or_insert_with(|| SocketOwner {
                    pid,
                    name: name.clone(),
                });
        }
    }

    owners
}

fn collect_table(
    content: &str,
    table: &NetTable,
    uid_map: &HashMap<u32, String>,
    owners: &HashMap<u64, SocketOwner>,
    connections: &mut Vec<Connection>,
) {
    for line in content.lines() {
        let Some(row) = parse_socket_row(line, table.ipv6) else {
            continue;
        };

        let owner = owners.get(&row.inode);
        let state = if table.datagram {
            datagram_state(row.state)
        } else {
            tcp_state(row.state)
        };

        connections.push(Connection {
            protocol: table.protocol.to_string(),
            local_address: row.local.0.to_string(),
            local_port: row.local.1,
            remote_address: row.remote.0.to_string(),
            remote_port: row.remote.1,
            state: state.to_string(),
            tx_queue: row.tx_queue,
            rx_queue: row.rx_queue,
            inode: row.inode,
            uid: row.uid,
            user: uid_map.get(&row.uid).cloned(),
            pid: owner.map(|owner| owner.pid),
            process_name: owner.and_then(|owner| owner.name.clone()),
            remote_country_code: lookup_country_code(&row.remote.0.to_string()),
        });
    }
}

fn list_connections() -> Result<Vec<Connection>, String> {
    let uid_map = build_uid_map();
    let owners = build_socket_owner_map();
    let mut connections = Vec::new();
    let mut readable_tables = 0;

    for table in &NET_TABLES {
        // A kernel built without IPv6 exposes no `tcp6`/`udp6` table at all, so
        // a missing file is a normal condition rather than an error.
        let Ok(content) = fs::read_to_string(table.path) else {
            continue;
        };
        readable_tables += 1;
        collect_table(&content, table, &uid_map, &owners, &mut connections);
    }

    if readable_tables == 0 {
        return Err("no /proc/net socket table could be read".to_string());
    }

    // A total order keeps rows from swapping places between polls when the
    // frontend sorts on a column with duplicate values.
    connections.sort_by(|a, b| {
        a.protocol
            .cmp(&b.protocol)
            .then(a.local_port.cmp(&b.local_port))
            .then(a.local_address.cmp(&b.local_address))
            .then(a.remote_address.cmp(&b.remote_address))
            .then(a.remote_port.cmp(&b.remote_port))
            .then(a.inode.cmp(&b.inode))
    });

    Ok(connections)
}

#[tauri::command]
pub async fn get_connections() -> Result<Vec<Connection>, String> {
    tauri::async_runtime::spawn_blocking(list_connections)
        .await
        .map_err(|e| format!("failed to join connection listing task: {e}"))?
}

#[cfg(test)]
mod tests {
    use super::{
        build_socket_owner_map, collect_table, datagram_state, list_connections, parse_hex_address,
        parse_socket_address, parse_socket_row, socket_inode, tcp_state, Connection, NetTable,
        SocketOwner,
    };
    use std::cmp::Ordering;
    use std::collections::HashMap;
    use std::net::{IpAddr, Ipv4Addr, Ipv6Addr};
    use std::path::PathBuf;

    const TCP_TABLE: NetTable = NetTable {
        path: "/proc/net/tcp",
        protocol: "tcp",
        ipv6: false,
        datagram: false,
    };

    const UDP_TABLE: NetTable = NetTable {
        path: "/proc/net/udp",
        protocol: "udp",
        ipv6: false,
        datagram: true,
    };

    #[test]
    fn decodes_little_endian_ipv4_addresses() {
        assert_eq!(
            parse_hex_address("0100007F", false),
            Some(IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)))
        );
        assert_eq!(
            parse_hex_address("00000000", false),
            Some(IpAddr::V4(Ipv4Addr::UNSPECIFIED))
        );
        // 10.0.2.79, taken from a live `/proc/net/udp` DHCP client row.
        assert_eq!(
            parse_hex_address("4F02000A", false),
            Some(IpAddr::V4(Ipv4Addr::new(10, 0, 2, 79)))
        );
    }

    #[test]
    fn decodes_ipv6_addresses_word_by_word() {
        assert_eq!(
            parse_hex_address("00000000000000000000000001000000", true),
            Some(IpAddr::V6(Ipv6Addr::LOCALHOST))
        );
        assert_eq!(
            parse_hex_address("00000000000000000000000000000000", true),
            Some(IpAddr::V6(Ipv6Addr::UNSPECIFIED))
        );
    }

    #[test]
    fn decodes_ipv4_mapped_ipv6_addresses() {
        // ::ffff:127.0.0.1, the form used by a dual-stack listener.
        assert_eq!(
            parse_hex_address("0000000000000000FFFF00000100007F", true),
            Some(IpAddr::V6(Ipv4Addr::new(127, 0, 0, 1).to_ipv6_mapped()))
        );
    }

    #[test]
    fn rejects_addresses_of_the_wrong_width_or_alphabet() {
        assert_eq!(parse_hex_address("0100007", false), None);
        assert_eq!(parse_hex_address("0100007FF", false), None);
        assert_eq!(parse_hex_address("0100007F", true), None);
        assert_eq!(parse_hex_address("local_ad", false), None);
        assert_eq!(parse_hex_address("+100007F", false), None);
    }

    #[test]
    fn parses_ports_as_host_order_hexadecimal() {
        assert_eq!(
            parse_socket_address("0100007F:CF8E", false),
            Some((IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)), 53134))
        );
        assert_eq!(
            parse_socket_address("00000000:0035", false),
            Some((IpAddr::V4(Ipv4Addr::UNSPECIFIED), 53))
        );
        assert_eq!(
            parse_socket_address("00000000000000000000000001000000:40FB", true),
            Some((IpAddr::V6(Ipv6Addr::LOCALHOST), 16635))
        );
    }

    #[test]
    fn parses_a_listening_socket_row() {
        let line = "   0: 0100007F:CF8E 00000000:0000 0A 00000000:00000000 00:00000000 00000000  1000        0 49748 1 0000000000000000 100 0 0 10 0";

        let row = parse_socket_row(line, false).expect("row should parse");

        assert_eq!(row.local, (IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)), 53134));
        assert_eq!(row.remote, (IpAddr::V4(Ipv4Addr::UNSPECIFIED), 0));
        assert_eq!(row.state, 10);
        assert_eq!(row.uid, 1000);
        assert_eq!(row.inode, 49748);
    }

    #[test]
    fn reads_the_send_queue_before_the_receive_queue() {
        let line = "   1: 0100007F:1F90 0100007F:9C40 01 0000002A:00000015 00:00000000 00000000  1000        0 51001 1 0000000000000000 20 4 30 10 -1";

        let row = parse_socket_row(line, false).expect("row should parse");

        assert_eq!(row.tx_queue, 42);
        assert_eq!(row.rx_queue, 21);
    }

    #[test]
    fn skips_table_headers_and_truncated_rows() {
        let header =
            "  sl  local_address rem_address   st tx_queue rx_queue tr tm->when retrnsmt   uid  timeout inode";
        assert_eq!(parse_socket_row(header, false), None);

        let ipv6_header =
            "  sl  local_address                         remote_address                        st tx_queue rx_queue tr tm->when retrnsmt   uid  timeout inode";
        assert_eq!(parse_socket_row(ipv6_header, true), None);

        assert_eq!(
            parse_socket_row("   0: 0100007F:CF8E 00000000:0000 0A", false),
            None
        );
        assert_eq!(parse_socket_row("", false), None);
    }

    #[test]
    fn maps_every_documented_tcp_state() {
        let expected = [
            (1, "ESTABLISHED"),
            (2, "SYN_SENT"),
            (3, "SYN_RECV"),
            (4, "FIN_WAIT1"),
            (5, "FIN_WAIT2"),
            (6, "TIME_WAIT"),
            (7, "CLOSE"),
            (8, "CLOSE_WAIT"),
            (9, "LAST_ACK"),
            (10, "LISTEN"),
            (11, "CLOSING"),
            (12, "NEW_SYN_RECV"),
        ];

        for (code, name) in expected {
            assert_eq!(tcp_state(code), name);
        }
        assert_eq!(tcp_state(0), "UNKNOWN");
        assert_eq!(tcp_state(13), "UNKNOWN");
    }

    #[test]
    fn labels_unconnected_datagram_sockets_the_way_ss_does() {
        assert_eq!(datagram_state(7), "UNCONN");
        assert_eq!(datagram_state(1), "ESTABLISHED");
    }

    #[test]
    fn recognises_only_socket_descriptor_targets() {
        assert_eq!(socket_inode(&PathBuf::from("socket:[49748]")), Some(49748));
        assert_eq!(socket_inode(&PathBuf::from("anon_inode:[eventfd]")), None);
        assert_eq!(socket_inode(&PathBuf::from("/dev/null")), None);
        assert_eq!(socket_inode(&PathBuf::from("socket:[]")), None);
        assert_eq!(socket_inode(&PathBuf::from("socket:[abc]")), None);
    }

    #[test]
    fn attaches_owner_and_user_names_to_parsed_rows() {
        let content = "\
  sl  local_address rem_address   st tx_queue rx_queue tr tm->when retrnsmt   uid  timeout inode
   0: 0100007F:CF8E 00000000:0000 0A 00000000:00000000 00:00000000 00000000  1000        0 49748 1 0000000000000000 100 0 0 10 0
   1: 00000000:07D0 00000000:0000 0A 00000000:00000000 00:00000000 00000000     0        0 10087 1 0000000000000000 100 0 0 10 0
";

        let mut uid_map = HashMap::new();
        uid_map.insert(1000, "alice".to_string());
        uid_map.insert(0, "root".to_string());

        let mut owners = HashMap::new();
        owners.insert(
            49748,
            SocketOwner {
                pid: 368,
                name: Some("MainThread".to_string()),
            },
        );

        let mut connections = Vec::new();
        collect_table(content, &TCP_TABLE, &uid_map, &owners, &mut connections);

        assert_eq!(connections.len(), 2);

        assert_eq!(
            connections[0],
            Connection {
                protocol: "tcp".to_string(),
                local_address: "127.0.0.1".to_string(),
                local_port: 53134,
                remote_address: "0.0.0.0".to_string(),
                remote_port: 0,
                state: "LISTEN".to_string(),
                tx_queue: 0,
                rx_queue: 0,
                inode: 49748,
                uid: 1000,
                user: Some("alice".to_string()),
                pid: Some(368),
                process_name: Some("MainThread".to_string()),
                remote_country_code: None,
            }
        );

        // A socket owned by an unreadable process still lists, just without
        // attribution, the unprivileged case.
        assert_eq!(connections[1].pid, None);
        assert_eq!(connections[1].process_name, None);
        assert_eq!(connections[1].user, Some("root".to_string()));
    }

    #[test]
    fn leaves_the_user_unresolved_when_the_uid_is_unknown() {
        let content =
            "   0: 0100007F:CF8E 00000000:0000 0A 00000000:00000000 00:00000000 00000000  4242        0 49748 1 0000000000000000 100 0 0 10 0\n";

        let mut connections = Vec::new();
        collect_table(
            content,
            &TCP_TABLE,
            &HashMap::new(),
            &HashMap::new(),
            &mut connections,
        );

        assert_eq!(connections[0].uid, 4242);
        assert_eq!(connections[0].user, None);
    }

    #[test]
    fn labels_datagram_tables_with_their_own_state_names() {
        let content =
            " 1843: 3500007F:0035 00000000:0000 07 00000000:00000000 00:00000000 00000000   101        0 5831 2 0000000000000000 0\n";

        let mut connections = Vec::new();
        collect_table(
            content,
            &UDP_TABLE,
            &HashMap::new(),
            &HashMap::new(),
            &mut connections,
        );

        assert_eq!(connections[0].protocol, "udp");
        assert_eq!(connections[0].state, "UNCONN");
        assert_eq!(connections[0].local_address, "127.0.0.53");
        assert_eq!(connections[0].local_port, 53);
    }

    #[test]
    fn resolves_the_sockets_owned_by_the_test_process() {
        let owners = build_socket_owner_map();
        let self_pid = std::process::id();

        // The harness itself need not hold a socket, but every entry that is
        // resolved must point at a live PID with a readable name.
        for owner in owners.values() {
            assert!(owner.pid > 0);
        }

        if let Some(owner) = owners.values().find(|owner| owner.pid == self_pid) {
            assert!(owner.name.is_some());
        }
    }

    /// An orphaned socket is detached from every descriptor and reported with
    /// inode 0, so the inode alone does not identify a row. Such a socket must
    /// still be listed, just without an owner.
    #[test]
    fn lists_orphaned_sockets_that_report_no_inode() {
        let content = "\
   0: 0100007F:1F90 0100007F:9C40 06 00000000:00000000 03:00000AFE 00000000     0        0 0 0 0000000000000000
   1: 0100007F:1F90 0100007F:9C41 06 00000000:00000000 03:00000AFE 00000000     0        0 0 0 0000000000000000
";

        let mut connections = Vec::new();
        collect_table(
            content,
            &TCP_TABLE,
            &HashMap::new(),
            &HashMap::new(),
            &mut connections,
        );

        assert_eq!(connections.len(), 2);
        for connection in &connections {
            assert_eq!(connection.state, "TIME_WAIT");
            assert_eq!(connection.inode, 0);
            assert_eq!(connection.pid, None);
        }
        // Only the peer port separates the two rows.
        assert_ne!(connections[0].remote_port, connections[1].remote_port);
    }

    #[test]
    fn lists_live_connections_in_the_documented_order() {
        let connections = list_connections().expect("/proc/net tables should be readable");

        for connection in &connections {
            assert!(
                matches!(
                    connection.protocol.as_str(),
                    "tcp" | "tcp6" | "udp" | "udp6"
                ),
                "unexpected protocol {}",
                connection.protocol
            );
            assert!(!connection.state.is_empty());
            assert!(!connection.local_address.is_empty());
        }

        for pair in connections.windows(2) {
            let (previous, next) = (&pair[0], &pair[1]);
            let ordering = previous
                .protocol
                .cmp(&next.protocol)
                .then(previous.local_port.cmp(&next.local_port))
                .then(previous.local_address.cmp(&next.local_address))
                .then(previous.remote_address.cmp(&next.remote_address))
                .then(previous.remote_port.cmp(&next.remote_port))
                .then(previous.inode.cmp(&next.inode));

            assert_ne!(
                ordering,
                Ordering::Greater,
                "{previous:?} was listed before {next:?}"
            );
        }
    }
}

use libc::c_void;
use serde::{Deserialize, Serialize};
use std::fs::OpenOptions;
use std::os::unix::io::AsRawFd;

// ── Shared output types ─────────────────────────────────────────────────────

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SmartAttribute {
    pub id: u8,
    pub name: String,
    pub current: u8,
    pub worst: u8,
    pub threshold: u8,
    pub raw: u64,
    pub raw_string: String,
    pub pre_failure: bool,
    pub failed: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AtaSmartData {
    pub overall_health: bool,
    pub attributes: Vec<SmartAttribute>,
    pub power_on_hours: Option<u64>,
    pub temperature_celsius: Option<i32>,
    pub reallocated_sectors: Option<u64>,
    pub pending_sectors: Option<u64>,
    pub uncorrectable_sectors: Option<u64>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NvmeSmartData {
    pub overall_health: bool,
    pub critical_warning: u8,
    pub temperature_celsius: Option<i32>,
    pub available_spare_percent: u8,
    pub available_spare_threshold: u8,
    pub percentage_used: u8,
    pub power_on_hours: Option<u64>,
    pub power_cycles: Option<u64>,
    pub unsafe_shutdowns: Option<u64>,
    pub media_errors: Option<u64>,
    pub data_units_read_gb: Option<u64>,
    pub data_units_written_gb: Option<u64>,
    pub limited: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type")]
pub enum SmartData {
    Ata(AtaSmartData),
    Nvme(NvmeSmartData),
}

// ── ATA/SATA via SG_IO ──────────────────────────────────────────────────────

// SG_IO ioctl number (plain constant, predates the _IOWR encoding scheme)
const SG_IO: libc::c_ulong = 0x2285;

// Transfer direction for sg_io_hdr.dxfer_direction
const SG_DXFER_FROM_DEV: i32 = -3;

// ATA PASSTHROUGH(16) CDB operation code
const ATA_PASSTHROUGH_16: u8 = 0x85;

// ATA SMART command and sub-commands (ATA feature register values)
const ATA_SMART: u8 = 0xB0;
const SMART_READ_DATA: u8 = 0xD0;
const SMART_READ_THRESHOLDS: u8 = 0xD1;

// Magic LBA values that identify SMART commands to the drive
const SMART_LBA_MID: u8 = 0x4F;
const SMART_LBA_HIGH: u8 = 0xC2;

// sg_io_hdr — must match the kernel's C definition exactly on x86-64.
// The explicit _pad field aligns usr_ptr to offset 56 (matching C's implicit padding).
#[repr(C)]
struct SgIoHdr {
    interface_id: i32,    // 0
    dxfer_direction: i32, // 4
    cmd_len: u8,          // 8
    mx_sb_len: u8,        // 9
    iovec_count: u16,     // 10
    dxfer_len: u32,       // 12
    dxferp: *mut c_void,  // 16
    cmdp: *mut u8,        // 24
    sbp: *mut u8,         // 32
    timeout: u32,         // 40
    flags: u32,           // 44
    pack_id: i32,         // 48
    _pad: i32,            // 52 (padding to bring usr_ptr to offset 56)
    usr_ptr: *mut c_void, // 56
    status: u8,           // 64
    masked_status: u8,    // 65
    msg_status: u8,       // 66
    sb_len_wr: u8,        // 67
    host_status: u16,     // 68
    driver_status: u16,   // 70
    resid: i32,           // 72
    duration: u32,        // 76
    info: u32,            // 80
}

fn send_ata_command(fd: libc::c_int, feature: u8) -> Result<[u8; 512], String> {
    let mut data = [0u8; 512];
    let mut sense = [0u8; 32];

    // ATA PASSTHROUGH(16) CDB:
    //   byte 1: protocol PIO-in (4) shifted left by 1 → 0x08, EXTEND=0
    //   byte 2: T_LENGTH=2 (sector-count reg), BYT_BLOK=1, T_DIR=1 (from device)
    //           0b00001110 = 0x0E
    //   byte 4: ATA FEATURES register
    //   byte 6: sector count = 1
    //   byte 10: LBA-mid SMART magic (0x4F)
    //   byte 12: LBA-high SMART magic (0xC2)
    //   byte 14: ATA command (0xB0 = SMART)
    let mut cdb = [0u8; 16];
    cdb[0] = ATA_PASSTHROUGH_16;
    cdb[1] = 0x08;
    cdb[2] = 0x0E;
    cdb[4] = feature;
    cdb[6] = 1;
    cdb[10] = SMART_LBA_MID;
    cdb[12] = SMART_LBA_HIGH;
    cdb[14] = ATA_SMART;

    let mut hdr = SgIoHdr {
        interface_id: b'S' as i32,
        dxfer_direction: SG_DXFER_FROM_DEV,
        cmd_len: 16,
        mx_sb_len: sense.len() as u8,
        iovec_count: 0,
        dxfer_len: 512,
        dxferp: data.as_mut_ptr() as *mut c_void,
        cmdp: cdb.as_mut_ptr(),
        sbp: sense.as_mut_ptr(),
        timeout: 5000,
        flags: 0,
        pack_id: 0,
        _pad: 0,
        usr_ptr: std::ptr::null_mut(),
        status: 0,
        masked_status: 0,
        msg_status: 0,
        sb_len_wr: 0,
        host_status: 0,
        driver_status: 0,
        resid: 0,
        duration: 0,
        info: 0,
    };

    let rc = unsafe { libc::ioctl(fd, SG_IO, &mut hdr as *mut SgIoHdr) };
    if rc < 0 {
        return Err(format!(
            "SG_IO ioctl failed: {}",
            std::io::Error::last_os_error()
        ));
    }
    if hdr.host_status != 0 || hdr.status != 0 {
        return Err(format!(
            "ATA command error: host_status={} scsi_status={}",
            hdr.host_status, hdr.status
        ));
    }

    Ok(data)
}

fn attribute_name(id: u8) -> &'static str {
    match id {
        1 => "Raw Read Error Rate",
        2 => "Throughput Performance",
        3 => "Spin-Up Time",
        4 => "Start/Stop Count",
        5 => "Reallocated Sector Count",
        7 => "Seek Error Rate",
        8 => "Seek Time Performance",
        9 => "Power-On Hours",
        10 => "Spin Retry Count",
        11 => "Recalibration Retries",
        12 => "Power Cycle Count",
        13 => "Soft Read Error Rate",
        170 => "Available Reserved Space",
        171 => "Program Fail Count",
        172 => "Erase Fail Count",
        173 => "Wear Leveling Count",
        174 => "Unexpected Power Loss",
        175 => "Program Fail Count (Chip)",
        176 => "Erase Fail Count (Chip)",
        177 => "Wear Leveling Count",
        178 => "Used Reserved Block Count",
        179 => "Used Reserved Block Count (Total)",
        180 => "Unused Reserved Block Total",
        181 => "Program Fail Count (Total)",
        182 => "Erase Fail Count (Total)",
        183 => "Runtime Bad Block",
        184 => "End-to-End Error",
        187 => "Reported Uncorrectable Errors",
        188 => "Command Timeout",
        189 => "High Fly Writes",
        190 => "Airflow Temperature",
        191 => "G-Sense Error Rate",
        192 => "Power-Off Retract Count",
        193 => "Load/Unload Cycle Count",
        194 => "Temperature",
        195 => "Hardware ECC Recovered",
        196 => "Reallocation Event Count",
        197 => "Current Pending Sector Count",
        198 => "Offline Uncorrectable Sectors",
        199 => "UDMA CRC Error Count",
        200 => "Multi-Zone Error Rate",
        201 => "Soft Read Error Rate",
        220 => "Disk Shift",
        221 => "G-Sense Error Rate",
        222 => "Loaded Hours",
        223 => "Load/Unload Retry Count",
        224 => "Load Friction",
        225 => "Load/Unload Cycle Count",
        228 => "Power-Off Retract Cycle",
        231 => "SSD Life Left",
        232 => "Endurance Remaining",
        233 => "Media Wearout Indicator",
        234 => "Average Erase Count",
        235 => "Good Block Count",
        240 => "Head Flying Hours",
        241 => "Total LBAs Written",
        242 => "Total LBAs Read",
        249 => "NAND Writes (1 GiB)",
        250 => "Read Error Retry Rate",
        254 => "Free Fall Protection",
        _ => "Vendor Specific",
    }
}

fn raw_string(id: u8, raw: u64) -> String {
    match id {
        9 => format!("{} h", raw),
        190 | 194 => format!("{} \u{00b0}C", raw & 0xFF),
        _ => format!("{}", raw),
    }
}

pub fn read_ata_smart(dev_path: &str) -> Result<AtaSmartData, String> {
    let file = OpenOptions::new()
        .read(true)
        .write(true)
        .open(dev_path)
        .map_err(|e| {
            if e.kind() == std::io::ErrorKind::PermissionDenied {
                "Permission denied — add your user to the 'disk' group".to_string()
            } else {
                format!("Cannot open {}: {}", dev_path, e)
            }
        })?;

    let fd = file.as_raw_fd();
    let data = send_ata_command(fd, SMART_READ_DATA)?;
    let thresh = send_ata_command(fd, SMART_READ_THRESHOLDS)?;

    // Build threshold lookup (30 entries × 12 bytes each, starting at byte 2)
    let mut threshold_map = [0u8; 256];
    for i in 0..30 {
        let off = 2 + i * 12;
        let id = thresh[off];
        if id != 0 {
            threshold_map[id as usize] = thresh[off + 1];
        }
    }

    let mut attributes: Vec<SmartAttribute> = Vec::new();
    let mut overall_health = true;

    for i in 0..30 {
        let off = 2 + i * 12;
        let id = data[off];
        if id == 0 {
            continue;
        }

        let flags = u16::from_le_bytes([data[off + 1], data[off + 2]]);
        let current = data[off + 3];
        let worst = data[off + 4];
        let raw = u64::from_le_bytes([
            data[off + 5],
            data[off + 6],
            data[off + 7],
            data[off + 8],
            data[off + 9],
            data[off + 10],
            0,
            0,
        ]);
        let threshold = threshold_map[id as usize];
        let pre_failure = (flags & 0x0001) != 0;
        let failed = pre_failure && threshold != 0 && current <= threshold;

        if failed {
            overall_health = false;
        }

        attributes.push(SmartAttribute {
            id,
            name: attribute_name(id).to_string(),
            current,
            worst,
            threshold,
            raw,
            raw_string: raw_string(id, raw),
            pre_failure,
            failed,
        });
    }

    // Pre-failure attributes first, then sorted by id
    attributes.sort_by(|a, b| b.pre_failure.cmp(&a.pre_failure).then(a.id.cmp(&b.id)));

    let power_on_hours = attributes.iter().find(|a| a.id == 9).map(|a| a.raw);
    let temperature_celsius = attributes
        .iter()
        .find(|a| a.id == 194 || a.id == 190)
        .map(|a| (a.raw & 0xFF) as i32);
    let reallocated_sectors = attributes.iter().find(|a| a.id == 5).map(|a| a.raw);
    let pending_sectors = attributes.iter().find(|a| a.id == 197).map(|a| a.raw);
    let uncorrectable_sectors = attributes.iter().find(|a| a.id == 198).map(|a| a.raw);

    Ok(AtaSmartData {
        overall_health,
        attributes,
        power_on_hours,
        temperature_celsius,
        reallocated_sectors,
        pending_sectors,
        uncorrectable_sectors,
    })
}

// ── NVMe via NVME_IOCTL_ADMIN_CMD ───────────────────────────────────────────

// _IOWR('N', 0x41, nvme_passthru_cmd) where sizeof(nvme_passthru_cmd) = 72
// = (3 << 30) | ('N' << 8) | 0x41 | (72 << 16) = 0xC0484E41
const NVME_IOCTL_ADMIN_CMD: libc::c_ulong = 0xC0484E41;

// Mirrors struct nvme_passthru_cmd from <linux/nvme_ioctl.h>
#[repr(C)]
struct NvmePassthruCmd {
    opcode: u8,
    flags: u8,
    rsvd1: u16,
    nsid: u32,
    cdw2: u32,
    cdw3: u32,
    metadata: u64,
    addr: u64,
    metadata_len: u32,
    data_len: u32,
    cdw10: u32,
    cdw11: u32,
    cdw12: u32,
    cdw13: u32,
    cdw14: u32,
    cdw15: u32,
    timeout_ms: u32,
    result: u32,
}

fn nvme_get_log_page(fd: libc::c_int, lid: u8, buf: &mut [u8]) -> Result<(), std::io::Error> {
    // NUMDL = (len/4 - 1) encodes the transfer length in dwords
    let numdl = (buf.len() / 4 - 1) as u32;
    let cdw10 = (numdl << 16) | (lid as u32);

    let mut cmd = NvmePassthruCmd {
        opcode: 0x02, // Get Log Page
        flags: 0,
        rsvd1: 0,
        nsid: 0xFFFF_FFFF,
        cdw2: 0,
        cdw3: 0,
        metadata: 0,
        addr: buf.as_mut_ptr() as u64,
        metadata_len: 0,
        data_len: buf.len() as u32,
        cdw10,
        cdw11: 0,
        cdw12: 0,
        cdw13: 0,
        cdw14: 0,
        cdw15: 0,
        timeout_ms: 5000,
        result: 0,
    };

    let rc = unsafe { libc::ioctl(fd, NVME_IOCTL_ADMIN_CMD, &mut cmd as *mut NvmePassthruCmd) };
    if rc < 0 {
        return Err(std::io::Error::last_os_error());
    }
    Ok(())
}

// Derive the NVMe namespace generic char device path from a block device path.
// "/dev/nvme0n1" → "/dev/ng0n1"  (ng devices allow unprivileged admin commands)
fn nvme_ng_path(dev_path: &str) -> String {
    let name = std::path::Path::new(dev_path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("");
    let ng_name = name.replacen("nvme", "ng", 1);
    format!("/dev/{}", ng_name)
}

// Derive the NVMe controller name from a block device path.
// "/dev/nvme0n1" → "nvme0",  "/dev/nvme0" → "nvme0"
fn nvme_ctrl_name(dev_path: &str) -> String {
    let name = std::path::Path::new(dev_path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("");
    // Strip "n<digits>" namespace suffix (e.g. "nvme0n1" → "nvme0")
    if let Some(pos) = name.rfind('n') {
        let suffix = &name[pos + 1..];
        if !suffix.is_empty() && suffix.chars().all(|c| c.is_ascii_digit()) {
            return name[..pos].to_string();
        }
    }
    name.to_string()
}

// Walk a directory looking for any hwmonN subdirectory, then read temp1_input (millidegrees).
fn find_hwmon_temp(dir: &str) -> Option<i32> {
    for entry in std::fs::read_dir(dir).ok()?.flatten() {
        let fname = entry.file_name();
        if fname.to_string_lossy().starts_with("hwmon") {
            let temp_path = entry.path().join("temp1_input");
            if let Ok(s) = std::fs::read_to_string(&temp_path) {
                if let Ok(millideg) = s.trim().parse::<i32>() {
                    return Some(millideg / 1000);
                }
            }
        }
    }
    None
}

// Read NVMe temperature from sysfs hwmon (no privileges required).
fn read_nvme_temp_sysfs(ctrl: &str) -> Option<i32> {
    // Typical path: /sys/class/nvme/nvme0/hwmon0/temp1_input
    let base = format!("/sys/class/nvme/{}", ctrl);
    if let Some(t) = find_hwmon_temp(&base) {
        return Some(t);
    }
    // Fallback layout: /sys/class/nvme/nvme0/device/hwmon/hwmon0/temp1_input
    let device_base = format!("/sys/class/nvme/{}/device/hwmon", ctrl);
    find_hwmon_temp(&device_base)
}

fn read_u16_le(buf: &[u8], off: usize) -> u16 {
    u16::from_le_bytes([buf[off], buf[off + 1]])
}

fn read_u128_le(buf: &[u8], off: usize) -> u128 {
    let mut b = [0u8; 16];
    b.copy_from_slice(&buf[off..off + 16]);
    u128::from_le_bytes(b)
}

fn read_nvme_log(dev_path: &str, buf: &mut [u8]) -> Result<(), std::io::Error> {
    let file = OpenOptions::new().read(true).write(true).open(dev_path)?;

    nvme_get_log_page(file.as_raw_fd(), 0x02, buf)
}

fn limited_nvme_data(dev_path: &str) -> NvmeSmartData {
    let ctrl = nvme_ctrl_name(dev_path);
    NvmeSmartData {
        limited: true,
        overall_health: true,
        critical_warning: 0,
        temperature_celsius: read_nvme_temp_sysfs(&ctrl),
        available_spare_percent: 0,
        available_spare_threshold: 0,
        percentage_used: 0,
        power_on_hours: None,
        power_cycles: None,
        unsafe_shutdowns: None,
        media_errors: None,
        data_units_read_gb: None,
        data_units_written_gb: None,
    }
}

pub fn read_nvme_smart(dev_path: &str) -> Result<NvmeSmartData, String> {
    let mut buf = [0u8; 512];
    match read_nvme_log(dev_path, &mut buf) {
        Ok(()) => {}
        Err(e) if e.kind() == std::io::ErrorKind::PermissionDenied => {
            // The block device may reject either open(2) or the admin ioctl.
            // Try the namespace generic character device before falling back
            // to the non-privileged temperature data exposed by sysfs.
            let ng = nvme_ng_path(dev_path);
            if read_nvme_log(&ng, &mut buf).is_err() {
                return Ok(limited_nvme_data(dev_path));
            }
        }
        Err(e) => return Err(format!("Cannot read NVMe SMART data from {dev_path}: {e}")),
    }

    // NVMe SMART/Health Information Log layout (NVM Express 1.4, section 5.14.1.2)
    let critical_warning = buf[0];
    let temp_k = read_u16_le(&buf, 1);
    let temperature_celsius = if temp_k >= 273 {
        Some((temp_k - 273) as i32)
    } else {
        None
    };
    let available_spare = buf[3];
    let available_spare_threshold = buf[4];
    let percentage_used = buf[5];

    // 128-bit counters; we truncate to u64 for practical display purposes
    let data_units_read = read_u128_le(&buf, 32);
    let data_units_written = read_u128_le(&buf, 48);
    // Each unit = 1000 × 512 bytes ≈ 500 KB; convert to GB
    let data_units_read_gb = Some((data_units_read.saturating_mul(512) / 2_000_000) as u64);
    let data_units_written_gb = Some((data_units_written.saturating_mul(512) / 2_000_000) as u64);

    let power_cycles = Some(read_u128_le(&buf, 112) as u64);
    let power_on_hours = Some(read_u128_le(&buf, 128) as u64);
    let unsafe_shutdowns = Some(read_u128_le(&buf, 144) as u64);
    let media_errors = Some(read_u128_le(&buf, 160) as u64);

    let overall_health = critical_warning == 0 && available_spare >= available_spare_threshold;

    Ok(NvmeSmartData {
        limited: false,
        overall_health,
        critical_warning,
        temperature_celsius,
        available_spare_percent: available_spare,
        available_spare_threshold,
        percentage_used,
        power_on_hours,
        power_cycles,
        unsafe_shutdowns,
        media_errors,
        data_units_read_gb,
        data_units_written_gb,
    })
}

// ── Tauri commands ──────────────────────────────────────────────────────────

fn is_nvme(dev_path: &str) -> bool {
    std::path::Path::new(dev_path)
        .file_name()
        .and_then(|n| n.to_str())
        .map(|n| n.starts_with("nvme"))
        .unwrap_or(false)
}

#[tauri::command]
pub async fn get_smart_data(dev_path: String) -> Result<SmartData, String> {
    if !crate::disk::is_allowed_smart_dev_path(&dev_path) {
        return Err("SMART device is not an allowed discovered disk".to_string());
    }

    tauri::async_runtime::spawn_blocking(move || {
        if is_nvme(&dev_path) {
            read_nvme_smart(&dev_path).map(SmartData::Nvme)
        } else {
            read_ata_smart(&dev_path).map(SmartData::Ata)
        }
    })
    .await
    .map_err(|e| e.to_string())?
}

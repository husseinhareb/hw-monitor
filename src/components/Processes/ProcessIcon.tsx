import React from 'react';
import {
  FaChrome, FaDocker, FaGitAlt, FaPython, FaJava, FaNodeJs,
  FaDatabase, FaTerminal, FaFileAlt, FaFolder, FaDesktop, FaKeyboard, FaPrint,
  FaWifi, FaLock, FaShieldAlt, FaMusic, FaCamera, FaGamepad, FaEnvelope,
  FaCalendarAlt, FaCalculator, FaClock, FaImage, FaVideo, FaVolumeUp,
  FaBluetooth, FaUsb, FaServer, FaNetworkWired, FaHdd, FaMicrochip,
  FaCog, FaLinux, FaRust, FaSlack, FaDiscord, FaSkype, FaTelegram, FaSpotify,
  FaSteam, FaGithub, FaDropbox, FaCode,
} from 'react-icons/fa';
import {
  SiGnubash, SiTypescript, SiGo, SiNginx, SiApache, SiRedis,
  SiPostgresql, SiMysql, SiMongodb, SiElasticsearch,
  SiKubernetes, SiGnome, SiKde, SiLibreoffice,
  SiVisualstudiocode, SiSublimetext, SiVim, SiNeovim,
  SiGimp, SiBlender, SiInkscape, SiVlcmediaplayer, SiObsstudio,
  SiSignal, SiFirefox,
  SiThunderbird,
} from 'react-icons/si';
import {
  VscTerminalBash, VscFile,
} from 'react-icons/vsc';
import { LuCpu, LuMonitor, LuHardDrive } from 'react-icons/lu';
import { MdSystemUpdateAlt, MdSchedule, MdUsb, MdMemory } from 'react-icons/md';
import { GiProcessor } from 'react-icons/gi';
import { BsGearFill } from 'react-icons/bs';
import { IconType } from 'react-icons';

type IconEntry = { icon: IconType; color?: string };

const ICON_MAP: Record<string, IconEntry> = {
  // ── Shells ─────────────────────────────────────────────
  bash:           { icon: SiGnubash },
  sh:             { icon: VscTerminalBash },
  zsh:            { icon: VscTerminalBash },
  fish:           { icon: FaTerminal },
  dash:           { icon: FaTerminal },
  csh:            { icon: FaTerminal },
  tcsh:           { icon: FaTerminal },
  ksh:            { icon: FaTerminal },

  // ── Terminal emulators ─────────────────────────────────
  'gnome-terminal':         { icon: FaTerminal },
  'gnome-terminal-server':  { icon: FaTerminal },
  konsole:                  { icon: FaTerminal },
  alacritty:                { icon: FaTerminal },
  kitty:                    { icon: FaTerminal },
  xterm:                    { icon: FaTerminal },
  urxvt:                    { icon: FaTerminal },
  tilix:                    { icon: FaTerminal },
  terminator:               { icon: FaTerminal },
  wezterm:                  { icon: FaTerminal },
  'wezterm-gui':            { icon: FaTerminal },
  foot:                     { icon: FaTerminal },
  st:                       { icon: FaTerminal },
  tmux:                     { icon: FaTerminal },
  screen:                   { icon: FaTerminal },

  // ── Browsers ───────────────────────────────────────────
  chrome:                   { icon: FaChrome,          color: '#4285F4' },
  'google-chrome':          { icon: FaChrome,          color: '#4285F4' },
  'google-chrome-stable':   { icon: FaChrome,          color: '#4285F4' },
  chromium:                 { icon: FaChrome,          color: '#4587F3' },
  'chromium-browser':       { icon: FaChrome,          color: '#4587F3' },
  firefox:                  { icon: SiFirefox,          color: '#FF7139' },
  'firefox-esr':            { icon: SiFirefox,          color: '#FF7139' },
  'Web Content':            { icon: SiFirefox,          color: '#FF7139' },
  'WebExtensions':          { icon: SiFirefox,          color: '#FF7139' },
  'Isolated Web Co':        { icon: SiFirefox,          color: '#FF7139' },
  brave:                    { icon: FaShieldAlt,        color: '#FB542B' },
  'brave-browser':          { icon: FaShieldAlt,        color: '#FB542B' },
  vivaldi:                  { icon: FaDesktop,          color: '#EF3939' },
  'vivaldi-bin':            { icon: FaDesktop,          color: '#EF3939' },
  epiphany:                 { icon: FaDesktop },
  'tor-browser':            { icon: FaShieldAlt },
  electron:                 { icon: FaDesktop },

  // ── Editors / IDEs ─────────────────────────────────────
  code:                     { icon: SiVisualstudiocode, color: '#007ACC' },
  'code-oss':               { icon: SiVisualstudiocode, color: '#007ACC' },
  codium:                   { icon: SiVisualstudiocode, color: '#2F80ED' },
  vim:                      { icon: SiVim,              color: '#019833' },
  nvim:                     { icon: SiNeovim,           color: '#57A143' },
  neovim:                   { icon: SiNeovim,           color: '#57A143' },
  nano:                     { icon: FaFileAlt },
  emacs:                    { icon: FaCode,             color: '#7F5AB6' },
  'sublime_text':           { icon: SiSublimetext,      color: '#FF9800' },
  subl:                     { icon: SiSublimetext,      color: '#FF9800' },
  gedit:                    { icon: FaFileAlt },
  kate:                     { icon: FaFileAlt },

  // ── Programming runtimes / languages ───────────────────
  python:                   { icon: FaPython,           color: '#3776AB' },
  python3:                  { icon: FaPython,           color: '#3776AB' },
  'python3.10':             { icon: FaPython,           color: '#3776AB' },
  'python3.11':             { icon: FaPython,           color: '#3776AB' },
  'python3.12':             { icon: FaPython,           color: '#3776AB' },
  'python3.13':             { icon: FaPython,           color: '#3776AB' },
  node:                     { icon: FaNodeJs,           color: '#339933' },
  nodejs:                   { icon: FaNodeJs,           color: '#339933' },
  npm:                      { icon: FaNodeJs,           color: '#CB3837' },
  npx:                      { icon: FaNodeJs,           color: '#CB3837' },
  yarn:                     { icon: FaNodeJs,           color: '#2C8EBB' },
  pnpm:                     { icon: FaNodeJs,           color: '#F69220' },
  bun:                      { icon: FaNodeJs },
  deno:                     { icon: SiTypescript,       color: '#3178C6' },
  java:                     { icon: FaJava,             color: '#ED8B00' },
  javac:                    { icon: FaJava,             color: '#ED8B00' },
  go:                       { icon: SiGo,               color: '#00ADD8' },
  rustc:                    { icon: FaRust,             color: '#CE422B' },
  cargo:                    { icon: FaRust,             color: '#CE422B' },
  ruby:                     { icon: FaCode,             color: '#CC342D' },
  perl:                     { icon: FaCode },
  php:                      { icon: FaCode,             color: '#777BB4' },
  lua:                      { icon: FaCode,             color: '#000080' },
  gcc:                      { icon: FaCode },
  'g++':                    { icon: FaCode },
  clang:                    { icon: FaCode },
  make:                     { icon: FaCode },
  cmake:                    { icon: FaCode },
  dotnet:                   { icon: FaCode,             color: '#512BD4' },

  // ── Version control ────────────────────────────────────
  git:                      { icon: FaGitAlt,           color: '#F05032' },
  'git-remote-https':       { icon: FaGitAlt,           color: '#F05032' },
  gh:                       { icon: FaGithub },

  // ── Databases ──────────────────────────────────────────
  postgres:                 { icon: SiPostgresql,       color: '#336791' },
  postgresql:               { icon: SiPostgresql,       color: '#336791' },
  mysql:                    { icon: SiMysql,            color: '#4479A1' },
  mysqld:                   { icon: SiMysql,            color: '#4479A1' },
  mariadb:                  { icon: SiMysql,            color: '#003545' },
  mongod:                   { icon: SiMongodb,          color: '#47A248' },
  mongos:                   { icon: SiMongodb,          color: '#47A248' },
  'redis-server':           { icon: SiRedis,            color: '#DC382D' },
  'redis-cli':              { icon: SiRedis,            color: '#DC382D' },
  sqlite3:                  { icon: FaDatabase },
  elasticsearch:            { icon: SiElasticsearch,    color: '#005571' },

  // ── Web servers / proxies ──────────────────────────────
  nginx:                    { icon: SiNginx,            color: '#009639' },
  apache2:                  { icon: SiApache,           color: '#D22128' },
  httpd:                    { icon: SiApache,           color: '#D22128' },
  caddy:                    { icon: FaServer },
  haproxy:                  { icon: FaServer },
  squid:                    { icon: FaServer },

  // ── Containers / orchestration ─────────────────────────
  docker:                   { icon: FaDocker,           color: '#2496ED' },
  dockerd:                  { icon: FaDocker,           color: '#2496ED' },
  'docker-proxy':           { icon: FaDocker,           color: '#2496ED' },
  containerd:               { icon: FaDocker,           color: '#2496ED' },
  'containerd-shim':        { icon: FaDocker,           color: '#2496ED' },
  'containerd-shim-runc-v2':{ icon: FaDocker,           color: '#2496ED' },
  runc:                     { icon: FaDocker },
  podman:                   { icon: FaDocker },
  kubectl:                  { icon: SiKubernetes,       color: '#326CE5' },
  kubelet:                  { icon: SiKubernetes,       color: '#326CE5' },

  // ── Chat / communication ───────────────────────────────
  slack:                    { icon: FaSlack,            color: '#4A154B' },
  discord:                  { icon: FaDiscord,          color: '#5865F2' },
  Discord:                  { icon: FaDiscord,          color: '#5865F2' },
  skypeforlinux:            { icon: FaSkype,            color: '#00AFF0' },
  telegram:                 { icon: FaTelegram,         color: '#26A5E4' },
  'telegram-desktop':       { icon: FaTelegram,         color: '#26A5E4' },
  signal:                   { icon: SiSignal,           color: '#3A76F0' },
  'signal-desktop':         { icon: SiSignal,           color: '#3A76F0' },
  thunderbird:              { icon: SiThunderbird,      color: '#0A84FF' },
  evolution:                { icon: FaEnvelope },

  // ── Media ──────────────────────────────────────────────
  vlc:                      { icon: SiVlcmediaplayer,   color: '#FF8800' },
  mpv:                      { icon: FaVideo },
  obs:                      { icon: SiObsstudio },
  'obs-studio':             { icon: SiObsstudio },
  spotify:                  { icon: FaSpotify,          color: '#1DB954' },
  rhythmbox:                { icon: FaMusic },
  audacity:                 { icon: FaMusic },
  ffmpeg:                   { icon: FaVideo },
  totem:                    { icon: FaVideo },
  cheese:                   { icon: FaCamera },

  // ── Graphics ───────────────────────────────────────────
  gimp:                     { icon: SiGimp },
  'gimp-2.10':              { icon: SiGimp },
  inkscape:                 { icon: SiInkscape },
  blender:                  { icon: SiBlender,          color: '#F5792A' },
  eog:                      { icon: FaImage },
  feh:                      { icon: FaImage },
  shotwell:                 { icon: FaImage },

  // ── Office ─────────────────────────────────────────────
  libreoffice:              { icon: SiLibreoffice,      color: '#18A303' },
  soffice:                  { icon: SiLibreoffice,      color: '#18A303' },
  'soffice.bin':            { icon: SiLibreoffice,      color: '#18A303' },
  lowriter:                 { icon: SiLibreoffice,      color: '#18A303' },
  localc:                   { icon: SiLibreoffice,      color: '#18A303' },
  loimpress:                { icon: SiLibreoffice,      color: '#18A303' },
  evince:                   { icon: FaFileAlt },
  okular:                   { icon: FaFileAlt },
  zathura:                  { icon: FaFileAlt },

  // ── File managers ──────────────────────────────────────
  nautilus:                 { icon: FaFolder },
  dolphin:                  { icon: FaFolder },
  thunar:                   { icon: FaFolder },
  nemo:                     { icon: FaFolder },
  pcmanfm:                  { icon: FaFolder },
  ranger:                   { icon: FaFolder },
  mc:                       { icon: FaFolder },

  // ── Gaming ─────────────────────────────────────────────
  steam:                    { icon: FaSteam },
  steamwebhelper:           { icon: FaSteam },
  wine:                     { icon: FaGamepad },
  'wine-preloader':         { icon: FaGamepad },
  wineserver:               { icon: FaGamepad },
  lutris:                   { icon: FaGamepad },

  // ── Desktop environments / compositors ─────────────────
  'gnome-shell':            { icon: SiGnome },
  'gnome-session':          { icon: SiGnome },
  gdm:                      { icon: SiGnome },
  'gdm3':                   { icon: SiGnome },
  plasmashell:              { icon: SiKde },
  kwin:                     { icon: SiKde },
  kwin_wayland:             { icon: SiKde },
  kwin_x11:                 { icon: SiKde },
  sway:                     { icon: LuMonitor },
  i3:                       { icon: LuMonitor },
  hyprland:                 { icon: LuMonitor },
  Xorg:                     { icon: LuMonitor },
  Xwayland:                 { icon: LuMonitor },
  mutter:                   { icon: LuMonitor },
  picom:                    { icon: LuMonitor },
  xfwm4:                    { icon: LuMonitor },
  openbox:                  { icon: LuMonitor },

  // ── System / kernel / init ─────────────────────────────
  systemd:                  { icon: FaLinux },
  'systemd-journald':       { icon: FaLinux },
  'systemd-logind':         { icon: FaLinux },
  'systemd-resolved':       { icon: FaNetworkWired },
  'systemd-timesyncd':      { icon: FaClock },
  'systemd-udevd':          { icon: MdUsb },
  'systemd-oomd':           { icon: MdMemory },
  init:                     { icon: FaLinux },
  kthreadd:                 { icon: FaLinux },
  dbus:                     { icon: BsGearFill },
  'dbus-daemon':            { icon: BsGearFill },
  'dbus-broker':            { icon: BsGearFill },
  polkitd:                  { icon: FaLock },
  'polkit-agent':           { icon: FaLock },
  cron:                     { icon: MdSchedule },
  crond:                    { icon: MdSchedule },
  anacron:                  { icon: MdSchedule },
  atd:                      { icon: MdSchedule },

  // ── Networking ─────────────────────────────────────────
  sshd:                     { icon: FaLock },
  ssh:                      { icon: FaLock },
  'ssh-agent':              { icon: FaLock },
  NetworkManager:           { icon: FaWifi },
  wpa_supplicant:           { icon: FaWifi },
  dhclient:                 { icon: FaNetworkWired },
  dhcpcd:                   { icon: FaNetworkWired },
  avahi:                    { icon: FaNetworkWired },
  'avahi-daemon':           { icon: FaNetworkWired },
  bluetoothd:               { icon: FaBluetooth },
  openvpn:                  { icon: FaShieldAlt },
  wireguard:                { icon: FaShieldAlt },
  iptables:                 { icon: FaShieldAlt },
  nftables:                 { icon: FaShieldAlt },
  firewalld:                { icon: FaShieldAlt },
  ufw:                      { icon: FaShieldAlt },
  curl:                     { icon: FaNetworkWired },
  wget:                     { icon: FaNetworkWired },

  // ── Audio ──────────────────────────────────────────────
  pulseaudio:               { icon: FaVolumeUp },
  pipewire:                 { icon: FaVolumeUp },
  'pipewire-pulse':         { icon: FaVolumeUp },
  wireplumber:              { icon: FaVolumeUp },
  'alsa-sink':              { icon: FaVolumeUp },

  // ── Cloud / sync ───────────────────────────────────────
  dropbox:                  { icon: FaDropbox,          color: '#0061FF' },

  // ── Package managers ───────────────────────────────────
  apt:                      { icon: FaLinux },
  'apt-get':                { icon: FaLinux },
  dpkg:                     { icon: FaLinux },
  pacman:                   { icon: FaLinux },
  yay:                      { icon: FaLinux },
  dnf:                      { icon: FaLinux },
  yum:                      { icon: FaLinux },
  flatpak:                  { icon: FaLinux },
  snap:                     { icon: FaLinux },
  snapd:                    { icon: FaLinux },

  // ── System utilities ───────────────────────────────────
  top:                      { icon: LuCpu },
  htop:                     { icon: LuCpu },
  btop:                     { icon: LuCpu },
  ps:                       { icon: GiProcessor },
  kill:                     { icon: FaTerminal },
  lsof:                     { icon: VscFile },
  cat:                      { icon: FaFileAlt },
  less:                     { icon: FaFileAlt },
  grep:                     { icon: FaFileAlt },
  find:                     { icon: FaFolder },
  rsync:                    { icon: FaHdd },
  tar:                      { icon: FaFileAlt },
  gzip:                     { icon: FaFileAlt },
  unzip:                    { icon: FaFileAlt },
  dd:                       { icon: LuHardDrive },
  mount:                    { icon: LuHardDrive },
  umount:                   { icon: LuHardDrive },
  fsck:                     { icon: LuHardDrive },
  smartctl:                 { icon: LuHardDrive },
  lsblk:                    { icon: LuHardDrive },
  udevadm:                  { icon: MdUsb },
  xdg:                      { icon: FaDesktop },
  dconf:                    { icon: FaCog },
  gsettings:                { icon: FaCog },

  // ── Security ───────────────────────────────────────────
  gpg:                      { icon: FaLock },
  'gpg-agent':              { icon: FaLock },
  keyring:                  { icon: FaLock },
  'gnome-keyring':          { icon: FaLock },
  'gnome-keyring-daemon':   { icon: FaLock },
  'secret-tool':            { icon: FaLock },

  // ── Printers ───────────────────────────────────────────
  cupsd:                    { icon: FaPrint },
  cups:                     { icon: FaPrint },
  'cups-browsed':           { icon: FaPrint },

  // ── Input ──────────────────────────────────────────────
  ibus:                     { icon: FaKeyboard },
  'ibus-daemon':            { icon: FaKeyboard },
  fcitx:                    { icon: FaKeyboard },
  fcitx5:                   { icon: FaKeyboard },

  // ── Updates ────────────────────────────────────────────
  unattended:               { icon: MdSystemUpdateAlt },
  'unattended-upgrade':     { icon: MdSystemUpdateAlt },
  'packagekitd':            { icon: MdSystemUpdateAlt },

  // ── Misc ───────────────────────────────────────────────
  'gnome-calculator':       { icon: FaCalculator },
  'gnome-calendar':         { icon: FaCalendarAlt },
  'gnome-clocks':           { icon: FaClock },
  'gnome-screenshot':       { icon: FaImage },
  'gnome-software':         { icon: MdSystemUpdateAlt },
  'gnome-disks':            { icon: LuHardDrive },
  'gnome-system-monitor':   { icon: LuCpu },
  'gnome-settings-daemon':  { icon: FaCog },
  'gnome-control-center':   { icon: FaCog },
  'xdg-desktop-portal':     { icon: FaDesktop },
  'xdg-document-portal':    { icon: FaFileAlt },
  'xdg-permission-store':   { icon: FaLock },

  // ── Tauri/this app ─────────────────────────────────────
  'hw-monitor':             { icon: FaMicrochip },
};

const DEFAULT_ICON: IconEntry = { icon: FaCog };

const FALLBACK_PATTERNS: { test: (name: string) => boolean; entry: IconEntry }[] = [
  { test: n => /^(k|kde|plasma)/i.test(n),               entry: { icon: SiKde } },
  { test: n => /^gnome/i.test(n),                         entry: { icon: SiGnome } },
  { test: n => /python/i.test(n),                         entry: { icon: FaPython, color: '#3776AB' } },
  { test: n => /^(node|npm|npx|yarn|pnpm)/i.test(n),     entry: { icon: FaNodeJs, color: '#339933' } },
  { test: n => /java/i.test(n),                           entry: { icon: FaJava, color: '#ED8B00' } },
  { test: n => /docker|container/i.test(n),               entry: { icon: FaDocker, color: '#2496ED' } },
  { test: n => /^(kworker|ksoftirq|migration|rcu|irq|watchdog|kthread|ata_|scsi|crypto|khugepaged|kswapd|kcompactd|oom_|writeback)/i.test(n),
    entry: { icon: FaLinux } },
  { test: n => /systemd/i.test(n),                        entry: { icon: FaLinux } },
  { test: n => /chrome|chromium/i.test(n),                entry: { icon: FaChrome, color: '#4285F4' } },
  { test: n => /firefox/i.test(n),                        entry: { icon: SiFirefox, color: '#FF7139' } },
  { test: n => /ssh/i.test(n),                            entry: { icon: FaLock } },
  { test: n => /vpn|tunnel|wireguard/i.test(n),           entry: { icon: FaShieldAlt } },
  { test: n => /audio|pulse|pipe|sound|alsa/i.test(n),    entry: { icon: FaVolumeUp } },
  { test: n => /print|cups|lp/i.test(n),                  entry: { icon: FaPrint } },
  { test: n => /disk|mount|fs|storage|btrfs|ext4|xfs/i.test(n), entry: { icon: LuHardDrive } },
  { test: n => /net|wlan|eth|wifi|wpa|nm-/i.test(n),      entry: { icon: FaNetworkWired } },
  { test: n => /dbus|bus/i.test(n),                        entry: { icon: BsGearFill } },
  { test: n => /usb/i.test(n),                             entry: { icon: FaUsb } },
  { test: n => /bluetooth|bt/i.test(n),                    entry: { icon: FaBluetooth } },
  { test: n => /cron|timer|schedule/i.test(n),             entry: { icon: MdSchedule } },
  { test: n => /^(xdg-|portal)/i.test(n),                  entry: { icon: FaDesktop } },
];

function resolve(name: string): IconEntry {
  const exact = ICON_MAP[name];
  if (exact) return exact;

  for (const fb of FALLBACK_PATTERNS) {
    if (fb.test(name)) return fb.entry;
  }

  return DEFAULT_ICON;
}

interface ProcessIconProps {
  name: string;
  size?: number;
  fallbackColor?: string;
}

const ProcessIcon: React.FC<ProcessIconProps> = ({ name, size = 14, fallbackColor }) => {
  const entry = resolve(name);
  const Icon = entry.icon;
  return <Icon size={size} color={entry.color ?? fallbackColor} style={{ flexShrink: 0 }} />;
};

export default React.memo(ProcessIcon);

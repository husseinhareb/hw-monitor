#!/usr/bin/env node
// Screenshot every page, tab, panel, dropdown and modal of hw-monitor into screenshots/.
//
// 1. src-tauri/examples/dump_fixtures.rs records real backend responses from this machine.
// 2. The frontend runs in headless Chromium (Vite dev server) with Tauri's invoke() mocked
//    to replay those responses, driven over the DevTools protocol. No extra npm deps.
//
// Usage: npm run screenshots [-- --no-dump] [--size 1400x900] [--samples 12] [--out dir] [--readme]
//   --no-dump   reuse screenshots/fixtures.json instead of sampling the backend again
//   --out       write the PNGs to another directory (fixtures stay in screenshots/)
//   --readme    capture the curated, themed README shots into docs/screenshots/ as framed WebP,
//               with usernames, hostnames, IP and MAC addresses and disk serials scrubbed
//
// WebKitWebDriver (needed to drive the real Tauri window) is not packaged on every distro,
// so this drives Chromium instead; fonts and scrollbars may differ slightly from WebKitGTK.

import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { hostname, tmpdir, userInfo } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fixturesPath = join(root, "screenshots", "fixtures.json");
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const option = (name, fallback) => {
  const i = argv.indexOf(name);
  return i === -1 ? fallback : argv[i + 1];
};
const README = flag("--readme");
const outDir = option("--out", join(root, README ? "docs/screenshots" : "screenshots"));
const [WIDTH, HEIGHT] = option("--size", "1400x900").split("x").map(Number);
const SAMPLES = option("--samples", "12");
const PORT = 1430;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Fixtures ──────────────────────────────────────────────────────────────

mkdirSync(outDir, { recursive: true });
mkdirSync(dirname(fixturesPath), { recursive: true });
if (!flag("--no-dump") || !existsSync(fixturesPath)) {
  console.log(`Sampling real backend data (${SAMPLES}s)...`);
  const dump = spawnSync(
    "cargo",
    ["run", "--quiet", "--example", "dump_fixtures", "--", fixturesPath, SAMPLES],
    { cwd: join(root, "src-tauri"), stdio: "inherit" },
  );
  if (dump.status !== 0) process.exit(dump.status ?? 1);
}
for (const f of readdirSync(outDir)) if (/\.(png|webp)$/.test(f)) rmSync(join(outDir, f));

// Public screenshots must not carry this machine's identity. Addresses are mapped to
// documentation ranges (RFC 5737 / 3849) consistently, so the same host keeps the same fake IP.
function scrub(fixtures) {
  const user = userInfo().username;
  const host = hostname();
  const word = (w) => new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
  const ips = new Map();
  const fakeIpv4 = (ip) => {
    const [a, b] = ip.split(".").map(Number);
    if (a === 0 || a === 127 || a >= 224) return ip;
    if (!ips.has(ip)) {
      const local = a === 10 || (a === 172 && b >= 16 && b < 32) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b < 128);
      const n = ips.size + 10;
      ips.set(ip, local ? `192.168.1.${n}` : `203.0.113.${n}`);
    }
    return ips.get(ip);
  };
  const macs = new Map();
  const fakeMac = (mac) => {
    if (!macs.has(mac)) macs.set(mac, `02:00:00:00:00:${String(macs.size + 1).padStart(2, "0")}`);
    return macs.get(mac);
  };
  const v6 = new Map();
  const fakeIpv6 = (addr) => {
    // Clock times (17:08:13) also match the pattern; real addresses have "::" or 7 colons
    if (!addr.includes("::") && addr.split(":").length < 8) return addr;
    if (addr === "::" || addr === "::1") return addr;
    if (!v6.has(addr)) v6.set(addr, `${addr.startsWith("fe80") ? "fe80" : "2001:db8"}::${(v6.size + 1).toString(16)}`);
    return v6.get(addr);
  };
  const identifierKeys = ["serial", "wwid", "uuid", "part_uuid", "partuuid"];
  // Same shape as the real value, obviously not it: letters and digits count up
  const fakeIdentifier = (text) => {
    let n = 0;
    return text.replace(/[A-Za-z0-9]/g, (c) => {
      const i = n++;
      if (/[0-9]/.test(c)) return String((i + 1) % 10);
      const letter = String.fromCharCode(65 + (i % 6));
      return c === c.toLowerCase() ? letter.toLowerCase() : letter;
    });
  };
  const identifiers = new Map();
  const collect = (value, key) => {
    if (typeof value === "string" && identifierKeys.includes(key) && value.length >= 6) identifiers.set(value, fakeIdentifier(value));
    else if (Array.isArray(value)) value.forEach((v) => collect(v, key));
    else if (value && typeof value === "object") Object.entries(value).forEach(([k, v]) => collect(v, k));
  };
  collect(fixtures, "");
  const addressCommands = /^(get_connections|get_interfaces|get_network|get_system_info|get_service_details)/;
  const clean = (text, key, command) => {
    if (identifierKeys.includes(key)) return fakeIdentifier(text);
    if (key === "hostname") return "workstation";
    // Serials also hide inside other fields (NVMe subsystem NQNs embed them)
    for (const [real, fake] of identifiers) text = text.replaceAll(real, fake);
    text = text.replace(/\b(?:[0-9a-f]{2}:){5}[0-9a-f]{2}\b/gi, fakeMac);
    if (addressCommands.test(command)) {
      text = text.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, fakeIpv4);
      text = text.replace(/(?<![\w:.])(?:[0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}(?![\w:.])/gi, fakeIpv6);
    }
    if (command.startsWith("get_service_details")) text = text.replace(word(host), "workstation");
    return text.replace(word(user), "user").replace(word(host), "workstation");
  };
  const walk = (value, key, command) => {
    if (typeof value === "string") return clean(value, key, command);
    if (Array.isArray(value)) return value.map((v) => walk(v, key, command));
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v, k, command)]));
    }
    return value;
  };
  return Object.fromEntries(Object.entries(fixtures).map(([command, list]) => [command, walk(list, "", command)]));
}

const fixtures = JSON.parse(readFileSync(fixturesPath, "utf8"));
const pageFixtures = README ? scrub(fixtures) : fixtures;

// Mock of window.__TAURI_INTERNALS__ plus DOM helpers used by the steps below.
const pageSetup = `(() => {
  const FIX = ${JSON.stringify(pageFixtures)};
  // English labels keep the text-based steps below stable; ?lang= and ?theme= (a preset
  // label from themes.ts) let the README shots switch language and theme per page load.
  const params = new URLSearchParams(location.search);
  const configOverrides = (async () => {
    const preset = params.get("theme")
      ? (await import("/src/components/Config/themes.ts")).themes.find((t) => t.label === params.get("theme"))
      : undefined;
    return { ...(preset?.values ?? {}), language: params.get("lang") ?? "en" };
  })();
  const counters = {};
  const next = (key) => {
    const list = FIX[key];
    if (!list) return undefined;
    const i = (counters[key] = (counters[key] ?? -1) + 1);
    return list[i % list.length];
  };
  let callbackId = 0;
  window.__TAURI_INTERNALS__ = {
    async invoke(cmd, args = {}) {
      const arg = args.name ?? args.devPath;
      const keyed = arg !== undefined && FIX[cmd + ":" + arg];
      const value = keyed ? next(cmd + ":" + arg) : next(cmd);
      if (value && typeof value === "object" && "__error" in value) throw value.__error;
      if (cmd === "get_configs" && value) return { ...value, ...(await configOverrides) };
      return value ?? null;
    },
    transformCallback(fn) { const id = ++callbackId; window["_" + id] = fn; return id; },
    unregisterCallback() {},
    convertFileSrc: (p) => p,
    metadata: { currentWindow: { label: "main" }, currentWebview: { windowLabel: "main", label: "main" } },
  };
  const visible = (e) => e.getClientRects().length > 0;
  window.__ui = {
    // Deepest visible element whose whole text is exactly \`text\`.
    find(text) {
      const hits = [...document.querySelectorAll("body *")]
        .filter((e) => visible(e) && e.textContent.trim() === text);
      return hits.find((e) => !hits.some((o) => o !== e && e.contains(o))) ?? null;
    },
    get(target) {
      return target.startsWith("css:") ? [...document.querySelectorAll(target.slice(4))].find(visible) ?? null : this.find(target);
    },
    click(target) {
      const el = this.get(target);
      if (!el) return false;
      el.scrollIntoView({ block: "center" });
      el.click();
      return true;
    },
    // Visible elements next to the element labelled \`text\` (sidebars).
    siblingElements(text) {
      const el = this.find(text);
      if (!el) return [];
      const item = [...el.parentElement.children].includes(el) ? el : el.parentElement;
      return [...item.parentElement.children].filter((c) => visible(c) && c.textContent.trim());
    },
    // Their visible labels.
    siblings(text) {
      return this.siblingElements(text).map((c) => c.textContent.trim());
    },
    // Click the sibling labelled \`label\`, so a sidebar item never resolves to a same-named navbar tab.
    clickSibling(anchor, label) {
      const el = this.siblingElements(anchor).find((c) => c.textContent.trim() === label);
      if (!el) return false;
      el.scrollIntoView({ block: "nearest" });
      el.click();
      return true;
    },
    // The scroll area under the middle of the viewport, so an open modal wins over the page behind it.
    scroller() {
      const scrollable = (e) => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 8;
      for (let e = document.elementFromPoint(innerWidth / 2, innerHeight / 2); e; e = e.parentElement) {
        if (scrollable(e)) return e;
        if (getComputedStyle(e).position === "fixed") return null; // modal overlay: never scroll the page behind it
      }
      return null;
    },
  };
})();`;

// ── Processes ─────────────────────────────────────────────────────────────

const children = [];
const cleanup = () => children.forEach((c) => c.kill("SIGTERM"));
process.on("exit", cleanup);
process.on("SIGINT", () => process.exit(130));

const vite = spawn("npx", ["vite", "--port", String(PORT), "--strictPort"], { cwd: root, stdio: "ignore" });
children.push(vite);

const browserBin = [process.env.CHROME, "chromium", "google-chrome-stable", "google-chrome"]
  .find((b) => b && spawnSync("which", [b]).status === 0);
if (!browserBin) throw new Error("No Chromium found; set CHROME=/path/to/chrome");
const profile = mkdtempSync(join(tmpdir(), "hw-monitor-shots-"));
const browser = spawn(browserBin, [
  "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
  `--user-data-dir=${profile}`, "--remote-debugging-port=0", "about:blank",
], { stdio: ["ignore", "ignore", "pipe"] });
children.push(browser);
const removeProfile = () => { try { rmSync(profile, { recursive: true, force: true }); } catch { /* still in use */ } };
process.on("exit", removeProfile);

const wsUrl = await new Promise((resolve, reject) => {
  let buf = "";
  browser.stderr.on("data", (d) => {
    buf += d;
    const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) resolve(m[1]);
  });
  browser.on("exit", (code) => reject(new Error(`${browserBin} exited (${code}): ${buf}`)));
});

for (let i = 0; ; i++) {
  try { if ((await fetch(`http://localhost:${PORT}`)).ok) break; } catch { /* not up yet */ }
  if (i > 60) throw new Error("Vite dev server did not start");
  await sleep(500);
}

// ── DevTools protocol ─────────────────────────────────────────────────────

const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let msgId = 0;
const pending = new Map();
ws.addEventListener("message", ({ data }) => {
  const msg = JSON.parse(data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message));
    else resolve(msg.result);
  } else if (msg.method === "Runtime.exceptionThrown") {
    console.warn("  page error:", msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
  }
});
const cdp = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const id = ++msgId;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params, sessionId }));
});

const { targetId } = await cdp("Target.createTarget", { url: "about:blank" });
const { sessionId } = await cdp("Target.attachToTarget", { targetId, flatten: true });
const page = (method, params) => cdp(method, params, sessionId);
await page("Page.enable");
await page("Runtime.enable");
await page("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: HEIGHT, deviceScaleFactor: README ? 2 : 1, mobile: false });
await page("Page.addScriptToEvaluateOnNewDocument", { source: pageSetup });

const evaluate = async (expression) => {
  const { result, exceptionDetails } = await page("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
  return result.value;
};

// ── Step helpers ──────────────────────────────────────────────────────────

let shotNo = 0;
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

async function waitFor(target, timeout = 10000) {
  for (let t = 0; t < timeout; t += 200) {
    if (await evaluate(`!!__ui.get(${JSON.stringify(target)})`)) return true;
    await sleep(200);
  }
  return false;
}

async function click(target, settle = 800) {
  if (!(await waitFor(target, 5000))) {
    console.warn(`  skip: "${target}" not found`);
    return false;
  }
  await evaluate(`__ui.click(${JSON.stringify(target)})`);
  await sleep(settle);
  return true;
}

async function capture(name) {
  const file = `${String(++shotNo).padStart(3, "0")}-${slug(name)}.png`;
  const { data } = await page("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(outDir, file), Buffer.from(data, "base64"));
  console.log(`  ${file}`);
}

// Screenshot, then page through the main scroll area if the content is taller than the view.
async function shot(name, { scroll = false } = {}) {
  await sleep(600);
  await evaluate(`(__ui.scroller() ?? {}).scrollTop = 0`);
  await capture(name);
  if (!scroll) return;
  for (let part = 2; part <= 8; part++) {
    const moved = await evaluate(`(() => {
      const s = __ui.scroller();
      if (!s || s.scrollTop + s.clientHeight >= s.scrollHeight - 2) return false;
      s.scrollTop += s.clientHeight * 0.9;
      return true;
    })()`);
    if (!moved) break;
    await sleep(300);
    await capture(`${name}-part${part}`);
  }
}

async function fresh(query = "") {
  await page("Page.navigate", { url: `http://localhost:${PORT}/${query}` });
  // The process table is the landing page in every language
  if (!(await waitFor("css:tbody tr", 20000))) throw new Error("app did not render");
  await sleep(1500);
}

async function pressEscape() {
  for (const type of ["keyDown", "keyUp"]) {
    await page("Input.dispatchKeyEvent", { type, key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  }
  await sleep(400);
}

// ── README shots ──────────────────────────────────────────────────────────

if (README) {
  // Each shot is composited onto a backdrop matching its theme, with rounded corners and a shadow
  const BACKDROPS = {
    Default: "linear-gradient(135deg, #0f2027, #203a43 50%, #2c5364)",
    Catppuccin: "linear-gradient(135deg, #cba6f7, #89b4fa)",
    Gruvbox: "linear-gradient(135deg, #d65d0e, #fabd2f)",
  };
  const PAD = 40;
  const { targetId: frameTarget } = await cdp("Target.createTarget", { url: "about:blank" });
  const { sessionId: frameSession } = await cdp("Target.attachToTarget", { targetId: frameTarget, flatten: true });
  const frame = (method, params) => cdp(method, params, frameSession);
  await frame("Page.enable");
  await frame("Emulation.setDeviceMetricsOverride", { width: WIDTH + 2 * PAD, height: HEIGHT + 2 * PAD, deviceScaleFactor: 2, mobile: false });

  let theme = "Default";
  const open = async (name, lang) => {
    theme = name;
    await fresh(`?theme=${name}${lang ? `&lang=${lang}` : ""}`);
  };
  const save = async (name) => {
    await sleep(800);
    const { data } = await page("Page.captureScreenshot", { format: "png" });
    const { frameTree } = await frame("Page.getFrameTree");
    await frame("Page.setDocumentContent", {
      frameId: frameTree.frame.id,
      html: `<body style="margin:0;background:${BACKDROPS[theme]}"><img src="data:image/png;base64,${data}" style="display:block;margin:${PAD}px;width:${WIDTH}px;height:${HEIGHT}px;border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.45)"></body>`,
    });
    await frame("Runtime.evaluate", { expression: "document.images[0].decode()", awaitPromise: true });
    const { data: webp } = await frame("Page.captureScreenshot", { format: "webp", quality: 90 });
    writeFileSync(join(outDir, `${name}.webp`), Buffer.from(webp, "base64"));
    console.log(`  ${name}.webp (${theme})`);
  };
  // Graphs hold 20 samples, one per second
  const FILL = 40000;
  const performance = async (item) => {
    await click("Performance", 500);
    if (item) await evaluate(`__ui.clickSibling("CPU", ${JSON.stringify(item)})`);
    await sleep(FILL);
  };
  // The interface and disk that moved the most data make the liveliest graphs
  const busiest = (samples, key, amount) => {
    const totals = {};
    for (const list of samples) for (const d of list ?? []) totals[d[key]] = (totals[d[key]] ?? 0) + amount(d);
    return Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0];
  };
  const netItem = busiest(fixtures.get_network, "interface", (n) => n.download + n.upload);
  const diskItem = busiest(fixtures.get_disks, "name", (d) => (parseFloat(d.read_speed) || 0) + (parseFloat(d.write_speed) || 0));

  console.log(`README shots at ${WIDTH}x${HEIGHT} @2x into ${outDir} ...`);
  await open("Default");
  await performance();
  await save("performance-cpu");

  await open("Catppuccin");
  await performance();
  await click("Logical Processors", 1000);
  await save("performance-cores");

  await open("Gruvbox");
  await performance("Memory");
  await save("performance-memory");

  await open("Catppuccin");
  await performance(netItem);
  await save("performance-network");

  await open("Gruvbox");
  await performance(diskItem);
  await save("performance-disk");

  await open("Default");
  await performance(busiest(fixtures.get_gpu_informations, "name", () => 1));
  await save("performance-gpu");

  await open("Default");
  // Second click sorts descending, so the busiest process is on top and gets monitored
  await click("CPU Usage", 1000);
  await click("CPU Usage", 1000);
  await click("css:tbody tr");
  await click("Monitor", 12000);
  await save("processes");

  await open("Gruvbox");
  await click("Tree", 1500);
  await click("Expand All", 1000);
  await save("processes-tree");

  await open("Catppuccin");
  await click("css:tbody tr");
  await click("Manage", 1200);
  await save("processes-manage");

  await open("Catppuccin");
  await click("Sensors", 2500);
  await save("sensors");

  await open("Gruvbox");
  await click("Sensors", 2500);
  // Graph the temperature that moved the most while sampling (a name used by only one chip)
  const temps = {};
  for (const chips of fixtures.get_sensors) {
    for (const chip of chips ?? []) {
      for (const sensor of chip.sensors) {
        if (sensor.sensor_type !== "temperature") continue;
        (temps[sensor.name] ??= { ids: new Set(), values: [] }).ids.add(sensor.id);
        temps[sensor.name].values.push(sensor.value);
      }
    }
  }
  const range = (values) => Math.max(...values) - Math.min(...values);
  const [graphed] = Object.entries(temps)
    .filter(([, t]) => t.ids.size === 1)
    .sort(([, a], [, b]) => range(b.values) - range(a.values))[0] ?? [];
  await evaluate(`(() => {
    for (let e = __ui.find(${JSON.stringify(graphed)}); e; e = e.parentElement) {
      const button = e.querySelector('button[title="Graph"]');
      if (button) return button.click();
    }
  })()`);
  await sleep(14000);
  await save("sensors-graph");

  await open("Default");
  await click("Disks", 2500);
  await save("disks");

  await open("Catppuccin");
  await click("Disks", 2500);
  const diskIndex = Math.max(0, fixtures.get_disks[0].findIndex((d) => d.name === diskItem));
  await evaluate(`document.querySelectorAll('[aria-label="Disk Details"]')[${diskIndex}]?.click()`);
  await sleep(2000);
  await save("disks-details");

  await open("Gruvbox");
  await click("Services", 2000);
  const service = Object.keys(fixtures).find((key) => key.startsWith("get_service_details:"))?.split(":")[1];
  if (service) await click(service, 2000);
  await save("services");

  await open("Catppuccin");
  await click("Services", 2000);
  await click("Startup Apps", 1500);
  await save("startup-apps");

  await open("Default");
  await click("Connections", 2500);
  // Established sockets carry the remote country flags
  await click("All states", 500);
  await click("Established", 1000);
  await save("connections");

  await open("Gruvbox");
  await click("System Info", 2500);
  await save("system-info");

  await open("Catppuccin");
  await click('css:button[aria-label="Config"]', 1500);
  await click('css:button[aria-label="Theme"]');
  await save("config");

  await open("Default", "ar");
  await click("css:nav li:nth-child(2) button", FILL);
  await save("arabic");

  await cdp("Browser.close").catch(() => {});
  removeProfile();
  ws.close();
  console.log("Done");
  process.exit(0);
}

// ── Walkthrough ───────────────────────────────────────────────────────────

console.log(`Capturing at ${WIDTH}x${HEIGHT} into screenshots/ ...`);

console.log("Processes");
await fresh();
await shot("processes-table");
await click('css:button[aria-label="Search..."]');
await shot("processes-search");
await click("Tree");
await shot("processes-tree");
await fresh();
await click("css:tbody tr");
await shot("processes-row-selected");
if (await click("Monitor", 4000)) await shot("processes-monitor");
await fresh();
await click("css:tbody tr");
if (await click("Manage", 1200)) await shot("processes-manage-modal", { scroll: true });

console.log("Performance");
// Each graph from a fresh start, to catch layout that only looks wrong while the history fills.
await fresh();
await click("Performance", 1000);
for (const item of await evaluate(`__ui.siblings("CPU")`)) {
  await fresh();
  await click("Performance", 0);
  await click(item, 0);
  for (const t of [0, 5, 10]) {
    await sleep(t ? 5000 : 300);
    await capture(`performance-${item}-${t}s`);
  }
}
await fresh();
await click("Performance", 12000); // let the graphs fill with the replayed samples
for (const item of await evaluate(`__ui.siblings("CPU")`)) {
  await click(item, 1500);
  await shot(`performance-${item}`, { scroll: true });
}
await click("CPU");
await click('css:button[aria-expanded="true"]');
await shot("performance-sidebar-collapsed");

console.log("Sensors");
await fresh();
await click("Sensors", 2500);
await shot("sensors", { scroll: true });
await click("Collapse All");
await shot("sensors-collapsed");
await click("Expand All");
await click("Show hidden sensors");
await shot("sensors-show-hidden");
await click('css:button[title="Edit sensor"]');
await shot("sensors-editor");
if (await click('css:button[title="Graph"]', 5000)) await shot("sensors-graph-modal");
await pressEscape();

console.log("Disks");
await fresh();
await click("Disks", 2500);
await shot("disks", { scroll: true });
const diskCount = await evaluate(`document.querySelectorAll('[aria-label="Disk Details"]').length`);
for (let i = 0; i < diskCount; i++) {
  await evaluate(`document.querySelectorAll('[aria-label="Disk Details"]')[${i}].click()`);
  await sleep(2000);
  await shot(`disks-details-${i + 1}`, { scroll: true });
  await pressEscape();
  await evaluate(`document.querySelector('[role="dialog"]')?.click()`);
  await sleep(400);
}

console.log("Services");
await fresh();
await click("Services", 2000);
await shot("services");
// A service whose details were dumped, so the panel does not show another unit's status
const dumpedService = Object.keys(fixtures)
  .find((key) => key.startsWith("get_service_details:"))
  ?.split(":")[1];
if (dumpedService && (await click(dumpedService, 2000))) await shot("services-details-panel");
await click("Startup Apps", 1500);
await shot("services-startup-apps");

console.log("Connections");
await fresh();
await click("Connections", 2500);
await shot("connections");
await click("All protocols");
await shot("connections-protocol-filter");
await click("All protocols");
await click("All states");
await shot("connections-state-filter");
await click("All states");
await click("css:tbody tr");
await shot("connections-row-selected");

console.log("System Info");
await fresh();
await click("System Info", 2500);
await shot("system-info", { scroll: true });

console.log("Config");
await fresh();
await click('css:button[aria-label="Config"]', 1500);
for (const section of await evaluate(`__ui.siblings("Config").filter((s) => s !== "Config")`)) {
  await evaluate(`__ui.clickSibling("Config", ${JSON.stringify(section)})`);
  await sleep(800);
  await shot(`config-${section}`, { scroll: true });
}
await click("English");
await shot("config-language-dropdown");
await click("English");
await click('css:button[aria-label="Theme"]');
await shot("config-theme-dropdown");

await cdp("Browser.close").catch(() => {});
await new Promise((r) => (browser.exitCode !== null ? r() : browser.once("exit", r)));
removeProfile();
ws.close();
console.log(`Done: ${shotNo} screenshots in screenshots/`);
process.exit(0);

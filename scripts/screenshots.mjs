#!/usr/bin/env node
// Screenshot every page, tab, panel, dropdown and modal of hw-monitor into screenshots/.
//
// 1. src-tauri/examples/dump_fixtures.rs records real backend responses from this machine.
// 2. The frontend runs in headless Chromium (Vite dev server) with Tauri's invoke() mocked
//    to replay those responses, driven over the DevTools protocol. No extra npm deps.
//
// Usage: npm run screenshots [-- --no-dump] [--size 1400x900] [--samples 12]
//   --no-dump   reuse screenshots/fixtures.json instead of sampling the backend again
//
// WebKitWebDriver (needed to drive the real Tauri window) is not packaged on every distro,
// so this drives Chromium instead; fonts and scrollbars may differ slightly from WebKitGTK.

import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "screenshots");
const fixturesPath = join(outDir, "fixtures.json");
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const option = (name, fallback) => {
  const i = argv.indexOf(name);
  return i === -1 ? fallback : argv[i + 1];
};
const [WIDTH, HEIGHT] = option("--size", "1400x900").split("x").map(Number);
const SAMPLES = option("--samples", "12");
const PORT = 1430;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Fixtures ──────────────────────────────────────────────────────────────

mkdirSync(outDir, { recursive: true });
if (!flag("--no-dump") || !existsSync(fixturesPath)) {
  console.log(`Sampling real backend data (${SAMPLES}s)...`);
  const dump = spawnSync(
    "cargo",
    ["run", "--quiet", "--example", "dump_fixtures", "--", fixturesPath, SAMPLES],
    { cwd: join(root, "src-tauri"), stdio: "inherit" },
  );
  if (dump.status !== 0) process.exit(dump.status ?? 1);
}
for (const f of readdirSync(outDir)) if (f.endsWith(".png")) rmSync(join(outDir, f));

// Mock of window.__TAURI_INTERNALS__ plus DOM helpers used by the steps below.
const pageSetup = `(() => {
  const FIX = ${readFileSync(fixturesPath, "utf8")};
  // English labels keep the text-based steps below stable.
  FIX.get_configs = FIX.get_configs.map((c) => ({ ...c, language: "en" }));
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
      el.scrollIntoView({ block: "center" });
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
await page("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false });
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

async function fresh() {
  await page("Page.navigate", { url: `http://localhost:${PORT}` });
  if (!(await waitFor("Processes", 20000))) throw new Error("app did not render");
  await sleep(1500);
}

async function pressEscape() {
  for (const type of ["keyDown", "keyUp"]) {
    await page("Input.dispatchKeyEvent", { type, key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  }
  await sleep(400);
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
const dumpedService = Object.keys(JSON.parse(readFileSync(fixturesPath, "utf8")))
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

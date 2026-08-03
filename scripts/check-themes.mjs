import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const themesPath = join(root, "src", "components", "Config", "themes.ts");
const configStorePath = join(root, "src", "services", "configStore.ts");

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const MIN_CONTRAST = 3.0;

const FG_BG_PAIRS = [
  ["processes_body_color", "processes_body_background_color"],
  ["processes_head_color", "processes_head_background_color"],
  ["performance_title_color", "performance_background_color"],
  ["performance_value_color", "performance_background_color"],
  ["performance_label_color", "performance_background_color"],
  ["performance_sidebar_color", "performance_sidebar_background_color"],
  ["sensors_foreground_color", "sensors_background_color"],
  ["sensors_boxes_foreground_color", "sensors_boxes_background_color"],
  ["sensors_boxes_title_foreground_color", "sensors_boxes_background_color"],
  ["disks_name_foreground_color", "disks_boxes_background_color"],
  ["disks_size_foreground_color", "disks_boxes_background_color"],
  ["disks_partition_name_foreground_color", "disks_partition_background_color"],
  ["navbar_buttons_foreground_color", "navbar_buttons_background_color"],
  ["navbar_search_foreground_color", "navbar_search_background_color"],
  ["config_text_color", "config_background_color"],
  ["config_button_foreground_color", "config_button_background_color"],
];

function isColorKey(key) {
  return key.endsWith("_color") || key.startsWith("heatbar_color_");
}

function extractObjectBlock(source, anchor) {
  const start = source.indexOf(anchor);
  if (start === -1) return null;
  const open = source.indexOf("{", start);
  if (open === -1) return null;
  let depth = 1;
  let i = open + 1;
  while (i < source.length && depth > 0) {
    const c = source[i];
    if (c === "{") depth++;
    else if (c === "}") depth--;
    i++;
  }
  return source.slice(open + 1, i - 1);
}

function extractColorEntries(block) {
  const out = {};
  const re = /([a-z_][a-z0-9_]*)\s*:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(block))) {
    if (isColorKey(m[1])) out[m[1]] = m[2];
  }
  return out;
}

function extractColorKeys(block) {
  const keys = new Set();
  const re = /([a-z_][a-z0-9_]*)\s*:/g;
  let m;
  while ((m = re.exec(block))) {
    if (isColorKey(m[1])) keys.add(m[1]);
  }
  return [...keys];
}

function extractThemes(source) {
  const themes = [];
  const re = /label:\s*"([^"]+)"\s*,\s*labelKey:\s*"[^"]+"\s*,\s*values:\s*\{/g;
  let m;
  while ((m = re.exec(source))) {
    const open = source.indexOf("{", m.index + m[0].length - 1);
    let depth = 1;
    let i = open + 1;
    while (i < source.length && depth > 0) {
      const c = source[i];
      if (c === "{") depth++;
      else if (c === "}") depth--;
      i++;
    }
    const block = source.slice(open + 1, i - 1);
    themes.push({ name: m[1], values: extractColorEntries(block) });
  }
  return themes;
}

function parseHex(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const HEATBAR_KEYS = [
  "heatbar_color_one",
  "heatbar_color_two",
  "heatbar_color_three",
  "heatbar_color_four",
  "heatbar_color_five",
  "heatbar_color_six",
  "heatbar_color_seven",
  "heatbar_color_eight",
  "heatbar_color_nine",
  "heatbar_color_ten",
];

function validateTheme(theme, requiredKeys) {
  const errors = [];
  const { name, values } = theme;

  for (const key of requiredKeys) {
    if (!(key in values)) {
      errors.push(`missing key "${key}"`);
    }
  }

  for (const [key, val] of Object.entries(values)) {
    if (!HEX_RE.test(val)) {
      errors.push(`"${key}" is not a 6-digit hex color: ${JSON.stringify(val)}`);
    }
  }

  const heatbar = HEATBAR_KEYS.map((k) => values[k]);
  if (heatbar.every((c) => c && HEX_RE.test(c))) {
    const seen = new Set();
    for (const c of heatbar) {
      const norm = c.toLowerCase();
      if (seen.has(norm)) errors.push(`heatbar duplicate stop: ${c}`);
      seen.add(norm);
    }

    const heat = heatbar.map((c) => {
      const [r, g] = parseHex(c);
      return r - g;
    });
    for (let i = 1; i < heat.length; i++) {
      if (heat[i] <= heat[i - 1]) {
        errors.push(
          `heatbar non-monotonic at stop ${i + 1} (${heatbar[i]}): r-g ${heat[i]} <= prev ${heat[i - 1]}`,
        );
      }
    }
  }

  for (const [fgKey, bgKey] of FG_BG_PAIRS) {
    const fg = values[fgKey];
    const bg = values[bgKey];
    if (!fg || !bg || !HEX_RE.test(fg) || !HEX_RE.test(bg)) continue;
    if (fg.toLowerCase() === bg.toLowerCase()) {
      errors.push(`${fgKey} equals ${bgKey} (${fg}): text invisible`);
      continue;
    }
    const ratio = contrastRatio(fg, bg);
    if (ratio < MIN_CONTRAST) {
      errors.push(
        `${fgKey} on ${bgKey}: contrast ${ratio.toFixed(2)}:1 below ${MIN_CONTRAST}:1 (${fg} / ${bg})`,
      );
    }
  }

  return errors.map((msg) => `[${name}] ${msg}`);
}

function main() {
  const themesSource = readFileSync(themesPath, "utf8");
  const configSource = readFileSync(configStorePath, "utf8");

  const defaultConfigBlock = extractObjectBlock(
    configSource,
    "defaultConfig: ConfigData =",
  );
  if (!defaultConfigBlock) {
    console.error("Could not locate defaultConfig in", configStorePath);
    process.exit(2);
  }
  const requiredKeys = extractColorKeys(defaultConfigBlock);

  const themes = extractThemes(themesSource);
  if (themes.length === 0) {
    console.error("No themes parsed from", themesPath);
    process.exit(2);
  }

  const allErrors = [];
  for (const theme of themes) {
    allErrors.push(...validateTheme(theme, requiredKeys));
  }

  if (allErrors.length > 0) {
    console.error(`Theme validation failed (${allErrors.length} issue(s)):`);
    for (const e of allErrors) console.error("  - " + e);
    process.exit(1);
  }

  console.log(
    `OK: ${themes.length} theme(s) validated against ${requiredKeys.length} *_color keys.`,
  );
}

main();

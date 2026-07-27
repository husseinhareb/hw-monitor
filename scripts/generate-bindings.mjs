import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const outputPath = join(root, "src", "bindings.ts");
const checkOnly = process.argv.includes("--check");

const structSources = [
  ["CpuInformations", "src-tauri/src/cpu/commands.rs"],
  ["GpuInformations", "src-tauri/src/gpu/commands.rs"],
  ["Memory", "src-tauri/src/memory/commands.rs"],
  ["MemoryHardwareInfo", "src-tauri/src/memory/commands.rs"],
  ["Network", "src-tauri/src/network/commands.rs"],
  ["NetworkInterface", "src-tauri/src/network/commands.rs"],
  ["Process", "src-tauri/src/proc/commands.rs"],
  ["SystemService", "src-tauri/src/services/commands.rs"],
  ["ServiceDetails", "src-tauri/src/services/commands.rs"],
  ["SmartAttribute", "src-tauri/src/smart/commands.rs"],
  ["AtaSmartData", "src-tauri/src/smart/commands.rs"],
  ["NvmeSmartData", "src-tauri/src/smart/commands.rs"],
  ["MountPoint", "src-tauri/src/disk/commands.rs"],
  ["Partition", "src-tauri/src/disk/commands.rs"],
  ["Disk", "src-tauri/src/disk/commands.rs"],
  ["BatteryData", "src-tauri/src/battery/data.rs"],
  ["SensorData", "src-tauri/src/sensors/commands.rs"],
  ["HwMonData", "src-tauri/src/sensors/commands.rs"],
  ["TotalUsage", "src-tauri/src/total_usages/commands.rs"],
];

const aliases = [
  ["CpuData", "CpuInformations"],
  ["GpuData", "GpuInformations"],
  ["MemoryUsage", "Memory"],
  ["NetworkUsage", "Network"],
  ["DiskData", "Disk"],
  ["PartitionData", "Partition"],
  ["TotalUsages", "TotalUsage"],
];

function readRust(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

function stripLineComment(line) {
  const index = line.indexOf("//");
  return index === -1 ? line : line.slice(0, index);
}

function extractBlockAfter(source, needle) {
  const start =
    typeof needle === "string"
      ? source.indexOf(needle)
      : source.search(needle);
  if (start === -1) {
    throw new Error(`Could not find ${needle}`);
  }

  const open = source.indexOf("{", start);
  if (open === -1) {
    throw new Error(`Could not find opening brace for ${needle}`);
  }

  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) {
      return source.slice(open + 1, index);
    }
  }

  throw new Error(`Could not find closing brace for ${needle}`);
}

function splitTopLevel(input, separator = ",") {
  const parts = [];
  let current = "";
  let angleDepth = 0;
  let squareDepth = 0;
  let parenDepth = 0;
  let stringQuote = null;

  for (const char of input) {
    if (stringQuote) {
      current += char;
      if (char === stringQuote) stringQuote = null;
      continue;
    }

    if (char === '"' || char === "'") {
      stringQuote = char;
      current += char;
      continue;
    }

    if (char === "<") angleDepth += 1;
    if (char === ">") angleDepth -= 1;
    if (char === "[") squareDepth += 1;
    if (char === "]") squareDepth -= 1;
    if (char === "(") parenDepth += 1;
    if (char === ")") parenDepth -= 1;

    if (
      char === separator &&
      angleDepth === 0 &&
      squareDepth === 0 &&
      parenDepth === 0
    ) {
      parts.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

function innerGeneric(type, wrapper) {
  if (!type.startsWith(`${wrapper}<`) || !type.endsWith(">")) {
    return null;
  }
  return type.slice(wrapper.length + 1, -1).trim();
}

function arrayOf(type) {
  return type.includes(" | ") ? `(${type})[]` : `${type}[]`;
}

function mapRustType(type) {
  const cleaned = type.trim().replace(/\s+/g, " ");
  const optionInner = innerGeneric(cleaned, "Option");
  if (optionInner) {
    return `${mapRustType(optionInner)} | null`;
  }

  const vecInner = innerGeneric(cleaned, "Vec");
  if (vecInner) {
    return arrayOf(mapRustType(vecInner));
  }

  const mapInner = innerGeneric(cleaned, "HashMap");
  if (mapInner) {
    const [key, value] = splitTopLevel(mapInner);
    const keyType = mapRustType(key);
    if (keyType !== "string" && keyType !== "number") {
      throw new Error(`Unsupported HashMap key type: ${key}`);
    }
    return `Record<${keyType}, ${mapRustType(value)}>`;
  }

  if (cleaned === "String" || cleaned === "&str") return "string";
  if (cleaned === "bool") return "boolean";
  if (
    [
      "u8",
      "u16",
      "u32",
      "u64",
      "usize",
      "i8",
      "i16",
      "i32",
      "i64",
      "isize",
      "f32",
      "f64",
    ].includes(cleaned)
  ) {
    return "number";
  }

  return cleaned;
}

function parseStruct(source, name) {
  const body = extractBlockAfter(source, new RegExp(`\\bstruct\\s+${name}\\b`));
  return body
    .split("\n")
    .map(stripLineComment)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#["))
    .map((line) => {
      const match = line.match(/^(?:pub(?:\([^)]*\))?\s+)?([A-Za-z_][A-Za-z0-9_]*):\s*(.+),$/);
      if (!match) {
        return null;
      }
      return { name: match[1], type: match[2].trim() };
    })
    .filter(Boolean);
}

function parseConfigData() {
  const source = readRust("src-tauri/src/config/commands.rs");
  const body = extractBlockAfter(source, "define_config!");

  return body
    .split("\n")
    .map(stripLineComment)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*([^=]+?)\s*=/);
      if (!match) {
        return null;
      }
      return { name: match[1], type: match[2].trim() };
    })
    .filter(Boolean);
}

function renderInterface(name, fields) {
  const lines = [`export interface ${name} {`];
  fields.forEach((field) => {
    lines.push(`  ${field.name}: ${mapRustType(field.type)};`);
  });
  lines.push("}");
  return lines.join("\n");
}

function renderSmartData() {
  const source = readRust("src-tauri/src/smart/commands.rs");
  const body = extractBlockAfter(source, "enum SmartData");
  const variants = body
    .split("\n")
    .map(stripLineComment)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.match(/^([A-Za-z_][A-Za-z0-9_]*)\(([^)]+)\),?$/))
    .filter(Boolean)
    .map((match) => `({ type: "${match[1]}" } & ${match[2].trim()})`);

  if (variants.length === 0) {
    throw new Error("Could not extract SmartData variants");
  }

  return `export type SmartData = ${variants.join(" | ")};`;
}

const sections = [
  "// This file is generated by scripts/generate-bindings.mjs.",
  "// Do not edit it manually; edit the Rust command models instead.",
  "",
  renderInterface("ConfigData", parseConfigData()),
];

for (const [name, relativePath] of structSources) {
  sections.push(renderInterface(name, parseStruct(readRust(relativePath), name)));
}

sections.push(renderSmartData());

for (const [alias, source] of aliases) {
  sections.push(`export type ${alias} = ${source};`);
}

mkdirSync(dirname(outputPath), { recursive: true });
const output = `${sections.join("\n\n")}\n`;

if (checkOnly) {
  const current = readFileSync(outputPath, "utf8");
  if (current !== output) {
    console.error("src/bindings.ts is out of date. Run npm run generate:bindings.");
    process.exit(1);
  }
} else {
  writeFileSync(outputPath, output);
}

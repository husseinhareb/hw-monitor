import assert from "node:assert/strict";

function convertData(data) {
  if (data >= 1_000_000_000) return { value: Number((data / 1_000_000_000).toFixed(2)), unit: "GB" };
  if (data >= 1_000_000) return { value: Number((data / 1_000_000).toFixed(2)), unit: "MB" };
  if (data >= 1_000) return { value: Number((data / 1_000).toFixed(2)), unit: "KB" };
  return { value: data, unit: "B" };
}

const raw = [999, 1000];
const stored = raw.map(convertData);
const plotted = stored.map((sample) => sample.value);
console.log({ raw, stored, plotted });
assert.deepEqual(plotted, [999, 1]);
assert.ok(raw[1] > raw[0] && plotted[1] < plotted[0]);
console.log("CONFIRMED: a higher transfer rate becomes a 99.9% chart drop.");

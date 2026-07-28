import assert from "node:assert/strict";

const dataUnits = 2_000_000n;
const expectedGb = dataUnits * 1000n * 512n / 1_000_000_000n;
const applicationGb = dataUnits * 512n / 2_000_000n;

console.log({ dataUnits: String(dataUnits), expectedGb: String(expectedGb), applicationGb: String(applicationGb) });
assert.equal(expectedGb, 1024n);
assert.equal(applicationGb, 512n);
console.log("CONFIRMED: lifetime data read/written is reported at half its value.");

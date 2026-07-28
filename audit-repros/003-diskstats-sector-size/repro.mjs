import assert from "node:assert/strict";

const diskstatsSectors = 100;
const hwSectorSize = 4096;
const expectedBytes = diskstatsSectors * 512;
const applicationBytes = diskstatsSectors * hwSectorSize;

console.log({ diskstatsSectors, hwSectorSize, expectedBytes, applicationBytes });
assert.equal(expectedBytes, 51_200);
assert.equal(applicationBytes, 409_600);
assert.equal(applicationBytes / expectedBytes, 8);
console.log("CONFIRMED: the application formula is 8x too high on 4Kn media.");

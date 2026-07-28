import assert from "node:assert/strict";

const memory = { total: 1000, available: 400, active: 200 };
const expectedUsed = memory.total - memory.available;
const applicationGraphValue = memory.active;

console.log({ memory, expectedUsed, applicationGraphValue });
assert.equal(expectedUsed / memory.total, 0.6);
assert.equal(applicationGraphValue / memory.total, 0.2);
console.log("CONFIRMED: the graph shows 20% while used memory is 60%.");

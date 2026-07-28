import assert from "node:assert/strict";

function applicationHealth(energyFull, energyFullDesign) {
  return energyFullDesign > 0 ? Math.round((energyFull / energyFullDesign) * 100) : 100;
}

const health = applicationHealth(35_000_000, 0);
console.log({ energyFull: 35_000_000, energyFullDesign: 0, displayedHealthPercent: health });
assert.equal(health, 100);
console.log("CONFIRMED: missing design capacity is displayed as perfect health.");

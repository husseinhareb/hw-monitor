import assert from "node:assert/strict";

let displayed = null;
const setData = (value) => { displayed = value; };
const fetchLikeHook = async (promise) => {
  const result = await promise;
  setData(result);
};

let resolveA;
let resolveB;
const a = new Promise((resolve) => { resolveA = resolve; });
const b = new Promise((resolve) => { resolveB = resolve; });
const pendingA = fetchLikeHook(a);
const pendingB = fetchLikeHook(b);

resolveB({ disk: "B", health: "newer" });
await pendingB;
assert.equal(displayed.disk, "B");
resolveA({ disk: "A", health: "stale" });
await pendingA;

console.log({ selectedDisk: "B", displayed });
assert.equal(displayed.disk, "A");
console.log("CONFIRMED: stale disk A data overwrites the selected disk B.");

import assert from "node:assert/strict";

const diskRenderBranch = (error, diskData) =>
  error ? "error" : diskData.length === 0 ? "loading.generic" : "content";
const batteryRenderBranch = (error, batteries) =>
  error ? "error" : batteries.length > 0 ? "content" : "loading.battery";

const result = {
  disksAfterSuccessfulEmptyResponse: diskRenderBranch(null, []),
  batteryAfterSuccessfulEmptyResponse: batteryRenderBranch(null, []),
};
console.log(result);
assert.equal(result.disksAfterSuccessfulEmptyResponse, "loading.generic");
assert.equal(result.batteryAfterSuccessfulEmptyResponse, "loading.battery");
console.log("CONFIRMED: successful empty responses remain indistinguishable from loading.");

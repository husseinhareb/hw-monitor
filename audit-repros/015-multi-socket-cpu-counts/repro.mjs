import assert from "node:assert/strict";

const sockets = [
  { physicalId: "0", cores: 14, siblings: 28 },
  { physicalId: "1", cores: 14, siblings: 28 },
];
const application = {
  cores: sockets[0].cores,
  threads: sockets[0].siblings,
  socketCount: new Set(sockets.map((socket) => socket.physicalId)).size,
};
const expected = {
  cores: sockets.reduce((sum, socket) => sum + socket.cores, 0),
  threads: sockets.reduce((sum, socket) => sum + socket.siblings, 0),
  socketCount: 2,
};

console.log({ expected, application });
assert.deepEqual(application, { cores: 14, threads: 28, socketCount: 2 });
assert.deepEqual(expected, { cores: 28, threads: 56, socketCount: 2 });
console.log("CONFIRMED: total cores and threads are underreported by one socket.");
